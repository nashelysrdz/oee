from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_connection
from utils.auth import verify_token

router = APIRouter()

# =========================
# SCHEMA
# =========================
class MaquinaSchema(BaseModel):
    nombre_maquina: str
    id_celda: int
    id_estatus_maquina: int

# =========================
# LISTAR POR CELDA
# =========================
@router.get("/celda/{id_celda:int}")
def get_maquinas_por_celda(id_celda: int, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        m.id_maquina,
        m.nombre_maquina,
        m.id_estatus_maquina,
        e.estatus_maquina,
        e.codigo
    FROM tbl_maquina m
    INNER JOIN tbl_estatus_maquina e 
        ON m.id_estatus_maquina = e.id_estatus_maquina
    WHERE m.id_celda = %s
    AND m.activo = 1
    ORDER BY m.id_maquina
    """

    cursor.execute(query, (id_celda,))
    return cursor.fetchall()

@router.get("/tecnico/eventos")
def get_eventos_tecnico(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    id_trabajador = user["id_trabajador"]

    query = """
    SELECT
        m.id_maquina,
        m.nombre_maquina,
        r.id_registro_falla,
        r.folio,
        r.hora_inicio,
        r.fecha_creacion,
        op.numero_empleado,
        op.nombre_trabajador,

        CASE
            WHEN r.id_trabajador_mantenimiento = %s THEN 'En proceso'
            WHEN r.id_trabajador_mantenimiento IS NULL 
                 AND r.hora_inicio IS NULL THEN 'Esperanto técnico'
        END AS estado_evento

    FROM tbl_registro_falla r
    INNER JOIN tbl_maquina m
        ON m.id_maquina = r.id_maquina
    LEFT JOIN tbl_trabajador op
        ON op.id_trabajador = r.id_trabajador_creacion

    WHERE r.hora_fin IS NULL
    AND (
        r.id_trabajador_mantenimiento = %s
        OR
        (
            r.id_trabajador_mantenimiento IS NULL
            AND r.hora_inicio IS NULL
        )
    )
    ORDER BY r.fecha_creacion ASC
    """

    cursor.execute(query, (id_trabajador, id_trabajador))
    return cursor.fetchall()

# =========================
# CREAR
# ========================= 
@router.post("/")
def create_maquina(data: MaquinaSchema, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor()
    id_usuario = user["id"]

    try:
        cursor.execute("""
            INSERT INTO tbl_maquina (
                nombre_maquina,
                id_celda,
                id_estatus_maquina,
                activo, 
                id_usuario_creacion,
                fecha_creacion
            )
            VALUES (%s, %s, %s, 1, %s, NOW())
        """, (
            data.nombre_maquina,
            data.id_celda,
            data.id_estatus_maquina,
            id_usuario
        ))

        conn.commit()
        return {"message": "Máquina creada"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

# =========================
# OBTENER UNA MAQUINA
# ========================= 
@router.get("/{id_maquina:int}")
def get_maquina(id_maquina: int, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        m.id_maquina,
        m.nombre_maquina,
        e.estatus_maquina,
        e.codigo,
        r.id_registro_falla,
        r.id_trabajador_mantenimiento,
        r.folio, 
        r.hora_inicio,
        r.hora_fin, 
        r.numero_orden, 
        r.comentarios,
        tt.numero_empleado, 
        tt.nombre_trabajador,
        df.fallas, 
        r.fecha_creacion
    FROM tbl_maquina m
    INNER JOIN tbl_estatus_maquina e 
        ON m.id_estatus_maquina = e.id_estatus_maquina
    LEFT JOIN tbl_registro_falla r 
        ON m.id_maquina = r.id_maquina 
        
        AND r.hora_fin IS NULL
    LEFT JOIN tbl_trabajador tt
        ON tt.id_trabajador = r.id_trabajador_creacion
    LEFT JOIN (
        SELECT 
            dr.id_registro_falla,
            GROUP_CONCAT(f.falla SEPARATOR ', ') AS fallas
        FROM tbl_detalle_registro dr
        INNER JOIN tbl_falla f 
            ON f.id_falla = dr.id_falla
        WHERE dr.activo = 1 AND f.activo = 1
        GROUP BY dr.id_registro_falla
    ) df 
        ON df.id_registro_falla = r.id_registro_falla
    WHERE m.id_maquina = %s
    """

    cursor.execute(query, ( id_maquina,))
    maquina = cursor.fetchone()

    return maquina

# =========================
# EDITAR
# =========================   
@router.put("/{id_maquina}")
def update_maquina(id_maquina: int, data: MaquinaSchema, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor()
    id_usuario = user["id"]

    try:
        cursor.execute("""
            UPDATE tbl_maquina
            SET nombre_maquina=%s,
                id_celda=%s,
                id_estatus_maquina = %s,
                id_usuario_modificacion = %s,
                fecha_modificacion = NOW()
            WHERE id_maquina=%s
        """, (
            data.nombre_maquina,
            data.id_celda,
            data.id_estatus_maquina,
            id_usuario,
            id_maquina
        ))

        conn.commit()
        return {"message": "Máquina actualizada"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

# =========================
# ELIMINAR (BAJA LOGICA)
# =========================  
# =========================
# ELIMINAR (BAJA LOGICA)
# =========================
@router.delete("/{id_maquina:int}")
def delete_maquina(id_maquina: int, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    id_usuario = user["id"]

    try:
        # Obtener id real del estatus MANTENIMIENTO
        cursor.execute("""
            SELECT id_estatus_maquina
            FROM tbl_estatus_maquina
            WHERE codigo = 'MANTENIMIENTO'
        """)
        estatus = cursor.fetchone()

        if not estatus:
            raise HTTPException(
                status_code=404,
                detail="No existe el estatus MANTENIMIENTO"
            )

        id_estatus_mantenimiento = estatus["id_estatus_maquina"]

        # Obtener estatus actual de la máquina
        cursor.execute("""
            SELECT id_estatus_maquina
            FROM tbl_maquina
            WHERE id_maquina = %s
              AND activo = 1
        """, (id_maquina,))

        maquina = cursor.fetchone()

        if not maquina:
            raise HTTPException(
                status_code=404,
                detail="Máquina no encontrada"
            )

        # Validar si está en mantenimiento
        if maquina["id_estatus_maquina"] == id_estatus_mantenimiento:
            raise HTTPException(
                status_code=400,
                detail="No se puede eliminar una máquina en mantenimiento"
            )

        # Baja lógica
        cursor.execute("""
            UPDATE tbl_maquina
            SET activo = 0,
                id_usuario_modificacion = %s,
                fecha_modificacion = NOW()
            WHERE id_maquina = %s
        """, (
            id_usuario,
            id_maquina
        ))

        conn.commit()

        return {"message": "Máquina eliminada"}

    except HTTPException:
        raise

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        conn.close()
        
# =========================
# BLOQUEAR MAQUINA
# ========================= 
@router.post("/{id_maquina}/bloquear")
def bloquear_maquina(id_maquina: int, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # 🔒 Bloqueo de fila
        cursor.execute("""
            SELECT id_estatus_maquina
            FROM tbl_maquina
            WHERE id_maquina = %s
            FOR UPDATE
        """, (id_maquina,))

        maquina = cursor.fetchone()

        if not maquina:
            raise HTTPException(status_code=404, detail="Máquina no encontrada")

        # Ajusta este ID según tu catálogo
        ESTATUS_MANTENIMIENTO = 2

        if maquina["id_estatus_maquina"] == ESTATUS_MANTENIMIENTO:
            raise HTTPException(status_code=400, detail="Máquina ya en mantenimiento")

        # Actualiza estado
        cursor.execute("""
            UPDATE tbl_maquina
            SET id_estatus_maquina = %s
            WHERE id_maquina = %s
        """, (ESTATUS_MANTENIMIENTO, id_maquina))

        conn.commit()

        return {"ok": True, "message": "Máquina bloqueada"}

    except Exception as e:
        conn.rollback()
        raise e
 