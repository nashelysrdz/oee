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
class EmpleadoSchema(BaseModel):
    numero_empleado: str
    id_tipo_trabajador: int
    nombre_trabajador: str
    es_admin: bool
    activo: bool

def generar_password(longitud=10):
    caracteres = string.ascii_letters + string.digits
    return ''.join(secrets.choice(caracteres) for _ in range(longitud))

# =========================
# LISTAR ACTIVOS
# =========================
@router.get("/")
def get_empleados(user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        id_trabajador,
        numero_empleado,
        id_tipo_trabajador,
        nombre_trabajador
    FROM tbl_trabajador
    WHERE activo = 1
    ORDER BY numero_empleado
    """

    cursor.execute(query)
    empleados = cursor.fetchall()

    return empleados

# =========================
# LISTAR TODAS
# =========================
@router.get("/empleadosAll")
def get_empleados(user=Depends(verify_token)):
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
    empleados = cursor.fetchall()

    return empleados

# =========================
# CREAR
# =========================
@router.post("/")
def create_empleado(data: EmpleadoSchema, user=Depends(verify_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    id_usuario = user["id"]

    try:
        cursor.execute(
            "SELECT id_trabajador FROM tbl_trabajador WHERE numero_empleado = %s",
            (data.numero_empleado,)
        )
        existe = cursor.fetchone()

        if existe:
            raise HTTPException(status_code=400, detail="El número de empleado ya existe")

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
        VALUES (%s,%s,%s,%s,%s,%s,NOW())
        """

        cursor.execute(query, (
            data.numero_empleado,
            data.id_tipo_trabajador,
            data.nombre_trabajador,
            1 if data.es_admin else 0,
            1 if data.activo else 0,
            id_usuario
        ))

        id_trabajador = cursor.lastrowid
        password_generada = None

        if data.es_admin:
            password_generada = generar_password()
            password_hash = bcrypt.hashpw(
                password_generada.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")

            cursor.execute("""
                INSERT INTO tbl_usuario (
                    id_trabajador,
                    password,
                    activo, 
                    id_usuario_creacion,
                    fecha_creacion
                )
                VALUES (%s,%s,%s, %s, NOW())
            """, (
                id_trabajador,
                password_hash,
                1,
                id_usuario
            ))

        conn.commit()

        return {
            "message": "Registro agregado correctamente",
            "password_generada": password_generada
        }

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
    cursor = conn.cursor(dictionary=True)
    id_usuario = user["id"]

    try:
        cursor.execute("""
            SELECT es_admin FROM tbl_trabajador
            WHERE id_trabajador = %s
        """, (id_trabajador,))
        empleado_actual = cursor.fetchone()

        cursor.execute("""
            SELECT id_usuario FROM tbl_usuario
            WHERE id_trabajador = %s
        """, (id_trabajador,))
        usuario = cursor.fetchone()

        query = """
        UPDATE tbl_trabajador
        SET numero_empleado=%s,
            id_tipo_trabajador=%s,
            nombre_trabajador=%s,
            es_admin=%s,
            activo=%s,
            id_usuario_modificacion=%s,
            fecha_modificacion=NOW()
        WHERE id_trabajador=%s
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

        password_generada = None

        if data.es_admin:
            if usuario:
                cursor.execute("""
                    UPDATE tbl_usuario
                    SET activo = 1, 
                        id_usuario_modificacion = %s,
                        fecha_modificacion = NOW()
                    WHERE id_trabajador = %s
                """, (id_usuario, id_trabajador))
            else:
                password_generada = generar_password()
                password_hash = bcrypt.hashpw(
                    password_generada.encode("utf-8"),
                    bcrypt.gensalt()
                ).decode("utf-8")

                cursor.execute("""
                    INSERT INTO tbl_usuario (
                        id_trabajador,
                        password,
                        activo,
                        id_usuario_creacion,
                        fecha_creacion
                    )
                    VALUES (%s,%s,1,%s,NOW())
                """, (
                    id_trabajador,
                    password_hash,
                    id_usuario
                ))

        else:
            if usuario:
                cursor.execute("""
                    UPDATE tbl_usuario
                    SET activo = 0,
                        id_usuario_modificacion = %s,
                        fecha_modificacion = NOW()
                    WHERE id_trabajador = %s
                """, (id_usuario, id_trabajador,))

        conn.commit()

        return {
            "message": "Registro modificado correctamente",
            "password_generada": password_generada
        }

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
