from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_connection
from utils.auth import verify_token

router = APIRouter()

# =========================
# MODELO
# =========================
class CeldaSchema(BaseModel):
    nombre_celda: str
    fila: int
    columna: int


# =========================
# LISTAR
# =========================
@router.get("/")
def get_celdas(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        id_celda,
        nombre_celda,
        fila,
        columna
    FROM tbl_celda
    WHERE activo = 1
    ORDER BY id_celda
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return rows

# =========================
# CREAR
# =========================
@router.post("/")
def create_celda(data: CeldaSchema, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor()
    id_usuario = user["id"]

    try:
        cursor.execute("""
            INSERT INTO tbl_celda (
                nombre_celda,
                fila,
                columna,
                activo,
                id_usuario_creacion,
                fecha_creacion
            )
            VALUES (%s,%s,%s,1,%s,NOW())
        """, (
            data.nombre_celda,
            data.fila,
            data.columna,
            id_usuario
        ))

        conn.commit()

        return {"message": "Celda creada correctamente"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        conn.close()


# =========================
# EDITAR
# =========================
@router.put("/{id_celda}")
def update_celda(id_celda: int, data: CeldaSchema, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor()
    id_usuario = user["id"]

    try:
        cursor.execute("""
            UPDATE tbl_celda
            SET
                nombre_celda = %s,
                fila = %s,
                columna = %s,
                id_usuario_modificacion = %s,
                fecha_modificacion = NOW()
            WHERE id_celda = %s
        """, (
            data.nombre_celda,
            data.fila,
            data.columna,
            id_usuario,
            id_celda
        ))

        conn.commit()

        return {"message": "Celda actualizada correctamente"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        conn.close()


# =========================
# ELIMINAR (BAJA LOGICA)
# =========================
@router.delete("/{id_celda}")
def delete_celda(id_celda: int, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    id_usuario = user["id"]

    try:
        # Validar si tiene máquinas activas asignadas
        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM tbl_maquina
            WHERE id_celda = %s
              AND activo = 1
        """, (id_celda,))
        
        result = cursor.fetchone()

        if result["total"] > 0:
            raise HTTPException(
                status_code=400,
                detail="No se puede eliminar la celda porque tiene máquinas asignadas"
            )

        # Baja lógica
        cursor.execute("""
            UPDATE tbl_celda
            SET
                activo = 0,
                id_usuario_modificacion = %s,
                fecha_modificacion = NOW()
            WHERE id_celda = %s
        """, (
            id_usuario,
            id_celda
        ))

        conn.commit()

        return {"message": "Celda eliminada correctamente"}

    except HTTPException:
        raise

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        conn.close()

@router.get("/maquinas")
def get_celdas_maquinas(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        c.id_celda,
        c.nombre_celda,
        c.fila,
        c.columna,
        m.id_maquina,
        m.nombre_maquina
    FROM tbl_celda c
    LEFT JOIN tbl_maquina m 
        ON m.id_celda = c.id_celda
        AND m.activo = 1
    WHERE c.activo = 1
    ORDER BY c.id_celda
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    celdas = {}

    for row in rows:
        cid = row["id_celda"]

        if cid not in celdas:
            celdas[cid] = {
                "id": cid,
                "nombre_celda": row["nombre_celda"],
                "fila": row["fila"],
                "columna": row["columna"],
                "maquinas": []
            }

        if row["id_maquina"]:
            celdas[cid]["maquinas"].append({
                "id_maquina": row["id_maquina"],
                "nombre_maquina": row["nombre_maquina"]
            })

    # agregar total
    result = []
    for c in celdas.values():
        c["total_maquinas"] = len(c["maquinas"])
        result.append(c)

    return result