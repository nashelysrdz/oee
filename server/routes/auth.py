from fastapi import APIRouter
from database import get_connection
from schemas import LoginRequest
from utils.jwt import create_access_token
from utils.auth import verify_password

router = APIRouter()

@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # 🔹 LOGIN EMPLEADO
    if data.tipo == "empleado":
        query = """
        SELECT 
            t.numero_empleado,
            tt.tipo_trabajador AS rol
        FROM tbl_trabajador t
        INNER JOIN tbl_tipo_trabajador tt 
            ON t.id_tipo_trabajador = tt.id_tipo_trabajador
        WHERE t.numero_empleado = %s
        AND t.activo = 1
        """
        cursor.execute(query, (data.numero_empleado,))
        user = cursor.fetchone()

        if not user:
            return {"success": False, "message": "Empleado no válido"}

        return {
            "success": True,
            "rol": user["rol"].lower(),
            "access_token": create_access_token({
                "numero_empleado": data.numero_empleado,
                "rol": user["rol"],
                "es_admin": user.get("es_admin", 0)
                })
        }

    # 🔹 LOGIN ADMIN (usa numero_empleado)
    if data.tipo == "admin":
        query = """
        SELECT 
            u.password,
            tt.tipo_trabajador AS rol,
            t.es_admin
        FROM tbl_usuario u
        INNER JOIN tbl_trabajador t 
            ON u.id_trabajador = t.id_trabajador
        INNER JOIN tbl_tipo_trabajador tt 
            ON t.id_tipo_trabajador = tt.id_tipo_trabajador
        WHERE t.numero_empleado = %s
        AND u.activo = 1
        AND t.activo = 1
        """
        cursor.execute(query, (data.numero_empleado,))
        user = cursor.fetchone()

        if not user:
            return {"success": False, "message": "No tiene permisos de administrador"}

        if not verify_password(data.password, user["password"]):
            return {"success": False, "message": "Contraseña incorrecta"}

        return {
            "success": True,
            "rol": user["rol"].lower(),
            "es_admin": user["es_admin"],
            "access_token": create_access_token({
                "numero_empleado": data.numero_empleado,
                "rol": user["rol"],
                "es_admin": user.get("es_admin", 0)
            })
        }

    return {"success": False}