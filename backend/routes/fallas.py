from fastapi import APIRouter, Depends
from database import get_connection
from utils.auth import verify_token

router = APIRouter()

@router.get("/")
def get_fallas(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        id_falla,
        codigo,
        falla
    FROM tbl_falla
    WHERE activo = 1
    ORDER BY codigo
    """

    cursor.execute(query)
    fallas = cursor.fetchall()

    return fallas