import React, { useState, useEffect } from 'react';
import * as THREE from 'three'; // Importar three.js
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Asegúrate de tener react-router-dom instalado
import MateriaPrimaInventario from './components/MateriaPrimaInventario';
import RecetasEstandar from './components/RecetasEstandar';
import Ventas from './components/Ventas';
import PagosDelDia from './components/PagosDelDia';
import MiMetaDeHoy from './components/MiMetaDeHoy';
import LoadingBar3D from './components/LoadingBar3D'; // Importar el componente 3D
import Login from './components/Login'; // Importar el componente Login
import Footer from './components/Footer';

// Componente para la página de inicio
const HomePage = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-gray-text-dark"> {/* Usando color de texto de marca */}
        <h1 className="text-5xl font-extrabold mb-6 text-pa-blue">¡Bienvenido a Pa' Arriba!</h1> {/* Azul de marca */}
        <p className="text-xl text-gray-text-dark mb-8 text-center max-w-2xl">
            Tu asistente financiero y de gestión de recetas para tu negocio de alimentos.
        </p>
        <p className="text-lg text-gray-text-light">Selecciona una opción del menú lateral para empezar.</p> {/* Gris claro de marca */}
        <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold text-pa-orange mb-4">crece - avanza - mejora - re-emprende</h3> {/* Slogan con naranja de marca */}
            <p className="text-gray-text-light max-w-lg">
                Empoderando a emprendedores con herramientas claras y accesibles para una mejor rentabilidad.
            </p>
        </div>
    </div>
);

// Componente Sidebar (barra lateral de navegación)
    const Sidebar = ({ isOpen, toggleSidebar }) => (
// Fondo oscuro, texto blanco, sombra sutil, esquinas redondeadas
<div className={`fixed inset-y-0 left-0 bg-pa-black text-pa-white h-screen p-6 shadow-xl flex flex-col transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 lg:w-64`}>
{/* Botón de cierre para pantallas pequeñas */}
         <button onClick={() => toggleSidebar(false)} className="lg:hidden absolute top-4 right-4 text-pa-white focus:outline-none">
             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
         </button>
        {/* Logo/Marca con azul de marca */}
        <h2 className="text-4xl font-extrabold mb-10 text-pa-blue">
            Pa' Arriba!
        </h2>
        <nav className="flex-grow">
            <ul>
                {/* Enlaces de navegación con hover de color de marca */}
                <li className="mb-4">
<Link to="/home" onClick={() => toggleSidebar(false)} className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition duration-200 ease-in-out transform hover:scale-105 text-lg font-medium">                        <svg className="w-6 h-6 mr-3 text-pa-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7 7m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        Inicio
                    </Link>
                </li>
                <li className="mb-4">
<Link to="/materia-prima" onClick={() => toggleSidebar(false)} className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition duration-200 ease-in-out transform hover:scale-105 text-lg font-medium">
                        <svg className="w-6 h-6 mr-3 text-pa-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m7 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v6m7 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m7 0h6a2 2 0 002-2v-6a2 2 0 00-2-2h-6a2 2 0 00-2 2v6a2 2 0 002 2"></path></svg>
                        Mi Despensa
                    </Link>
                </li>
                <li className="mb-4">
<Link to="/recetas" onClick={() => toggleSidebar(false)} className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition duration-200 ease-in-out transform hover:scale-105 text-lg font-medium">
                        <svg className="w-6 h-6 mr-3 text-pa-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        Mi Sazón, Mi Pasión
                    </Link>
                </li>
                <li className="mb-4">
<Link to="/ventas" onClick={() => toggleSidebar(false)} className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition duration-200 ease-in-out transform hover:scale-105 text-lg font-medium">
                        <svg className="w-6 h-6 mr-3 text-pa-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9m2 4H9m4 0h3"></path></svg>
                        Control de Ventas
                    </Link>
                </li>
                <li className="mb-4">
<Link to="/pagos" onClick={() => toggleSidebar(false)} className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition duration-200 ease-in-out transform hover:scale-105 text-lg font-medium">
                        <svg className="w-6 h-6 mr-3 text-pa-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0h.01M9 12h6m-5 0h.01M9 16h6m-5 0h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Control Financiero
                    </Link>
                </li>
                <li className="mb-4">
<Link to="/metas" onClick={() => toggleSidebar(false)} className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition duration-200 ease-in-out transform hover:scale-105 text-lg font-medium">
                        <svg className="w-6 h-6 mr-3 text-pa-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m2-8H4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-4L12 3z"></path></svg>
                        Mi Meta y Resultado de Hoy
                    </Link>
                </li>
            </ul>
        </nav>
    </div>
);
function App() {
    const [isLoading, setIsLoading] = useState(true);
        const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar la visibilidad del sidebar en móvil
        const [loadingProgress, setLoadingProgress] = useState(0); // Estado para el progreso de la carga 0-100%
    useEffect(() => {
let startTime = Date.now();
const duration = 5000; // 5 segundos

const updateProgress = () => {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min((elapsedTime / duration) * 100, 100);
    setLoadingProgress(progress);

    if (progress < 100) {
        requestAnimationFrame(updateProgress);
    } else {
        setIsLoading(false); // Desactiva el loader cuando el progreso llega a 100%
    }
};

requestAnimationFrame(updateProgress);

// Limpieza si es necesario, aunque requestAnimationFrame lo maneja bien
return () => {}; // Dejamos un return vacío para consistencia con useEffect
    }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar
    return (
        <React.Fragment>
            {isLoading ? (
                // ESTE ES EL CONTENIDO QUE SE MUESTRA MIENTRAS CARGA (el loader)
                <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-pa-blue">
                 <img src="/logoarriba.png" alt="Pa' Arriba! Logo" className="h-56 md:h-72 animate-pulse" />
<div id="threejs-container" className="w-full h-48 flex flex-col items-center justify-center relative">
    <LoadingBar3D progress={loadingProgress} /> {/* Renderiza el componente 3D aquí */}
    <p className="mt-2 text-xl text-gray-700">{Math.round(loadingProgress)}%</p> {/* Mueve el porcentaje debajo de la barra */}
</div>
                </div>
            ) : (
                // ESTE ES EL CONTENIDO DE TU APLICACIÓN NORMAL (lo que estaba dentro del Router)
                <Router>
                    {/* Contenedor principal con fuente de marca y fondo general */}
              <div className="relative flex h-screen bg-gray-bg font-sans">
                        {/* Sidebar */}
            {isSidebarOpen && (
                             <div
                                 className="fixed inset-0 bg-black opacity-50 lg:hidden z-40"
                                 onClick={() => setIsSidebarOpen(false)}
                             ></div>
                        )}
                          <Sidebar isOpen={isSidebarOpen} toggleSidebar={setIsSidebarOpen} />                  
             {/* Contenido principal */}
<div className="flex-1 flex flex-col overflow-hidden">
 {/* Botón para abrir el sidebar en pantallas pequeñas */}
                        <button
onClick={() => setIsSidebarOpen(true)} // Llama a la función para abrir el sidebar
className="lg:hidden p-4 text-pa-white bg-pa-blue focus:outline-none z-40 fixed top-4 left-4 rounded-full shadow-lg"
                         >
                             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                         </button>
<main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-bg p-6 pt-16 lg:pt-6">
<Routes>
    <Route path="/" element={<Login />} /> {/* Temporalmente, la página de inicio será Login */}
    <Route path="/home" element={<HomePage />} /> {/* Mueve HomePage a una nueva ruta /home */}
    <Route path="/materia-prima" element={<MateriaPrimaInventario />} />
    <Route path="/recetas" element={<RecetasEstandar />} />
    <Route path="/ventas" element={<Ventas />} />
    <Route path="/pagos" element={<PagosDelDia />} />
    <Route path="/metas" element={<MiMetaDeHoy />} />
</Routes>                              
                            </main>
             <Footer />               
                        </div>
                    </div>
                </Router>
            )}
        </React.Fragment>
    );
}
export default App;