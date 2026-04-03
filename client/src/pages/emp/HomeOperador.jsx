import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const celdas = [
  { id: "C1", maquinas: ["M01", "M02"] },
  { id: "C2", maquinas: ["M03", "M04"] },
  { id: "C3", maquinas: ["M05", "M06"] },
  { id: "C4", maquinas: ["M07", "M08"] },
  { id: "C5", maquinas: ["M09", "M10"] },
  { id: "C6", maquinas: ["M11", "M12"] },
  { id: "C7", maquinas: ["M13", "M14"] },
  { id: "C8", maquinas: ["M15", "M16"] },
  { id: "C9", maquinas: ["M17", "M18"] },
  { id: "C10", maquinas: ["M19", "M20"] },
];

const HomeOperador = () => {
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full text-white flex flex-col items-center px-2 py-10">
      
      {/* Título */}
      <h1 className="text-4xl font-bold mb-10 text-center">
        Localizador de Máquinas
      </h1>

      {/* Buscador */}
      <div className="flex gap-4 mb-12 w-full max-w-xl">
        <input
          type="text"
          placeholder="Buscar máquina (M01...)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 px-4 py-3 bg-[#1e1f25] rounded-lg border border-gray-700 outline-none focus:border-green-500"
        />
        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition">
          Buscar
        </button>
      </div>

      {/* Grid de CELDAS */}
      <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-5 gap-6 w-full max-w-7xl">
        {celdas.map((celda) => {
          const match = celda.maquinas.some((m) =>
            m.toLowerCase().includes(busqueda.toLowerCase())
          );

          return (
            <div
              key={celda.id}
              onClick={() => navigate(`/dashboard/celda/${celda.id}`)}
              className={`w-full aspect-square flex items-center justify-center rounded-md cursor-pointer border transition
                ${
                  match && busqueda
                    ? "border-green-500 bg-green-600/20 shadow-md shadow-green-500/20"
                    : "border-gray-700 bg-[#1a1b20] hover:border-green-500 hover:bg-[#22232a]"
                }`}
            >
              <span className="text-xl font-bold tracking-wider">
                {celda.id}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeOperador;