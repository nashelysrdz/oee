import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// icons
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";

const Login = () => {
  const [tipo, setTipo] = useState("empleado");
  const [showPassword, setShowPassword] = useState(false);
  const [numeroEmpleado, setNumeroEmpleado] = useState("");

  const navigate = useNavigate();

  // 👇 usuarios mock
  const tecnicos = ["5678"];
  const operadores = ["9222"];

  const handleLogin = (e) => {
    e.preventDefault();

    // 👉 LOGIN EMPLEADO
    if (tipo === "empleado") {
      if (tecnicos.includes(numeroEmpleado)) {
        navigate("/dashboard/tecnico");
      } else if (operadores.includes(numeroEmpleado)) {
        navigate("/dashboard/operador");
      } else {
        alert("Empleado no válido");
      }
    }

    // 👉 LOGIN ADMIN (puedes mejorar esto luego)
    if (tipo === "admin") {
      navigate("/dashboard/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      
      {/* Card */}
      <div className="bg-secondary-100 p-8 rounded-2xl shadow-2xl w-[380px] text-white">
        
        {/* Selector */}
        <div className="flex mb-6 bg-secondary-900 rounded-lg overflow-hidden">
          <button
            onClick={() => setTipo("empleado")}
            className={`flex-1 py-2 transition ${
              tipo === "empleado"
                ? "bg-primary text-black"
                : "text-gray-400"
            }`}
          >
            Empleado
          </button>

          <button
            onClick={() => setTipo("admin")}
            className={`flex-1 py-2 transition ${
              tipo === "admin"
                ? "bg-primary text-black"
                : "text-gray-400"
            }`}
          >
            Administrador
          </button>
        </div>

        {/* Título */}
        <h1 className="text-2xl text-center font-bold mb-6">
          Sistema OEE
        </h1>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          
          {/* Número empleado */}
          <div>
            <label className="text-sm text-gray-400">
              Número de empleado
            </label>
            <input
              type="text"
              placeholder="10023"
              value={numeroEmpleado}
              onChange={(e) => setNumeroEmpleado(e.target.value)}
              className="w-full mt-1 py-3 px-4 bg-secondary-900 rounded-lg outline-none"
            />
          </div>

          {/* Password SOLO admin */}
          {tipo === "admin" && (
            <div className="relative">
              <label className="text-sm text-gray-400">
                Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full mt-1 py-3 px-4 bg-secondary-900 rounded-lg outline-none"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[45px] cursor-pointer text-gray-400"
              >
                {showPassword ? <RiEyeOffFill/>:<RiEyeFill/>}
              </span>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-primary hover:opacity-90 transition py-3 rounded-lg mt-4 text-black"
          >
            Ingresar
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Sistema OEE - Control de Producción
        </p>
      </div>
    </div>
  );
};

export default Login;