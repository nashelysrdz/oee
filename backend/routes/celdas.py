from fastapi import APIRouter, Depends
from database import get_connection
from utils.auth import verify_token

router = APIRouter()

@router.get("/")
def get_celdas(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        c.id_celda,
        c.nombre_celda AS celda,
        m.nombre_maquina AS maquina
    FROM tbl_celda c
    LEFT JOIN tbl_maquina m 
        ON m.id_celda = c.id_celda
    ORDER BY c.id_celda
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    # 🔥 transformar a estructura usable
    celdas = {}

    for row in rows:
        celda_id = row["celda"]

        if celda_id not in celdas:
            celdas[celda_id] = {
                "id": celda_id,
                "maquinas": []
            }

        if row["maquina"]:
            celdas[celda_id]["maquinas"].append(row["maquina"])

    return list(celdas.values())