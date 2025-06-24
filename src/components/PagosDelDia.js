import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const PagosDelDia = () => {
    const [pagos, setPagos] = useState([]);
    const [nuevoPago, setNuevoPago] = useState({
        fecha: new Date().toISOString().split('T')[0],
        tipo_pago: '',
        monto: '',
        descripcion: '',
        metodo_pago: '',
    });
    const [pagoEditando, setPagoEditando] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
// Después de la línea 16:
const [filtroTipoPago, setFiltroTipoPago] = useState(''); // Estado para el filtro por tipo de pago
const [filtroFechaInicio, setFiltroFechaInicio] = useState(''); // Estado para la fecha de inicio del filtro
const [filtroFechaFin, setFiltroFechaFin] = useState('');     // Estado para la fecha de fin del filtro
const API_URL = 'http://192.168.100.16:3000';
// Reemplaza de la LÍNEA 20 a la LÍNEA 30:
const obtenerPagos = useCallback(async () => {
    try {
        const params = new URLSearchParams();
        if (filtroTipoPago) {
            params.append('tipoPago', filtroTipoPago);
        }
        if (filtroFechaInicio) {
            params.append('fechaInicio', filtroFechaInicio);
        }
        if (filtroFechaFin) {
            params.append('fechaFin', filtroFechaFin);
        }

        let url = `${API_URL}/pagos-del-dia`;
        if (params.toString()) {
url = `${url}?${params.toString()}`;
        }

        console.log('DEBUG FRONTEND: Solicitando pagos a URL:', url); // Debugging: ver la URL de la solicitud
        const response = await axios.get(url);
        setPagos(response.data);
        setMensajeExito('✅ Pagos cargados exitosamente.');
        setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
        console.error('❌ Error al obtener pagos:', error);
        setMensajeError('❌ Error al cargar los pagos.');
        setTimeout(() => setMensajeError(''), 5000);
    }
}, [API_URL, filtroTipoPago, filtroFechaInicio, filtroFechaFin]); // Añadir dependencias de los filtros
    useEffect(() => {
        obtenerPagos();
    }, [obtenerPagos]);
const handleFiltrarPagos = () => {
    obtenerPagos(); // Llama a la función para obtener pagos con los filtros actuales
};
const handleLimpiarFiltros = () => {
    setFiltroTipoPago(''); // Restablece el tipo de pago a vacío (Todos)
    setFiltroFechaInicio(''); // Restablece la fecha de inicio
    setFiltroFechaFin(''); // Restablece la fecha de fin
    obtenerPagos(); // Recarga los pagos inmediatamente después de limpiar
};
    const handleNuevoPagoChange = (e) => {
        const { name, value } = e.target;
        setNuevoPago(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const registrarPago = async (e) => {
        e.preventDefault();
        if (!nuevoPago.fecha || !nuevoPago.tipo_pago || nuevoPago.monto === '' || nuevoPago.metodo_pago === '') { 
            setMensajeError('❌ Fecha, Tipo de Pago, Monto y Método de Pago son obligatorios.');
            setTimeout(() => setMensajeError(''), 3000);
            return;
        }

        const montoNumerico = parseFloat(nuevoPago.monto);
        if (isNaN(montoNumerico) || montoNumerico < 0) {
            setMensajeError('❌ El monto debe ser un número positivo.');
            setTimeout(() => setMensajeError(''), 3000);
            return;
        }

        try {
            const pagoAAnadir = {
                fecha: nuevoPago.fecha,
                tipo_pago: nuevoPago.tipo_pago,
                monto: montoNumerico,
                descripcion: nuevoPago.descripcion,
                metodo_pago: nuevoPago.metodo_pago,
            };

            // MODIFICACIÓN: Eliminado 'const response ='
            await axios.post(`${API_URL}/pagos-del-dia`, pagoAAnadir); 
            setMensajeExito('✅ Pago registrado exitosamente.');
            setTimeout(() => setMensajeExito(''), 3000);
            setNuevoPago({
                fecha: new Date().toISOString().split('T')[0],
                tipo_pago: '',
                monto: '',
                descripcion: '',
                metodo_pago: '',
            });
            obtenerPagos();
        } catch (error) {
            console.error('❌ Error al registrar pago (frontend):', error);
            let errorMessage = 'Error al registrar el pago.';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = `❌ ${error.response.data.error}`;
            } else if (error.message) {
                errorMessage = `❌ ${error.message}`;
            }
            setMensajeError(errorMessage);
            setTimeout(() => setMensajeError(''), 5000);
        }
    };

    const seleccionarPago = (pago) => {
        setPagoEditando({
            ...pago,
            fecha: new Date(pago.fecha).toISOString().split('T')[0]
        });
    };

    const handlePagoEditandoChange = (e) => {
        const { name, value } = e.target;
        setPagoEditando(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const actualizarPago = async (e) => {
        e.preventDefault();
        if (!pagoEditando || !pagoEditando.fecha || !pagoEditando.tipo_pago || pagoEditando.monto === '' || pagoEditando.metodo_pago === '') {
            setMensajeError('❌ Fecha, Tipo de Pago, Monto y Método de Pago son obligatorios para actualizar.');
            setTimeout(() => setMensajeError(''), 3000);
            return;
        }

        const montoNumerico = parseFloat(pagoEditando.monto);
        if (isNaN(montoNumerico) || montoNumerico < 0) {
            setMensajeError('❌ El monto debe ser un número positivo.');
            setTimeout(() => setMensajeError(''), 3000);
            return;
        }

        try {
            const pagoActualizar = {
                fecha: pagoEditando.fecha,
                tipo_pago: pagoEditando.tipo_pago,
                monto: montoNumerico,
                descripcion: pagoEditando.descripcion,
                metodo_pago: pagoEditando.metodo_pago,
            };

            // MODIFICACIÓN: Eliminado 'const response ='
            await axios.put(`${API_URL}/pagos-del-dia/${pagoEditando.id}`, pagoActualizar);
            setMensajeExito('✅ Pago actualizado exitosamente.');
            setTimeout(() => setMensajeExito(''), 3000);
            setPagoEditando(null);
            obtenerPagos();
        } catch (error) {
            console.error('❌ Error al actualizar pago (frontend):', error);
            let errorMessage = 'Error al actualizar el pago.';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = `❌ ${error.response.data.error}`;
            } else if (error.message) {
                errorMessage = `❌ ${error.message}`;
            }
            setMensajeError(errorMessage);
            setTimeout(() => setMensajeError(''), 5000);
        }
    };

    const eliminarPago = async (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_URL}/pagos-del-dia/${id}`);
                    setMensajeExito('✅ Pago eliminado exitosamente.');
                    setTimeout(() => setMensajeExito(''), 3000);
                    setPagoEditando(null);
                    obtenerPagos();
                    Swal.fire(
                        '¡Eliminado!',
                        'El pago ha sido eliminado.',
                        'success'
                    );
                } catch (error) {
                    console.error('❌ Error al eliminar pago (frontend):', error);
                    let errorMessage = 'Error al eliminar el pago.';
                    if (error.response && error.response.data && error.response.data.error) {
                        errorMessage = `❌ ${error.response.data.error}`;
                    } else if (error.message) {
                        errorMessage = `❌ ${error.message}`;
                    }
                    setMensajeError(errorMessage);
                    setTimeout(() => setMensajeError(''), 5000);
                    Swal.fire(
                        'Error',
                        errorMessage,
                        'error'
                    );
                }
            }
        });
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen font-sans">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Control Financiero - Pagos del Día</h1>
<div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Filtrar Pagos</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro por Tipo de Pago */}
        <div>
            <label htmlFor="filtroTipoPago" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago:</label>
            <select
                id="filtroTipoPago"
                name="filtroTipoPago"
                value={filtroTipoPago}
                onChange={(e) => setFiltroTipoPago(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pa-blue focus:border-pa-blue sm:text-sm rounded-md shadow-sm"
            >
                <option value="">Todos</option> {/* Opción para mostrar todos los tipos */}
                <option value="Sueldo">Sueldo</option>
                <option value="Servicio">Servicio</option>
                <option value="Alquiler">Alquiler</option>
                <option value="Insumos">Insumos</option>
                <option value="Otros">Otros</option>
            </select>
        </div>

        {/* Filtro por Fecha de Inicio */}
        <div>
            <label htmlFor="filtroFechaInicio" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio:</label>
            <input
                type="date"
                id="filtroFechaInicio"
                name="filtroFechaInicio"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pa-blue focus:border-pa-blue sm:text-sm"
            />
        </div>

        {/* Filtro por Fecha de Fin */}
        <div>
            <label htmlFor="filtroFechaFin" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin:</label>
            <input
                type="date"
                id="filtroFechaFin"
                name="filtroFechaFin"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pa-blue focus:border-pa-blue sm:text-sm"
            />
        </div>
<div className="md:col-span-1 flex items-end space-x-2 mt-4 md:mt-0">
    {/* Botón Filtrar (Diseño similar al de materia prima - bg-green-600) */}
    <button
        type="button"
        onClick={handleFiltrarPagos}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
    >
        Filtrar Pagos
    </button>

    {/* Botón Limpiar Filtro (Diseño similar al de materia prima - bg-gray-400) */}
    <button
        type="button"
        onClick={handleLimpiarFiltros}
        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
    >
        Limpiar Filtro
    </button>
</div>
    </div>
</div>
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

            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Registrar Nuevo Pago</h2>
                <form onSubmit={registrarPago} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fecha" className="block text-gray-700 text-sm font-bold mb-2">Fecha del Pago:</label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            value={nuevoPago.fecha}
                            onChange={handleNuevoPagoChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="tipo_pago" className="block text-gray-700 text-sm font-bold mb-2">Tipo de Pago:</label>
                        <select
                            id="tipo_pago"
                            name="tipo_pago"
                            value={nuevoPago.tipo_pago}
                            onChange={handleNuevoPagoChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="">Seleccionar Tipo</option>
                            <option value="Sueldo">Sueldo</option>
                            <option value="Servicio">Servicio</option>
                            <option value="Alquiler">Alquiler</option>
                            <option value="Insumos">Insumos</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="monto" className="block text-gray-700 text-sm font-bold mb-2">Monto:</label>
                        <input
                            type="number"
                            id="monto"
                            name="monto"
                            value={nuevoPago.monto}
                            onChange={handleNuevoPagoChange}
                            step="0.01"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="metodo_pago" className="block text-gray-700 text-sm font-bold mb-2">Método de Pago:</label>
                        <select
                            id="metodo_pago"
                            name="metodo_pago"
                            value={nuevoPago.metodo_pago}
                            onChange={handleNuevoPagoChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="">Seleccionar Método</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                            <option value="Tarjeta de Credito/Debito">Tarjeta de Crédito/Débito</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">Descripción (opcional):</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={nuevoPago.descripcion}
                            onChange={handleNuevoPagoChange}
                            rows="2"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                    </div>
                    <div className="md:col-span-2 text-right">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                        >
                            Registrar Pago
                        </button>
                    </div>
                </form>
            </div>
            <div className="hidden md:block">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Registro de Pagos</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                        <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <tr>
                                <th className="py-3 px-6 text-left">Fecha</th>
                                <th className="py-3 px-6 text-left">Tipo de Pago</th>
                                <th className="py-3 px-6 text-right">Monto</th>
                                <th className="py-3 px-6 text-left">Método de Pago</th>
                                <th className="py-3 px-6 text-left">Descripción</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {pagos.map(pago => (
                                <tr
                                    key={pago.id}
                                    className={`border-b border-gray-200 hover:bg-gray-100 ${pagoEditando && pagoEditando.id === pago.id ? 'bg-blue-50' : ''}`}
                                    onClick={() => seleccionarPago(pago)}
                                >
                                    <td className="py-3 px-6 text-left">{new Date(pago.fecha).toLocaleDateString()}</td>
                                    <td className="py-3 px-6 text-left">{pago.tipo_pago}</td>
                                    <td className="py-3 px-6 text-right">${parseFloat(pago.monto).toFixed(2)}</td>
                                    <td className="py-3 px-6 text-left">{pago.metodo_pago || 'N/A'}</td>
                                    <td className="py-3 px-6 text-left truncate max-w-xs">{pago.descripcion}</td>
                                    <td className="py-3 px-6 text-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); seleccionarPago(pago); }}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-lg text-xs shadow-md transform transition duration-150 hover:scale-105 mr-2"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); eliminarPago(pago.id); }}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg text-xs shadow-md transform transition duration-150 hover:scale-105"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                    </div>
        </div> {/* Cierre del div hidden md:block */}
        <div className="md:hidden mt-4">
{pagos.length > 0 ? (
    <div className="space-y-4"> {/* Contenedor para espaciar las tarjetas */}
        {pagos.map(pago => (
            <div key={pago.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Pago ID: {pago.id}</span>
                    <span className="text-xs text-gray-500">{new Date(pago.fecha).toLocaleDateString()}</span>
                </div>
                <div className="border-t border-gray-100 pt-2">
                    <p className="text-md font-bold text-gray-800">Tipo de Pago: {pago.tipo_pago}</p>
                    <p className="text-lg font-bold text-gray-800 mt-1">Monto: ${parseFloat(pago.monto).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Método de Pago: {pago.metodo_pago || 'N/A'}</p>
                    {pago.descripcion && <p className="text-xs text-gray-500 mt-1">Descripción: {pago.descripcion}</p>}
                </div>
                <div className="flex justify-end mt-3">
                    <button
                        onClick={() => seleccionarPago(pago)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out mr-2"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => eliminarPago(pago.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ))}
    </div>
) : (
    <p className="text-center text-gray-500 mt-8">No hay pagos registrados para mostrar en móvil.</p>
)}            {pagos.length === 0 && (
                <p className="text-center text-gray-500 py-4">No hay pagos registrados.</p>
            )}
        </div>

{pagoEditando && (
                <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Editar Pago</h2>
                    <form onSubmit={actualizarPago} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit_fecha" className="block text-gray-700 text-sm font-bold mb-2">Fecha del Pago:</label>
                            <input
                                type="date"
                                id="edit_fecha"
                                name="fecha"
                                value={pagoEditando.fecha || ''}
                                onChange={handlePagoEditandoChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="edit_tipo_pago" className="block text-gray-700 text-sm font-bold mb-2">Tipo de Pago:</label>
                            <select
                                id="edit_tipo_pago"
                                name="tipo_pago"
                                value={pagoEditando.tipo_pago || ''}
                                onChange={handlePagoEditandoChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            >
                                <option value="">Seleccionar Tipo</option>
                                <option value="Sueldo">Sueldo</option>
                                <option value="Servicio">Servicio</option>
                                <option value="Alquiler">Alquiler</option>
                                <option value="Insumos">Insumos</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="edit_monto" className="block text-gray-700 text-sm font-bold mb-2">Monto:</label>
                            <input
                                type="number"
                                id="edit_monto"
                                name="monto"
                                value={pagoEditando.monto || ''}
                                onChange={handlePagoEditandoChange}
                                step="0.01"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="edit_metodo_pago" className="block text-gray-700 text-sm font-bold mb-2">Método de Pago:</label>
                            <select
                                id="edit_metodo_pago"
                                name="metodo_pago"
                                value={pagoEditando.metodo_pago || ''}
                                onChange={handlePagoEditandoChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            >
                                <option value="">Seleccionar Método</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                <option value="Tarjeta de Credito/Debito">Tarjeta de Crédito/Débito</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="edit_descripcion" className="block text-gray-700 text-sm font-bold mb-2">Descripción (opcional):</label>
                            <textarea
                                id="edit_descripcion"
                                name="descripcion"
                                value={pagoEditando.descripcion || ''}
                                onChange={handlePagoEditandoChange}
                                rows="2"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            ></textarea>
                        </div>
                        <div className="md:col-span-2 text-right">
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105 mr-2"
                            >
                                Actualizar Pago
                            </button>
                            <button
                                type="button"
                                onClick={() => setPagoEditando(null)}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PagosDelDia;
