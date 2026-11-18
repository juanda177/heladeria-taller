export default function Navbar({ usuario, onLogout, vistaActual, setVistaActual, ventasHoy }) {
  const rol = usuario ? usuario.rol : 'publico';
  const totalDineroHoy = ventasHoy.reduce((acc, v) => acc + Number(v.total), 0);
  const cantidadVentasHoy = ventasHoy.reduce((acc, v) => acc + Number(v.cantidad), 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div className="container">
        <a
          className="navbar-brand d-flex align-items-center fw-bold"
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            setVistaActual('productos');
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="me-2">
            <path d="M12 2C8.686 2 6 4.686 6 8C6 9.657 6.672 11.157 7.757 12.243L12 22L16.243 12.243C17.328 11.157 18 9.657 18 8C18 4.686 15.314 2 12 2Z" fill="#FFC107" />
            <circle cx="12" cy="8" r="3" fill="#FFF" />
          </svg>
          Gelato Nube
        </a>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            className={`btn btn-sm ${vistaActual === 'productos' ? 'btn-light fw-bold' : 'btn-outline-light'}`}
            onClick={() => setVistaActual('productos')}
          >
            Menú de Productos
          </button>

          {(rol === 'admin' || rol === 'empleado') && (
            <button
              className={`btn btn-sm ${vistaActual === 'ingredientes' ? 'btn-light fw-bold' : 'btn-outline-light'}`}
              onClick={() => setVistaActual('ingredientes')}
            >
              Inventario Ingredientes
            </button>
          )}

          <span className="badge bg-warning text-dark p-2">
            Ventas hoy: {cantidadVentasHoy} (${totalDineroHoy.toLocaleString()})
          </span>

          {usuario ? (
            <div className="d-flex align-items-center gap-2 ms-2">
              <span className="text-white small">
                Hola, <strong>{usuario.nombre}</strong> ({usuario.rol})
              </span>
              <button className="btn btn-sm btn-danger" onClick={onLogout}>
                Salir
              </button>
            </div>
          ) : (
            <button
              className="btn btn-sm btn-success ms-2"
              onClick={() => setVistaActual('login')}
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}