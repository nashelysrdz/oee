from fastapi import APIRouter, Depends
from utils.auth import verify_token
from utils.auth import verify_token, require_role 

router = APIRouter()

@router.get("/perfil")
def perfil(user=Depends(verify_token)):
    return {
        "message": "Acceso permitido",
        "user": user
    }

@router.get("/tecnico")
def vista_tecnico(user=Depends(require_role(["tecnico"]))):
    return {"msg": "Solo técnicos"}

# SOLO OPERADOR
@router.get("/operador")
def vista_operador(user=Depends(require_role(["operador"]))):
    return {"msg": "Solo operadores"}