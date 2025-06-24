// src/components/Login.js
import React, { useState } from 'react';

const Login = () => {
    // Estados para los campos del formulario (no se usarán para lógica de autenticación real por ahora)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Por ahora, solo mostraremos un mensaje en consola
        console.log('Intento de Login:', { username, password });
        alert('Funcionalidad de Login NO implementada aún. Esto es solo la UI.');
        // En una implementación real, aquí se llamaría a una API de autenticación
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center text-pa-blue mb-6">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Usuario:
                        </label>
                        <input
                            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-pa-blue"
                            id="username"
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Contraseña:
                        </label>
                        <input
                            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-pa-blue"
                            id="password"
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-pa-green hover:bg-pa-green-dark text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105 w-full"
                            type="submit"
                        >
                            Ingresar
                        </button>
                    </div>
                </form>
                {/* Mensaje informativo */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    Esta es una demostración de la interfaz de login. La funcionalidad real no está conectada.
                </p>
            </div>
        </div>
    );
};

export default Login;