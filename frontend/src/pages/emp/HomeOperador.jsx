import React, { useState, useRef, useEffect } from "react";
import { RiAddLine } from "react-icons/ri";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const GRID_COLS = 10;
const GRID_ROWS = 10;

const CeldasMaquinas = () => {
    const navigate = useNavigate();
    const gridRef = useRef(null);

    const [cellSize, setCellSize] = useState(60);
    const [celdas, setCeldas] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCelda, setSelectedCelda] = useState(null);

    useEffect(() => {
        loadCeldas();
    }, []);

    const loadCeldas = async () => {
        try {
            const res = await api.get("/celdas/maquinas");
            setCeldas(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const updateGridSize = () => {
            if (!gridRef.current) return;
            const width = gridRef.current.offsetWidth;
            setCellSize(width / GRID_COLS);
        };

        updateGridSize();
        window.addEventListener("resize", updateGridSize);
        return () => window.removeEventListener("resize", updateGridSize);
    }, []);

    const handleViewMaquinas = (celda) => {
        navigate(`/dashboard/celda/${celda.id}`, {
            state: { nombreCelda: celda.nombre_celda }
        });
    };

    const filteredCeldas = celdas.map((celda) => {
        const match =
            search.trim() &&
            celda.maquinas?.some((m) =>
                m.nombre_maquina.toLowerCase().includes(search.toLowerCase())
            );

        return {
            ...celda,
            highlight: match
        };
    });

    const Tooltip = ({ text }) => (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
            opacity-0 group-hover:opacity-100 transition text-[10px] bg-black text-white px-2 py-1 rounded">
            {text}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white">
                  Localizador de Máquinas
                </h1>
                <p className="text-gray-400">
                    Consulta visual por celda
                </p>
            </div>

            <div className="bg-secondary-100 p-6 rounded-2xl">
                <input
                    type="text"
                    placeholder="Buscar máquina..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-secondary-900 p-3 rounded-lg w-full text-white mb-6"
                />

                <div
                    ref={gridRef}
                    className="rounded-2xl overflow-auto bg-white"
                    style={{ minHeight: "350px" }}
                >
                    <div
                        className="relative"
                        style={{
                            width: "100%",
                            height: GRID_ROWS * cellSize,
                            backgroundSize: `${cellSize}px ${cellSize}px`,
                            backgroundImage: `
                                linear-gradient(to right, #d1d5db 1px, transparent 1px),
                                linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
                            `,
                        }}
                    >
                        {filteredCeldas.map((celda) => (
                            <div
                                key={celda.id}
                                onClick={() =>
                                    window.innerWidth < 768 &&
                                    setSelectedCelda(selectedCelda === celda.id ? null : celda.id)
                                }
                                className={`absolute rounded-xl shadow-md text-white group
                                    flex flex-col justify-between p-2 transition
                                    ${celda.highlight ? "bg-orange-500" : "bg-green-600"}`}
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    left: celda.columna * cellSize,
                                    top: celda.fila * cellSize,
                                }}
                            >
                                {/* DESKTOP */}
                                <div className="hidden md:flex flex-col h-full justify-between">
                                    <div className="text-xs font-bold truncate">
                                        {celda.nombre_celda}
                                    </div>

                                    <div className="text-[9px] opacity-90">
                                        {celda.total_maquinas || 0} máquinas
                                    </div>

                                    <button
                                        onClick={() => handleViewMaquinas(celda)}
                                        className="text-[10px] flex items-center gap-1"
                                    >
                                        <RiAddLine size={12} />
                                        Selecc.
                                    </button>

                                    {/* tooltip hover */}
                                    <Tooltip text="Seleccionar" />
                                </div>

                                {/* MOBILE ICON ONLY */}
                                <div className="md:hidden flex items-center justify-center h-full">
                                    <RiAddLine size={18} />
                                </div>

                                {/* MOBILE POPUP */}
                                {selectedCelda === celda.id && (
                                    <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-white text-black rounded-xl shadow-xl p-3 z-50 min-w-[140px]">
                                        <p className="text-xs font-bold mb-2 truncate">
                                            {celda.nombre_celda}
                                        </p>

                                        <p className="text-[10px] mb-2">
                                            {celda.total_maquinas || 0} máquinas
                                        </p>

                                        <button
                                            onClick={() => handleViewMaquinas(celda)}
                                            className="text-xs text-blue-600 font-bold"
                                        >
                                            Seleccionar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CeldasMaquinas;