import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CeldaDetalle = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validando, setValidando] = useState(false);
  const [comentarios, setComentarios] = useState("");

  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [modo, setModo] = useState(null); // "ver" | "crear"
  const [mostrarModal, setMostrarModal] = useState(false);

  const [tiempoActual, setTiempoActual] = useState(new Date());

  //fallas
const [fallas, setFallas] = useState([]);
const [fallasSeleccionadas, setFallasSeleccionadas] = useState([]);
const [busquedaFalla, setBusquedaFalla] = useState("");

  const formatearHora = (fecha) => {
    if (!fecha) return "";

    const date = new Date(fecha);

    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");

    return `${horas}:${minutos}`;
  };

  useEffect(() => {
    const fetchMaquinas = async () => {
      try {
        const res = await api.get(`/maquinas/celda/${id}`);
        setMaquinas(res.data);
      } catch (error) {
        console.error("Error cargando máquinas:", error);
      } finally {
        setLoading(false);
      }
    };

    // Carga inicial inmediata
    fetchMaquinas();

    // Polling
    const interval = setInterval(fetchMaquinas, 5000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoActual(new Date());
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!mostrarModal) return;
  
    const fetchFallas = async () => {
      try {
        const res = await api.get("/fallas");
        setFallas(res.data);
      } catch (error) {
        console.error("Error cargando fallas:", error);
      }
    };
  
    fetchFallas();
  }, [mostrarModal]);
  
  const seleccionarMaquina = async (m) => {
    setValidando(true);

    try {
      // SOLO VALIDAR estado real
      const res = await api.get(`/maquinas/${m.id_maquina}`);
      const maquinaActual = res.data;

      setMaquinas((prev) =>
        prev.map((maq) =>
          maq.id_maquina === m.id_maquina
            ? { ...maq, estatus_maquina: maquinaActual.estatus_maquina }
            : maq
        )
      );

      setMaquinaSeleccionada(maquinaActual);

      const enMantenimiento =
        maquinaActual.codigo === "MANTENIMIENTO";

      if (enMantenimiento) {
        // Mostrar info
        setModo("ver");
        setMostrarModal(false);
      } else {

        // LIMPIAR modal antes de abrir
        setFallasSeleccionadas([]);
        setBusquedaFalla("");

        // Abrir modal
        setModo("crear");
        setMostrarModal(true);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setValidando(false);
    }
  };

  const calcularTiempoTranscurrido = (horaInicio, horaFin) => {
    if (!horaInicio) return "00:00:00";
  
    const inicio = new Date(horaInicio);
    const fin = horaFin ? new Date(horaFin) : tiempoActual;
  
    const diffMs = fin - inicio;
  
    const totalSegundos = Math.floor(diffMs / 1000);
  
    const dias = Math.floor(totalSegundos / 86400);
    const horas = Math.floor((totalSegundos % 86400) / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
  
    if (dias > 0) {
      return `${dias}d ${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    }
  
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
  };

  const fallasFiltradas = fallas.filter((f) =>
    f.falla?.toLowerCase().includes(busquedaFalla.toLowerCase())
  );

  const confirmarFallas = () => {
    console.log("Fallas seleccionadas:", fallasSeleccionadas);
    setMostrarModal(false);
  };
  
  return (
    <div className="min-h-screen text-white px-6">

      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
      >
        ← Regresar
      </button>

      <h1 className="text-3xl font-bold mb-10 text-center">
        Seleccione la máquina
      </h1>

      {/* SIN REGISTROS */}
      {!loading && maquinas.length === 0 && (
        <p className="text-gray-400 text-center">No hay registros</p>
      )}

      {/* LOADING */}
      {loading && <p>Cargando máquinas...</p>}

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {maquinas.map((m) => (
          <div
            key={m.id_maquina}
            onClick={() => seleccionarMaquina(m)}
            className={`p-6 rounded-lg border text-center transition cursor-pointer
                ${m.codigo === "MANTENIMIENTO"
                ? "bg-gray-600/30 border-gray-500"
                : "bg-[#1a1b20] border-gray-700 hover:border-green-500"
              }`}
          >
            <span className="text-xl font-semibold">
              {m.nombre_maquina}
            </span>
          </div>
        ))}
      </div>

      {modo === "ver" && maquinaSeleccionada && (
        <div className="bg-[#1e1f25] p-6 rounded-lg border border-gray-700 mt-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            Máquina en mantenimiento
          </h2>

          <p><strong>Máquina:</strong> {maquinaSeleccionada.nombre_maquina}</p>
          <p><strong>Operador:</strong> {maquinaSeleccionada.numero_empleado} - {maquinaSeleccionada.nombre_trabajador}</p>
          <p><strong>Folio:</strong> {maquinaSeleccionada.folio}</p>
          <p>  <strong>Hora generada:</strong> {formatearHora(maquinaSeleccionada.fecha_creacion)}</p>
          <p><strong>Fallas:</strong></p>
          {maquinaSeleccionada.fallas ? (
            <ul className="ml-4 list-disc">
              {maquinaSeleccionada.fallas.split(", ").map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ) : (
            <p>No hay fallas registradas</p>
          )}
          {/* Técnico */}
          {!maquinaSeleccionada.hora_inicio ? (
            <button
              onClick={() => console.log("Técnico llegó")}
              className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg"
            >
              Técnico llegó
            </button>
          ) : (
            <><p className="mt-4 mb-2 text-green-400">
              <strong>Hora llegada de técnico:</strong>{" "}
              {formatearHora(maquinaSeleccionada.hora_inicio)}
            </p>
              <p>
                <strong>No. de orden:</strong> {maquinaSeleccionada.numero_orden}
              </p>
              <p>
                <strong>Tiempo mantenimiento:</strong>{" "}
                {calcularTiempoTranscurrido(
                  maquinaSeleccionada?.hora_inicio,
                  maquinaSeleccionada?.hora_fin
                )}
              </p>
              <div className="mt-2">
                <strong>
                  Comentarios
                </strong>
                <textarea
                  placeholder="Escribe observaciones del mantenimiento..."
                  onChange={(e) => setComentarios(e.target.value)}
                  className="w-full mt-2 p-3 bg-[#131517] border border-gray-700 rounded-lg outline-none resize-none h-24 focus:border-green-500"
                />
              </div>
              <button
                disabled={!comentarios.trim()}
                className={`mt-4 px-4 py-2 rounded-lg w-full
                ${!comentarios.trim()
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
              >
                Finalizar mantenimiento
              </button>
            </>
          )}
        </div>
      )}

      {mostrarModal && modo === "crear" && (
        
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

        <div className="bg-[#1e1f25] w-[90%] max-w-2xl max-h-[80vh] rounded-lg border border-gray-700 flex flex-col">

          {/* HEADER */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-yellow-400">
            Seleccionar fallas para la máquina:{" "}
            <span>
              {maquinaSeleccionada?.nombre_maquina}
            </span>
          </h2>
            <button
              onClick={() => setMostrarModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* BUSCADOR */}
          <div className="p-4">
            <input
              type="text"
              placeholder="Buscar falla..."
              value={busquedaFalla}
              onChange={(e) => setBusquedaFalla(e.target.value)}
              className="w-full px-3 py-2 bg-[#131517] border border-gray-700 rounded"
            />
          </div>

          {/* LISTA */}
          <div className="px-4 overflow-y-auto flex-1">
          {fallasFiltradas.length === 0 && (
            <p className="pb-5 text-gray-400 text-center mt-4">
              No se encontraron resultados
            </p>
          )}
            <div className="pb-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {fallasFiltradas.map((f) => (
                <label
                  key={f.id_falla}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-700/40 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={fallasSeleccionadas.includes(f.id_falla)}
                    onChange={() => {
                      if (fallasSeleccionadas.includes(f.id_falla)) {
                        setFallasSeleccionadas(
                          fallasSeleccionadas.filter((x) => x !== f.id_falla)
                        );
                      } else {
                        setFallasSeleccionadas([...fallasSeleccionadas, f.id_falla]);
                      }
                    }}
                  />
                  <span className="text-sm">{f.falla}</span>
                </label>
              ))}
              
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
            <button
              onClick={() => {
                setMostrarModal(false);
                setFallasSeleccionadas([]);
                setBusquedaFalla("");
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
            >
              Cancelar
            </button>

            <button
              onClick={async () => {
                try {
                  await api.post("/mantenimiento/crear", {
                    id_maquina: maquinaSeleccionada.id_maquina,
                    fallas: fallasSeleccionadas
                  });
              
                  // refrescar máquinas
                  const res = await api.get(`/maquinas/celda/${id}`);
                  setMaquinas(res.data);
              
                  setMostrarModal(false);
                  setFallasSeleccionadas([]);
                  setBusquedaFalla("");
              
                } catch (error) {
                  console.error(error);
                }
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              Guardar
            </button>
          </div>

        </div>
      </div>






      )}

    </div>
  );
};

export default CeldaDetalle;