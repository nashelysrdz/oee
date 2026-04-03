from fastapi import APIRouter, Depends
from utils.auth import verify_token

router = APIRouter()

@router.get("/perfil")
def perfil(user=Depends(verify_token)):
    return {
        "message": "Acceso permitido",
        "user": user
    }