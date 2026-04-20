import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const HomeTecnico = () => {
  const [eventos, setEventos] = useState([]);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [modo, setModo] = useState(null); // iniciar | finalizar
  const [mostrarModalInicio, setMostrarModalInicio] = useState(false);
  const [comentarios, setComentarios] = useState("");
  const [tiempoActual, setTiempoActual] = useState(new Date());

  const [numeroOrden, setNumeroOrden] = useState("");
  const [errorInicio, setErrorInicio] = useState("");

  const cargarEventos = async () => {
    try {
      const res = await api.get("/maquinas/tecnico/eventos");
      setEventos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarEventos();

    const interval = setInterval(cargarEventos, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoActual(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatearHora = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  const calcularTiempo = (inicio, fin) => {
    if (!inicio) return "00:00:00";

    const start = new Date(inicio);
    const end = fin ? new Date(fin) : tiempoActual;

    const diff = Math.floor((end - start) / 1000);

    const h = String(Math.floor(diff / 3600)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");

    return `${h}:${m}:${s}`;
  };

  const seleccionarEvento = async (evento) => {
    try {
      const res = await api.get(`/maquinas/${evento.id_maquina}`);
      const detalle = res.data;

      setMaquinaSeleccionada(detalle);

      if (!detalle.hora_inicio) {
        setModo("iniciar");
        setMostrarModalInicio(true);
      } else {
        setModo("finalizar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const finalizarMantenimiento = async () => {
    try {
      await api.post("/mantenimiento/finalizar", {
        id_registro_falla: maquinaSeleccionada.id_registro_falla,
        comentarios
      });

      setMaquinaSeleccionada(null);
      setComentarios("");
      cargarEventos();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-center">
          🔧 Eventos activos
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

          {eventos.length === 0 && (
            <p className="col-span-full text-gray-400 text-center">
              No se encontraron registros
            </p>
          )}

          {eventos.map((evento) => (
            <div
              key={evento.id_registro_falla}
              onClick={() => seleccionarEvento(evento)}
              className="p-6 rounded-xl border text-center cursor-pointer
              bg-secondary border-gray-700 hover:border-[#0F4C81]"
            >
              <span className="text-xl font-semibold block">
                {evento.nombre_maquina}
              </span>

              <p
                className={`text-sm mt-2 ${evento.estado_evento === "En proceso"
                  ? "text-green-400"
                  : "text-yellow-400"
                  }`}
              >
                {evento.estado_evento}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Operador: {evento.numero_empleado}
              </p>
            </div>
          ))}
        </div>

        {modo === "finalizar" && maquinaSeleccionada && (
          <div className="bg-secondary p-6 rounded-lg border mt-8">
            <h2 className="text-xl font-bold text-green-400 mb-4">
              Mantenimiento en proceso
            </h2>
            <p><strong>Máquina:</strong> {maquinaSeleccionada.nombre_maquina}</p>
            <p><strong>Operador:</strong> {maquinaSeleccionada.numero_empleado} - {maquinaSeleccionada.nombre_trabajador}</p>
            <p><strong>Folio:</strong> {maquinaSeleccionada.folio}</p>
            <p><strong>Hora generada:</strong> {formatearHora(maquinaSeleccionada.fecha_creacion)}</p>
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

            <p>
              <p className="mt-4 mb-2 text-green-400">
                <strong>Hora llegada de técnico:</strong>{" "}
                {formatearHora(maquinaSeleccionada.hora_inicio)}
              </p>
              <p>
                <strong>No. de orden:</strong> {maquinaSeleccionada.numero_orden}
              </p>


              <strong>Tiempo mantenimiento::</strong>{" "}
              {calcularTiempo(
                maquinaSeleccionada.hora_inicio,
                maquinaSeleccionada.hora_fin
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
              onClick={finalizarMantenimiento}
              className={`mt-4 px-4 py-2 rounded-lg w-full
                ${!comentarios.trim()
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
                }`}
            >
              Finalizar mantenimiento
            </button>
          </div>
        )}
      </div>

      {mostrarModalInicio && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-[#1e1f25] w-[90%] max-w-md rounded-xl border border-gray-700">

            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-yellow-400">
                Iniciar mantenimiento de la máquina {maquinaSeleccionada?.nombre_maquina}
              </h2>
              <button
                onClick={() => setMostrarModalInicio(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <label className="block text-sm text-gray-400 mb-1">
                Número de orden
              </label>
              <input
                value={numeroOrden}
                onChange={(e) => setNumeroOrden(e.target.value)}
                placeholder="Número de orden"
                className="w-full px-3 py-2 bg-[#131517] border border-gray-700 rounded-lg"
              />
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setMostrarModalInicio(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  if (!numeroOrden.trim()) {
                    setErrorInicio("Número de orden obligatorio");
                    return;
                  }

                  try {
                    setErrorInicio("");

                    await api.post("/mantenimiento/iniciar", {
                      id_registro_falla: maquinaSeleccionada.id_registro_falla,
                      numero_orden: numeroOrden
                    });

                    const res = await api.get(`/maquinas/${maquinaSeleccionada.id_maquina}`);
                    setMaquinaSeleccionada(res.data);

                    setMostrarModalInicio(false);
                    setNumeroOrden("");
                    cargarEventos();

                  } catch (error) {
                    setErrorInicio(
                      error.response?.data?.detail || "Error al iniciar"
                    );
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Iniciar
              </button>
            </div>

          </div>
        </div>

      )}
    </div>
  );
};

export default HomeTecnico;