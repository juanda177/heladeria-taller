import { useState } from 'react';
import {
  crearIngrediente,
  actualizarIngrediente,
  eliminarIngrediente,
  reabastecerIngrediente,
  renovarInventarioComplemento,
} from '../services/apiHeladeria';

const ESTADO_INICIAL = {
  nombre: '',
  precio: '',
  calorias: '',
  inventario: '',
  es_vegetariano: true,
  es_sano: true,
  tipo: 'base',
  sabor: '',
};

export default function IngredientesCrud({ ingredientes, onActualizar }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const ingredientesFiltrados = ingredientes.filter(
    (i) =>
      i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(i.id) === busqueda.trim()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: form.nombre,
        precio: Number(form.precio),
        calorias: Number(form.calorias),
        inventario: Number(form.inventario),
        es_vegetariano: form.es_vegetariano,
        es_sano: form.es_sano,
        tipo: form.tipo,
        sabor: form.tipo === 'base' ? form.sabor : null,
      };

      if (editandoId) {
        await actualizarIngrediente(editandoId, payload);
        setMensaje({ tipo: 'success', texto: 'Ingrediente actualizado correctamente.' });
      } else {
        await crearIngrediente(payload);
        setMensaje({ tipo: 'success', texto: 'Ingrediente creado correctamente.' });
      }

      setForm(ESTADO_INICIAL);
      setEditandoId(null);
      onActualizar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const handleEditar = (ing) => {
    setEditandoId(ing.id);
    setForm({
      nombre: ing.nombre,
      precio: ing.precio,
      calorias: ing.calorias,
      inventario: ing.inventario,
      es_vegetariano: ing.es_vegetariano,
      es_sano: ing.es_sano,
      tipo: ing.tipo,
      sabor: ing.sabor || '',
    });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ingrediente?')) return;
    try {
      await eliminarIngrediente(id);
      setMensaje({ tipo: 'warning', texto: 'Ingrediente eliminado.' });
      onActualizar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const handleReabastecer = async (id) => {
    try {
      await reabastecerIngrediente(id, 10);
      setMensaje({ tipo: 'success', texto: 'Se agregaron +10 unidades al inventario.' });
      onActualizar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const handleRenovar = async (ing) => {
    try {
      await renovarInventarioComplemento(ing);
      setMensaje({ tipo: 'info', texto: `Inventario de ${ing.nombre} puesto en 0.` });
      onActualizar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div>
      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-dark text-white">
          <h6 className="mb-0">{editandoId ? 'Editar Ingrediente' : 'Agregar Nuevo Ingrediente'}</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Precio ($)</label>
              <input
                type="number"
                className="form-control"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Calorías</label>
              <input
                type="number"
                className="form-control"
                value={form.calorias}
                onChange={(e) => setForm({ ...form, calorias: e.target.value })}
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Inventario</label>
              <input
                type="number"
                className="form-control"
                value={form.inventario}
                onChange={(e) => setForm({ ...form, inventario: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                <option value="base">Base</option>
                <option value="complemento">Complemento</option>
              </select>
            </div>

            {form.tipo === 'base' && (
              <div className="col-md-3">
                <label className="form-label">Sabor (solo bases)</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.sabor}
                  onChange={(e) => setForm({ ...form, sabor: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="col-md-3 d-flex align-items-end gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={form.es_vegetariano}
                  onChange={(e) => setForm({ ...form, es_vegetariano: e.target.checked })}
                />
                <label className="form-check-label">Vegetariano</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={form.es_sano}
                  onChange={(e) => setForm({ ...form, es_sano: e.target.checked })}
                />
                <label className="form-check-label">Es sano</label>
              </div>
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary me-2">
                {editandoId ? 'Guardar Cambios' : 'Crear Ingrediente'}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditandoId(null);
                    setForm(ESTADO_INICIAL);
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="mb-3 col-md-5">
        <input
          type="text"
          className="form-control"
          placeholder="Consultar ingrediente por nombre o ID..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="table-responsive bg-white shadow-sm rounded">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo / Sabor</th>
              <th>Precio</th>
              <th>Calorías</th>
              <th>¿Sano? / Veg.</th>
              <th>Inventario</th>
              <th>Acciones de Inventario</th>
              <th>CRUD</th>
            </tr>
          </thead>
          <tbody>
            {ingredientesFiltrados.map((ing) => (
              <tr key={ing.id}>
                <td>#{ing.id}</td>
                <td className="fw-bold">{ing.nombre}</td>
                <td>
                  <span className="badge bg-info text-dark me-1">{ing.tipo}</span>
                  {ing.sabor && <small className="text-muted">({ing.sabor})</small>}
                </td>
                <td>${Number(ing.precio).toLocaleString()}</td>
                <td>{ing.calorias} kcal</td>
                <td>
                  <span className={`badge me-1 ${ing.es_sano ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {ing.es_sano ? 'Sano' : 'No sano'}
                  </span>
                  {ing.es_vegetariano && <span className="badge bg-secondary">Veg</span>}
                </td>
                <td>
                  <span className={`badge fs-6 ${ing.inventario > 5 ? 'bg-primary' : 'bg-danger'}`}>
                    {ing.inventario}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-success me-1"
                    onClick={() => handleReabastecer(ing.id)}
                  >
                    +10 Stock
                  </button>
                  {ing.tipo === 'complemento' && (
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleRenovar(ing)}
                    >
                      Renovar (0)
                    </button>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-1"
                    onClick={() => handleEditar(ing)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleEliminar(ing.id)}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}