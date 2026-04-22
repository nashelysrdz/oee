import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import {
    RiArrowLeftLine,
    RiEdit2Line,
    RiDeleteBin6Line,
} from "react-icons/ri";
import api from "../../api/axios";
import { toast } from "react-toastify";

const Maquinas = () => {
    const { id_celda } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [maquinas, setMaquinas] = useState([]);
    const [nombreMaquina, setNombreMaquina] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const nombreCelda = location.state?.nombreCelda || "Celda";

    useEffect(() => {
        loadMaquinas();
    }, [id_celda]);

    const loadMaquinas = async () => {
        try {
            const res = await api.get(`/maquinas/celda/${id_celda}`);
            setMaquinas(res.data);
        } catch {
            toast.error("Error al cargar máquinas");
        }
    };

    const handleSave = async () => {
        if (!nombreMaquina.trim()) {
            toast.warning("El nombre de la máquina es obligatorio");
            return;
        }

        try {
            if (editingId) {
                await api.put(`/maquinas/${editingId}`, {
                    nombre_maquina: nombreMaquina.trim(),
                    id_celda: Number(id_celda)
                });

                toast.success("Máquina actualizada");
            } else {
                await api.post("/maquinas", {
                    nombre_maquina: nombreMaquina.trim(),
                    id_celda: Number(id_celda)
                });

                toast.success("Máquina registrada");
            }

            resetForm();
            loadMaquinas();
        } catch {
            toast.error("No se pudo guardar");
        }
    };

    const handleEdit = (maquina) => {
        setEditingId(maquina.id_maquina);
        setNombreMaquina(maquina.nombre_maquina);
    };

    const handleDelete = async () => {
        if (!deleteItem) return;

        try {
            await api.delete(`/maquinas/${deleteItem.id_maquina}`);
            toast.success("Máquina eliminada");
            loadMaquinas();
        } catch {
            toast.error("No se pudo eliminar");
        } finally {
            setDeleteItem(null);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setNombreMaquina("");
    };

    const filteredMaquinas = maquinas.filter((m) =>
        m.nombre_maquina.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMaquinas.length / rowsPerPage);

    const currentRows = filteredMaquinas.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    return (
        <div className="space-y-8">
            {/* Título */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Máquinas de {nombreCelda}
                    </h1>
                    <p className="text-gray-400">
                        Registro de máquinas asignadas a la celda vv
                    </p>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="
        flex items-center justify-center
        w-10 h-10 md:w-auto md:h-auto
        md:px-4 md:py-2
        rounded-full md:rounded-xl
        bg-secondary-100 text-white
        hover:bg-secondary-900 transition
    "
                >
                    <RiArrowLeftLine size={18} />
                    <span className="hidden md:inline ml-2">
                        Regresar
                    </span>
                </button>
            </div>

            {/* Formulario */}
            <div className="bg-secondary-100 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl text-white">
                        {editingId ? "Modificar Máquina" : "Registrar Máquina"}
                    </h2>

                    <span className="text-xs text-red-400">
                        * Campos obligatorios
                    </span>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Nombre máquina <span className="text-red-400">*</span>
                        </label>

                        <input
                            type="text"
                            value={nombreMaquina}
                            onChange={(e) => setNombreMaquina(e.target.value)}
                            placeholder="Nombre de máquina"
                            className="bg-secondary-900 p-3 rounded-lg outline-none text-white"
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button
                        onClick={handleSave}
                        className="bg-lzbblue text-white px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                        {editingId ? "Modificar" : "Guardar"}
                    </button>

                    {editingId && (
                        <button
                            onClick={resetForm}
                            className="bg-secondary-900 text-white px-6 py-3 rounded-lg"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            {/* Listado */}
            <div className="bg-secondary-100 p-6 rounded-2xl">
                <div className="space-y-6">
                    {/* Buscador */}
                    <input
                        type="text"
                        placeholder="Buscar máquina..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="bg-secondary-900 p-3 rounded-lg w-full text-white"
                    />

                    {/* MOBILE */}
                    <div className="md:hidden space-y-4">
                        {currentRows.map((maquina) => (
                            <div
                                key={maquina.id_maquina}
                                className="bg-secondary-900 rounded-xl p-4 space-y-3"
                            >
                                <div>
                                    <p className="text-gray-400 text-sm">Nombre</p>
                                    <p className="text-white">{maquina.nombre_maquina}</p>
                                </div>

                                <div className="flex justify-end gap-4 pt-2">
                                    <button
                                        onClick={() => handleEdit(maquina)}
                                        className="text-blue-400"
                                    >
                                        <RiEdit2Line />
                                    </button>

                                    <button
                                        onClick={() => setDeleteItem(maquina)}
                                        className="text-red-400"
                                    >
                                        <RiDeleteBin6Line />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredMaquinas.length === 0 && (
                            <div className="text-center py-6 text-gray-400">
                                No hay máquinas registradas
                            </div>
                        )}
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-300">
                                    <th className="py-3">Nombre</th>
                                    <th className="py-3 text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentRows.map((maquina) => (
                                    <tr
                                        key={maquina.id_maquina}
                                        className="border-b border-gray-800 hover:bg-secondary-900"
                                    >
                                        <td className="py-3">
                                            {maquina.nombre_maquina}
                                        </td>

                                        <td className="py-3">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(maquina)}
                                                    className="text-blue-400"
                                                >
                                                    <RiEdit2Line />
                                                </button>

                                                <button
                                                    onClick={() => setDeleteItem(maquina)}
                                                    className="text-red-400"
                                                >
                                                    <RiDeleteBin6Line />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredMaquinas.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="2"
                                            className="text-center py-6 text-gray-400"
                                        >
                                            No hay máquinas registradas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 rounded bg-secondary-900 disabled:opacity-40"
                        >
                            Anterior
                        </button>

                        <span>
                            Página {page} de {totalPages || 1}
                        </span>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-4 py-2 rounded bg-secondary-900 disabled:opacity-40"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmación */}
            {deleteItem && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-secondary-100 p-6 rounded-2xl w-full max-w-md">
                        <h3 className="text-xl text-white mb-4">
                            Confirmar eliminación
                        </h3>

                        <p className="text-gray-400 mb-6">
                            ¿Deseas eliminar la máquina{" "}
                            <span className="text-white font-semibold">
                                {deleteItem.nombre_maquina}
                            </span>?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteItem(null)}
                                className="px-4 py-2 rounded-lg bg-secondary-900 text-white"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maquinas;