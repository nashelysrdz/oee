import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const HomeOperador = () => {
  const [busqueda, setBusqueda] = useState("");
  const [celdas, setCeldas] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCeldas = async () => {
      try {
        const res = await api.get("/celdas");
        setCeldas(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCeldas();
  }, []);

  // filtro
  const celdasFiltradas = celdas.filter((celda) =>{
    // si no hay búsqueda → mostrar todas (incluyendo vacías)
    if (!busqueda) return true;

    // si no tiene máquinas → NO coincide búsqueda
    if (!celda.maquinas || celda.maquinas.length === 0) return false;

    return celda.maquinas.some((m) =>
      m.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

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

      {/* LOADING */}
      {loading && <p>Cargando...</p>}

      {/* SIN REGISTROS */}
      {!loading && celdas.length === 0 && (
        <p className="text-gray-400">No hay registros</p>
      )}

      {/* SIN RESULTADOS DE BÚSQUEDA */}
      {!loading && celdas.length > 0 && celdasFiltradas.length === 0 && (
        <p className="text-gray-400">No se encontraron resultados</p>
      )}

      {/* Grid de CELDAS */}
      <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-5 gap-6 w-full max-w-7xl">
        {celdasFiltradas.map((celda) => {
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
                {celda.nombre}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeOperador;