from fastapi import APIRouter, Depends
from database import get_connection
from utils.auth import verify_token

router = APIRouter()

# =========================
# LISTAR ACTIVOS
# =========================
@router.get("/")
def get_estatusMaquina(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        id_estatus_maquina,
        estatus_maquina
    FROM tbl_estatus_maquina
    WHERE activo = 1
    ORDER BY estatus_maquina
    """

    cursor.execute(query)
    estatusMaquina = cursor.fetchall()

    return estatusMaquina