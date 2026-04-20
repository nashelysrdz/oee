from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_connection
from utils.auth import verify_token

router = APIRouter()

# =========================
# MODELO
# =========================
class EmpleadoSchema(BaseModel):
    numero_empleado: str
    id_tipo_trabajador: int
    nombre_trabajador: str
    es_admin: bool
    activo: bool

# =========================
# LISTAR ACTIVOS
# =========================
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

# =========================
# LISTAR TODAS
# =========================
@router.get("/empleadosAll")
def get_fallas(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        t.id_trabajador,
        t.numero_empleado,
        t.id_tipo_trabajador,
        t.nombre_trabajador,
        t.es_admin,
        t.activo,
        tt.tipo_trabajador
    FROM tbl_trabajador t
        INNER JOIN tbl_tipo_trabajador tt
        ON tt.id_tipo_trabajador = t.id_tipo_trabajador
    ORDER BY t.numero_empleado
    """

    cursor.execute(query)
    fallas = cursor.fetchall()

    return fallas

# =========================
# CREAR
# =========================
@router.post("/")
def create_empleado(data: EmpleadoSchema, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor()

    id_usuario = user["id"]  

    try:
        query = """
        INSERT INTO tbl_trabajador (
            numero_empleado,
            id_tipo_trabajador,
            nombre_trabajador,
            es_admin,
            activo,
            id_usuario_creacion,
            fecha_creacion
        )
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(query, (
            data.numero_empleado,
            data.id_tipo_trabajador,
            data.nombre_trabajador,
            1 if data.es_admin else 0,
            1 if data.activo else 0,
            id_usuario
        ))

        conn.commit()

        return {"message": "Registro agregado correctamente"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        conn.close()

# =========================
# EDITAR
# =========================
@router.put("/{id_trabajador}")
def update_empleado(id_trabajador: int, data: EmpleadoSchema, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor()

    id_usuario = user["id"]  

    try:
        query = """
        UPDATE tbl_trabajador
        SET
            numero_empleado = %s,
            id_tipo_trabajador = %s,
            nombre_trabajador = %s,
            es_admin = %s,
            activo = %s,
            id_usuario_modificacion = %s,
            fecha_modificacion = NOW()
        WHERE id_trabajador = %s
        """

        cursor.execute(query, (
            data.numero_empleado,
            data.id_tipo_trabajador,
            data.nombre_trabajador,
            1 if data.es_admin else 0,
            1 if data.activo else 0,
            id_usuario,
            id_trabajador
        ))

        conn.commit()

        return {"message": "Registro modificado correctamente"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        conn.close()


# =========================
# BAJA LÓGICA
# =========================
@router.delete("/{id_trabajador}")
def delete_empleado(id_trabajador: int, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor()

    id_usuario = user["id"]  

    try:
        query = """
        UPDATE tbl_trabajador
        SET activo = 0,
        id_usuario_modificacion = %s,
        fecha_modificacion = NOW()
        WHERE id_trabajador = %s
        """

        cursor.execute(query, (id_usuario, id_trabajador))
        conn.commit()

        return {"message": "Registro dado de baja correctamente"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
    finally:
        cursor.close()
        conn.close()
