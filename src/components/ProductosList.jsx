import { useState } from 'react';
import { venderProducto } from '../services/apiHeladeria';

export default function ProductosList({ productos, usuario, onVentaRealizada }) {
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const rol = usuario ? usuario.rol : 'publico';

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(p.id) === busqueda.trim()
  );

  const masRentable =
    productos.length > 0
      ? [...productos].sort((a, b) => b.rentabilidad - a.rentabilidad)[0]
      : null;

  const handleVender = async (producto) => {
    setMensaje(null);
    try {
      await venderProducto(producto, usuario?.id || null);
      setMensaje({ tipo: 'success', texto: `¡Venta exitosa de ${producto.nombre}! Inventario actualizado.` });
      onVentaRealizada();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div>
      {rol === 'admin' && masRentable && (
        <div className="alert alert-info d-flex justify-content-between align-items-center shadow-sm">
          <div>
            <strong>Producto más rentable:</strong> {masRentable.nombre}
          </div>
          <span className="badge bg-success fs-6">
            Rentabilidad: ${masRentable.rentabilidad.toLocaleString()}
          </span>
        </div>
      )}

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto por nombre o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="row g-4">
        {productosFiltrados.map((prod) => {
          const hayStock = prod.listaIngredientes.every((i) => i.inventario > 0);

          return (
            <div className="col-md-6 col-lg-3" key={prod.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <span className="badge bg-secondary text-uppercase">{prod.tipo}</span>
                  <small className="text-muted">ID: #{prod.id}</small>
                </div>

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{prod.nombre}</h5>
                  <h4 className="text-primary fw-bold mb-2">
                    ${Number(prod.precio_publico).toLocaleString()}
                  </h4>

                  <p className="small text-muted mb-2">
                    {prod.tipo === 'copa'
                      ? `Vaso: ${prod.vaso}`
                      : `Volumen: ${prod.volumen_onzas} oz`}
                  </p>

                  <div className="mb-3">
                    <strong className="small">Ingredientes:</strong>
                    <ul className="list-group list-group-flush small mt-1">
                      {prod.listaIngredientes.map((ing) => (
                        <li
                          key={ing.id}
                          className="list-group-item px-0 py-1 d-flex justify-content-between"
                        >
                          <span>{ing.nombre}</span>
                          {rol !== 'publico' && (
                            <span className={`badge ${ing.inventario > 0 ? 'bg-light text-dark' : 'bg-danger'}`}>
                              Stock: {ing.inventario}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-2 border-top small">
                    {rol !== 'publico' && (
                      <div className="d-flex justify-content-between">
                        <span>Calorías:</span>
                        <strong>{prod.total_calorias} kcal</strong>
                      </div>
                    )}

                    {(rol === 'admin' || rol === 'empleado') && (
                      <div className="d-flex justify-content-between">
                        <span>Costo producción:</span>
                        <span>${prod.costo.toLocaleString()}</span>
                      </div>
                    )}

                    {rol === 'admin' && (
                      <div className="d-flex justify-content-between text-success fw-bold">
                        <span>Rentabilidad:</span>
                        <span>${prod.rentabilidad.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {rol !== 'publico' && (
                  <div className="card-footer bg-white border-0 pb-3">
                    <button
                      className={`btn w-100 ${hayStock ? 'btn-success' : 'btn-secondary'}`}
                      disabled={!hayStock}
                      onClick={() => handleVender(prod)}
                    >
                      {hayStock ? 'Vender Producto' : 'Sin Stock'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}