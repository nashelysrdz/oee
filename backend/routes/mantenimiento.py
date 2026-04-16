from fastapi import APIRouter, Depends, HTTPException
from database import get_connection
from utils.auth import verify_token
from datetime import datetime

router = APIRouter()

@router.post("/crear")
def crear_mantenimiento(data: dict, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Obtener id del estatus MANTENIMIENTO
    cursor.execute("""
        SELECT id_estatus_maquina
        FROM tbl_estatus_maquina
        WHERE codigo = 'MANTENIMIENTO'
    """)

    estatus_mantenimiento = cursor.fetchone()["id_estatus_maquina"]

    try:
        id_maquina = data.get("id_maquina")
        fallas = data.get("fallas", [])  # array de ids

        if not id_maquina or not fallas:
            raise HTTPException(status_code=400, detail="Datos incompletos")

        id_usuario = user["id_trabajador"]  

        # Bloquear máquina
        cursor.execute("""
            SELECT id_estatus_maquina
            FROM tbl_maquina
            WHERE id_maquina = %s
            FOR UPDATE
        """, (id_maquina,))

        maquina = cursor.fetchone()

        if not maquina:
            raise HTTPException(status_code=404, detail="Máquina no encontrada")

        if maquina["id_estatus_maquina"] == estatus_mantenimiento:
            raise HTTPException(status_code=400, detail="Ya está en mantenimiento")
        # Generar folio único
        fecha_hoy = datetime.now().strftime("%Y%m%d")

        cursor.execute("""
            SELECT COUNT(*) as total
            FROM tbl_registro_falla
            WHERE DATE(fecha_creacion) = CURDATE()
        """)

        total = cursor.fetchone()["total"] + 1
        folio = f"F-{fecha_hoy}-{total}"

        # Insertar registro falla
        cursor.execute("""
            INSERT INTO tbl_registro_falla (
                id_maquina,
                folio,
                fecha_registro,
                id_trabajador_creacion,
                fecha_creacion
            )
            VALUES (%s, %s, CURDATE(), %s, NOW())
        """, (id_maquina, folio, id_usuario))

        id_registro_falla = cursor.lastrowid

        # Insertar fallas
        for id_falla in fallas:
            cursor.execute("""
                INSERT INTO tbl_detalle_registro (
                    id_registro_falla,
                    id_falla,
                    activo,
                    id_trabajador_creacion,
                    fecha_creacion
                )
                VALUES (%s, %s, 1, %s, NOW())
            """, (id_registro_falla, id_falla, id_usuario))

        # Cambiar estatus máquina
        cursor.execute("""
            UPDATE tbl_maquina
            SET id_estatus_maquina = %s
            WHERE id_maquina = %s
        """, (estatus_mantenimiento, id_maquina))

        conn.commit()

        return {
            "ok": True,
            "folio": folio,
            "id_registro_falla": id_registro_falla
        }

    except Exception as e:
        conn.rollback()
        raise e
    
@router.post("/iniciar")
def iniciar_mantenimiento(data: dict, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        id_registro_falla = data.get("id_registro_falla")
        numero_empleado = data.get("numero_empleado")
        numero_orden = data.get("numero_orden")

        if not id_registro_falla or not numero_empleado or not numero_orden:
            raise HTTPException(status_code=400, detail="Todos los campos son obligatorios")

        # validar técnico
        cursor.execute("""
            SELECT id_trabajador, numero_empleado, nombre_trabajador
            FROM tbl_trabajador
            WHERE numero_empleado = %s
              AND activo = 1
        """, (numero_empleado,))

        tecnico = cursor.fetchone()

        if not tecnico:
            raise HTTPException(status_code=400, detail="Empleado no válido o inactivo")

        # actualizar registro
        cursor.execute("""
            UPDATE tbl_registro_falla
            SET id_trabajador_mantenimiento = %s,
                hora_inicio = NOW(),
                numero_orden = %s
            WHERE id_registro_falla = %s
        """, (
            tecnico["id_trabajador"],
            numero_orden,
            id_registro_falla
        ))

        conn.commit()

        return {
            "ok": True,
            "tecnico": tecnico["nombre_trabajador"]
        }

    except Exception as e:
        conn.rollback()
        raise e

@router.post("/finalizar")
def finalizar_mantenimiento(data: dict, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        id_registro_falla = data.get("id_registro_falla")
        comentarios = data.get("comentarios")

        if not id_registro_falla or not comentarios.strip():
            raise HTTPException(
                status_code=400,
                detail="Todos los campos son obligatorios"
            )

        id_usuario = user["id_trabajador"]

        # Obtener estatus DISPONIBLE
        cursor.execute("""
            SELECT id_estatus_maquina
            FROM tbl_estatus_maquina
            WHERE codigo = 'DISPONIBLE'
        """)
        estatus_disponible = cursor.fetchone()

        if not estatus_disponible:
            raise HTTPException(
                status_code=404,
                detail="No existe estatus DISPONIBLE"
            )

        id_estatus_disponible = estatus_disponible["id_estatus_maquina"]

        # Obtener máquina del registro
        cursor.execute("""
            SELECT id_maquina
            FROM tbl_registro_falla
            WHERE id_registro_falla = %s
        """, (id_registro_falla,))
        
        registro = cursor.fetchone()

        if not registro:
            raise HTTPException(
                status_code=404,
                detail="Registro no encontrado"
            )

        id_maquina = registro["id_maquina"]

        # Actualizar registro falla
        cursor.execute("""
            UPDATE tbl_registro_falla
            SET hora_fin = NOW(),
                comentarios = %s,
                id_trabajador_modificacion = %s,
                fecha_modificacion = NOW()
            WHERE id_registro_falla = %s
        """, (
            comentarios,
            id_usuario,
            id_registro_falla
        ))

        # Cambiar máquina a disponible
        cursor.execute("""
            UPDATE tbl_maquina
            SET id_estatus_maquina = %s
            WHERE id_maquina = %s
        """, (
            id_estatus_disponible,
            id_maquina
        ))

        conn.commit()

        return {
            "ok": True,
            "message": "Mantenimiento finalizado correctamente"
        }

    except Exception as e:
        conn.rollback()
        raise e