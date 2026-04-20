import React, { useState, useEffect, useRef } from "react";
import {
    RiEdit2Line,
    RiDeleteBin6Line,
} from "react-icons/ri";
import api from "../../api/axios";
import { toast } from "react-toastify";

const Fallas = () => {
    const formRef = useRef(null);
    const [fallas, setFallas] = useState([]);
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const [deleteItem, setDeleteItem] = useState(null);

    useEffect(() => {
        fetchFallas();
    }, []);

    const fetchFallas = async () => {
        try {
            const res = await api.get("/fallas/fallasAll");
            setFallas(res.data);
        } catch {
            toast.error("Error al cargar registros");
        }
    };

    const handleSubmit = async () => {
        if (
            !formData.codigo.trim() ||
            !formData.falla.trim() ||
            !formData.tipo_falla ||
            formData.activo === ""
        ) {
            toast.warning("Completa todos los campos obligatorios");
            return;
        }

        try {
            if (editingId) {
                await api.put(`/fallas/${editingId}`, formData);
                toast.success("Registro modificado correctamente");
            } else {
                await api.post("/fallas", formData);
                toast.success("Registro agregado correctamente");
            }

            resetForm();
            fetchFallas();

        } catch (error) {
            toast.error("No se pudo guardar el registro");
        }
    };

    const filtered = fallas.filter((f) =>
        f.falla.toLowerCase().includes(search.toLowerCase()) ||
        f.codigo.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    const currentRows = filtered.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const [formData, setFormData] = useState({
        codigo: "",
        falla: "",
        tipo_falla: "CORRECTIVA",
        activo: "true",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleEdit = (falla) => {
        setEditingId(falla.id_falla);

        setFormData({
            codigo: falla.codigo,
            falla: falla.falla,
            tipo_falla: falla.tipo_falla.toUpperCase(),
            activo: falla.activo ? "true" : "false",
        });

        formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const handleDelete = (falla) => {
        setDeleteItem(falla);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;

        try {
            await api.delete(`/fallas/${deleteItem.id_falla}`);
            toast.success("Registro dado de baja correctamente");
            fetchFallas();
        } catch {
            toast.error("No se pudo dar de baja");
        } finally {
            setDeleteItem(null);
        }
    };

    const resetForm = () => {
        setEditingId(null);

        setFormData({
            codigo: "",
            falla: "",
            tipo_falla: "CORRECTIVA",
            activo: "true",
        });
    };
    return (
        <div className="space-y-8">
            {/* Título */}
            <div>
                <h1 className="text-2xl font-bold text-white">Catálogo de Fallas</h1>
                <p className="text-gray-400">
                    Administración de fallas del sistema
                </p>
            </div>

            {/* Formulario */}
            <div ref={formRef} className="bg-secondary-100 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl text-white">
                        {editingId ? "Modificar Falla" : "Registrar Falla"}
                    </h2>

                    <span className="text-xs text-red-400">
                        * Campos obligatorios
                    </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Código <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleChange}
                            placeholder="Código"
                            className="bg-secondary-900 p-3 rounded-lg outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Falla <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="falla"
                            value={formData.falla}
                            onChange={handleChange}
                            placeholder="Descripción de falla"
                            required
                            className="bg-secondary-900 p-3 rounded-lg outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Tipo falla <span className="text-red-400">*</span>
                        </label>
                        <select
                            name="tipo_falla"
                            value={formData.tipo_falla}
                            onChange={handleChange}
                            required
                            className="bg-secondary-900 p-3 rounded-lg outline-none"
                        >
                            <option className="bg-secondary-900 text-white" value="CORRECTIVA">Correctiva</option>
                            <option className="bg-secondary-900 text-white" value="OPERATIVA">Operativa</option>
                            <option className="bg-secondary-900 text-white" value="SIN AFECTACION">Sin afectación</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Estatus <span className="text-red-400">*</span>
                        </label>

                        <select
                            name="activo"
                            value={formData.activo}
                            onChange={handleChange}
                            required
                            className="bg-secondary-900 p-3 rounded-lg outline-none"
                        >
                            <option className="bg-secondary-900 text-white" value="true">Activo</option>
                            <option className="bg-secondary-900 text-white" value="false">Inactivo</option>
                        </select>
                    </div>

                </div>

                <div className="mt-6 flex gap-4">
                    <button
                        onClick={handleSubmit}
                        className="bg-lzbblue text-white px-6 py-3 rounded-lg"
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
            <div className="bg-secondary-100 p-6 rounded-2xl">

                <div className="space-y-6">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="bg-secondary-900 p-3 rounded-lg w-full text-sm md:text-base"
                    />
                    {/* MOBILE */}
                    <div className="md:hidden space-y-4">
                        {currentRows.map((falla) => (
                            <div
                                key={falla.id_falla}
                                className="bg-secondary-900 rounded-xl p-4 space-y-3"
                            >
                                <div>
                                    <p className="text-gray-400 text-sm">Código</p>
                                    <p className="text-white">{falla.codigo}</p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-sm">Falla</p>
                                    <p className="text-white">{falla.falla}</p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-sm">Tipo</p>
                                    <p className="text-white">{falla.tipo_falla}</p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-sm">Estatus</p>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${Number(falla.activo) === 1
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {Number(falla.activo) === 1 ? "Activo" : "Inactivo"}
                                    </span>
                                </div>

                                <div className="flex justify-end gap-4 pt-2">
                                    <button
                                        onClick={() => handleEdit(falla)}
                                        className="text-blue-400">
                                        <RiEdit2Line />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(falla)} className="text-red-400">
                                        <RiDeleteBin6Line />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead >
                                <tr className="border-b border-gray-700 text-gray-300">
                                    <th className="px-4 py-3">Código</th>
                                    <th className="px-4 py-3">Falla</th>
                                    <th className="px-4 py-3">Tipo</th>
                                    <th className="px-4 py-3">Estatus</th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentRows.map((falla) => (
                                    <tr
                                        key={falla.id_falla}
                                        className="border-b border-gray-800 hover:bg-secondary-900"
                                    >
                                        <td className="py-2">{falla.codigo}</td>
                                        <td className="py-2">{falla.falla}</td>
                                        <td className="py-2">{falla.tipo_falla}</td>
                                        <td className="py-2 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${Number(falla.activo) === 1
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                                    }`}
                                            >
                                                {Number(falla.activo) === 1 ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => handleEdit(falla)}
                                                    className="text-blue-400">
                                                    <RiEdit2Line />
                                                </button>

                                                <button onClick={() => handleDelete(falla)} className="text-red-400">
                                                    <RiDeleteBin6Line />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* PAGINACIÓN */}
                    <div className="flex justify-between items-center text-sm md:text-base">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 rounded bg-secondary-900 disabled:opacity-40"
                        >
                            Anterior
                        </button>

                        <span>
                            Página {page} de {totalPages}
                        </span>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded bg-secondary-900 disabled:opacity-40"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            {deleteItem && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-secondary-100 p-6 rounded-2xl w-full max-w-md shadow-xl">
                        <h3 className="text-xl text-white mb-3">
                            Confirmar baja de registro
                        </h3>

                        <p className="text-gray-400 mb-6">
                            ¿Deseas dar de baja el registro con el código{" "} 
                            <span className="text-white font-semibold">
                                {deleteItem.codigo}
                            </span> ?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteItem(null)}
                                className="px-4 py-2 rounded-lg bg-secondary-900 text-white"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={confirmDelete}
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

export default Fallas;