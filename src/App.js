import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// Importación de componentes de páginas y componentes
import Home from './pages/Home';
import Search from './pages/Search';
import Upload from './pages/Upload';
import VideoList from './components/VideoList';
import StoreRegister from './components/StoreRegister';
import StoreLogin from './components/StoreLogin';

// Componente principal de la aplicación
const App = () => {
    return (
        // Configuración del enrutador
        <Router>
            {/* Contenedor principal con estilos de fondo y texto */}
            <div className="min-h-screen bg-black text-white">
                {/* Barra de navegación fija en la parte superior */}
                <nav className="bg-gray-900 p-4 fixed w-full top-0 z-50">
                    <div className="container mx-auto flex justify-between items-center">
                        {/* Logo de la aplicación */}
                        <Link to="/" className="text-2xl font-bold text-primary">LookyMapp</Link>
                        {/* Lista de enlaces de navegación */}
                        <ul className="flex space-x-4">
                            <li><Link to="/" className="hover:text-primary transition-colors">Inicio</Link></li>
                            <li><Link to="/search" className="hover:text-primary transition-colors">Buscar</Link></li>
                            <li><Link to="/upload" className="hover:text-primary transition-colors">Subir</Link></li>
                            <li><Link to="/videos" className="hover:text-primary transition-colors">Videos</Link></li>
                            <li><Link to="/register-store" className="hover:text-primary transition-colors">Registrar</Link></li>
                            <li><Link to="/login-store" className="hover:text-primary transition-colors">Iniciar Sesión</Link></li>
                        </ul>
                    </div>
                </nav>
                {/* Contenido principal de la aplicación */}
                <main className="container mx-auto pt-20 px-4">
                    {/* Configuración de rutas */}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/videos" element={<VideoList />} />
                        <Route path="/register-store" element={<StoreRegister />} />
                        <Route path="/login-store" element={<StoreLogin />} />
                    </Routes>
                </main>
                {/* Pie de página */}
                <footer className="bg-gray-900 p-4 fixed bottom-0 w-full">
                    <p className="text-center">&copy; 2023 LookyMapp. Todos los derechos reservados.</p>
                </footer>
            </div>
        </Router>
    );
};

export default App;
