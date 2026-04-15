from fastapi import APIRouter, Depends
from database import get_connection
from utils.auth import verify_token

router = APIRouter(prefix="/maquinas", tags=["maquinas"])

@router.get("/celda/{id_celda}")
def get_maquinas_por_celda(id_celda: int, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        m.id_maquina,
        m.nombre_maquina,
        e.estatus_maquina
    FROM tbl_maquina m
    INNER JOIN tbl_estatus_maquina e 
        ON m.id_estatus_maquina = e.id_estatus_maquina
    WHERE m.id_celda = %s
    AND m.activo = 1
    """

    cursor.execute(query, (id_celda,))
    return cursor.fetchall()