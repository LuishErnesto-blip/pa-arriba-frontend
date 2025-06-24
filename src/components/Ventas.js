import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Colores de la identidad visual de Pa' Arriba
const PAARRIBA_COLORS = {
    azulElectrico: '#1877f2',
    naranjaVibrante: '#ff5c00',
    verdeDinamico: '#1ed760',
    negro: '#333333',
    blanco: '#ffffff',
    grisClaro: '#f2f2f2',
    grisBorde: '#e0e0e0',
    rojoError: '#e74c3c'
};

const Ventas = () => {
    // Estados principales
    const [ventas, setVentas] = useState([]);
    const [nuevaVenta, setNuevaVenta] = useState({
        fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        platillo_id: '',
        cantidad: '',
        precio_unitario: '', // Se autocompletará
        total_venta: '',     // Se autocalculará
        metodo_pago: '',
        descripcion: '',
    });
    const [ventaEditando, setVentaEditando] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [recetasDisponibles, setRecetasDisponibles] = useState([]);

    // NUEVOS ESTADOS PARA LOS FILTROS DE FECHA
    const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
    const [filtroFechaFin, setFiltroFechaFin] = useState('');

const API_URL = 'http://192.168.100.16:3000';
    // Envuelve obtenerVentas en useCallback
    const obtenerVentas = useCallback(async () => {
        try {
            // Construir la URL con parámetros de fecha si están presentes
            let url = `${API_URL}/ventas`;
            const params = new URLSearchParams();

            if (filtroFechaInicio) {
                params.append('fechaInicio', filtroFechaInicio);
            }
            if (filtroFechaFin) {
                params.append('fechaFin', filtroFechaFin);
            }

            // Si hay parámetros, añadirlos a la URL
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await axios.get(url);
            setVentas(response.data);
            setMensajeExito('✅ Ventas cargadas exitosamente.');
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (error) {
            console.error('❌ Error al obtener ventas:', error);
            setMensajeError('❌ Error al cargar las ventas.');
            setTimeout(() => setMensajeError(''), 5000);
        }
    }, [API_URL, filtroFechaInicio, filtroFechaFin]); // Dependencias para que se ejecute al cambiar filtros

    // Envuelve obtenerRecetasDisponibles en useCallback
    const obtenerRecetasDisponibles = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/recetas-estandar?es_producto_final=true`);
            setRecetasDisponibles(response.data);
        } catch (error) {
            console.error('❌ Error al obtener recetas disponibles:', error);
        }
    }, [API_URL]);

    // useEffect para cargar ventas y recetas al inicio o al cambiar filtros
    useEffect(() => {
        obtenerRecetasDisponibles();
        obtenerVentas(); // Se llamará con los filtros actuales
    }, [obtenerRecetasDisponibles, obtenerVentas]); // Dependencias: funciones de carga y filtros

    // Manejar cambios en el formulario de nueva venta
    const handleNuevaVentaChange = (e) => {
        const { name, value } = e.target;
        setNuevaVenta(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'platillo_id') {
                const selectedReceta = recetasDisponibles.find(r => String(r.id) === String(value));
                if (selectedReceta) {
                    newState.precio_unitario = parseFloat(selectedReceta.precio_venta || 0).toFixed(2);
                    if (newState.cantidad) {
                        newState.total_venta = (parseFloat(newState.cantidad) * parseFloat(newState.precio_unitario)).toFixed(2);
                    }
                } else {
                    newState.precio_unitario = '';
                    newState.total_venta = '';
                }
            } else if (name === 'cantidad') {
                if (newState.precio_unitario) {
                    newState.total_venta = (parseFloat(value || 0) * parseFloat(newState.precio_unitario)).toFixed(2);
                }
            }
            return newState;
        });
    };

    // Manejar cambios en el formulario de edición de venta
    const handleVentaEditandoChange = (e) => {
        const { name, value } = e.target;
        setVentaEditando(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'platillo_id') {
                const selectedReceta = recetasDisponibles.find(r => String(r.id) === String(value));
                if (selectedReceta) {
                    newState.precio_unitario = parseFloat(selectedReceta.precio_venta || 0).toFixed(2);
                    if (newState.cantidad) {
                        newState.total_venta = (parseFloat(newState.cantidad) * parseFloat(newState.precio_unitario)).toFixed(2);
                    }
                } else {
                    newState.precio_unitario = '';
                    newState.total_venta = '';
                }
            } else if (name === 'cantidad') {
                if (newState.precio_unitario) {
                    newState.total_venta = (parseFloat(value || 0) * parseFloat(newState.precio_unitario)).toFixed(2);
                }
            }
            return newState;
        });
    };

    // Función para registrar una nueva venta
    const registrarVenta = async (e) => {
        e.preventDefault();
        if (!nuevaVenta.platillo_id || !nuevaVenta.cantidad || !nuevaVenta.total_venta) {
            setMensajeError('❌ Faltan campos obligatorios para registrar la venta.');
            return;
        }

        try {
            const ventaAEnviar = {
                ...nuevaVenta,
                cantidad: parseFloat(nuevaVenta.cantidad),
                precio_unitario: parseFloat(nuevaVenta.precio_unitario),
                total_venta: parseFloat(nuevaVenta.total_venta),
                platillo_id: parseInt(nuevaVenta.platillo_id),
                // Asegurar que metodo_pago y descripcion se envíen como strings o null
                metodo_pago: nuevaVenta.metodo_pago || null,
                descripcion: nuevaVenta.descripcion || null
            };
            
            await axios.post(`${API_URL}/ventas`, ventaAEnviar);
            setMensajeExito('✅ Venta registrada exitosamente.');
            setNuevaVenta({
                fecha: new Date().toISOString().split('T')[0],
                platillo_id: '',
                cantidad: '',
                precio_unitario: '',
                total_venta: '',
                metodo_pago: '',
                descripcion: '',
            });
            obtenerVentas(); // Recargar la lista de ventas
        } catch (error) {
            console.error('❌ Error al registrar venta:', error);
            setMensajeError('❌ Error al registrar la venta. ' + (error.response?.data?.error || error.message));
        }
    };

    // Función para seleccionar una venta para edición
    const seleccionarVenta = (venta) => {
        setVentaEditando({
            ...venta,
            fecha: venta.fecha.split('T')[0], // Formato de fecha para input type="date"
            cantidad: String(venta.cantidad), // Para input type="number"
            precio_unitario: String(venta.precio_unitario),
            total_venta: String(venta.total_venta),
            platillo_id: String(venta.platillo_id), // Para select
        });
    };

    // Función para actualizar una venta
    const actualizarVenta = async (e) => {
        e.preventDefault();
        if (!ventaEditando || !ventaEditando.platillo_id || !ventaEditando.cantidad || !ventaEditando.total_venta) {
            setMensajeError('❌ Faltan campos obligatorios para actualizar la venta.');
            return;
        }

        try {
            const ventaAActualizar = {
                ...ventaEditando,
                cantidad: parseFloat(ventaEditando.cantidad),
                precio_unitario: parseFloat(ventaEditando.precio_unitario),
                total_venta: parseFloat(ventaEditando.total_venta),
                platillo_id: parseInt(ventaEditando.platillo_id),
                metodo_pago: ventaEditando.metodo_pago || null,
                descripcion: ventaEditando.descripcion || null
            };

            await axios.put(`${API_URL}/ventas/${ventaAActualizar.id}`, ventaAActualizar);
            setMensajeExito('✅ Venta actualizada exitosamente.');
            setVentaEditando(null); // Limpiar el formulario de edición
            obtenerVentas(); // Recargar la lista de ventas
        } catch (error) {
            console.error('❌ Error al actualizar venta:', error);
            setMensajeError('❌ Error al actualizar la venta. ' + (error.response?.data?.error || error.message));
        }
    };

    // Función para eliminar una venta
    const eliminarVenta = async (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: PAARRIBA_COLORS.azulElectrico,
            cancelButtonColor: PAARRIBA_COLORS.rojoError,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_URL}/ventas/${id}`);
                    setMensajeExito('✅ Venta eliminada exitosamente.');
                    obtenerVentas(); // Recargar la lista de ventas
                    Swal.fire(
                        '¡Eliminada!',
                        'La venta ha sido eliminada.',
                        'success'
                    );
                } catch (error) {
                    console.error('❌ Error al eliminar venta:', error);
                    setMensajeError('❌ Error al eliminar la venta. ' + (error.response?.data?.error || error.message));
                    Swal.fire(
                        'Error',
                        'Error al eliminar la venta: ' + (error.response?.data?.error || error.message),
                        'error'
                    );
                }
            }
        });
    };

    // JSX del componente
    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen font-sans">
            <h1 className="text-4xl font-bold text-pa-blue mb-8 text-center">
                CONTROL DE VENTAS
            </h1>

            {/* Mensajes de éxito y error */}
            {mensajeExito && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-md" role="alert">
                    {mensajeExito}
                </div>
            )}
            {mensajeError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
                    {mensajeError}
                </div>
            )}

            {/* Formulario para registrar nueva venta */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Registrar Nueva Venta</h2>
                <form onSubmit={registrarVenta} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fecha" className="block text-gray-700 text-sm font-bold mb-2">Fecha:</label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            value={nuevaVenta.fecha}
                            onChange={handleNuevaVentaChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="platillo_id" className="block text-gray-700 text-sm font-bold mb-2">Platillo:</label>
                        <select
                            id="platillo_id"
                            name="platillo_id"
                            value={nuevaVenta.platillo_id}
                            onChange={handleNuevaVentaChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="">-- Seleccionar Platillo --</option>
                            {recetasDisponibles.map(receta => (
                                <option key={receta.id} value={receta.id}>{receta.nombre_platillo}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="cantidad" className="block text-gray-700 text-sm font-bold mb-2">Cantidad:</label>
                        <input
                            type="number"
                            id="cantidad"
                            name="cantidad"
                            value={nuevaVenta.cantidad}
                            onChange={handleNuevaVentaChange}
                            step="0.01"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="precio_unitario" className="block text-gray-700 text-sm font-bold mb-2">Precio Unitario ($):</label>
                        <input
                            type="number"
                            id="precio_unitario"
                            name="precio_unitario"
                            value={nuevaVenta.precio_unitario}
                            onChange={handleNuevaVentaChange}
                            step="0.01"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            readOnly
                        />
                    </div>
                    <div>
                        <label htmlFor="total_venta" className="block text-gray-700 text-sm font-bold mb-2">Total Venta ($):</label>
                        <input
                            type="number"
                            id="total_venta"
                            name="total_venta"
                            value={nuevaVenta.total_venta}
                            onChange={handleNuevaVentaChange}
                            step="0.01"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            readOnly
                        />
                    </div>
                    <div>
                        <label htmlFor="metodo_pago" className="block text-gray-700 text-sm font-bold mb-2">Método de Pago:</label>
                        <select
                            id="metodo_pago"
                            name="metodo_pago"
                            value={nuevaVenta.metodo_pago}
                            onChange={handleNuevaVentaChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="">-- Seleccionar Método --</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">Descripción (opcional):</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={nuevaVenta.descripcion}
                            onChange={handleNuevaVentaChange}
                            rows="2"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                    </div>
                    <div className="md:col-span-2 text-right">
                        <button
                            type="submit"
                            className="bg-pa-blue hover:bg-pa-blue-dark text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                        >
                            Registrar Venta
                        </button>
                    </div>
                </form>
            </div>

            {/* AÑADIDO: Bloque de Filtros de Fecha */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Filtrar Ventas por Fecha</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="filtroFechaInicio" className="block text-gray-700 text-sm font-bold mb-2">Fecha Inicio:</label>
                        <input
                            type="date"
                            id="filtroFechaInicio"
                            name="filtroFechaInicio"
                            value={filtroFechaInicio}
                            onChange={(e) => setFiltroFechaInicio(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div>
                        <label htmlFor="filtroFechaFin" className="block text-gray-700 text-sm font-bold mb-2">Fecha Fin:</label>
                        <input
                            type="date"
                            id="filtroFechaFin"
                            name="filtroFechaFin"
                            value={filtroFechaFin}
                            onChange={(e) => setFiltroFechaFin(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex justify-end md:justify-start">
                        <button
                            onClick={() => {
                                setFiltroFechaInicio(''); // Limpiar el estado de fecha de inicio
                                setFiltroFechaFin('');     // Limpiar el estado de fecha de fin
                                // obtenerVentas() se llamará automáticamente por el useEffect
                            }}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105 mr-2"
                        >
                            Limpiar Filtros
                        </button>
                         <button
                            onClick={obtenerVentas} // Llama a obtenerVentas para aplicar el filtro
                            className="bg-pa-blue hover:bg-pa-blue-dark text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                        >
                            Aplicar Filtro
                        </button>
                    </div>
                </div>
            </div>
            {/* Sección de Registro de Ventas */}
            <div className="hidden md:block">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Registro de Ventas</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                        <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <tr>
                                <th className="py-3 px-6 text-left">Fecha</th>
                                <th className="py-3 px-6 text-left">Platillo</th>
                                <th className="py-3 px-6 text-right">Cantidad</th>
                                <th className="py-3 px-6 text-right">Precio Unitario</th>
                                <th className="py-3 px-6 text-right">Total Venta</th>
                                <th className="py-3 px-6 text-left">Método Pago</th>
                                <th className="py-3 px-6 text-left">Descripción</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {ventas.length > 0 ? (
                                ventas.map(venta => (
                                    <tr key={venta.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left">{new Date(venta.fecha).toLocaleDateString()}</td>
                                        <td className="py-3 px-6 text-left">{venta.nombre_platillo}</td> {/* 'nombre_platillo' viene de la unión en el backend */}
                                        <td className="py-3 px-6 text-right">{parseFloat(venta.cantidad).toFixed(2)}</td>
                                        <td className="py-3 px-6 text-right">${parseFloat(venta.precio_unitario).toFixed(2)}</td>
                                        <td className="py-3 px-6 text-right">${parseFloat(venta.total_venta).toFixed(2)}</td>
                                        <td className="py-3 px-6 text-left">{venta.metodo_pago || 'N/A'}</td>
                                        <td className="py-3 px-6 text-left">{venta.descripcion || 'N/A'}</td>
                                        <td className="py-3 px-6 text-center">
                                            <button
                                                onClick={() => seleccionarVenta(venta)}
                                                className="bg-pa-orange hover:bg-pa-orange-dark text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out mr-2"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => eliminarVenta(venta.id)}
                                                className="bg-feedback-error hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-4 text-center text-gray-500">No hay ventas registradas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div> {/* Cierre del div hidden md:block */}
                </div>
            </div>
            <div className="md:hidden mt-4">
            {ventas.length > 0 ? (
    <div className="space-y-4"> {/* Contenedor para espaciar las tarjetas */}
        {ventas.map(venta => (
            <div key={venta.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Venta ID: {venta.id}</span>
                    <span className="text-xs text-gray-500">{new Date(venta.fecha).toLocaleDateString()}</span>
                </div>
                <div className="border-t border-gray-100 pt-2">
                    <p className="text-md font-bold text-gray-800">{venta.nombre_platillo}</p>
                    <p className="text-sm text-gray-600">Cantidad: {parseFloat(venta.cantidad).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Precio Unitario: ${parseFloat(venta.precio_unitario).toFixed(2)}</p>
                    <p className="text-lg font-bold text-gray-800 mt-1">Total: ${parseFloat(venta.total_venta).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Método de Pago: {venta.metodo_pago || 'N/A'}</p>
                    {venta.descripcion && <p className="text-xs text-gray-500 mt-1">Descripción: {venta.descripcion}</p>}
                </div>
                <div className="flex justify-end mt-3">
                    <button
                        onClick={() => seleccionarVenta(venta)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out mr-2"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => eliminarVenta(venta.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ))}
    </div>
) : (
    <p className="text-center text-gray-500 mt-8">No hay ventas registradas para mostrar en móvil.</p>
)}
            {/* Aquí es donde irá el código para las tarjetas de ventas */}
            </div>
            {/* Formulario para editar venta (ya debe estar aquí) */}
            {ventaEditando && (
                <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Editar Venta</h2>
                    <form onSubmit={actualizarVenta} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit_fecha" className="block text-gray-700 text-sm font-bold mb-2">Fecha:</label>
                            <input
                                type="date"
                                id="edit_fecha"
                                name="fecha"
                                value={ventaEditando.fecha}
                                onChange={handleVentaEditandoChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="edit_platillo_id" className="block text-gray-700 text-sm font-bold mb-2">Platillo:</label>
                            <select
                                id="edit_platillo_id"
                                name="platillo_id"
                                value={ventaEditando.platillo_id}
                                onChange={handleVentaEditandoChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            >
                                <option value="">-- Seleccionar Platillo --</option>
                                {recetasDisponibles.map(receta => (
                                    <option key={receta.id} value={receta.id}>{receta.nombre_platillo}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="edit_cantidad" className="block text-gray-700 text-sm font-bold mb-2">Cantidad:</label>
                            <input
                                type="number"
                                id="edit_cantidad"
                                name="cantidad"
                                value={ventaEditando.cantidad}
                                onChange={handleVentaEditandoChange}
                                step="0.01"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="edit_precio_unitario" className="block text-gray-700 text-sm font-bold mb-2">Precio Unitario ($):</label>
                            <input
                                type="number"
                                id="edit_precio_unitario"
                                name="precio_unitario"
                                value={ventaEditando.precio_unitario}
                                onChange={handleVentaEditandoChange}
                                step="0.01"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                readOnly
                            />
                        </div>
                        <div>
                            <label htmlFor="edit_total_venta" className="block text-gray-700 text-sm font-bold mb-2">Total Venta ($):</label>
                            <input
                                type="number"
                                id="edit_total_venta"
                                name="total_venta"
                                value={ventaEditando.total_venta}
                                onChange={handleVentaEditandoChange}
                                step="0.01"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                readOnly
                            />
                        </div>
                        <div>
                            <label htmlFor="edit_metodo_pago" className="block text-gray-700 text-sm font-bold mb-2">Método de Pago:</label>
                            <select
                                id="edit_metodo_pago"
                                name="metodo_pago"
                                value={ventaEditando.metodo_pago}
                                onChange={handleVentaEditandoChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="">-- Seleccionar Método --</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="edit_descripcion" className="block text-gray-700 text-sm font-bold mb-2">Descripción (opcional):</label>
                            <textarea
                                id="edit_descripcion"
                                name="descripcion"
                                value={ventaEditando.descripcion}
                                onChange={handleVentaEditandoChange}
                                rows="2"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            ></textarea>
                        </div>
                        <div className="md:col-span-2 text-right">
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105 mr-2"
                            >
                                Actualizar Venta
                            </button>
                            <button
                                type="button"
                                onClick={() => setVentaEditando(null)}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                            >
                                Cancelar Edición
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Ventas;
