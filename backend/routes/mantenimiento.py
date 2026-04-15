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