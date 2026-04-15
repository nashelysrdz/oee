import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

// 👇 puedes pegar aquí TODA tu lista real de fallas
const fallas = [
  "Aguja dañada / mal colocada",
  "Ajuste de banda",
  "Ajuste de pedal",
  "Fuga de aire",
  "Hilos enredados",
  "Material atrapado",
  "No corta",
  "No avanza material",
  "Rotura de hilo",
  "Salto de puntada",
  "Tensiones",
  "Tornillos faltantes",
  "Pieza mecánica dañada",
  "Cambio de aguja",
  "Error en panel",
];

const CeldaDetalle1 = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const celda = celdas.find((c) => c.id === id);

  // estados principales
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [modoSeleccion, setModoSeleccion] = useState(null);
  const [horaActual, setHoraActual] = useState("");

  // modal
  const [mostrarModal, setMostrarModal] = useState(false);

  // estado de máquinas
  const [maquinasEstado, setMaquinasEstado] = useState({});

  // fallas
  const [fallasSeleccionadas, setFallasSeleccionadas] = useState([]);
  const [busquedaFalla, setBusquedaFalla] = useState("");

  // reloj
  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  // seleccionar máquina
  const seleccionarMaquina = (m) => {
    const estado = maquinasEstado[m];

    if (estado?.enMantenimiento) {
      setMaquinaSeleccionada(m);
      setModoSeleccion("ver");
      return;
    }

    setMaquinaSeleccionada(m);
    setFallasSeleccionadas([]);
    setMostrarModal(true);
  };

  // confirmar fallas
  const confirmarFallas = () => {
    if (fallasSeleccionadas.length === 0) return;

    const nueva = {
      enMantenimiento: true,
      folio: "F-" + Date.now(),
      horaInicio: new Date().toLocaleTimeString(),
      fallas: fallasSeleccionadas,
      horaTecnico: null,
    };

    setMaquinasEstado({
      ...maquinasEstado,
      [maquinaSeleccionada]: nueva,
    });

    setMostrarModal(false);
    setModoSeleccion("ver");
  };

  // técnico llegó
  const llegadaTecnico = () => {
    setMaquinasEstado({
      ...maquinasEstado,
      [maquinaSeleccionada]: {
        ...maquinasEstado[maquinaSeleccionada],
        horaTecnico: new Date().toLocaleTimeString(),
      },
    });
  };

  // filtro fallas
  const fallasFiltradas = fallas.filter((f) =>
    f.toLowerCase().includes(busquedaFalla.toLowerCase())
  );

  return (
    <div className="min-h-screen text-white px-6 py-10">

      {/* REGRESAR */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
      >
        ← Regresar
      </button>

      <h1 className="text-3xl font-bold mb-10">
        Seleccione la máquina
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {celda?.maquinas.map((m) => {
          const estado = maquinasEstado[m];

          return (
            <div
              key={m}
              onClick={() => seleccionarMaquina(m)}
              className={`p-6 rounded-lg border text-center transition cursor-pointer
                ${
                  estado?.enMantenimiento
                    ? "bg-gray-600/30 border-gray-500"
                    : "bg-[#1a1b20] border-gray-700 hover:border-green-500"
                }`}
            >
              <span className="text-xl font-semibold">{m}</span>
            </div>
          );
        })}
      </div>

      {/* PANEL INFO */}
      {maquinaSeleccionada && modoSeleccion === "ver" && (
        <div className="bg-[#1e1f25] p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl mb-4 font-bold text-green-400">
            Evento activo
          </h2>

          <p><strong>Máquina:</strong> {maquinaSeleccionada}</p>
          <p><strong>Folio:</strong> {maquinasEstado[maquinaSeleccionada]?.folio}</p>
          <p><strong>Hora inicio:</strong> {maquinasEstado[maquinaSeleccionada]?.horaInicio}</p>
          <p><strong>Hora actual:</strong> {horaActual}</p>

          <p className="mt-2"><strong>Fallas:</strong></p>
          <ul className="ml-4 list-disc">
            {maquinasEstado[maquinaSeleccionada]?.fallas.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>

          {!maquinasEstado[maquinaSeleccionada]?.horaTecnico ? (
            <button
              onClick={llegadaTecnico}
              className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg"
            >
              Técnico llegó
            </button>
          ) : (
            <p className="mt-4 text-green-400">
              <strong>Hora técnico:</strong>{" "}
              {maquinasEstado[maquinaSeleccionada].horaTecnico}
            </p>
          )}
        </div>
      )}

      {/* MODAL */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-[#1e1f25] w-[90%] max-w-2xl max-h-[80vh] rounded-lg border border-gray-700 flex flex-col">

            {/* HEADER */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-yellow-400">
                Seleccionar fallas
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fallasFiltradas.map((f, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-700/40 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={fallasSeleccionadas.includes(f)}
                      onChange={() => {
                        if (fallasSeleccionadas.includes(f)) {
                          setFallasSeleccionadas(
                            fallasSeleccionadas.filter((x) => x !== f)
                          );
                        } else {
                          setFallasSeleccionadas([...fallasSeleccionadas, f]);
                        }
                      }}
                    />
                    <span className="text-sm">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarFallas}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CeldaDetalle1;