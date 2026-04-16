import React, { useState, useEffect } from "react";

const HomeTecnico = () => {
  //  mock
  const [eventosData, setEventosData] = useState([
    {
      maquina: "M01",
      estado: "Esperando técnico",
      operador: "1234",
      tecnico: null,
      celda: "C1",
    },
    {
      maquina: "M05",
      estado: "En proceso",
      operador: "5678",
      tecnico: "9222",
      celda: "C3",
    },
  ]);

  // 👇 SOLO sin técnico
  const estadosVisibles = ["Esperando técnico", "En proceso"];
  const tecnicoLogueado = "9222";

  const [comentarios, setComentarios] = useState("");

  const eventos = eventosData.filter((e) =>
    e.estado === "Esperando técnico" ||
    (e.estado === "En proceso" && e.tecnico === tecnicoLogueado)
  );

  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [orden, setOrden] = useState("");

  const [horaInicio, setHoraInicio] = useState(null);
  const [contador, setContador] = useState("00:00:00");

  // ⏱️ contador estilo CeldaDetalle
  useEffect(() => {
    let timer;

    if (horaInicio) {
      timer = setInterval(() => {
        const ahora = new Date();
        const inicio = new Date(horaInicio);

        const diff = Math.floor((ahora - inicio) / 1000);

        const h = String(Math.floor(diff / 3600)).padStart(2, "0");
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        const s = String(diff % 60).padStart(2, "0");

        setContador(`${h}:${m}:${s}`);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [horaInicio]);

  const seleccionarEvento = (evento) => {
    setEventoSeleccionado(evento);

    if (evento.estado === "En proceso") {
      // 🔥 ya está en proceso → NO pedir orden
      setHoraInicio(new Date()); // aquí luego vendrá del backend
      setMostrarModal(false);
    } else {
      // 🟡 esperando técnico → sí pedir orden
      setMostrarModal(true);
    }
  };

  const iniciar = () => {
    if (!orden) return;

    const inicio = new Date();
    setHoraInicio(inicio);

    // ✅ PRIMERO crear el objeto
    const eventoActualizado = {
      ...eventoSeleccionado,
      estado: "En proceso",
      tecnico: tecnicoLogueado,
      orden: orden,
      horaInicio: inicio,
    };

    // ✅ DESPUÉS actualizar estado
    setEventosData((prev) =>
      prev.map((e) =>
        e.maquina === eventoSeleccionado.maquina
          ? eventoActualizado
          : e
      )
    );

    setEventoSeleccionado(eventoActualizado);
    setMostrarModal(false);
  };

  const finalizar = () => {
    const fin = new Date();
  
    setEventosData((prev) =>
      prev.map((e) => {
        if (e.maquina === eventoSeleccionado.maquina) {
          const inicio = new Date(e.horaInicio);
          const duracion = Math.floor((fin - inicio) / 1000);
  
          return {
            ...e,
            estado: "Terminado",
            horaFin: fin,
            duracionSegundos: duracion,
            comentarios: comentarios, // 👈 agregado
          };
        }
        return e;
      })
    );
  
    // reset
    setEventoSeleccionado(null);
    setOrden("");
    setHoraInicio(null);
    setContador("00:00:00");
    setComentarios(""); // 👈 limpiar
  };

  return (
    <div className="min-h-screen text-white px-4 py-8">

      {/* CONTENEDOR IGUAL QUE CELDA */}
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-10 text-center">
          🔧 Eventos activos
        </h1>

        {/* GRID estilo máquinas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
          {eventos.map((evento, i) => (
            <div
              key={i}
              onClick={() => seleccionarEvento(evento)}
              className="p-6 rounded-xl border text-center transition cursor-pointer
              bg-[#1a1b20] border-gray-700 hover:border-yellow-500 hover:bg-[#22232a]"
            >
              <span className="text-xl font-semibold block">
                {evento.maquina}
              </span>

              <p
                className={`text-sm mt-2 ${evento.estado === "En proceso"
                  ? "text-green-400"
                  : "text-yellow-400"
                  }`}
              >
                {evento.estado}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Operador: {evento.operador}
              </p>
            </div>
          ))}
        </div>

        {/* PANEL (igual estilo CeldaDetalle) */}
        {eventoSeleccionado && horaInicio && (
          <div className="bg-[#1e1f25] p-6 rounded-xl border border-gray-700 max-w-xl mx-auto">

            <h2 className="text-xl mb-4 font-bold text-green-400">
              Mantenimiento en curso
            </h2>

            <div className="space-y-2 text-sm">
              <p><strong>Máquina:</strong> {eventoSeleccionado.maquina}</p>
              <p><strong>Orden:</strong> {orden}</p>
              <p><strong>Tiempo:</strong> {contador}</p>
            </div>

            <div className="mt-4">
              <strong>Comentarios</strong>

              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Escribe observaciones del mantenimiento..."
                className="w-full mt-2 p-3 bg-[#131517] border border-gray-700 rounded-lg outline-none resize-none h-24 focus:border-green-500"
              />
            </div>

            <button
              onClick={finalizar}
              disabled={!comentarios.trim()}
              className={`mt-6 w-full py-2 rounded-lg
    ${comentarios.trim()
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-600 cursor-not-allowed"
                }
  `}
            >
              Finalizar
            </button>
          </div>
        )}
      </div>

      {/* MODAL (MISMO ESTILO) */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-[#1e1f25] w-[90%] max-w-md rounded-xl border border-gray-700">

            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-yellow-400">
                Iniciar mantenimiento
              </h2>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <input
                placeholder="Número de orden"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="w-full px-3 py-2 bg-[#131517] border border-gray-700 rounded-lg outline-none focus:border-green-500"
              />
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={iniciar}
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