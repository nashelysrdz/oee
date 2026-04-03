import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../api/axios";
import { toast } from "react-toastify";

// icons
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";

const Login = () => {
  const [tipo, setTipo] = useState("empleado");
  const [showPassword, setShowPassword] = useState(false);
  const [numeroEmpleado, setNumeroEmpleado] = useState("");
  const [password, setPassword] = useState(""); 

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      let payload = {
        tipo: tipo,
      };

      // LOGIN EMPLEADO
      if (tipo === "empleado") {
        payload.numero_empleado = numeroEmpleado;
      }

      // LOGIN ADMIN
      if (tipo === "admin") {
        payload.numero_empleado = numeroEmpleado;
        payload.password = password;
      }

      const res = await api.post("/login", payload);

      if (res.data.success === false) {
        toast.error(res.data.message || "Error en login");
        return;
      }

      if (res.data.success === true) {
        const { rol, access_token, es_admin } = res.data;


        // GUARDAR TOKEN
        localStorage.setItem("token", access_token);
        localStorage.setItem("rol", rol.toLowerCase());
        localStorage.setItem("es_admin", es_admin);

        if (es_admin === 1){
          navigate("/");
        } else if (rol === "tecnico") {
          navigate("/dashboard/tecnico");
        } else if (rol === "operador") {
          navigate("/dashboard/operador");
        }
      }

    } catch (error) {
      console.error(error);
      toast.error("Error conectando con el servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-secondary-100 p-8 rounded-2xl shadow-2xl w-[380px] text-white">

        {/* Selector */}
        <div className="flex mb-6 bg-secondary-900 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setTipo("empleado")}
            className={`flex-1 py-2 transition ${tipo === "empleado"
                ? "bg-primary text-black"
                : "text-gray-400"
              }`}
          >
            Empleado
          </button>

          <button
            type="button"
            onClick={() => setTipo("admin")}
            className={`flex-1 py-2 transition ${tipo === "admin"
                ? "bg-primary text-black"
                : "text-gray-400"
              }`}
          >
            Administrador
          </button>
        </div>

        <h1 className="text-2xl text-center font-bold mb-6">
          Sistema OEE
        </h1>

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
              required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mt-1 py-3 px-4 bg-secondary-900 rounded-lg outline-none"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[45px] cursor-pointer text-gray-400"
              >
                {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary hover:opacity-90 transition py-3 rounded-lg mt-4 text-black"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Sistema OEE - Control de Producción
        </p>
      </div>
    </div>
  );
};

export default Login;