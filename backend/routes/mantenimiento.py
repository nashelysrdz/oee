from fastapi import APIRouter, Depends
from database import get_connection
from utils.auth import verify_token
from datetime import datetime

router = APIRouter()

# 🔥 crear registro
@router.post("/crear")
def crear_registro(data: dict, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO tbl_registro_falla 
    (id_maquina, id_trabajador_reporte, folio, hora_inicio, fecha_registro)
    VALUES (%s, %s, %s, %s, NOW())
    """

    cursor.execute(query, (
        data["id_maquina"],
        data["id_operador"],
        data["folio"],
        datetime.now().time()
    ))

    id_registro = cursor.lastrowid

    # 🔥 insertar fallas
    for falla in data["fallas"]:
        cursor.execute("""
        INSERT INTO tbl_detalle_registro (id_registro_falla, id_falla, activo)
        VALUES (%s, %s, 1)
        """, (id_registro, falla))

    # 🔥 actualizar estado máquina
    cursor.execute("""
    UPDATE tbl_maquina 
    SET id_estatus_maquina = 2 
    WHERE id_maquina = %s
    """, (data["id_maquina"],))

    conn.commit()

    return {"msg": "Registro creado", "id": id_registro}