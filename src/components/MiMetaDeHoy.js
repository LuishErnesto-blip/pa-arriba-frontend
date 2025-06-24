import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
// Importación de Recharts para los gráficos de barra
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

// Importar html2pdf.js desde CDN. Asegúrate de que esta etiqueta script
// esté en tu public/index.html justo antes del cierre de </body>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>

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

const MiMetaDeHoy = () => {
    const [metas, setMetas] = useState([]);
    const [nuevaMeta, setNuevaMeta] = useState({
        fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        meta_venta_diaria: '',
    });
    const [metaEditando, setMetaEditando] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [ventasHoy, setVentasHoy] = useState(0);
    const [gananciaNetaHoy, setGananciaNetaHoy] = useState(0);
    const [costosIngredientesHoy, setCostosIngredientesHoy] = useState(0);
    const [pagosOperativosHoy, setPagosOperativosHoy] = useState(0);
    const [costoTotalOperativoDia, setCostoTotalOperativoDia] = useState(0);
    const [proyeccionVentasMeta, setProyeccionVentasMeta] = useState(0);
    const [gananciaNetaEsperada, setGananciaNetaEsperada] = useState(0);
const [filtroFechaInicio, setFiltroFechaInicio] = useState(new Date().toISOString().split('T')[0]);
const [filtroFechaFin, setFiltroFechaFin] = useState(new Date().toISOString().split('T')[0]);
const API_URL = 'https://pa-arriba-backend-api.onrender.com'; // URL de tu backend desplegado en Render.com
const mostrarMensaje = useCallback((tipo, mensaje) => {
    if (tipo === 'exito') {
        setMensajeExito(mensaje);
        setTimeout(() => setMensajeExito(''), 3000);
    } else {
        setMensajeError(mensaje);
        setTimeout(() => setMensajeError(''), 5000);
    }
}, []);
    const obtenerMetas = useCallback(async (fechaInicio, fechaFin) => {
        try {
            let url = `${API_URL}/metas-diarias`;
            const params = new URLSearchParams();
            if (fechaInicio) params.append('fechaInicio', fechaInicio);
            if (fechaFin) params.append('fechaFin', fechaFin);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await axios.get(url);
            setMetas(response.data);
        } catch (error) {
            console.error('❌ Error al obtener metas diarias:', error);
            mostrarMensaje('error', '❌ Error al cargar las metas diarias. ' + (error.response?.data?.error || error.message));
        }
    }, [API_URL, mostrarMensaje]);
// NUEVA FUNCIÓN PRINCIPAL: Cargar resultados financieros para un rango de fechas
// Esta función encapsula toda la lógica de carga y cálculo de resultados
const cargarResultadosDiarios = useCallback(async (fechaInicio, fechaFin) => {
    try {
        const fechaParaBackend = fechaInicio || new Date().toISOString().split('T')[0];
        let urlResultados = `${API_URL}/resultados-del-dia?fecha=${fechaParaBackend}`;
        console.log('Fetching consolidated results from:', urlResultados);
        const responseResultados = await axios.get(urlResultados);
        const { totalVentas, gastosIngredientes, totalPagosOperativos, costoTotalOperativoDelDia, gananciaNeta } = responseResultados.data;
        setVentasHoy(totalVentas);
        setCostosIngredientesHoy(gastosIngredientes); // Esto ya viene calculado del backend
        setPagosOperativosHoy(totalPagosOperativos); // Esto ya viene calculado del backend
        setCostoTotalOperativoDia(costoTotalOperativoDelDia); // Esto ya viene calculado del backend
        setGananciaNetaHoy(gananciaNeta); // Esto ya viene calculado del backend
// Calcular Proyección a Vender (Punto de Equilibrio con utilidad deseada)
const margenUtilidadDeseado = 0.33; // 33% de utilidad esperada
const proyeccion = costoTotalOperativoDelDia / (1 - margenUtilidadDeseado);
setProyeccionVentasMeta(proyeccion); // Actualiza el estado proyeccionVentasMeta
// Calcular Ganancia Neta Esperada basada en la proyección
const gananciaEsperadaCalculada = proyeccion * margenUtilidadDeseado;
setGananciaNetaEsperada(gananciaEsperadaCalculada); // Actualiza el estado gananciaNetaEsperada
        mostrarMensaje('exito', '✅ Resultados consolidados cargados exitosamente.');
    } catch (error) {
        console.error('❌ Error al cargar resultados financieros (MiMetaDeHoy.js):', error);
        mostrarMensaje('error', '❌ Error al cargar los resultados consolidados. ' + (error.response?.data?.error || error.message));
    }
}, [API_URL, mostrarMensaje, costoTotalOperativoDia]); // Agrega proyeccionVentasMeta a las dependencias si no está.
const registrarMeta = async (e) => {       
try {
            const metaEnviar = {
                ...nuevaMeta,
                meta_venta_diaria: parseFloat(nuevaMeta.meta_venta_diaria)
            };
            await axios.post(`${API_URL}/metas-diarias`, metaEnviar);
            mostrarMensaje('exito', '✅ Meta diaria registrada exitosamente.');
            setNuevaMeta({
                fecha: new Date().toISOString().split('T')[0],
                meta_venta_diaria: ''
            });
            // Recargar metas y resultados con los filtros actuales
            obtenerMetas(filtroFechaInicio, filtroFechaFin);
            cargarResultadosDiarios(filtroFechaInicio, filtroFechaFin);
        } catch (error) {
            console.error('❌ Error al registrar meta:', error);
            mostrarMensaje('error', '❌ Error al registrar la meta diaria. ' + (error.response?.data?.error || error.message));
        }
    };
    // Función para seleccionar una meta para edición
    const seleccionarMeta = (meta) => {
        setMetaEditando({
            ...meta,
            fecha: meta.fecha.split('T')[0], // Formato para input type="date"
            meta_venta_diaria: String(meta.meta_venta_diaria) // Para input type="number"
        });
    };
    // Función para actualizar una meta diaria
    const actualizarMeta = async (e) => {
        e.preventDefault();
        if (!metaEditando || !metaEditando.fecha || !metaEditando.meta_venta_diaria) {
            mostrarMensaje('error', '❌ La fecha y la meta de venta son obligatorias para actualizar.');
            return;
        }

        try {
            const metaActualizar = {
                ...metaEditando,
                meta_venta_diaria: parseFloat(metaEditando.meta_venta_diaria)
            };
            await axios.put(`${API_URL}/metas-diarias/${metaActualizar.id}`, metaActualizar);
            mostrarMensaje('exito', '✅ Meta diaria actualizada exitosamente.');
            setMetaEditando(null);
            // Recargar metas y resultados con los filtros actuales
            obtenerMetas(filtroFechaInicio, filtroFechaFin);
            cargarResultadosDiarios(filtroFechaInicio, filtroFechaFin);
        } catch (error) {
            console.error('❌ Error al actualizar meta:', error);
            mostrarMensaje('error', '❌ Error al actualizar la meta diaria. ' + (error.response?.data?.error || error.message));
        }
    };

    // Función para eliminar una meta diaria
    const eliminarMeta = async (id) => {
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
                    await axios.delete(`${API_URL}/metas-diarias/${id}`);
                    mostrarMensaje('exito', '✅ Meta diaria eliminada exitosamente.');
                    // Recargar metas y resultados con los filtros actuales
                    obtenerMetas(filtroFechaInicio, filtroFechaFin);
                    cargarResultadosDiarios(filtroFechaInicio, filtroFechaFin);
                    Swal.fire(
                        '¡Eliminada!',
                        'La meta ha sido eliminada.',
                        'success'
                    );
                } catch (error) {
                    console.error('❌ Error al eliminar meta:', error);
                    mostrarMensaje('error', '❌ Error al eliminar la meta diaria. ' + (error.response?.data?.error || error.message));
                    Swal.fire(
                        'Error',
                        'Error al eliminar la meta: ' + (error.response?.data?.error || error.message),
                        'error'
                    );
                }
            }
        });
    };

    // Lógica para generar PDF
    const exportarResultadosAPDF = () => {
        // Asegúrate de que html2pdf.js esté cargado en tu index.html
        if (typeof window.html2pdf !== 'undefined') {
            const element = document.getElementById('report-section'); // El ID del div que contiene los resultados a exportar
            const opt = {
                margin: 0.5,
                filename: `Reporte_Meta_Resultados_${filtroFechaInicio || 'Todo'}_${filtroFechaFin || 'Todo'}.pdf`, // Nombre dinámico
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true, useCORS: true }, // Añadir useCORS
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                // NUEVA OPCIÓN: Evitar cortes dentro de elementos específicos
                pagebreak: {
                    mode: ['avoid-all', 'css', 'legacy'], // Intenta evitar cortes agresivamente
                    before: ['.html2pdf__page-break'], // Si hay un elemento con esta clase, forzar un salto de página antes
                    after: ['.after-page-break'] // Si hay un elemento con esta clase, forzar un salto de página después
                }
            };
            window.html2pdf().set(opt).from(element).save();
            mostrarMensaje('exito', '✅ Reporte PDF generado exitosamente.');
        } else {
            mostrarMensaje('error', '❌ Error: html2pdf.js no está cargado. Asegúrate de incluirlo en tu index.html.');
            console.error('html2pdf.js no encontrado. Asegúrate de que la librería esté cargada.');
        }
    };


    // Datos para los gráficos de Recharts
    // Calcular el valor máximo para el dominio del eje Y dinámicamente
    // Añadimos un pequeño factor para que la barra más alta no toque el tope del gráfico
    const maxVentasValue = Math.max(proyeccionVentasMeta, ventasHoy, 0) * 1.15; // Mínimo 0 para evitar errores, factor de 1.15
    const maxGananciaValue = Math.max(gananciaNetaEsperada, gananciaNetaHoy, 0) * 1.15; // Mínimo 0, factor de 1.15

    const chartDataVentas = [
        {
            name: 'Meta de Ventas',
            'Valor ($)': parseFloat(proyeccionVentasMeta).toFixed(2)
        },
        {
            name: 'Ventas Reales',
            'Valor ($)': parseFloat(ventasHoy).toFixed(2)
        }
    ];

    const chartDataGanancia = [
        {
            name: 'Ganancia Esperada',
            'Valor ($)': parseFloat(gananciaNetaEsperada).toFixed(2)
        },
        {
            name: 'Ganancia Real',
            'Valor ($)': parseFloat(gananciaNetaHoy).toFixed(2)
        }
    ];

    // Calcula el progreso de ventas y el desempeño de ganancia
    const progresoVentas = proyeccionVentasMeta > 0 ? ((ventasHoy / proyeccionVentasMeta) * 100).toFixed(2) : (ventasHoy > 0 ? 100 : 0);
    const desempenoGanancia = gananciaNetaEsperada > 0 ? ((gananciaNetaHoy / gananciaNetaEsperada) * 100).toFixed(2) : (gananciaNetaHoy > 0 ? 100 : 0);

    // JSX del componente
    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen font-sans">
            <h1 className="text-4xl font-bold text-pa-blue mb-8 text-center">
                Mi Meta y Resultados del Día/Periodo
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

            {/* Bloque de Filtros de Fecha para Mi Meta y Resultados */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ver Resultados por Fecha</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="filtroFechaInicioMeta" className="block text-gray-700 text-sm font-bold mb-2">Fecha Inicio:</label>
                        <input
                            type="date"
                            id="filtroFechaInicioMeta"
                            name="filtroFechaInicio"
                            value={filtroFechaInicio}
                            onChange={(e) => setFiltroFechaInicio(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div>
                        <label htmlFor="filtroFechaFinMeta" className="block text-gray-700 text-sm font-bold mb-2">Fecha Fin:</label>
                        <input
                            type="date"
                            id="filtroFechaFinMeta"
                            name="filtroFechaFin"
                            value={filtroFechaFin}
                            onChange={(e) => setFiltroFechaFin(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex justify-end md:justify-start">
                        <button
                            onClick={() => {
                                // Al limpiar, se inicializan con la fecha actual de nuevo
                                const today = new Date().toISOString().split('T')[0];
                                setFiltroFechaInicio(today);
                                setFiltroFechaFin(today);
                                // useEffect se encargará de recargar los datos
                            }}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105 mr-2"
                        >
                            Limpiar Filtros
                        </button>
                         <button
                            onClick={() => {
                                // Forzar la recarga al aplicar filtro si es necesario, aunque useEffect ya lo hace
                                cargarResultadosDiarios(filtroFechaInicio, filtroFechaFin);
                                obtenerMetas(filtroFechaInicio, filtroFechaFin);
                            }}
                            className="bg-pa-blue hover:bg-pa-blue-dark text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                        >
                            Aplicar Filtro
                        </button>
                    </div>
                </div>
            </div>


            {/* Contenido principal de los resultados, con ID para exportación PDF */}
            <div id="report-section"> {/* ID para la exportación a PDF */}
                {/* Mi Meta de Hoy al Iniciar el Día */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8 no-break-inside"> {/* Añadida clase para PDF */}
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Resumen del Día/Periodo</h2> {/* Título ajustado */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
<div className="bg-blue-100 p-4 rounded-lg shadow-inner text-center">
    <p className="text-gray-600">Ventas del Día:</p>
    <p className="text-3xl font-bold text-blue-800">${parseFloat(ventasHoy).toFixed(2)}</p>
</div>                        <div className="bg-yellow-100 p-4 rounded-lg shadow-inner text-center">
                            <p className="text-gray-600">Gastos de Ingredientes:</p>
<p className="text-3xl font-bold text-yellow-800">${parseFloat(costosIngredientesHoy).toFixed(2)}</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg shadow-inner text-center">
                            <p className="text-gray-600">Pagos Operativos del Día:</p>
                            <p className="text-3xl font-bold text-green-800">${parseFloat(pagosOperativosHoy).toFixed(2)}</p>
                        </div>
                        <div className="bg-purple-100 p-4 rounded-lg shadow-inner text-center">
                            <p className="text-gray-600">Costo Total Operativo del Día:</p>
                            <p className="text-3xl font-bold text-purple-800">${parseFloat(costoTotalOperativoDia).toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="text-center mb-6">
                        <p className="text-gray-600 text-lg">Proyección a Vender (Meta Automática):</p>
                        <p className="text-5xl font-extrabold text-pa-blue">${parseFloat(proyeccionVentasMeta).toFixed(2)}</p>
                        <p className="text-gray-500 mt-2">Para cubrir costos operativos y obtener una utilidad estimada del 33%</p>
                        <p className="text-xl font-semibold text-green-700 mt-1">Ganancia Neta Esperada: ${parseFloat(gananciaNetaEsperada).toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Registrar/Actualizar Meta Diaria (Manual)</h3>
                        <form onSubmit={registrarMeta} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div>
                                <label htmlFor="meta_fecha" className="block text-gray-700 text-sm font-bold mb-2">Fecha:</label>
                                <input
                                    type="date"
                                    id="meta_fecha"
                                    name="fecha"
                                    value={nuevaMeta.fecha}
                                    onChange={(e) => setNuevaMeta({ ...nuevaMeta, fecha: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="meta_venta_diaria" className="block text-gray-700 text-sm font-bold mb-2">Meta de Venta Diaria ($):</label>
                                <input
                                    type="number"
                                    id="meta_venta_diaria"
                                    name="meta_venta_diaria"
                                    value={nuevaMeta.meta_venta_diaria}
                                    onChange={(e) => setNuevaMeta({ ...nuevaMeta, meta_venta_diaria: e.target.value })}
                                    step="0.01"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 text-right">
                                <button
                                    type="submit"
                                    className="bg-pa-blue hover:bg-pa-blue-dark text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                                >
                                    Registrar Meta
                                </button>
                            </div>
                        </form>

                        {/* Formulario de Edición de Meta Diaria */}
                        {metaEditando && (
                            <form onSubmit={actualizarMeta} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mt-4">
                                <div>
                                    <label htmlFor="edit_meta_fecha" className="block text-gray-700 text-sm font-bold mb-2">Fecha:</label>
                                    <input
                                        type="date"
                                        id="edit_meta_fecha"
                                        name="fecha"
                                        value={metaEditando.fecha}
                                        onChange={(e) => setMetaEditando({ ...metaEditando, fecha: e.target.value })}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit_meta_venta_diaria" className="block text-gray-700 text-sm font-bold mb-2">Meta de Venta Diaria ($):</label>
                                    <input
                                        type="number"
                                        id="edit_meta_venta_diaria"
                                        name="meta_venta_diaria"
                                        value={metaEditando.meta_venta_diaria}
                                        onChange={(e) => setMetaEditando({ ...metaEditando, meta_venta_diaria: e.target.value })}
                                        step="0.01"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 text-right">
                                    <button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105 mr-2"
                                    >
                                        Actualizar Meta
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMetaEditando(null)}
                                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                                    >
                                        Cancelar Edición
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tabla de Registro de Metas Diarias (Manuales) */}
                        <div className="mt-8 overflow-x-auto no-break-inside"> {/* Añadida clase para PDF */}
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Registro de Metas Diarias (Manuales)</h3>
                            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                                <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                    <tr>
                                        <th className="py-3 px-6 text-left">Fecha</th>
                                        <th className="py-3 px-6 text-right">Meta Venta Diaria</th>
                                        <th className="py-3 px-6 text-right">Progreso (%)</th>
                                        <th className="py-3 px-6 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 text-sm font-light">
                                    {metas.length > 0 ? (
                                        metas.map(meta => (
                                            <tr key={meta.id} className="border-b border-gray-200 hover:bg-gray-100">
                                                <td className="py-3 px-6 text-left">{new Date(meta.fecha).toLocaleDateString()}</td>
                                                <td className="py-3 px-6 text-right">${parseFloat(meta.meta_venta_diaria).toFixed(2)}</td>
                                                {/* Mostrar progreso_calculado que viene del backend */}
                                                <td className="py-3 px-6 text-right">
                                                    {meta.progreso_calculado !== undefined && meta.progreso_calculado !== null
                                                        ? `${parseFloat(meta.progreso_calculado).toFixed(2)}%`
                                                        : 'N/A'}
                                                </td>
                                                <td className="py-3 px-6 text-center">
                                                    <button
                                                        onClick={() => seleccionarMeta(meta)}
                                                        className="bg-pa-orange hover:bg-pa-orange-dark text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out mr-2"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarMeta(meta.id)}
                                                        className="bg-feedback-error hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-4 text-center text-gray-500">No hay metas diarias registradas.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Mis Resultados al Finalizar el Día */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8 no-break-inside"> {/* Añadida clase para PDF */}
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Mis Resultados al Finalizar el Día</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Gráfico de Comparación de Ventas Diarias */}
                        <div className="no-break-inside"> {/* Añadida clase para PDF */}
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Comparación de Ventas Diarias</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartDataVentas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    barCategoryGap="20%"> {/* Ajuste de espacio entre barras */}
                                    <CartesianGrid strokeDasharray="3 3" />
                                    {/* Ajuste dinámico del dominio del eje Y */}
                                    <XAxis dataKey="name">
                                        <Label value="Categoría" offset={-5} position="insideBottom" />
                                    </XAxis>
                                    <YAxis domain={[0, maxVentasValue]}> {/* Ajusta el dominio para que sea un poco más grande que el máximo valor */}
                                        {/* Formato de tick para evitar muchos ceros */}
                                        <Label value="Valor ($)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} /> {/* Alineación vertical */}
                                    </YAxis>
                                    <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
                                    <Legend />
                                    {/* COLORES DIFERENTES PARA BARRAS: Meta de Ventas (gris) y Ventas Reales (azul) */}
                                    <Bar dataKey="Valor ($)"
                                         // Custom fill function for different colors based on data name
                                         fill={(data) => {
                                            if (data.name === 'Meta de Ventas') return '#B0BEC5'; // Un gris más claro para la meta (material-grey-300)
                                            if (data.name === 'Ventas Reales') return PAARRIBA_COLORS.azulElectrico; // Tu azul para lo real
                                            return PAARRIBA_COLORS.azulElectrico; // Default
                                         }}
                                         radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="text-center mt-4">
                                <p className="text-lg text-gray-700">Meta de Ventas: <span className="font-bold">${parseFloat(proyeccionVentasMeta).toFixed(2)}</span></p>
                                <p className="text-lg text-gray-700">Ventas Reales: <span className="font-bold">${parseFloat(ventasHoy).toFixed(2)}</span></p>
                                <p className={`text-xl font-bold ${progresoVentas >= 100 ? 'text-green-600' : 'text-red-600'}`}>Progreso: {progresoVentas}%</p>
                            </div>
                        </div>

                        {/* Gráfico de Comparación de Ganancia Neta */}
                        <div className="no-break-inside"> {/* Añadida clase para PDF */}
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Comparación de Ganancia Neta</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartDataGanancia} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    barCategoryGap="20%"> {/* Ajuste de espacio entre barras */}
                                    <CartesianGrid strokeDasharray="3 3" />
                                    {/* Ajuste dinámico del dominio del eje Y */}
                                    <XAxis dataKey="name">
                                        <Label value="Categoría" offset={-5} position="insideBottom" />
                                    </XAxis>
                                    <YAxis domain={[0, maxGananciaValue]}> {/* Ajusta el dominio para que sea un poco más grande que el máximo valor */}
                                        {/* Formato de tick para evitar muchos ceros */}
                                        <Label value="Valor ($)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} /> {/* Alineación vertical */}
                                    </YAxis>
                                    <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
                                    <Legend />
                                    {/* COLORES DIFERENTES PARA BARRAS: Ganancia Esperada (naranja) y Ganancia Real (verde) */}
                                    <Bar dataKey="Valor ($)"
                                         fill={(data) => {
                                            if (data.name === 'Ganancia Esperada') return PAARRIBA_COLORS.naranjaVibrante; // Naranja para la esperada
                                            if (data.name === 'Ganancia Real') return PAARRIBA_COLORS.verdeDinamico; // Tu verde para la real
                                            return PAARRIBA_COLORS.verdeDinamico; // Default
                                         }}
                                         radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="text-center mt-4">
                                <p className="text-lg text-gray-700">Ganancia Esperada: <span className="font-bold">${parseFloat(gananciaNetaEsperada).toFixed(2)}</span></p>
                                <p className="text-lg text-gray-700">Ganancia Real: <span className="font-bold">${parseFloat(gananciaNetaHoy).toFixed(2)}</span></p>
                                <p className={`text-xl font-bold ${desempenoGanancia >= 100 ? 'text-green-600' : 'text-red-600'}`}>Desempeño: {desempenoGanancia}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div> {/* Cierre del div report-section */}

            {/* Sección de Exportar a PDF */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8 text-center no-break-inside"> {/* Añadida clase para PDF */}
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Exportar Reporte</h2>
                <button
                    onClick={() => {
                        console.log('Generando reporte PDF...');
                        mostrarMensaje('exito', 'Preparando el reporte PDF. Por favor, espera...');
                        exportarResultadosAPDF();
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                >
                    Exportar a PDF
                </button>
            </div>

        </div>
    );
};

export default MiMetaDeHoy;
