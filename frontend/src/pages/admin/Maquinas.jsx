import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  RiAddLine,
  RiEdit2Line,
  RiDeleteBin6Line,
} from "react-icons/ri";
import { toast } from "react-toastify";

const Maquinas = () => {
  const [celdas, setCeldas] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nombre_maquina: "",
    id_celda: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resCeldas, resMaquinas] = await Promise.all([
        api.get("/celdas/"),
        api.get("/maquinas/")
      ]);

      setCeldas(resCeldas.data);
      setMaquinas(resMaquinas.data);
    } catch {
      toast.error("Error al cargar información");
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre_maquina.trim() || !formData.id_celda) {
      toast.warning("Completa los campos obligatorios");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/maquinas/${editingId}`, formData);
        toast.success("Máquina actualizada");
      } else {
        await api.post("/maquinas/", formData);
        toast.success("Máquina registrada");
      }

      resetForm();
      loadData();
    } catch {
      toast.error("No se pudo guardar");
    }
  };

  const handleEdit = (maquina) => {
    setEditingId(maquina.id_maquina);
    setFormData({
      nombre_maquina: maquina.nombre_maquina,
      id_celda: maquina.id_celda
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/maquinas/${id}`);
    loadData();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nombre_maquina: "",
      id_celda: ""
    });
  };

  const maquinasPorCelda = (id_celda) =>
    maquinas.filter((m) => m.id_celda === id_celda);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Catálogo de Máquinas</h1>
        <p className="text-gray-400">Asignación visual de máquinas por celda</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-72 bg-secondary-100 rounded-2xl p-6">
          <h2 className="text-xl text-white mb-4">
            {editingId ? "Editar máquina" : "Registrar máquina"}
          </h2>

          <input
            type="text"
            placeholder="Nombre máquina"
            value={formData.nombre_maquina}
            onChange={(e) =>
              setFormData({ ...formData, nombre_maquina: e.target.value })
            }
            className="w-full bg-secondary-900 p-3 rounded-xl mb-4"
          />

          <select
            value={formData.id_celda}
            onChange={(e) =>
              setFormData({ ...formData, id_celda: e.target.value })
            }
            className="w-full bg-secondary-900 p-3 rounded-xl mb-4"
          >
            <option value="">Seleccione celda</option>
            {celdas.map((celda) => (
              <option key={celda.id_celda} value={celda.id_celda}>
                {celda.nombre_celda}
              </option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            className="w-full bg-lzbblue py-3 rounded-xl"
          >
            {editingId ? "Guardar" : "Registrar"}
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 bg-white rounded-2xl p-4">
          <div className="grid grid-cols-5 gap-4">
            {celdas.map((celda) => (
              <div
                key={celda.id_celda}
                className="border rounded-xl p-3 min-h-[120px]"
              >
                <h3 className="font-bold text-sm mb-2">
                  {celda.nombre_celda}
                </h3>

                <div className="space-y-2">
                  {maquinasPorCelda(celda.id_celda).map((maquina) => (
                    <div
                      key={maquina.id_maquina}
                      className="bg-blue-600 text-white rounded-lg p-2 text-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span>{maquina.nombre_maquina}</span>

                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(maquina)}>
                            <RiEdit2Line />
                          </button>

                          <button onClick={() => handleDelete(maquina.id_maquina)}>
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maquinas;