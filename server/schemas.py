from pydantic import BaseModel, field_validator
from typing import Optional

class LoginRequest(BaseModel):
    tipo: str
    numero_empleado: Optional[str] = None
    password: Optional[str] = None

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v):
        if v not in ["empleado", "admin"]:
            raise ValueError("Tipo inválido")
        return v

    @field_validator("numero_empleado")
    @classmethod
    def validar_numero(cls, v):
        if not v:
            raise ValueError("numero_empleado es requerido")
        return v

    @field_validator("password")
    @classmethod
    def validar_password(cls, v, info):
        if info.data.get("tipo") == "admin" and not v:
            raise ValueError("password es requerido para admin")
        return v