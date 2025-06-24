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

const MateriaPrimaInventario = () => {
    // Estados para la gestión de materia prima
    const [materiaPrima, setMateriaPrima] = useState([]);
    const [nuevaMateriaPrima, setNuevaMateriaPrima] = useState({
        nombre: '',
        unidad: '',      // Coincide con campo 'unidad' en BD
        costo: '',   // Coincide con campo 'costo' en BD
        cantidad: '', // Coincide con campo 'cantidad' en BD
        fecha_ingreso: new Date().toISOString().split('T')[0], // Ahora existe en BD
        descripcion: ''       // Ahora existe en BD
    });
    const [materiaPrimaEditando, setMateriaPrimaEditando] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [ingredientesList, setIngredientesList] = useState([]); // Nuevo estado para la lista de nombres de ingredientes del filtro
    const [filtroNombre, setFiltroNombre] = useState(''); // Nuevo estado para el filtro por nombre
     const [filtroFechaInicio, setFiltroFechaInicio] = useState(''); // Estado para el filtro por fecha de inicio
     const [filtroFechaFin, setFiltroFechaFin] = useState('');     // Estado para el filtro por fecha de fin
    const [compras, setCompras] = useState([]);
    const [compraEditando, setCompraEditando] = useState(null);
    // ****** MODIFICACIÓN CLAVE AQUÍ (Estado de Compras): Alinear con columnas de BD 'compras' ******
    const [nuevaCompra, setNuevaCompra] = useState({
        producto: '',        // Columna 'producto' en BD, antes 'materia_prima_id'
        cantidad: '',        // Columna 'cantidad' en BD, antes 'cantidad_comprada'
        unidad: '',          // Columna 'unidad' en BD
        costo_unitario: '',  // Columna 'costo_unitario' en BD, antes 'costo_total_compra' (Frontend enviaba Costo Total)
        fecha: new Date().toISOString().split('T')[0], // Columna 'fecha' en BD, antes 'fecha_compra'
        // 'proveedor' y 'factura' eliminados, ya que no existen en la tabla 'compras'
    });

const API_URL = 'http://192.168.100.16:3000'; // Apunta a la IP de tu computadora donde está el backend
    // Función auxiliar para mostrar mensajes
    const mostrarMensaje = useCallback((tipo, mensaje) => {
        if (tipo === 'exito') {
            setMensajeExito(mensaje);
            setTimeout(() => setMensajeExito(''), 3000);
        } else {
            setMensajeError(mensaje);
            setTimeout(() => setMensajeError(''), 5000);
        }
    }, []);

    // Función para obtener la materia prima
const obtenerMateriaPrima = useCallback(async (nombre = '', fechaInicio = '', fechaFin = '') => {
    try {
            // ****** MODIFICACIÓN CLAVE AQUÍ (URL de Materia Prima): Alinear con backend ******
            // De '/materia-prima-inventario' a '/materia-prima' para coincidir con el backend
let url = `${API_URL}/materia-prima`;
            const params = new URLSearchParams();

            if (nombre) {
                params.append('nombre', nombre);
            }
            if (fechaInicio) {
                params.append('fechaInicio', fechaInicio);
            }
            if (fechaFin) {
                params.append('fechaFin', fechaFin);
            }

            if (params.toString()) {
 url = `${url}?${params.toString()}`;
            }
            const response = await axios.get(url);
            setMateriaPrima(response.data);
            mostrarMensaje('exito', '✅ Materias primas cargadas exitosamente.');
        } catch (error) {
            console.error('❌ Error al obtener materia prima:', error);
            mostrarMensaje('error', '❌ Error al cargar las materias primas. ' + (error.response?.data?.error || error.message));
        }
}, [API_URL, mostrarMensaje]); // Las dependencias no cambian por añadir parámetros opcionales
 const aplicarFiltros = () => {
     obtenerMateriaPrima(filtroNombre, filtroFechaInicio, filtroFechaFin);
 };
const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    obtenerMateriaPrima(); // Llama a la función sin parámetros para obtener todo
};
     // useEffect para cargar la materia prima y las compras al inicio
     useEffect(() => {
obtenerMateriaPrima(filtroNombre, filtroFechaInicio, filtroFechaFin);
}, [obtenerMateriaPrima, filtroNombre, filtroFechaInicio, filtroFechaFin]);
          // Efecto para cargar la lista de nombres de ingredientes para el filtro
useEffect(() => {
    const fetchIngredientesList = async () => {
        try {
            const response = await axios.get(`${API_URL}/ingredientes/nombres`);
            setIngredientesList(response.data); // El backend ya devuelve un array ordenado de nombres
        } catch (error) {
            console.error('❌ Error al obtener la lista de nombres de ingredientes para el filtro:', error);
        }
    };

    fetchIngredientesList();
}, []); // Se ejecuta una sola vez al montar el componente


const registrarMateriaPrima = async (e) => {
        e.preventDefault();
        // Validación básica: Asegurarse de usar los nombres de propiedades actualizados
        if (!nuevaMateriaPrima.nombre || !nuevaMateriaPrima.unidad || nuevaMateriaPrima.costo === '' || nuevaMateriaPrima.cantidad === '' || !nuevaMateriaPrima.fecha_ingreso) {
            mostrarMensaje('error', '❌ Todos los campos obligatorios deben ser llenados.');
            return;
        }

        try {
            const mpEnviar = {
                // Mapear propiedades del estado a los nombres de las columnas de la BD 'ingredientes'
                nombre: nuevaMateriaPrima.nombre,
                unidad: nuevaMateriaPrima.unidad,             // CAMBIO: Antes 'tipo_unidad'
                costo: parseFloat(nuevaMateriaPrima.costo),   // CAMBIO: Antes 'costo_unitario'
                cantidad: parseFloat(nuevaMateriaPrima.cantidad), // CAMBIO: Antes 'cantidad_disponible'
                fecha_ingreso: nuevaMateriaPrima.fecha_ingreso,
                descripcion: nuevaMateriaPrima.descripcion
            };
            await axios.post(`${API_URL}/materia-prima`, mpEnviar);
            mostrarMensaje('exito', '✅ Materia prima registrada exitosamente.');
            // Restablecer el formulario con los nombres de propiedades actualizados
            setNuevaMateriaPrima({
                nombre: '',
                unidad: '',             // CAMBIO: Antes 'tipo_unidad'
                costo: '',              // CAMBIO: Antes 'costo_unitario'
                cantidad: '',           // CAMBIO: Antes 'cantidad_disponible'
                fecha_ingreso: new Date().toISOString().split('T')[0],
                descripcion: ''
            });
            obtenerMateriaPrima(); // Recargar la lista
        } catch (error) {
            console.error('❌ Error al registrar materia prima:', error);
            mostrarMensaje('error', '❌ Error al registrar la materia prima. ' + (error.response?.data?.error || error.message));
        }
    };

        // Función para seleccionar materia prima para edición
    const seleccionarMateriaPrima = (mp) => {
        setMateriaPrimaEditando({
            ...mp,
            // Asegura que las propiedades existan antes de acceder a ellas, si pueden ser nulas desde la BD
            fecha_ingreso: mp.fecha_ingreso ? mp.fecha_ingreso.split('T')[0] : new Date().toISOString().split('T')[0], // Formato para input type="date"
            descripcion: mp.descripcion || '', // Asegura que no sea null
            costo: String(mp.costo), // CAMBIO: Ahora mapea directamente a 'costo'
            cantidad: String(mp.cantidad), // CAMBIO: Ahora mapea directamente a 'cantidad'
            unidad: mp.unidad // CAMBIO: Ahora mapea directamente a 'unidad'
        });
    };

       // Función para actualizar materia prima
    const actualizarMateriaPrima = async (e) => {
        e.preventDefault();
        // Validación básica: Asegurarse de usar los nombres de propiedades actualizados
        if (!materiaPrimaEditando || !materiaPrimaEditando.nombre || !materiaPrimaEditando.unidad || materiaPrimaEditando.costo === '' || materiaPrimaEditando.cantidad === '' || !materiaPrimaEditando.fecha_ingreso) {
            mostrarMensaje('error', '❌ Todos los campos obligatorios deben ser llenados para actualizar.');
            return;
        }

        try {
            const mpActualizar = {
                // Mapear propiedades del estado a los nombres de las columnas de la BD 'ingredientes'
                id: materiaPrimaEditando.id, // Asegurar que el ID se envíe para la actualización
                nombre: materiaPrimaEditando.nombre,
                unidad: materiaPrimaEditando.unidad, // CAMBIO: Antes 'tipo_unidad'
                costo: parseFloat(materiaPrimaEditando.costo), // CAMBIO: Antes 'costo_unitario'
                cantidad: parseFloat(materiaPrimaEditando.cantidad), // CAMBIO: Antes 'cantidad_disponible'
                fecha_ingreso: materiaPrimaEditando.fecha_ingreso,
                descripcion: materiaPrimaEditando.descripcion
            };
            await axios.put(`${API_URL}/materia-prima/${mpActualizar.id}`, mpActualizar);
            mostrarMensaje('exito', '✅ Materia prima actualizada exitosamente.');
            setMateriaPrimaEditando(null);
            obtenerMateriaPrima(); // Recargar la lista
        } catch (error) {
            console.error('❌ Error al actualizar materia prima:', error);
            mostrarMensaje('error', '❌ Error al actualizar la materia prima. ' + (error.response?.data?.error || error.message));
        }
    };
    
    // Función para eliminar materia prima
    const eliminarMateriaPrima = async (id) => {
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
                    await axios.delete(`${API_URL}/materia-prima/${id}`); // URL ya correcta
                    mostrarMensaje('exito', '✅ Materia prima eliminada exitosamente.');
                    obtenerMateriaPrima(); // Recargar la lista
                    Swal.fire(
                        '¡Eliminada!',
                        'La materia prima ha sido eliminada.',
                        'success'
                    );
                } catch (error) {
                    console.error('❌ Error al eliminar materia prima:', error);
                    mostrarMensaje('error', '❌ Error al eliminar la materia prima. ' + (error.response?.data?.error || error.message));
                    Swal.fire(
                        'Error',
                        'Error al eliminar la materia prima: ' + (error.response?.data?.error || error.message),
                        'error'
                    );
                }
            }
        });
    };

    // Funciones para la gestión de compras
    const registrarCompra = async (e) => {
        e.preventDefault();
        // ****** MODIFICACIÓN CLAVE AQUÍ (Validación y Objeto a Enviar para Compras) ******
        if (!nuevaCompra.producto || !nuevaCompra.cantidad || !nuevaCompra.unidad || !nuevaCompra.costo_unitario || !nuevaCompra.fecha) {
            mostrarMensaje('error', '❌ Faltan campos obligatorios para registrar la compra.');
            return;
        }
        try {
            const compraEnviar = {
                // Mapear nombres del frontend a lo que el backend espera de la BD 'compras'
                producto: nuevaCompra.producto,
                cantidad: parseFloat(nuevaCompra.cantidad),
                unidad: nuevaCompra.unidad,
                costo_unitario: parseFloat(nuevaCompra.costo_unitario),
                fecha: nuevaCompra.fecha,
                // 'proveedor' y 'factura' se eliminan aquí, ya que no existen en la BD 'compras'
            };
            await axios.post(`${API_URL}/compras`, compraEnviar);
            mostrarMensaje('exito', '✅ Compra registrada exitosamente.');
            // Restablecer el formulario de compras
            setNuevaCompra({
                producto: '',
                cantidad: '',
                unidad: '',
                costo_unitario: '',
                fecha: new Date().toISOString().split('T')[0],
            });
         
            obtenerMateriaPrima(); // Re-obtener materia prima para actualizar cantidad disponible (si el backend lo maneja)
        } catch (error) {
            console.error('❌ Error al registrar compra:', error);
            mostrarMensaje('error', '❌ Error al registrar la compra. ' + (error.response?.data?.error || error.message));
        }
    };

    const seleccionarCompra = (compra) => {
        // ****** MODIFICACIÓN CLAVE AQUÍ (Seleccionar Compra para Edición) ******
        setCompraEditando({
            ...compra,
            // Mapear de la respuesta del backend a los estados del frontend
            producto: compra.producto,
            cantidad: String(compra.cantidad), // 'cantidad' de BD
            unidad: compra.unidad,
            costo_unitario: String(compra.costo_unitario), // 'costo_unitario' de BD
            fecha: compra.fecha.split('T')[0], // 'fecha' de BD
            // 'proveedor' y 'factura' no se cargan para edición
        });
    };

    const actualizarCompra = async (e) => {
        e.preventDefault();
        // ****** MODIFICACIÓN CLAVE AQUÍ (Validación y Objeto a Enviar para Actualizar Compra) ******
        if (!compraEditando || !compraEditando.producto || !compraEditando.cantidad || !compraEditando.unidad || !compraEditando.costo_unitario || !compraEditando.fecha) {
            mostrarMensaje('error', '❌ Faltan campos obligatorios para actualizar la compra.');
            return;
        }

        try {
            const compraActualizar = {
                // Mapear nombres del frontend a lo que el backend espera de la BD 'compras'
                producto: compraEditando.producto,
                cantidad: parseFloat(compraEditando.cantidad),
                unidad: compraEditando.unidad,
                costo_unitario: parseFloat(compraEditando.costo_unitario),
                fecha: compraEditando.fecha,
                // 'proveedor' y 'factura' se eliminan aquí
            };
            await axios.put(`${API_URL}/compras/${compraActualizar.id}`, compraActualizar);
            mostrarMensaje('exito', '✅ Compra actualizada exitosamente.');
            setCompraEditando(null);
          
            obtenerMateriaPrima(); // Re-obtener materia prima para actualizar cantidad disponible (si el backend lo maneja)
        } catch (error) {
            console.error('❌ Error al actualizar compra:', error);
            mostrarMensaje('error', '❌ Error al actualizar la compra. ' + (error.response?.data?.error || error.message));
        }
    };

    const eliminarCompra = async (id) => {
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
                    await axios.delete(`${API_URL}/compras/${id}`);
                    mostrarMensaje('exito', '✅ Compra eliminada exitosamente.');
                    
                    obtenerMateriaPrima(); // Re-obtener materia prima para actualizar cantidad disponible (si el backend lo maneja)
                    Swal.fire(
                        '¡Eliminada!',
                        'La compra ha sido eliminada.',
                        'success'
                    );
                } catch (error) {
                    console.error('❌ Error al eliminar compra:', error);
                    mostrarMensaje('error', '❌ Error al eliminar la compra: ' + (error.response?.data?.error || error.message));
                    Swal.fire(
                        'Error',
                        'Error al eliminar la compra: ' + (error.response?.data?.error || error.message),
                        'error'
                    );
                }
            }
        });
    };
    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen font-sans">
            <h1 className="text-4xl font-bold text-pa-blue mb-8 text-center">
                MI DESPENSA - Inventario de Materia Prima
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
        {/* INICIA EL NUEVO CÓDIGO DE FILTROS AQUÍ */}
<div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">FILTRAR INVENTARIO</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label htmlFor="filtroNombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre del Ingrediente:</label>
                    <select
                    id="filtroNombre"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={filtroNombre} // Añadido: Controla el valor seleccionado
                    onChange={(e) => setFiltroNombre(e.target.value)} // Añadido: Actualiza el estado al cambiar
                >
                    <option value="">Todos los productos</option>
                    {ingredientesList.map((nombre) => (
                        <option key={nombre} value={nombre}>
                            {nombre}
                        </option>
                    ))}
                </select>
                </div>
                <div>
                    <label htmlFor="filtroFechaInicio" className="block text-gray-700 text-sm font-bold mb-2">Fecha Inicio:</label>
                    <input
                        type="date"
                        id="filtroFechaInicio"
                        name="filtroFechaInicio"
                        value={filtroFechaInicio}
                        onChange={(e) => setFiltroFechaInicio(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        // Aquí irán los estados y onChange para el filtro
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
                        // Aquí irán los estados y onChange para el filtro
                    />
                </div>
            </div>
            <div className="text-center">
                <button
                    // Aquí irá el onClick para la función de filtrado
                    className="bg-pa-orange hover:bg-pa-orange-dark text-white font-bold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                >
                    Filtrar Inventario
                </button>
                <button
                   onClick={limpiarFiltros}
                   className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105 ml-4"
                >
                    Limpiar Filtro
                </button>
            </div>
        </div>
            {mensajeError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
                    {mensajeError}
                </div>
            )}

            {/* Formulario para Registrar/Actualizar Materia Prima */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    {materiaPrimaEditando ? 'Actualizar Materia Prima' : 'Registrar Nueva Materia Prima'}
                </h2>
                <form onSubmit={materiaPrimaEditando ? actualizarMateriaPrima : registrarMateriaPrima} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Nombre */}
                    <div>
                        <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={materiaPrimaEditando ? materiaPrimaEditando.nombre : nuevaMateriaPrima.nombre}
                            onChange={(e) => materiaPrimaEditando ? setMateriaPrimaEditando({ ...materiaPrimaEditando, nombre: e.target.value }) : setNuevaMateriaPrima({ ...nuevaMateriaPrima, nombre: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Ej. Harina de Trigo"
                            required
                        />
                    </div>
                    {/* Cantidad Actual (mapea a 'cantidad' en BD) */}
                    <div>
                        <label htmlFor="cantidad" className="block text-gray-700 text-sm font-bold mb-2">Cantidad Actual:</label>
                        <input
                            type="number"
                            id="cantidad" // CAMBIO: Antes "cantidad_disponible"
                            name="cantidad" // CAMBIO: Antes "cantidad_disponible"
                            value={materiaPrimaEditando ? materiaPrimaEditando.cantidad : nuevaMateriaPrima.cantidad} // CAMBIO: Ahora usa .cantidad
                            onChange={(e) => materiaPrimaEditando ? setMateriaPrimaEditando({ ...materiaPrimaEditando, cantidad: e.target.value }) : setNuevaMateriaPrima({ ...nuevaMateriaPrima, cantidad: e.target.value })} // CAMBIO: Ahora usa .cantidad
                            step="0.01"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Ej. 1000"
                            required
                        />
                    </div>
                    {/* Unidad Estándar (mapea a 'unidad' en BD) */}
                    <div>
                        <label htmlFor="unidad" className="block text-gray-700 text-sm font-bold mb-2">Unidad Estándar:</label>
                        <input
                            type="text"
                            id="unidad" // CAMBIO: Antes "tipo_unidad"
                            name="unidad" // CAMBIO: Antes "tipo_unidad"
                            value={materiaPrimaEditando ? materiaPrimaEditando.unidad : nuevaMateriaPrima.unidad} // CAMBIO: Ahora usa .unidad
                            onChange={(e) => materiaPrimaEditando ? setMateriaPrimaEditando({ ...materiaPrimaEditando, unidad: e.target.value }) : setNuevaMateriaPrima({ ...nuevaMateriaPrima, unidad: e.target.value })} // CAMBIO: Ahora usa .unidad
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Ej. kg, litro, unidad"
                            required
                        />
                    </div>
                    {/* Costo Unitario Estándar (mapea a 'costo' en BD) */}
                    <div>
                        <label htmlFor="costo" className="block text-gray-700 text-sm font-bold mb-2">Costo Unitario Estándar ($):</label>
                        <input
                            type="number"
                            id="costo" // CAMBIO: Antes "costo_unitario"
                            name="costo" // CAMBIO: Antes "costo_unitario"
                            value={materiaPrimaEditando ? materiaPrimaEditando.costo : nuevaMateriaPrima.costo} // CAMBIO: Ahora usa .costo
                            onChange={(e) => materiaPrimaEditando ? setMateriaPrimaEditando({ ...materiaPrimaEditando, costo: e.target.value }) : setNuevaMateriaPrima({ ...nuevaMateriaPrima, costo: e.target.value })} // CAMBIO: Ahora usa .costo
                            step="0.01"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Ej. 0.01"
                            required
                        />
                    </div>
                    {/* Fecha de Ingreso (mapea a 'fecha_ingreso' en BD) */}
                    <div>
                        <label htmlFor="fecha_ingreso" className="block text-gray-700 text-sm font-bold mb-2">Fecha de Ingreso:</label>
                        <input
                            type="date"
                            id="fecha_ingreso"
                            name="fecha_ingreso"
                            value={materiaPrimaEditando ? materiaPrimaEditando.fecha_ingreso : nuevaMateriaPrima.fecha_ingreso}
                            onChange={(e) => materiaPrimaEditando ? setMateriaPrimaEditando({ ...materiaPrimaEditando, fecha_ingreso: e.target.value }) : setNuevaMateriaPrima({ ...nuevaMateriaPrima, fecha_ingreso: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    {/* Descripción (mapea a 'descripcion' en BD) */}
                    <div>
                        <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">Descripción (opcional):</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={materiaPrimaEditando ? materiaPrimaEditando.descripcion || '' : nuevaMateriaPrima.descripcion}
                            onChange={(e) => materiaPrimaEditando ? setMateriaPrimaEditando({ ...materiaPrimaEditando, descripcion: e.target.value }) : setNuevaMateriaPrima({ ...nuevaMateriaPrima, descripcion: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y"
                            placeholder="Breve descripción de la materia prima"
                            rows="2"
                        ></textarea>
                    </div>

                    {/* Botones de acción */}
                    <div className="md:col-span-3 text-right">
                        {materiaPrimaEditando ? (
                            <>
                                <button
                                    type="submit"
                                    className="bg-pa-blue hover:bg-pa-blue-dark text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105 mr-2"
                                >
                                    Actualizar Materia Prima
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMateriaPrimaEditando(null)}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                                >
                                    Cancelar Edición
                                </button>
                            </>
                        ) : (
                            <button
                                type="submit"
                                className="bg-pa-blue hover:bg-pa-blue-dark text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                            >
                                Registrar Materia Prima
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="hidden md:block">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Listado de Materia Prima</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                        <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <tr><th className="py-3 px-6 text-left">Nombre</th><th className="py-3 px-6 text-left">Unidad</th><th className="py-3 px-6 text-right">Costo Unitario</th><th className="py-3 px-6 text-right">Cantidad</th><th className="py-3 px-6 text-left">Fecha Ingreso</th><th className="py-3 px-6 text-left">Descripción</th><th className="py-3 px-6 text-center">Acciones</th></tr>
                        </thead>
                        <tbody  className="text-gray-600 text-sm font-light">
                            {materiaPrima.length > 0 ? (
                            materiaPrima.map((mp) => (
                            <tr key={mp.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{mp.nombre}</td>
                                <td className="py-3 px-6 text-left">{mp.unidad}</td>
                                <td className="py-3 px-6 text-right">${parseFloat(mp.costo).toFixed(2)}</td>
                                <td className="py-3 px-6 text-right">{parseFloat(mp.cantidad).toFixed(2)}</td>
                                <td className="py-3 px-6 text-left">{mp.fecha_ingreso ? new Date(mp.fecha_ingreso).toLocaleDateString() : 'N/A'}</td>
                                <td className="py-3 px-6 text-left">{mp.descripcion || 'N/A'}</td>
                                <td className="py-3 px-6 text-center whitespace-nowrap">
                                    <button 
                                    onClick={() => seleccionarMateriaPrima(mp)} 
                                    className="bg-pa-orange hover:bg-pa-orange-dark text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out mr-2">
                                        Editar
                                        </button>
                                        <button 
                                        onClick={() => eliminarMateriaPrima(mp.id)} 
                                        className="bg-feedback-error hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out"
                                        >
                                            Eliminar
                                            </button>
                                            </td>
                                            </tr>
                                            ))
                                        ): (
                                            <tr>
                                                <td colSpan="7" className="py-4 text-center text-gray-500">
                                                    No hay materia prima registrada.
                                                    </td>
                                                    </tr>
                                                    )}
                                                    </tbody>
                    </table>
                </div>
            </div>
           </div> {/* Cierre del div hidden md:block */}  
           <div className="md:hidden mt-4">
            {materiaPrima.length > 0 ? (
    <div className="space-y-4"> {/* Contenedor para espaciar las tarjetas */}
        {materiaPrima.map(mp => (
            <div key={mp.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">ID: {mp.id}</span>
                    <span className="text-xs text-gray-500">{mp.fecha_ingreso ? new Date(mp.fecha_ingreso).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="border-t border-gray-100 pt-2">
                    <p className="text-md font-bold text-gray-800">Nombre: {mp.nombre}</p>
                    <p className="text-sm text-gray-600">Unidad: {mp.unidad}</p>
                    <p className="text-lg font-bold text-gray-800 mt-1">Costo Unitario: ${parseFloat(mp.costo).toFixed(2)}</p>
                    <p className="text-md font-semibold text-gray-700">Cantidad: {parseFloat(mp.cantidad).toFixed(2)}</p>
                    {mp.descripcion && <p className="text-xs text-gray-500 mt-1">Descripción: {mp.descripcion}</p>}
                </div>
                <div className="flex justify-end mt-3">
                    <button
                        onClick={() => seleccionarMateriaPrima(mp)}
                        className="bg-pa-orange hover:bg-pa-orange-dark text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out mr-2"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => eliminarMateriaPrima(mp.id)}
                        className="bg-feedback-error hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ))}
    </div>
) : (
    <p className="text-center text-gray-500 mt-8">No hay materia prima registrada para mostrar en móvil.</p>
)}
    {/* Aquí es donde irá el código para las tarjetas de materia prima */}
</div>               
            {/* Sección de Compras */}

        </div>
    );
};

export default MateriaPrimaInventario;
