import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import ProductosList from './components/ProductosList';
import IngredientesCrud from './components/IngredientesCrud';
import {
  obtenerTodosLosProductos,
  obtenerTodosLosIngredientes,
  obtenerVentasDelDia,
} from './services/apiHeladeria';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActual, setVistaActual] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [ventasHoy, setVentasHoy] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prods, ings, ventas] = await Promise.all([
        obtenerTodosLosProductos(),
        obtenerTodosLosIngredientes(),
        obtenerVentasDelDia(),
      ]);
      setProductos(prods);
      setIngredientes(ings);
      setVentasHoy(ventas);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleLoginExitoso = (user) => {
    setUsuario(user);
    setVistaActual('productos');
  };

  const handleLogout = () => {
    setUsuario(null);
    setVistaActual('productos');
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar
        usuario={usuario}
        onLogout={handleLogout}
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        ventasHoy={ventasHoy}
      />

      <main className="container flex-grow-1 pb-5">
        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Cargando datos de la heladería...</p>
          </div>
        ) : (
          <>
            {vistaActual === 'login' && (
              <LoginModal
                onLoginExitoso={handleLoginExitoso}
                onCancelar={() => setVistaActual('productos')}
              />
            )}

            {vistaActual === 'productos' && (
              <ProductosList
                productos={productos}
                usuario={usuario}
                onVentaRealizada={cargarDatos}
              />
            )}

            {vistaActual === 'ingredientes' &&
              (usuario?.rol === 'admin' || usuario?.rol === 'empleado') && (
                <IngredientesCrud
                  ingredientes={ingredientes}
                  onActualizar={cargarDatos}
                />
              )}
          </>
        )}
      </main>

      <footer className="bg-white text-center text-muted py-3 border-top small">
        Taller Frontend React + Vite y Supabase - Gelato Nube
      </footer>
    </div>
  );
}