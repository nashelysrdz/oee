from fastapi import APIRouter, Depends
from database import get_connection
from utils.auth import verify_token

router = APIRouter()

# =========================
# LISTAR ACTIVOS
# =========================
@router.get("/")
def get_tiposTrabajador(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        id_tipo_trabajador,
        tipo_trabajador
    FROM tbl_tipo_trabajador
    WHERE activo = 1
    ORDER BY tipo_trabajador
    """

    cursor.execute(query)
    tiposTrabajador = cursor.fetchall()

    return tiposTrabajador