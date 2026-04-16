from fastapi import APIRouter, Depends
from database import get_connection
from utils.auth import verify_token
from fastapi import HTTPException

router = APIRouter()

@router.get("/celda/{id_celda}")
def get_maquinas_por_celda(id_celda: int, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        m.id_maquina,
        m.nombre_maquina,
        e.estatus_maquina,
        e.codigo
    FROM tbl_maquina m
    INNER JOIN tbl_estatus_maquina e 
        ON m.id_estatus_maquina = e.id_estatus_maquina
    WHERE m.id_celda = %s
    AND m.activo = 1
    ORDER BY m.orden
    """

    cursor.execute(query, (id_celda,))
    return cursor.fetchall()

@router.get("/{id_maquina}")
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

        # ⚠️ Ajusta este ID según tu catálogo
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