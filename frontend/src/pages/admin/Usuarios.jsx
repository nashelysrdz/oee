import React, { useState, useEffect, useMemo } from "react";
import {
    RiEyeFill, RiEyeOffFill,
    RiDeleteBin6Line,
    RiLockPasswordLine,
    RiAddLine
} from "react-icons/ri";
import api from "../../api/axios";
import { toast } from "react-toastify";

const Usuarios = () => {
   
    const [usuarios, setUsuarios] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [deleteItem, setDeleteItem] = useState(null);
    const [credenciales, setCredenciales] = useState(null);
    const rowsPerPage = 10;

    const PASSWORD_REGEX = /^[A-Za-z0-9@$!%*?&.]*$/;

    //usuario
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [trabajadoresDisponibles, setTrabajadoresDisponibles] = useState([]);
    const [searchTrabajador, setSearchTrabajador] = useState("");

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [newPassword, setNewPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const res = await api.get("/usuarios/usuariosAll");
            setUsuarios(res.data);
        } catch (error) {
            toast.error("Error al cargar registros");
        }
    };

    const handleOpenPassword = (usuario) => {
        setSelectedUsuario(usuario);
        setNewPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowPasswordModal(true);
    };

    const passwordRules = {
        length: newPassword.length >= 8,
        upper: /[A-Z]/.test(newPassword),
        lower: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[@$!%*?&.]/.test(newPassword),
    };

    const isPasswordSecure = Object.values(passwordRules).every(Boolean);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

    const handleChangePassword = async () => {
        if (!isPasswordSecure) {
            toast.warning("La contraseña no cumple con los requisitos");
            return;
        }

        if (!passwordsMatch) {
            toast.warning("Las contraseñas no coinciden");
            return;
        }

        try {
            await api.put(`/usuarios/password/${selectedUsuario.id_usuario}`, {
                password: newPassword
            });

            toast.success("Contraseña actualizada");
            setShowPasswordModal(false);
        } catch {
            toast.error("No se pudo actualizar");
        }
    };

    const copiarCredenciales = () => {
        if (!credenciales) return;

        const texto = `Usuario: ${credenciales.usuario}\nContraseña: ${credenciales.password}`;

        navigator.clipboard.writeText(texto);
        toast.success("Credenciales copiadas");
    };

    const filtered = usuarios.filter((f) =>
        f.nombre_trabajador.toLowerCase().includes(search.toLowerCase()) ||
        f.numero_empleado.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    const currentRows = filtered.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handleDelete = (empleado) => {
        setDeleteItem(empleado);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;

        try {
            await api.delete(`/usuarios/${deleteItem.id_usuario}`);
            toast.success("Registro dado de baja correctamente");
            fetchUsuarios();
        } catch {
            toast.error("No se pudo dar de baja");
        } finally {
            setDeleteItem(null);
        }
    };

    const handleOpenCreate = async () => {
        try {
            const res = await api.get("/usuarios/disponibles");
            setTrabajadoresDisponibles(res.data);
            setShowCreateModal(true);
        } catch {
            toast.error("No se pudieron cargar trabajadores");
        }
    };

    const handleCreateUsuario = async (trabajador) => {
        try {
            const res = await api.post("/usuarios", {
                id_trabajador: trabajador.id_trabajador
            });

            setCredenciales({
                usuario: trabajador.numero_empleado,
                password: res.data.password_generada
            });

            setShowCreateModal(false);
            fetchUsuarios();

            toast.success("Usuario creado correctamente");
        } catch {
            toast.error("No se pudo crear usuario");
        }
    };

    const generarPassword = (longitud = 12) => {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const specials = "@$!%*?&";
    
        const allChars = upper + lower + numbers + specials;
    
        let password = [
            upper[Math.floor(Math.random() * upper.length)],
            lower[Math.floor(Math.random() * lower.length)],
            numbers[Math.floor(Math.random() * numbers.length)],
            specials[Math.floor(Math.random() * specials.length)]
        ];
    
        for (let i = password.length; i < longitud; i++) {
            password.push(
                allChars[Math.floor(Math.random() * allChars.length)]
            );
        }
    
        return password
            .sort(() => Math.random() - 0.5)
            .join("");
    };

    const handleSecureInput = (setter, value) => {
        if (PASSWORD_REGEX.test(value)) {
            setter(value);
        }
    };

    const handleGeneratePassword = () => {
        const nueva = generarPassword();
    
        setNewPassword(nueva);
        setConfirmPassword(nueva);
    };

    const trabajadoresFiltrados = trabajadoresDisponibles.filter((t) =>
        t.nombre_trabajador.toLowerCase().includes(searchTrabajador.toLowerCase()) ||
        t.numero_empleado.toLowerCase().includes(searchTrabajador.toLowerCase())
    );

    const getPasswordStrength = () => {
        let score = 0;

        if (newPassword.length >= 8) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[a-z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[@$!%*?&.]/.test(newPassword)) score++;

        if (score <= 2) {
            return {
                label: "Débil",
                width: "33%",
                color: "bg-red-500"
            };
        }

        if (score <= 4) {
            return {
                label: "Media",
                width: "66%",
                color: "bg-yellow-500"
            };
        }

        return {
            label: "Fuerte",
            width: "100%",
            color: "bg-green-500"
        };
    };

    const passwordStrength = useMemo(() => getPasswordStrength(), [newPassword]);

    return (
        <div className="space-y-8">
            {/* Título */}
            <div>
                <h1 className="text-2xl font-bold text-white">
                    Usuarios
                </h1>
                <p className="text-gray-400">
                    Administración de usuarios
                </p>
            </div>

            {/* Tabla */}
            <div className="bg-secondary-100 p-6 rounded-2xl">

                <div className="space-y-6">

                    <div className="flex justify-end">
                        <button
                            onClick={handleOpenCreate}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white flex items-center gap-2"
                        >
                            <RiAddLine />
                            Crear usuario
                        </button>
                    </div>

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
                                    <p className="text-gray-400 text-sm">Nombre</p>
                                    <p className="text-white">{empleado.nombre_trabajador}</p>
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
                                        onClick={() => handleOpenPassword(empleado)}
                                        className="text-yellow-400"
                                    >
                                        <RiLockPasswordLine />
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
                                    <th className="px-4 py-3">Nombre</th>
                                    <th className="px-4 py-3">Cambiar contraseña</th>
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
                                        <td className="py-2">{empleado.nombre_trabajador}</td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleOpenPassword(empleado)}
                                                className="text-yellow-400"
                                            >
                                                <RiLockPasswordLine />
                                            </button>
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
                                                <button onClick={() => handleDelete(empleado)} className="text-red-400">
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
                            Confirmar eliminación
                        </h3>

                        <p className="text-gray-400 mb-6">
                            ¿Deseas dar de baja el usuario del empleado {" "}
                            <span className="text-white font-semibold">
                                {deleteItem.nombre_trabajador}
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
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {credenciales && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-secondary-100 p-6 rounded-2xl w-full max-w-md shadow-xl">
                        <h3 className="text-xl text-white mb-4">
                            Credenciales generadas
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-400 text-sm">Usuario</p>
                                <div className="bg-secondary-900 p-3 rounded-lg text-white">
                                    {credenciales.usuario}
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">Contraseña</p>
                                <div className="bg-secondary-900 p-3 rounded-lg text-white">
                                    {credenciales.password}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={copiarCredenciales}
                                className="px-4 py-2 rounded-lg bg-lzbblue text-white"
                            >
                                Copiar
                            </button>

                            <button
                                onClick={() => setCredenciales(null)}
                                className="px-4 py-2 rounded-lg bg-secondary-900 text-white"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

                    <div className="bg-[#1e1f25] w-[90%] max-w-2xl max-h-[80vh] rounded-lg border border-gray-700 flex flex-col">

                        {/* HEADER */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                            <h2 className="text-lg font-bold text-white">
                                Crear usuario
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-secondary-100 p-6 rounded-2xl w-full max-w-2xl">
                            <input
                                type="text"
                                placeholder="Buscar trabajador..."
                                value={searchTrabajador}
                                onChange={(e) => setSearchTrabajador(e.target.value)}
                                className="bg-secondary-900 p-3 rounded-lg w-full mb-4 text-white"
                            />

                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {trabajadoresFiltrados.map((trabajador) => (
                                    <div
                                        key={trabajador.id_trabajador}
                                        className="bg-secondary-900 p-4 rounded-xl flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="text-white font-medium">
                                                {trabajador.nombre_trabajador}
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                {trabajador.numero_empleado}
                                            </p>
                                        </div>

                                        {trabajador.id_usuario ? (
                                            <span
                                                className="px-3 py-1 rounded-full text-sm font-medium 
                                                 bg-red-500/20 text-red-400"

                                            >
                                                Usuario creado
                                            </span>) : <button
                                                onClick={() => handleCreateUsuario(trabajador)}
                                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
                                            >
                                            Crear usuario
                                        </button>
                                        }
                                    </div>
                                ))}

                                {trabajadoresFiltrados.length === 0 && (
                                    <p className="text-gray-400 text-center py-6">
                                        No hay trabajadores disponibles
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 bg-secondary-900 rounded-lg text-white"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-secondary-100 p-6 rounded-2xl w-full max-w-md">
                        <h3 className="text-xl text-white mb-4">
                            Cambiar contraseña
                        </h3>

                        <p className="text-gray-400 mb-4">
                            {selectedUsuario?.nombre_trabajador}
                        </p>

                        <div className="space-y-4">
                            {/* Nueva contraseña */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => handleSecureInput(setNewPassword, e.target.value)}
                                    placeholder="Nueva contraseña"
                                    className="w-full bg-secondary-900 p-3 rounded-lg text-white pr-10"
                                />

                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 cursor-pointer text-gray-400"
                                >
                                    {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="w-full h-2 bg-secondary-900 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                        style={{ width: passwordStrength.width }}
                                    />
                                </div>

                                <p className="text-sm text-gray-300">
                                    Seguridad:{" "}
                                    <span className={
                                        passwordStrength.label === "Débil"
                                            ? "text-red-400"
                                            : passwordStrength.label === "Media"
                                                ? "text-yellow-400"
                                                : "text-green-400"
                                    }>
                                        {passwordStrength.label}
                                    </span>
                                </p>
                            </div>

                            {/* Confirmar */}
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => handleSecureInput(setConfirmPassword, e.target.value)}
                                    placeholder="Confirmar contraseña"
                                    className="w-full bg-secondary-900 p-3 rounded-lg text-white pr-10"
                                />

                                <span
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 cursor-pointer text-gray-400"
                                >
                                    {showConfirmPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                                </span>
                            </div>

                            {!passwordsMatch && confirmPassword && (
                                <p className="text-red-400 text-sm">
                                    La contraseña no coincide
                                </p>
                            )}

                            {/* Reglas */}
                            <div className="text-sm space-y-1">
                                <p className={passwordRules.length ? "text-green-400" : "text-gray-400"}>
                                    ✓ Al menos 8 caracteres
                                </p>
                                <p className={passwordRules.upper ? "text-green-400" : "text-gray-400"}>
                                    ✓ Una letra mayúscula
                                </p>
                                <p className={passwordRules.lower ? "text-green-400" : "text-gray-400"}>
                                    ✓ Una letra minúscula
                                </p>
                                <p className={passwordRules.number ? "text-green-400" : "text-gray-400"}>
                                    ✓ Un número
                                </p>
                                <p className={passwordRules.special ? "text-green-400" : "text-gray-400"}>
                                    ✓ Un carácter especial: ( @ $ ! % * ? & . )
                                </p>
                            </div>

                            <button
                                onClick={handleGeneratePassword}
                                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white"
                            >
                                Generar contraseña segura
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 bg-secondary-900 rounded-lg text-white"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleChangePassword}
                                disabled={!isPasswordSecure || !passwordsMatch}
                                className="px-4 py-2 bg-yellow-600 rounded-lg text-white disabled:opacity-40"
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

export default Usuarios;