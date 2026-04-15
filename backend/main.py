from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, user, celdas, maquinas

app = FastAPI()

# CORS para React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# rutas
app.include_router(auth.router, prefix="/auth")
app.include_router(user.router, prefix="/user")
app.include_router(celdas.router, prefix="/celdas")
app.include_router(maquinas.router)