import React, { useState, useRef, useEffect } from "react";
import {
    RiAddLine,
    RiEdit2Line,
    RiDeleteBin6Line,
} from "react-icons/ri";

import api from "../../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const GRID_COLS = 10;
const GRID_ROWS = 10;

const Celdas = () => {
    const navigate = useNavigate();
    const gridRef = useRef(null);
    const formRef = useRef(null);

    const [cellSize, setCellSize] = useState(60);
    const [placing, setPlacing] = useState(false);
    const [preview, setPreview] = useState(null);
    const [celdas, setCeldas] = useState([]);
    const [nombreCelda, setNombreCelda] = useState("");
    const [editingCelda, setEditingCelda] = useState(null);
    const [draggingId, setDraggingId] = useState(null);

    const [selectedCelda, setSelectedCelda] = useState(null);

    // responsive size
    useEffect(() => {
        loadCeldas();
    }, []);

    const loadCeldas = async () => {
        try {
            const res = await api.get("/celdas/");
            setCeldas(
                res.data.map((c) => ({
                    id: c.id_celda,
                    nombre: c.nombre_celda,
                    row: c.fila,
                    col: c.columna,
                }))
            );
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
        navigate(`/maquinas/${celda.id}`, {
            state: {
                nombreCelda: celda.nombre
            }
        });
    };

    const getGridPosition = (e) => {
        const rect = gridRef.current.getBoundingClientRect();

        return {
            col: Math.min(GRID_COLS - 1, Math.max(0, Math.floor((e.clientX - rect.left) / cellSize))),
            row: Math.min(GRID_ROWS - 1, Math.max(0, Math.floor((e.clientY - rect.top) / cellSize))),
        };
    };

    const handleMouseMove = (e) => {
        if (!placing) return;
        setPreview(getGridPosition(e));
    };

    const handleGridClick = async () => {
        if (!placing || !preview || !nombreCelda.trim()) return;

        const occupied = celdas.some(
            c => c.row === preview.row && c.col === preview.col
        );

        if (occupied) {
            toast.warning("Ya existe una celda en esa posición");
            return;
        }

        try {
            await api.post("/celdas/", {
                nombre_celda: nombreCelda.trim(),
                fila: preview.row,
                columna: preview.col
            });

            await loadCeldas();

            setPreview(null);
            setPlacing(false);
            setNombreCelda("");
        } catch (error) {
            //console.error(error.response?.data?.detail);
            toast.error(
                "No fue posible crear la celda"
            );
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/celdas/${id}`);
            toast.success("Celda eliminada correctamente");
            loadCeldas();
        } catch (error) {
            toast.error(
                "No fue posible eliminar la celda"
            );
        }
    };

    const handleEdit = (celda) => {
        setEditingCelda(celda.id);
        setNombreCelda(celda.nombre);
        setSelectedCelda(null);
    
        const shouldCheckScroll = window.innerWidth < 1024;
    
        if (shouldCheckScroll) {
            setTimeout(() => {
                const rect = formRef.current?.getBoundingClientRect();
    
                if (!rect) return;
    
                const isVisible =
                    rect.top >= 0 &&
                    rect.bottom <= window.innerHeight;
    
                if (!isVisible) {
                    formRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 150);
        }
    };

    const saveEdit = async () => {
        if (!nombreCelda.trim()) {
            toast.warning("El nombre de la celda es obligatorio");
            return;
        }

        const celda = celdas.find(c => c.id === editingCelda);
        try {
            await api.put(`/celdas/${editingCelda}`, {
                nombre_celda: nombreCelda.trim(),
                fila: celda.row,
                columna: celda.col
            });

            toast.success("Celda modificada correctamente");

            setEditingCelda(null);
            setNombreCelda("");
            loadCeldas();
        } catch (error) {
            toast.error(
                "No fue posible actualizar la celda"
            );
        }
    };

    const handleDragStart = (id) => {
        setDraggingId(id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e) => {
        e.preventDefault();

        if (!draggingId) return;

        const pos = getGridPosition(e);

        const occupied = celdas.some(
            (c) =>
                c.id !== draggingId &&
                c.row === pos.row &&
                c.col === pos.col
        );

        if (occupied) {
            toast.warning("Esa posición ya está ocupada");
            setDraggingId(null);
            return;
        }

        const celda = celdas.find(c => c.id === draggingId);

        try {
            await api.put(`/celdas/${draggingId}`, {
                nombre_celda: celda.nombre,
                fila: pos.row,
                columna: pos.col
            });

            await loadCeldas();
        } catch (error) {
            toast.error(
                "No fue posible mover la celda"
            );
        }

        setDraggingId(null);
    };

    const handleCellClick = (e, celda) => {
        e.stopPropagation();

        if (window.innerWidth < 768) {
            setSelectedCelda(selectedCelda === celda.id ? null : celda.id);
        }
    };

    const TooltipIcon = ({ label, children }) => (
        <div className="relative group">
            {children}

            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                opacity-0 group-hover:opacity-100 transition duration-200
                pointer-events-none z-50">
                <span className="relative bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap block">
                    {label}
                    <span className="absolute left-1/2 top-full -translate-x-1/2 -mt-1 w-2 h-2 bg-black rotate-45"></span>
                </span>
            </span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h1 className="text-2xl font-bold text-white">Catálogo de Celdas</h1>
                <p className="text-gray-400">
                    Administración visual de celdas
                </p>
            </div>
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)] gap-6">


                {/* Sidebar */}
                <div ref={formRef} className="w-full lg:w-72 bg-secondary-100 rounded-2xl p-6 shadow-lg">

                    <div className="mb-4">
                        <div className="flex flex-col lg:flex-col">
                            <div className="flex justify-between lg:justify-end">
                                <h2 className="text-xl text-white lg:hidden">
                                    Registrar Celda
                                </h2>

                                <span className="text-xs text-red-400">
                                    * Campos obligatorios
                                </span>
                            </div>

                            <h2 className="hidden lg:block text-xl text-white mt-2">
                                Registrar Celda
                            </h2>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Tipo trabajador <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={nombreCelda}
                            onChange={(e) => setNombreCelda(e.target.value)}
                            placeholder="Nombre de celda"
                            className="w-full bg-secondary-900 text-white p-3 rounded-xl mb-4 outline-none"
                        />
                    </div>
                    {editingCelda ? (
                        <button
                            onClick={saveEdit}
                            className="w-full bg-green-600 text-white py-3 rounded-xl"
                        >
                            Guardar cambios
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (!nombreCelda.trim()) {
                                    toast.warning("El nombre de la celda es obligatorio");
                                    return;
                                }

                                setPlacing(true);
                            }}
                            className="w-full bg-lzbblue text-white py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            <RiAddLine size={20} />
                            Agregar Celda
                        </button>
                    )}

                    <div className="mt-8 text-sm text-gray-400 space-y-2">
                        <p>• Ingresar el nombre de las celdas</p>
                        <p>• Click en el botón para agregar celda</p>
                        <p>• Click para colocar</p>
                        <p>• Arrastra para mover</p>
                    </div>
                </div>

                {/* Grid */}
                <div
                    ref={gridRef}
                    onMouseMove={handleMouseMove}
                    onClick={() => {
                        handleGridClick();
                        setSelectedCelda(null);
                    }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="flex-1 rounded-2xl overflow-y-auto overflow-x-hidden bg-white max-h-[70vh] lg:max-h-[85vh] xl:max-h-none" style={{
                        minHeight: "435px",
                    }}
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
                        {/* Preview */}
                        {placing && preview && (
                            <div
                                className="absolute border-2 border-blue-500 bg-blue-500/20 rounded-xl"
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    left: preview.col * cellSize,
                                    top: preview.row * cellSize,
                                }}
                            />
                        )}

                        {/* Celdas */}
                        {celdas.map((celda) => (
                            <div
                                key={celda.id}
                                draggable
                                onDragStart={() => handleDragStart(celda.id)}
                                onClick={(e) => handleCellClick(e, celda)}
                                className="absolute bg-green-600 text-white rounded-xl shadow-md cursor-move"
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    left: celda.col * cellSize,
                                    top: celda.row * cellSize,
                                }}
                            >
                                {/* Desktop */}
                                <div className="hidden md:flex flex-col h-full justify-between p-2 text-xs font-semibold">
                                    <span className="truncate">{celda.nombre}</span>

                                    <div className="flex justify-end gap-2 text-sm">
                                        <TooltipIcon label="Agregar máquinas">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewMaquinas(celda);
                                                }}
                                            >
                                                <RiAddLine />
                                            </button>
                                        </TooltipIcon>

                                        <TooltipIcon label="Editar">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(celda);
                                                }}
                                            >
                                                <RiEdit2Line />
                                            </button>
                                        </TooltipIcon>

                                        <TooltipIcon label="Eliminar">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(celda.id);
                                                }}
                                            >
                                                <RiDeleteBin6Line />
                                            </button>
                                        </TooltipIcon>
                                    </div>
                                </div>

                                {/* Mobile simple icon */}
                                <div className="md:hidden flex items-center justify-center h-full">
                                    <RiAddLine size={18} />
                                </div>

                                {/* Mobile popup */}
                                {selectedCelda === celda.id && (
                                    <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-white text-black rounded-xl shadow-xl p-3 z-50 min-w-[140px]">
                                        <p className="text-xs font-bold mb-2 truncate">{celda.nombre}</p>

                                        <div className="flex justify-around text-lg">
                                            <button onClick={() => handleViewMaquinas(celda)}>
                                                <RiAddLine />
                                            </button>
                                            <button onClick={() => handleEdit(celda)}>
                                                <RiEdit2Line />
                                            </button>
                                            <button onClick={() => handleDelete(celda.id)}>
                                                <RiDeleteBin6Line />
                                            </button>
                                        </div>
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

export default Celdas;