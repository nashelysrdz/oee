from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_connection
from utils.auth import verify_token
import bcrypt
import secrets
import string

router = APIRouter()

# =========================
# MODELO
# =========================
class UsuarioSchema(BaseModel):
    id_trabajador: int
    password: str
    activo: bool

def generar_password(longitud=10):
    caracteres = string.ascii_letters + string.digits
    return ''.join(secrets.choice(caracteres) for _ in range(longitud))

# =========================
# LISTAR ACTIVOS
# =========================
@router.get("/")
def get_usuarios(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        u.id_usuario,
        t.id_trabajador,
        t.numero_empleado,
        t.nombre_trabajador
    FROM tbl_usuario u
    INNER JOIN tbl_trabajador t
        ON u.id_trabajador = t.id_trabajador
    WHERE t.activo = 1
    ORDER BY numero_empleado
    """

    cursor.execute(query)
    usuarios = cursor.fetchall()

    return usuarios

# =========================
# LISTAR TODAS
# =========================
@router.get("/usuariosAll")
def get_usuarios(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        t.id_trabajador,
        t.numero_empleado,
        t.id_tipo_trabajador,
        t.nombre_trabajador,
        u.id_usuario,
        u.activo
    FROM tbl_usuario u
        INNER JOIN tbl_trabajador t
        ON t.id_trabajador = u.id_trabajador
    ORDER BY t.numero_empleado
    """

    cursor.execute(query)
    usuarios = cursor.fetchall()

    return usuarios

@router.get("/disponibles")
def trabajadores_disponibles(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        t.id_trabajador,
        t.numero_empleado,
        t.nombre_trabajador,
        IFNULL(u.id_usuario, 0) AS id_usuario
    FROM tbl_trabajador t
    LEFT JOIN tbl_usuario u 
    	ON u.id_trabajador = t.id_trabajador
    WHERE t.activo = 1
    ORDER BY t.numero_empleado
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return data

@router.post("/")
def crear_usuario(data: dict, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor()
    id_usuario = user["id"]

    password_generada = generar_password()
    hashed = bcrypt.hashpw(password_generada.encode(), bcrypt.gensalt()).decode()

    query = """
    INSERT INTO tbl_usuario (id_trabajador, password, activo, id_usuario_creacion, fecha_creacion)
    VALUES (%s, %s, 1, %s, NOW())
    """

    cursor.execute(query, (
        data["id_trabajador"],
        hashed,
        id_usuario
    ))

    # actualizar trabajador
    query_update = """
    UPDATE tbl_trabajador
    SET es_admin = 1,
        id_usuario_modificacion = %s,
        fecha_modificacion = NOW()
    WHERE id_trabajador = %s
    """

    cursor.execute(
        query_update,
        (
            id_usuario,
            data["id_trabajador"]
        )
    )

    conn.commit()

    return {
        "password_generada": password_generada
    }

@router.delete("/{id_usuario}")
def eliminar_usuario(id_usuario: int, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    id_usuario_modifica = user["id"]

    # buscar trabajador relacionado
    query_find = """
    SELECT id_trabajador
    FROM tbl_usuario
    WHERE id_usuario = %s
    """
    cursor.execute(query_find, (id_usuario,))
    usuario = cursor.fetchone()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    id_trabajador = usuario["id_trabajador"]

    # eliminar usuario
    query_delete = """
    UPDATE tbl_usuario
    SET activo = 0,
        id_usuario_modificacion = %s,
        fecha_modificacion = NOW()
    WHERE id_usuario = %s
    """
    cursor.execute(query_delete, (id_usuario_modifica, id_usuario))

    # actualizar trabajador
    query_update = """
    UPDATE tbl_trabajador
    SET es_admin = 0,
        id_usuario_modificacion = %s,
        fecha_modificacion = NOW()
    WHERE id_trabajador = %s
    """
    cursor.execute(query_update, (
        id_usuario_modifica,
        id_trabajador
    ))

    conn.commit()

    return {"message": "Usuario eliminado correctamente"}

@router.put("/password/{id_usuario}")
def cambiar_password(id_usuario: int, data: dict, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor()

    nueva_password = data.get("password")

    if not nueva_password:
        raise HTTPException(status_code=400, detail="Contraseña requerida")

    hashed = bcrypt.hashpw(
        nueva_password.encode(),
        bcrypt.gensalt()
    ).decode()

    query = """
    UPDATE tbl_usuario
    SET password = %s
    WHERE id_usuario = %s
    """

    cursor.execute(query, (
        hashed,
        id_usuario
    ))

    conn.commit()

    return {"message": "Contraseña actualizada"}