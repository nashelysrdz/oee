import React, { useState, useRef, useEffect } from "react";
import {
    RiAddLine,
    RiEdit2Line,
    RiDeleteBin6Line,
} from "react-icons/ri";

const GRID_COLS = 10;
const GRID_ROWS = 10;

const Celdas = () => {
    const gridRef = useRef(null);

    const [cellSize, setCellSize] = useState(60);
    const [placing, setPlacing] = useState(false);
    const [preview, setPreview] = useState(null);
    const [celdas, setCeldas] = useState([]);
    const [nombreCelda, setNombreCelda] = useState("");
    const [editingCelda, setEditingCelda] = useState(null);
    const [draggingId, setDraggingId] = useState(null);

    // responsive size
    useEffect(() => {
        const updateGridSize = () => {
            if (!gridRef.current) return;

            const width = gridRef.current.offsetWidth;
            const newCellSize = width / GRID_COLS;

            setCellSize(newCellSize);
        };

        updateGridSize();
        window.addEventListener("resize", updateGridSize);

        return () => window.removeEventListener("resize", updateGridSize);
    }, []);

    const getGridPosition = (e) => {
        const rect = gridRef.current.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.min(
            GRID_COLS - 1,
            Math.max(0, Math.floor(x / cellSize))
        );

        const row = Math.min(
            GRID_ROWS - 1,
            Math.max(0, Math.floor(y / cellSize))
        );

        return { row, col };
    };

    const handleMouseMove = (e) => {
        if (!placing) return;
        setPreview(getGridPosition(e));
    };

    const handleGridClick = () => {
        if (!placing || !preview || !nombreCelda.trim()) return;

        const occupied = celdas.some(
            (c) => c.row === preview.row && c.col === preview.col
        );

        if (occupied) return;

        const nuevaCelda = {
            id: Date.now(),
            nombre: nombreCelda.trim(),
            row: preview.row,
            col: preview.col,
        };

        setCeldas([...celdas, nuevaCelda]);
        setPreview(null);
        setPlacing(false);
        setNombreCelda("");
    };

    const handleDelete = (id) => {
        setCeldas(celdas.filter((c) => c.id !== id));
    };

    const handleEdit = (celda) => {
        setEditingCelda(celda.id);
        setNombreCelda(celda.nombre);
    };

    const saveEdit = () => {
        setCeldas(
            celdas.map((c) =>
                c.id === editingCelda
                    ? { ...c, nombre: nombreCelda.trim() }
                    : c
            )
        );

        setEditingCelda(null);
        setNombreCelda("");
    };

    const handleDragStart = (id) => {
        setDraggingId(id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
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
            setDraggingId(null);
            return;
        }

        setCeldas(
            celdas.map((c) =>
                c.id === draggingId
                    ? { ...c, row: pos.row, col: pos.col }
                    : c
            )
        );

        setDraggingId(null);
    };

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
                <div className="w-full lg:w-72 bg-secondary-100 rounded-2xl p-6 shadow-lg">

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
                            onClick={() => setPlacing(true)}
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
    onClick={handleGridClick}
    onDragOver={handleDragOver}
    onDrop={handleDrop}
    className="flex-1 rounded-2xl overflow-y-auto overflow-x-hidden bg-white max-h-[70vh] lg:max-h-[85vh] xl:max-h-none"style={{
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
                            className="absolute bg-green-600 text-white rounded-xl text-xs font-semibold shadow-md p-2 cursor-move"
                            style={{
                                width: cellSize,
                                height: cellSize,
                                left: celda.col * cellSize,
                                top: celda.row * cellSize,
                            }}
                        >
                            <div className="flex flex-col h-full justify-between">
                                <span className="truncate">{celda.nombre}</span>

                                <div className="flex justify-end gap-2 text-sm">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(celda);
                                        }}
                                    >
                                        <RiEdit2Line />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(celda.id);
                                        }}
                                    >
                                        <RiDeleteBin6Line />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </div>
    );
};

export default Celdas;