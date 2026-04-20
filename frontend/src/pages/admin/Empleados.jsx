import React, { useState, useEffect, useRef } from "react";
import {
    RiEdit2Line,
    RiDeleteBin6Line,
} from "react-icons/ri";
import api from "../../api/axios";
import { toast } from "react-toastify";

const Empleados = () => {
    const formRef = useRef(null);
    const [empleados, setEmpleados] = useState([]);
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    //tipo trabajador
    const [tiposTrabajador, setTiposTrabajador] = useState([]);

    useEffect(() => {
        fetchEmpleados();
        fetchTiposTrabajador();
    }, []);

    const fetchEmpleados = async () => {
        try {
            const res = await api.get("/empleados/empleadosAll");
            setEmpleados(res.data);
        } catch {
            toast.error("Error al cargar registros");
        }
    };

    const fetchTiposTrabajador = async () => {
        try {
            const res = await api.get("/tiposTrabajador");
            setTiposTrabajador(res.data);
        } catch {
            toast.error("Error al cargar tipos de trabajador");
        }
    };

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await api.put(`/empleados/${editingId}`, formData);
                toast.success("Registro modificado correctamente");
            } else {
                await api.post("/empleados", formData);
                toast.success("Registro agregado correctamente");
            }

            resetForm();
            fetchEmpleados();

        } catch (error) {
            toast.error("No se pudo guardar el registro");
        }
    };

    const filtered = empleados.filter((f) =>
        f.nombre_trabajador.toLowerCase().includes(search.toLowerCase()) ||
        f.numero_empleado.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    const currentRows = filtered.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const [formData, setFormData] = useState({
        numero_empleado: "",
        id_tipo_trabajador: "",
        nombre_trabajador: "",
        es_admin: 0,
        activo: "1",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "numero_empleado" && !/^\d*$/.test(value)) {
            return;
        }

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleEdit = (empleado) => {
        setEditingId(empleado.id_trabajador);

        setFormData({
            numero_empleado: empleado.numero_empleado,
            id_tipo_trabajador: empleado.id_tipo_trabajador,
            nombre_trabajador: empleado.nombre_trabajador,
            es_admin: empleado.es_admin,
            activo: String(empleado.activo),
        });

        formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const handleDelete = async (empleado) => {
        const confirmar = window.confirm(
            `¿Deseas dar de baja el registro ${empleado.numero_empleado}?`
        );

        if (!confirmar) return;

        try {
            await api.delete(`/empleados/${empleado.id_trabajador}`);
            toast.success("Registro dado de baja correctamente");
            fetchEmpleados();
        } catch {
            toast.error("No se pudo dar de baja");
        }
    };

    const resetForm = () => {
        setEditingId(null);

        setFormData({
            numero_empleado: "",
            id_tipo_trabajador: "",
            nombre_trabajador: "",
            es_admin: 0,
            activo: "1",
        });
    };
    return (
        <div className="space-y-8">
            {/* Título */}
            <div>
                <h1 className="text-2xl font-bold text-white">Catálogo de Empleados</h1>
                <p className="text-gray-400">
                    Administración de empleados del sistema
                </p>
            </div>

            {/* Formulario */}
            <div ref={formRef} className="bg-secondary-100 p-6 rounded-2xl">
                <h2 className="text-xl text-white mb-4">
                    {editingId ? "Modificar Empleado" : "Registrar Empleado"}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Número de empleado
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="numero_empleado"
                            value={formData.numero_empleado}
                            onChange={handleChange}
                            placeholder="Número de empleado"
                            className="bg-secondary-900 p-3 rounded-lg outline-none"
                        />

                        
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Tipo trabajador
                        </label>

                        <select
                            name="id_tipo_trabajador"
                            value={formData.id_tipo_trabajador}
                            onChange={handleChange}
                            required
                            className="bg-secondary-900 text-white p-3 rounded-lg outline-none"
                        >
                            <option value="">Seleccione un tipo</option>

                            {tiposTrabajador.map((tipo) => (
                                <option
                                    key={tipo.id_tipo_trabajador}
                                    value={tipo.id_tipo_trabajador}
                                >
                                    {tipo.tipo_trabajador}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Nombre
                        </label>
                        <input
                            type="text"
                            name="nombre_trabajador"
                            value={formData.nombre_trabajador}
                            onChange={handleChange}
                            placeholder="Nombre"
                            required
                            className="bg-secondary-900 p-3 rounded-lg outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Tiene acceso administrador
                        </label>

                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-white">
                                <input
                                    type="checkbox"
                                    name="es_admin"
                                    checked={formData.es_admin}
                                    onChange={handleChange}
                                />
                                Si
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">
                            Estatus
                        </label>

                        <select
                            name="activo"
                            value={formData.activo}
                            onChange={handleChange}
                            required
                            className="bg-secondary-900 p-3 rounded-lg outline-none"
                        >
                            <option className="bg-secondary-900 text-white" value="1">Activo</option>
                            <option className="bg-secondary-900 text-white" value="0">Inactivo</option>
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
                        {currentRows.map((empleado) => (
                            <div
                                key={empleado.id_trabajador}
                                className="bg-secondary-900 rounded-xl p-4 space-y-3"
                            >
                                <div>
                                    <p className="text-gray-400 text-sm">Número empleado</p>
                                    <p className="text-white">{empleado.numero_empleado}</p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-sm">Tipo trabajador</p>
                                    <p className="text-white">{empleado.tipo_trabajador}</p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-sm">Nombre</p>
                                    <p className="text-white">{empleado.nombre_trabajador}</p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-sm">Es admin</p>
                                    <p className="text-white">
                                        <input
                                            type="checkbox"
                                            checked={Number(empleado.es_admin) === 1}
                                            readOnly
                                            className="w-4 h-4 accent-lzbblue"
                                        />
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-sm">Estatus</p>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${Number(empleado.activo) === 1
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {Number(empleado.activo) === 1 ? "Activo" : "Inactivo"}
                                    </span>
                                </div>

                                <div className="flex justify-end gap-4 pt-2">
                                    <button
                                        onClick={() => handleEdit(empleado)}
                                        className="text-blue-400">
                                        <RiEdit2Line />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(empleado)} className="text-red-400">
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
                                    <th className="px-4 py-3">Número de empleado</th>
                                    <th className="px-4 py-3">Tipo trabajador</th>
                                    <th className="px-4 py-3">Nombre</th>
                                    <th className="px-4 py-3">Es admin</th>
                                    <th className="px-4 py-3">Estatus</th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentRows.map((empleado) => (
                                    <tr
                                        key={empleado.id_trabajador}
                                        className="border-b border-gray-800 hover:bg-secondary-900"
                                    >
                                        <td className="py-2">{empleado.numero_empleado}</td>
                                        <td className="py-2">{empleado.tipo_trabajador}</td>
                                        <td className="py-2">{empleado.nombre_trabajador}</td>

                                        <td className="py-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={Number(empleado.es_admin) === 1}
                                                readOnly
                                                className="w-4 h-4 accent-lzbblue"
                                            />
                                        </td>
                                        <td className="py-2 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${Number(empleado.activo) === 1
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                                    }`}
                                            >
                                                {Number(empleado.activo) === 1 ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => handleEdit(empleado)}
                                                    className="text-blue-400">
                                                    <RiEdit2Line />
                                                </button>

                                                <button className="text-red-400">
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
        </div>
    );
};

export default Empleados;