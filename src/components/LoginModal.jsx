import { useState } from 'react';
import { loginUsuario } from '../services/apiHeladeria';

export default function LoginModal({ onLoginExitoso, onCancelar }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const user = await loginUsuario(correo, password);
      onLoginExitoso(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Iniciar Sesión - Gelato Nube</h5>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ej. admin@admin.co"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
              <div className="d-flex justify-content-between">
                <button type="button" className="btn btn-secondary" onClick={onCancelar}>
                  Volver
                </button>
                <button type="submit" className="btn btn-primary" disabled={cargando}>
                  {cargando ? 'Ingresando...' : 'Entrar'}
                </button>
              </div>
            </form>

            <hr />
            <div className="small text-muted">
              <strong>Usuarios de prueba:</strong><br />
              Admin: <code>admin@admin.co</code> / <code>admin</code><br />
              Empleado: <code>empleado@empleado.co</code> / <code>empleado</code><br />
              Cliente: <code>cliente@cliente.co</code> / <code>cliente</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}