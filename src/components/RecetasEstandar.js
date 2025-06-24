import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Colores de la identidad visual de Pa' Arriba (Asegúrate de que estos estén definidos en tu archivo de estilos global si los usas en el CSS externo, o en un objeto de configuración para Tailwind si no están en la configuración por defecto)
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

// Estados principales para la gestión de recetas y sus ingredientes
const RecetasEstandar = () => {
        const [recetas, setRecetas] = useState([]); // Lista de todas las recetas estándar
const [nuevaReceta, setNuevaReceta] = useState({ // Estado para el formulario de nueva receta
    nombre: '',
    foto_url: '',
    descripcion: '',
    precio_venta: 0, // Cambiar de '' a 0
    es_producto_final: false,
    costo_total_calculado: 0, // Cambiar de '' a 0
});

    const [editandoReceta, setEditandoReceta] = useState(null); // Receta actualmente en edición
    const [ingredientesReceta, setIngredientesReceta] = useState([]); // Ingredientes de la receta en edición
    const [nuevoIngrediente, setNuevoIngrediente] = useState({ // Estado para el formulario de nuevo ingrediente
        receta_id: null,
        tipo_componente: 'ingrediente_base',
        nombre_componente: '',
        materia_prima_id: '', // ID de materia prima seleccionada
        subreceta_referencia_id: '', // ID de sub-receta seleccionada
        cantidad: 0, // Cambiar de '' a 0
        unidad: '',
        costo_unitario: 0, // Cambiar de '' a 0
    });
    const [selectedMateriaPrimaObj, setSelectedMateriaPrimaObj] = useState(null); // <-- Inserta esta línea aquí
    const [editandoIngrediente, setEditandoIngrediente] = useState(null); // Ingrediente actualmente en edición
    const [materiaPrimaInventario, setMateriaPrimaInventario] = useState([]); // Inventario de materia prima
    const [subRecetasDisponibles, setSubRecetasDisponibles] = useState([]); // Sub-recetas que pueden ser ingredientes
    const [mensajeExito, setMensajeExito] = useState(null); // Mensaje de éxito para el usuario
    const [mensajeError, setMensajeError] = useState(null); // Mensaje de error para el usuario

    // URL de la API de tu backend
const API_URL = 'https://pa-arriba-backend-api.onrender.com'; // URL de tu backend desplegado
    // useCallback para manejar mensajes de éxito y error
    const mostrarMensaje = useCallback((tipo, mensaje) => {
        if (tipo === 'exito') {
            setMensajeExito(mensaje);
            setTimeout(() => setMensajeExito(null), 3000);
        } else {
            setMensajeError(mensaje);
            setTimeout(() => setMensajeError(null), 5000);
        }
    }, []);

    // 1. Obtener todas las recetas estándar
    const obtenerRecetasEstandar = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/recetas-estandar`);
            setRecetas(response.data);
            console.log('✅ Datos de recetas obtenidos y actualizados:', response.data); // AÑADIR ESTA LÍNEA
            mostrarMensaje('exito', '✅ Recetas cargadas exitosamente.');
        } catch (error) {
            console.error('❌ Error al obtener recetas estándar:', error);
            mostrarMensaje('error', '❌ Error al cargar las recetas. ' + (error.response?.data?.error || error.message));
        }
    }, [API_URL, mostrarMensaje]);

    // 2. Obtener ingredientes de una receta específica
    const obtenerIngredientesReceta = useCallback(async (recetaId) => {
        try {
            // CORRECCIÓN: Ajustar la URL para que coincida con la ruta del backend
            const response = await axios.get(`${API_URL}/recetas-estandar/${recetaId}/ingredientes`);
            setIngredientesReceta(response.data);
            console.log('DEBUG FRONTEND: [obtenerIngredientesReceta] Ingredientes de receta obtenidos:', response.data);
        } catch (error) {
            console.error('❌ Error al obtener ingredientes de receta:', error);
            mostrarMensaje('error', '❌ Error al cargar los ingredientes de la receta. ' + (error.response?.data?.error || error.message));
        }
    }, [API_URL, mostrarMensaje]);

    // 3. Obtener el inventario de materia prima
    const obtenerMateriaPrimaInventario = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/materia-prima`);
            setMateriaPrimaInventario(response.data);
        } catch (error) {
            console.error('❌ Error al obtener inventario de materia prima:', error);
            mostrarMensaje('error', '❌ Error al cargar el inventario de materia prima. ' + (error.response?.data?.error || error.message));
        }
    }, [API_URL, mostrarMensaje]);
        // ... (cierre de obtenerMateriaPrimaInventario, línea 95)

        // INSERTA ESTE NUEVO BLOQUE DE CODIGO AQUI (ej. a partir de la línea 96 o 97)
       // cuando cambia la materia prima seleccionada.
         useEffect(() => {
        if (nuevoIngrediente.tipo_componente === 'ingrediente_base' && nuevoIngrediente.materia_prima_id) {
        const selectedMp = materiaPrimaInventario.find(mp => String(mp.id) === String(nuevoIngrediente.materia_prima_id));
        if (selectedMp && selectedMp.unidad) {
            setNuevoIngrediente(prev => ({
                ...prev, // Mantén todas las propiedades previas del estado
                unidad: selectedMp.unidad, // Sincroniza la unidad
                nombre_componente: selectedMp.nombre, // Sincroniza el nombre
                costo_unitario: parseFloat(selectedMp.costo || 0).toFixed(4) // Sincroniza el costo
            }));
        console.log('DEBUG FRONTEND: [useEffect selectedMp] selectedMp.costo:', selectedMp.costo);
        console.log('DEBUG FRONTEND: [useEffect selectedMp] typeof selectedMp.costo:', typeof selectedMp.costo);
        console.log('DEBUG FRONTEND: [useEffect selectedMp] parseFloat(selectedMp.costo || 0):', parseFloat(selectedMp.costo || 0));
        console.log('DEBUG FRONTEND: [useEffect selectedMp] nuevoIngrediente.costo_unitario (después de set):', parseFloat(selectedMp.costo || 0).toFixed(4));
        
        } else {
            // Si no se selecciona una materia prima válida (o si se deselecciona),
            // limpiamos los campos relevantes para evitar datos inconsistentes.
            setNuevoIngrediente(prev => ({
                ...prev,
                nombre_componente: '',
                unidad: '',
                costo_unitario: ''
            }));
        }
    }
}, [nuevoIngrediente.materia_prima_id, nuevoIngrediente.tipo_componente, materiaPrimaInventario, setNuevoIngrediente]); 
// Dependencias: El efecto se ejecuta cuando cambia el ID de la MP, el tipo de componente,
// la lista de MP (si se recarga), o la función setNuevoIngrediente.

// ... (El siguiente useEffect o código en tu archivo, aprox. desde la línea 109)

    // 4. Obtener sub-recetas (recetas que no son productos finales para usar como ingredientes)
    const obtenerSubRecetasDisponibles = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/recetas-estandar?es_producto_final=false`);
            setSubRecetasDisponibles(response.data);
        } catch (error) {
            console.error('❌ Error al obtener sub-recetas disponibles:', error);
            mostrarMensaje('error', '❌ Error al cargar sub-recetas. ' + (error.response?.data?.error || error.message));
        }
    }, [API_URL, mostrarMensaje]);

    // Efecto para cargar datos iniciales
    useEffect(() => {
        obtenerRecetasEstandar();
        obtenerMateriaPrimaInventario();
        obtenerSubRecetasDisponibles();
    }, [obtenerRecetasEstandar, obtenerMateriaPrimaInventario, obtenerSubRecetasDisponibles]);
    console.log('DEBUG: Estado de recetas:', recetas); // <-- AÑADE ESTA LÍNEA AQUÍ
    // Manejar cambios en el formulario de nueva receta
    const handleNuevaRecetaChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNuevaReceta(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Manejar cambios en el formulario de edición de receta
    const handleEditandoRecetaChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditandoReceta(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

       // Manejar cambios en el formulario de nuevo ingrediente
    const handleNuevoIngredienteChange = (e) => {
        const { name, value } = e.target;
        setNuevoIngrediente(prev => {
            const newState = { ...prev, [name]: value };
            // Lógica para autocompletar nombre_componente, unidad y costo_unitario si se selecciona materia_prima_id
                       if (name === 'materia_prima_id' && newState.tipo_componente === 'ingrediente_base') { // Línea 181
                const selectedMp = materiaPrimaInventario.find(mp => String(mp.id) === String(value)); // Línea 182
                if (selectedMp) { // Línea 183
                    newState.nombre_componente = selectedMp.nombre; // Línea 184
                    newState.unidad = selectedMp.unidad; // Línea 185
                    newState.costo_unitario = parseFloat(selectedMp.costo || 0); // Línea 186 (almacenar como número)
                    setSelectedMateriaPrimaObj(selectedMp); // Línea 187
                } else { // Si no se encuentra una materia prima válida
                    newState.nombre_componente = ''; // Línea 189
                    newState.unidad = ''; // Línea 190
                    newState.costo_unitario = 0; // Línea 191
                    setSelectedMateriaPrimaObj(null); // Línea 192
                }
            } else if (name === 'tipo_componente') { // Línea 194
                // Limpiar campos relacionados al cambiar tipo de componente
                newState.nombre_componente = ''; // Línea 195
                newState.materia_prima_id = ''; // Línea 196
                newState.subreceta_referencia_id = ''; // Línea 197
                newState.cantidad = ''; // Línea 198
                newState.unidad = ''; // Línea 199
                newState.costo_unitario = 0; // Línea 200
                setSelectedMateriaPrimaObj(null); // Línea 201 (limpiar también selectedMateriaPrimaObj)
            } else if (name === 'subreceta_referencia_id' && newState.tipo_componente === 'sub_receta') { // Línea 202
                const selectedSub = subRecetasDisponibles.find(sr => String(sr.id) === String(value)); // Línea 203
                if (selectedSub) { // Línea 204
                    newState.nombre_componente = selectedSub.nombre_platillo; // Línea 205
                    newState.unidad = 'unidad(es)'; // Puedes poner una unidad por defecto para sub-recetas // Línea 208
                    newState.costo_unitario = parseFloat(selectedSub.costo_total_calculado || 0); // Línea 209 (almacenar como número)
                } else { // Línea 210
                    newState.nombre_componente = ''; // Línea 211
                    newState.unidad = ''; // Línea 212
                    newState.costo_unitario = ''; // Línea 213
                }
            }
            // Asegurarse de que el parseo de cantidad se haga solo si el campo es 'cantidad'
            if (name === 'cantidad') { // Línea 218
                newState.cantidad = parseFloat(value);
            }
            return newState;
        });
    };

    // Manejar cambios en el formulario de edición de ingrediente
    const handleEditandoIngredienteChange = (e) => {
        const { name, value } = e.target;
        setEditandoIngrediente(prev => {
            const newState = { ...prev, [name]: value };

            // Lógica para autocompletar nombre_componente y costo_unitario si se selecciona materia_prima_id
            if (name === 'materia_prima_id' && newState.tipo_componente === 'ingrediente_base') {
                const selectedMp = materiaPrimaInventario.find(mp => String(mp.id) === String(value));
                if (selectedMp) {
                    newState.nombre_componente = selectedMp.nombre;
                } else {
                    newState.nombre_componente = '';
                }
                newState.costo_unitario = ''; // Limpiar costo manual si selecciona de inventario
            } else if (name === 'tipo_componente') {
                // Limpiar campos relacionados al cambiar tipo de componente
                newState.nombre_componente = '';
                newState.materia_prima_id = '';
                newState.subreceta_referencia_id = '';
                newState.cantidad = '';
                newState.unidad = '';
                newState.costo_unitario = '';
            } else if (name === 'subreceta_referencia_id' && newState.tipo_componente === 'sub_receta') {
                const selectedSub = subRecetasDisponibles.find(sr => String(sr.id) === String(value));
                if (selectedSub) {
                    newState.nombre_componente = selectedSub.nombre_platillo;
                } else {
                    newState.nombre_componente = '';
                }
            }
            return newState;
        });
    };


    // Función para registrar una nueva receta estándar
        const registrarReceta = async (e) => {
        e.preventDefault();

        // Validar que el campo 'nombre' no esté vacío (corregido de nombre_platillo)
        if (!nuevaReceta.nombre) {
            mostrarMensaje('error', '❌ El nombre del platillo es obligatorio.');
            return;
        }

        let costo_total_calculado = parseFloat(nuevaReceta.costo_total_calculado); // Intentamos parsear si ya hay un valor
        let precio_venta = parseFloat(nuevaReceta.precio_venta);
        let utilidad_bruta = 0;
        let porcentaje_utilidad = 0;

        // Determinar si el cálculo automático está activado.
        // Asumo que 'es_producto_final' en 'nuevaReceta' también controla el checkbox "Calcular automáticamente (+33%)".
        // Si no, necesitaríamos un estado separado para el checkbox.
        const calcularAutomaticamente = nuevaReceta.es_producto_final; // Esto necesita ser confirmado

        if (calcularAutomaticamente) {
            // Si el costo total calculado no está disponible (quizás no se ha ingresado manualmente aún)
            // Para el registro inicial, asumimos que no hay un costo_total_calculado previo real.
            // Para la primera vez, el costo total calculado puede ser 0 o un valor por defecto si no lo ingresan.
            // Si el backend es quien calcula el costo total, entonces el frontend no debería enviarlo en este punto.
            // Pero el backend lo requiere. Esto es una inconsistencia.
            // Para esta prueba, si el cálculo es automático, enviaremos un costo_total_calculado de 0 o el que tenga
            // y calcularemos el precio_venta, utilidad_bruta, porcentaje_utilidad basados en el precio_venta ingresado.

            // Si el precio de venta se ingresa manualmente y el cálculo automático está marcado:
            // Usamos el precio de venta ingresado para calcular el costo, utilidad y porcentaje.
  
        } else {
            // Si no es cálculo automático, se envían los valores tal cual (o 0 si no se especifican)
            costo_total_calculado = isNaN(costo_total_calculado) ? 0 : costo_total_calculado;
            precio_venta = isNaN(precio_venta) ? 0 : precio_venta;
            // Para estos casos, utilidad y porcentaje se dejan en 0 o se calculan si los tienes en el formulario
            utilidad_bruta = 0;
            porcentaje_utilidad = 0;
        }

        const recetaEnviar = {
            nombre: nuevaReceta.nombre, // CAMBIO: Usar 'nombre' en lugar de 'nombre_platillo'
            foto_url: nuevaReceta.foto_url || null,
            descripcion: nuevaReceta.descripcion || null,
            es_producto_final: !!nuevaReceta.es_producto_final, // Asegurar que sea booleano
            costo_total_calculado: parseFloat(costo_total_calculado).toFixed(2),
            precio_venta: parseFloat(precio_venta).toFixed(2),
            utilidad_bruta: parseFloat(utilidad_bruta).toFixed(2),
            porcentaje_utilidad: parseFloat(porcentaje_utilidad).toFixed(2),
        };

        try {
            await axios.post(`${API_URL}/recetas-estandar`, recetaEnviar);
            mostrarMensaje('exito', '✅ Receta registrada exitosamente.');
            setNuevaReceta({
                nombre: '', // CAMBIO: Usar 'nombre' aquí también
                foto_url: '',
                descripcion: '',
                precio_venta: '',
                es_producto_final: false,
                costo_total_calculado: '',
            });
            obtenerRecetasEstandar(); // Recargar la lista de recetas
        } catch (error) {
            console.error('❌ Error al registrar receta:', error);
            mostrarMensaje('error', '❌ Error al registrar la receta. ' + (error.response?.data?.error || error.message));
        }
    };
       
    // Función para seleccionar una receta para edición
    const seleccionarReceta = (receta) => {
        setEditandoReceta({
            ...receta,
            es_producto_final: !!receta.es_producto_final // Asegurar que sea booleano
        });
        obtenerIngredientesReceta(receta.id); // Cargar los ingredientes de la receta seleccionada
        setNuevoIngrediente(prev => ({ ...prev, receta_id: receta.id })); // Setear receta_id para el form de nuevo ingrediente
    };

    // Función para actualizar una receta estándar
    const actualizarReceta = async (e) => {
        e.preventDefault();
        if (!editandoReceta || !editandoReceta.nombre_platillo) {
            mostrarMensaje('error', '❌ El nombre del platillo es obligatorio para actualizar.');
            return;
        }

        // Si es producto final y no hay precio de venta explícito, se calculará en el backend
        const precioActualizado = editandoReceta.precio_venta ? parseFloat(editandoReceta.precio_venta) : 0;

        const recetaActualizar = {
            ...editandoReceta,
            precio_venta: precioActualizado,
            es_producto_final: !!editandoReceta.es_producto_final
        };

        try {
            await axios.put(`${API_URL}/recetas-estandar/${recetaActualizar.id}`, recetaActualizar);
            mostrarMensaje('exito', '✅ Receta actualizada exitosamente.');
            setEditandoReceta(null); // Limpiar el formulario de edición
            obtenerRecetasEstandar(); // Recargar la lista de recetas
        } catch (error) {
            console.error('❌ Error al actualizar receta:', error);
            mostrarMensaje('error', '❌ Error al actualizar la receta. ' + (error.response?.data?.error || error.message));
        }
    };

    // Función para eliminar una receta estándar
    const eliminarReceta = async (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto! Se eliminarán los ingredientes asociados.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: PAARRIBA_COLORS.azulElectrico,
            cancelButtonColor: PAARRIBA_COLORS.rojoError,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
await axios.delete(`${API_URL}/recetas/${id}`);                    
mostrarMensaje('exito', '✅ Receta eliminada exitosamente.');
                    setEditandoReceta(null); // Limpiar el formulario de edición si se eliminó la que se editaba
                    obtenerRecetasEstandar(); // Recargar la lista de recetas
                    Swal.fire(
                        '¡Eliminada!',
                        'La receta ha sido eliminada.',
                        'success'
                    );
                } catch (error) {
                    console.error('❌ Error al eliminar receta:', error);
                    mostrarMensaje('error', '❌ Error al eliminar la receta. ' + (error.response?.data?.error || error.message));
                    Swal.fire(
                        'Error',
                        'Error al eliminar la receta: ' + (error.response?.data?.error || error.message),
                        'error'
                    );
                }
            }
        });
    };

    // Función para registrar un nuevo ingrediente en una receta
    const registrarIngrediente = async (e) => {
        e.preventDefault();
        if (!nuevoIngrediente.nombre_componente || !nuevoIngrediente.cantidad || !nuevoIngrediente.unidad || !nuevoIngrediente.costo_unitario) {            
            mostrarMensaje('error', '❌ Debes seleccionar una receta para añadir ingredientes.');
            return;
        }

        // Validaciones más robustas y específicas para cada tipo de componente
        if (nuevoIngrediente.tipo_componente === 'ingrediente_base') {
            if (!nuevoIngrediente.nombre_componente && !nuevoIngrediente.materia_prima_id) {
                 console.log('DEBUG FRONTEND: [registrarIngrediente] Validación: Unidad de ingrediente base faltante.');
                 mostrarMensaje('error', 'La unidad del ingrediente base es obligatoria.');
                mostrarMensaje('error', '❌ Para ingrediente base, debes seleccionar una materia prima o ingresar un nombre.');
                console.log('DEBUG FRONTEND: [registrarIngrediente] Validación: Ingrediente base sin nombre ni materia prima ID.');
                return;
            }
            if (nuevoIngrediente.cantidad === '' || isNaN(parseFloat(nuevoIngrediente.cantidad)) || parseFloat(nuevoIngrediente.cantidad) <= 0) {
                mostrarMensaje('error', '❌ La cantidad para el ingrediente base debe ser un número positivo.');
                console.log('DEBUG FRONTEND: [registrarIngrediente] Validación: Cantidad de ingrediente base inválida.');
                return;
            }
            if (!nuevoIngrediente.unidad) {
                mostrarMensaje('error', '❌ La unidad para el ingrediente base es obligatoria.');
                console.log('DEBUG FRONTEND: [registrarIngrediente] Validación: Unidad de ingrediente base faltante.');
                return;
            }
        } else if (nuevoIngrediente.tipo_componente === 'sub_receta') {
            if (!nuevoIngrediente.subreceta_referencia_id) {
                console.log('DEBUG FRONTEND: [registrarIngrediente] Validación: Unidad de sub-receta faltante.');
                mostrarMensaje('error', 'La unidad de la sub-receta es obligatoria.');
                mostrarMensaje('error', '❌ Para sub-receta, debes seleccionar una sub-receta existente.');
                console.log('DEBUG FRONTEND: [registrarIngrediente] Validación: Sub-receta ID no seleccionada.');
                return;
            }
            if (nuevoIngrediente.cantidad === '' || isNaN(parseFloat(nuevoIngrediente.cantidad)) || parseFloat(nuevoIngrediente.cantidad) <= 0) {
                mostrarMensaje('error', '❌ La cantidad para la sub-receta debe ser un número positivo.');
                console.log('DEBUG FRONTEND: [registrarIngrediente] Validación: Cantidad de sub-receta inválida.');
                return;
            }
        } else {
            mostrarMensaje('error', '❌ Tipo de componente no válido.');
            console.log('DEBUG FRONTEND: [registrarIngrediente] Validación: Campos obligatorios faltantes.');
            mostrarMensaje('error', 'Por favor, completa todos los campos obligatorios del ingrediente.');            
            return;
        }
            console.log('DEBUG CHECK (Pre-DataToSubmit): selectedMateriaPrimaObj', selectedMateriaPrimaObj);
            console.log('DEBUG CHECK (Pre-DataToSubmit): typeof selectedMateriaPrimaObj?.costo:', typeof selectedMateriaPrimaObj?.costo, '-> valor:', selectedMateriaPrimaObj?.costo);
            console.log('DEBUG CHECK (Pre-DataToSubmit): typeof nuevoIngrediente.costo_unitario:', typeof nuevoIngrediente.costo_unitario, '-> valor:', nuevoIngrediente.costo_unitario);

        let dataToSubmit = {
            receta_id: nuevoIngrediente.receta_id,
            tipo_componente: nuevoIngrediente.tipo_componente,
            nombre_componente: nuevoIngrediente.nombre_componente, // Se ajustará más abajo si es necesario
            subreceta_referencia_id: nuevoIngrediente.subreceta_referencia_id ? parseInt(nuevoIngrediente.subreceta_referencia_id) : null,
            cantidad: parseFloat(nuevoIngrediente.cantidad),
            unidad: nuevoIngrediente.unidad || null,
            costo_unitario: (() => { // Usamos una IIFE para un cálculo más claro
                let finalCost = null;
                if (nuevoIngrediente.tipo_componente === 'ingrediente_base' && selectedMateriaPrimaObj && selectedMateriaPrimaObj.costo) {
                    finalCost = Number(selectedMateriaPrimaObj.costo); // Conversión explícita a Number
                } else if (nuevoIngrediente.tipo_componente === 'sub_receta' && nuevoIngrediente.subreceta_referencia_id && nuevoIngrediente.costo_unitario) {
                    finalCost = Number(nuevoIngrediente.costo_unitario); // Conversión explícita a Number
                } else if (nuevoIngrediente.costo_unitario !== null && nuevoIngrediente.costo_unitario !== undefined && nuevoIngrediente.costo_unitario !== '') {
                    finalCost = Number(nuevoIngrediente.costo_unitario); // Para costos manuales
                }
                // Si la conversión resulta en NaN, forzar a null
                return isNaN(finalCost) ? null : finalCost;
            })(),
            materia_prima_id: (nuevoIngrediente.tipo_componente === 'ingrediente_base' && selectedMateriaPrimaObj) ? selectedMateriaPrimaObj.id : null, 
        };
        console.log('DEBUG FRONTEND: [registrarIngrediente] Estado de nuevoIngrediente antes de construir dataToSubmit:', nuevoIngrediente); // Nueva línea
        console.log('DEBUG FRONTEND: [registrarIngrediente] Estado de selectedMateriaPrimaObj antes de construir dataToSubmit:', selectedMateriaPrimaObj); // Nueva línea
        console.log('DEBUG FRONTEND: [registrarIngrediente] Valor de nuevoIngrediente.costo_unitario:', nuevoIngrediente.costo_unitario, 'Tipo:', typeof nuevoIngrediente.costo_unitario); // Nueva línea
        console.log('DEBUG FRONTEND: [registrarIngrediente] Valor de selectedMateriaPrimaObj?.costo:', selectedMateriaPrimaObj?.costo, 'Tipo:', typeof selectedMateriaPrimaObj?.costo); // Nueva línea
        console.log('DEBUG FRONTEND: [registrarIngrediente] Datos a enviar al backend:', dataToSubmit);
        // Asignar nombre_componente, costo_unitario y materia_prima_id basado en el tipo y selección
        if (dataToSubmit.tipo_componente === 'ingrediente_base') {
            if (nuevoIngrediente.materia_prima_id) {
                // Si viene de inventario
                const selectedMateriaPrima = materiaPrimaInventario.find(mp => String(mp.id) === String(nuevoIngrediente.materia_prima_id));
                if (selectedMateriaPrima) {
                    dataToSubmit.nombre_componente = selectedMateriaPrima.nombre;
                    dataToSubmit.materia_prima_id = parseInt(nuevoIngrediente.materia_prima_id);
                    dataToSubmit.costo_unitario = parseFloat(selectedMateriaPrima.costo); // Usar costo del inventario
                }
            } else {
                // Si es ingrediente base manual
                dataToSubmit.nombre_componente = nuevoIngrediente.nombre_componente;
                dataToSubmit.costo_unitario = parseFloat(nuevoIngrediente.costo_unitario || 0);
            }
        } else if (dataToSubmit.tipo_componente === 'sub_receta') {
            const selectedSubReceta = subRecetasDisponibles.find(sr => String(sr.id) === String(nuevoIngrediente.subreceta_referencia_id));
            if (selectedSubReceta) {
                dataToSubmit.nombre_componente = selectedSubReceta.nombre_platillo;
                dataToSubmit.subreceta_referencia_id = parseInt(nuevoIngrediente.subreceta_referencia_id);
                dataToSubmit.costo_unitario = parseFloat(selectedSubReceta.costo_total_calculado || 0); // Costo de la subreceta
            }
        }

        console.log('DEBUG FRONTEND: [registrarIngrediente] selectedMateriaPrimaObj:', selectedMateriaPrimaObj); // <-- RE-CONFIRMAR ESTE LOG (Ya lo tenías, asegúrate de que muestra el objeto completo)

// DEBUG CHECK (Pre-DataToSubmit): Tipo y valor de selectedMateriaPrimaObj?.costo
        console.log('DEBUG FRONTEND: [registrarIngrediente] selectedMateriaPrimaObj?.costo:', selectedMateriaPrimaObj?.costo, 'Tipo:', typeof selectedMateriaPrimaObj?.costo); // <-- RE-CONFIRMAR ESTE LOG

// DEBUG CHECK (Pre-DataToSubmit): Tipo y valor de nuevoIngrediente.costo_unitario
        console.log('DEBUG FRONTEND: [registrarIngrediente] nuevoIngrediente.costo_unitario (antes del cálculo):', nuevoIngrediente.costo_unitario, 'Tipo:', typeof nuevoIngrediente.costo_unitario); // <-- RE-CONFIRMAR ESTE LOG

// ... (tu lógica para construir dataToSubmit, incluyendo la IIFE para costo_unitario)

        console.log('DEBUG FRONTEND: [registrarIngrediente] Datos a enviar al backend:', dataToSubmit); // <-- RE-CONFIRMAR ESTE LOG (Este es el más importante para ver el costo_unitario final antes del envío)

        try {
            const response = await axios.post(`${API_URL}/ingredientes-receta`, dataToSubmit);
            console.log('DEBUG FRONTEND: [registrarIngrediente] Respuesta del backend:', response.data);
            mostrarMensaje('exito', '✅ Ingrediente añadido a la receta exitosamente.');
            // Reiniciar el formulario de nuevo ingrediente, manteniendo la receta_id
            setNuevoIngrediente({
                receta_id: nuevoIngrediente.receta_id, // Mantener la receta_id seleccionada
                tipo_componente: 'ingrediente_base',
                nombre_componente: '',
                materia_prima_id: '',
                subreceta_referencia_id: '',
                cantidad: '',
                unidad: '',
                costo_unitario: '',
            });
            // Recargar la lista de ingredientes de la receta
            obtenerIngredientesReceta(nuevoIngrediente.receta_id);
            // Recargar la lista de recetas estándar para actualizar costo total y PVP de la receta principal
            await obtenerRecetasEstandar();
        } catch (error) {
            console.error('DEBUG FRONTEND: [registrarIngrediente] Error al registrar ingrediente:', error);
            let errorMessage = 'Error al añadir el ingrediente. Inténtalo de nuevo.';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = `❌ ${error.response.data.error}`;
            }
            mostrarMensaje('error', errorMessage);
        }
    };

    // Función para seleccionar un ingrediente para edición
    const seleccionarIngrediente = (ingrediente) => {
        setEditandoIngrediente({
            ...ingrediente,
            // Convertir IDs a string para los selects si son numéricos
            materia_prima_id: ingrediente.materia_prima_id ? String(ingrediente.materia_prima_id) : '',
            subreceta_referencia_id: ingrediente.subreceta_referencia_id ? String(ingrediente.subreceta_referencia_id) : '',
            // Asegurarse de que costo_unitario y cantidad sean strings para los inputs si son numéricos
            cantidad: String(ingrediente.cantidad),
            costo_unitario: ingrediente.costo_unitario ? String(ingrediente.costo_unitario) : ''
        });
    };

    // Función para actualizar un ingrediente de receta
    const actualizarIngrediente = async (e) => {
        e.preventDefault();
        console.log('DEBUG FRONTEND: [actualizarIngrediente] Función iniciada.');
        console.log('DEBUG FRONTEND: [actualizarIngrediente] Datos a actualizar:', editandoIngrediente);

        if (!editandoIngrediente || !editandoIngrediente.receta_id) {
            mostrarMensaje('error', '❌ Debes seleccionar una receta y un ingrediente para actualizar.');
            console.log('DEBUG FRONTEND: [actualizarIngrediente] Validación: receta_id o ingrediente no seleccionados.');
            return;
        }
        
        // Validaciones similares a registrarIngrediente
        if (editandoIngrediente.tipo_componente === 'ingrediente_base') {
            if (!editandoIngrediente.nombre_componente && !editandoIngrediente.materia_prima_id) {
                mostrarMensaje('error', '❌ Para ingrediente base, debes seleccionar una materia prima o ingresar un nombre.');
                console.log('DEBUG FRONTEND: [actualizarIngrediente] Validación: Ingrediente base sin nombre ni materia prima ID.');
                return;
            }
            if (editandoIngrediente.cantidad === '' || isNaN(parseFloat(editandoIngrediente.cantidad)) || parseFloat(editandoIngrediente.cantidad) <= 0) {
                mostrarMensaje('error', '❌ La cantidad para el ingrediente base debe ser un número positivo.');
                console.log('DEBUG FRONTEND: [actualizarIngrediente] Validación: Cantidad de ingrediente base inválida.');
                return;
            }
            if (!editandoIngrediente.unidad) {
                mostrarMensaje('error', '❌ La unidad para el ingrediente base es obligatoria.');
                console.log('DEBUG FRONTEND: [actualizarIngrediente] Validación: Unidad de ingrediente base faltante.');
                return;
            }
        } else if (editandoIngrediente.tipo_componente === 'sub_receta') {
            if (!editandoIngrediente.subreceta_referencia_id) {
                mostrarMensaje('error', '❌ Para sub-receta, debes seleccionar una sub-receta existente.');
                console.log('DEBUG FRONTEND: [actualizarIngrediente] Validación: Sub-receta ID no seleccionada.');
                return;
            }
            if (editandoIngrediente.cantidad === '' || isNaN(parseFloat(editandoIngrediente.cantidad)) || parseFloat(editandoIngrediente.cantidad) <= 0) {
                mostrarMensaje('error', '❌ La cantidad para la sub-receta debe ser un número positivo.');
                console.log('DEBUG FRONTEND: [actualizarIngrediente] Validación: Cantidad de sub-receta inválida.');
                return;
            }
        } else {
            mostrarMensaje('error', '❌ Tipo de componente no válido.');
            console.log('DEBUG FRONTEND: [actualizarIngrediente] Validación: Tipo de componente no válido.');
            return;
        }

        let dataToSubmit = {
            receta_id: editandoReceta.receta_id,
            tipo_componente: editandoIngrediente.tipo_componente,
            nombre_componente: editandoIngrediente.nombre_componente,
            subreceta_referencia_id: editandoIngrediente.subreceta_referencia_id ? parseInt(editandoIngrediente.subreceta_referencia_id) : null,
            cantidad: parseFloat(editandoIngrediente.cantidad),
            unidad: editandoIngrediente.unidad || null,
            costo_unitario: null,
            materia_prima_id: null,
        };

        // Asignar valores basados en el tipo y selección para actualización
        if (dataToSubmit.tipo_componente === 'ingrediente_base') {
            if (editandoIngrediente.materia_prima_id) {
                const selectedMateriaPrima = materiaPrimaInventario.find(mp => String(mp.id) === String(editandoIngrediente.materia_prima_id));
                if (selectedMateriaPrima) {
                    dataToSubmit.nombre_componente = selectedMateriaPrima.nombre;
                    dataToSubmit.materia_prima_id = parseInt(editandoIngrediente.materia_prima_id);
                    dataToSubmit.costo_unitario = parseFloat(selectedMateriaPrima.costo_unitario_estandar);
                }
            } else {
                dataToSubmit.nombre_componente = editandoIngrediente.nombre_componente;
                dataToSubmit.costo_unitario = parseFloat(editandoIngrediente.costo_unitario || 0);
            }
        } else if (dataToSubmit.tipo_componente === 'sub_receta') {
            const selectedSubReceta = subRecetasDisponibles.find(sr => String(sr.id) === String(editandoIngrediente.subreceta_referencia_id));
            if (selectedSubReceta) {
                dataToSubmit.nombre_componente = selectedSubReceta.nombre_platillo;
                dataToSubmit.subreceta_referencia_id = parseInt(editandoIngrediente.subreceta_referencia_id);
                dataToSubmit.costo_unitario = parseFloat(selectedSubReceta.costo_total_calculado || 0);
            }
        }

        console.log('DEBUG FRONTEND: [actualizarIngrediente] Datos a enviar al backend:', dataToSubmit);

        try {
            await axios.put(`${API_URL}/ingredientes-receta/${editandoIngrediente.id}`, dataToSubmit);
            mostrarMensaje('exito', '✅ Ingrediente actualizado exitosamente.');
            setEditandoIngrediente(null); // Limpiar el formulario de edición
            obtenerIngredientesReceta(editandoIngrediente.receta_id); // Recargar la lista de ingredientes
            await obtenerRecetasEstandar(); // Recargar recetas para actualizar costos y PVP
        } catch (error) {
            console.error('DEBUG FRONTEND: [actualizarIngrediente] Error al actualizar ingrediente:', error);
            let errorMessage = 'Error al actualizar el ingrediente. Inténtalo de nuevo.';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = `❌ ${error.response.data.error}`;
            }
            mostrarMensaje('error', errorMessage);
        }
    };

    // Función para eliminar un ingrediente de receta
    const eliminarIngrediente = async (id, recetaId) => {
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
                    await axios.delete(`${API_URL}/ingredientes-receta/${id}`);
                    mostrarMensaje('exito', '✅ Ingrediente eliminado exitosamente.');
                    setEditandoIngrediente(null); // Limpiar edición si se eliminó el ingrediente
                    obtenerIngredientesReceta(recetaId); // Recargar la lista de ingredientes
                    await obtenerRecetasEstandar(); // Recargar recetas para actualizar costos y PVP
                    Swal.fire(
                        '¡Eliminado!',
                        'El ingrediente ha sido eliminado.',
                        'success'
                    );
                } catch (error) {
                    console.error('❌ Error al eliminar ingrediente:', error);
                    mostrarMensaje('error', '❌ Error al eliminar el ingrediente. ' + (error.response?.data?.error || error.message));
                    Swal.fire(
                        'Error',
                        'Error al eliminar el ingrediente: ' + (error.response?.data?.error || error.message),
                        'error'
                    );
                }
            }
        });
    };
    console.log('Estado actual de recetas en el componente (antes del render):', recetas); // AÑADE ESTA LÍNEA
 // Calcula el costo total de los ingredientes de la receta (suma vertical)
const costoTotalVerticalIngredientes = ingredientesReceta.reduce((sum, ing) => {
    return sum + parseFloat(ing.costo_total_componente || 0);
}, 0);
     return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen font-sans">
            <h1 className="text-4xl font-bold text-pa-blue mb-8 text-center">
                MI SAZÓN, MI PASIÓN - Gestión de Recetas
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

            {/* Formulario para registrar nueva receta */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Registrar Nueva Receta Estándar</h2>
                <form onSubmit={registrarReceta} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre del Platillo:</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={nuevaReceta.nombre_platillo}
                            onChange={handleNuevaRecetaChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="foto_url" className="block text-gray-700 text-sm font-bold mb-2">URL de Foto (opcional):</label>
                        <input
                            type="text"
                            id="foto_url"
                            name="foto_url"
                            value={nuevaReceta.foto_url}
                            onChange={handleNuevaRecetaChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">Descripción (opcional):</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={nuevaReceta.descripcion}
                            onChange={handleNuevaRecetaChange}
                            rows="2"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                    </div>
                    {/* Campos de precio y producto final se ocultan o muestran según la lógica de tu UI/UX */}
                    <div>
                        <label htmlFor="precio_venta" className="block text-gray-700 text-sm font-bold mb-2">Precio de Venta ($):</label>
                        <input
                            type="number"
                            id="precio_venta"
                            name="precio_venta"
                            value={nuevaReceta.precio_venta}
                            onChange={handleNuevaRecetaChange}
                            step="0.01"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <p className="text-xs text-gray-500 mt-1">Se calculará automáticamente si el checkbox "Calcular automáticamente" está marcado.</p>
                    </div>
                    <div className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            id="es_producto_final"
                            name="es_producto_final"
                            checked={nuevaReceta.es_producto_final}
                            onChange={handleNuevaRecetaChange}
                            className="mr-2 h-4 w-4 text-pa-blue rounded focus:ring-pa-blue"
                        />
                        <label htmlFor="es_producto_final" className="text-gray-700 text-sm font-bold">Es Producto Final (se vende directamente)</label>
                    </div>
                    {/* Checkbox para el cálculo automático (opcional, si quieres que el usuario lo controle desde UI) */}
                    <div className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            id="calcular_automaticamente"
                            name="calcular_automaticamente" // Este nombre no se mapea directamente al estado de la receta, es para lógica interna
                            checked={true} // Siempre marcado para que se aplique la lógica del 33% en backend
                            readOnly // Para evitar que el usuario lo desactive si siempre quieres el cálculo automático
                            className="mr-2 h-4 w-4 text-pa-blue rounded focus:ring-pa-blue"
                        />
                        <label htmlFor="calcular_automaticamente" className="text-gray-700 text-sm font-bold">Calcular automáticamente (+33%)</label>
                    </div>
                    <div className="md:col-span-2 text-right">
                        <button
                            type="submit"
                            className="bg-pa-blue hover:bg-pa-blue-dark text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                        >
                            Registrar Receta
                        </button>
                    </div>
                </form>
            </div>

            {/* Formulario para editar receta */}
            {editandoReceta && (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Editar Receta Estándar: {editandoReceta.nombre_platillo}</h2>
                    <form onSubmit={actualizarReceta} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="edit_nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre del Platillo:</label>
                            <input
                                type="text"
                                id="edit_nombre"
                                name="nombre"
                                value={editandoReceta.nombre_platillo || ''}
                                onChange={handleEditandoRecetaChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="edit_foto_url" className="block text-gray-700 text-sm font-bold mb-2">URL de Foto (opcional):</label>
                            <input
                                type="text"
                                id="edit_foto_url"
                                name="foto_url"
                                value={editandoReceta.foto_url || ''}
                                onChange={handleEditandoRecetaChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="edit_descripcion" className="block text-gray-700 text-sm font-bold mb-2">Descripción (opcional):</label>
                            <textarea
                                id="edit_descripcion"
                                name="descripcion"
                                value={editandoReceta.descripcion || ''}
                                onChange={handleEditandoRecetaChange}
                                rows="2"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="edit_precio_venta" className="block text-gray-700 text-sm font-bold mb-2">Precio de Venta ($):</label>
                            <input
                                type="number"
                                id="edit_precio_venta"
                                name="precio_venta"
                                value={parseFloat(editandoReceta.precio_venta || 0).toFixed(2)} // Muestra el PVP actualizado
                                onChange={handleEditandoRecetaChange}
                                step="0.01"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                readOnly // El precio se calcula en el backend
                            />
                             <p className="text-xs text-gray-500 mt-1">Precio de venta se autocalcula en base al costo y margen.</p>
                        </div>
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                id="edit_es_producto_final"
                                name="es_producto_final"
                                checked={editandoReceta.es_producto_final}
                                onChange={handleEditandoRecetaChange}
                                className="mr-2 h-4 w-4 text-pa-blue rounded focus:ring-pa-blue"
                            />
                            <label htmlFor="edit_es_producto_final" className="text-gray-700 text-sm font-bold">Es Producto Final (se vende directamente)</label>
                        </div>
                         {/* Checkbox para el cálculo automático (opcional, siempre marcado en edición) */}
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                id="edit_calcular_automaticamente"
                                name="calcular_automaticamente"
                                checked={true}
                                readOnly
                                className="mr-2 h-4 w-4 text-pa-blue rounded focus:ring-pa-blue"
                            />
                            <label htmlFor="edit_calcular_automaticamente" className="text-gray-700 text-sm font-bold">Calcular automáticamente (+33%)</label>
                        </div>
                        <div className="md:col-span-2 text-right">
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105 mr-2"
                            >
                                Actualizar Receta
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditandoReceta(null)}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:shadow-outline transform transition duration-150 hover:scale-105"
                            >
                                Cancelar Edición
                            </button>
                        </div>
                    </form>

                    {/* Sección de Ingredientes para la Receta */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-inner mt-8">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Ingredientes para "{editandoReceta.nombre_platillo}"</h3>

                        {/* Formulario para añadir ingrediente a la receta */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            <h4 className="text-lg font-semibold text-gray-700 mb-4">Añadir Ingrediente a Receta</h4>
                            <form onSubmit={registrarIngrediente} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="tipo_componente" className="block text-gray-700 text-sm font-bold mb-2">Tipo de Componente:</label>
                                    <select
                                        id="tipo_componente"
                                        name="tipo_componente"
                                        value={nuevoIngrediente.tipo_componente}
                                        onChange={handleNuevoIngredienteChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    >
                                        <option value="ingrediente_base">Ingrediente Base</option>
                                        <option value="sub_receta">Sub-Receta</option>
                                    </select>
                                </div>

                                {nuevoIngrediente.tipo_componente === 'ingrediente_base' && (
                                    <>
                                        <div>
                                            <label htmlFor="materia_prima_id" className="block text-gray-700 text-sm font-bold mb-2">Seleccionar Materia Prima de Despensa:</label>
                                            <select
                                                id="materia_prima_id"
                                                name="materia_prima_id"
                                                value={nuevoIngrediente.materia_prima_id}
                                                onChange={handleNuevoIngredienteChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            >
                                                <option value="">-- O seleccionar una Materia Prima --</option>
                                                {materiaPrimaInventario.map(mp => (
                                                    <option key={mp.id} value={mp.id}>
                                                {mp.nombre} (${parseFloat(mp.costo || 0).toFixed(4)}/{mp.unidad || ''}) {/* CORRECCIÓN: Usar mp.costo y mp.unidad */}                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Si seleccionas una materia prima, su costo se usará.</p>
                                        </div>
                                        <div>
                                            <label htmlFor="nombre_componente" className="block text-gray-700 text-sm font-bold mb-2">Nombre del Componente (si no es de despensa):</label>
                                            <input
                                                type="text"
                                                id="nombre_componente"
                                                name="nombre_componente"
                                                value={nuevoIngrediente.nombre_componente}
                                                onChange={handleNuevoIngredienteChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                placeholder="Ej: Agua, Sal (si no está en despensa)"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="costo_unitario" className="block text-gray-700 text-sm font-bold mb-2">Costo Unitario ($) (si no es de despensa):</label>
                                            <input
                                                type="number"
                                                id="costo_unitario"
                                                name="costo_unitario"
                                                value={nuevoIngrediente.costo_unitario !== null && nuevoIngrediente.costo_unitario !== undefined ? nuevoIngrediente.costo_unitario : ''} // Línea 924
                                                onChange={handleNuevoIngredienteChange}
                                                step="0.0001"
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                placeholder="Ej: 0.005"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Solo si no seleccionaste una materia prima de la despensa.</p>
                                        </div>
                                    </>
                                )}

                                {nuevoIngrediente.tipo_componente === 'sub_receta' && (
                                    <div>
                                        <label htmlFor="subreceta_referencia_id" className="block text-gray-700 text-sm font-bold mb-2">Seleccionar Sub-Receta:</label>
                                        <select
                                            id="subreceta_referencia_id"
                                            name="subreceta_referencia_id"
                                            value={nuevoIngrediente.subreceta_referencia_id}
                                            onChange={handleNuevoIngredienteChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        >
                                            <option value="">-- Seleccionar una Sub-Receta --</option>
                                            {subRecetasDisponibles.map(sr => (
                                                <option key={sr.id} value={sr.id}>
                                                    {sr.nombre_platillo} (${parseFloat(sr.costo_total_calculado).toFixed(2)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="cantidad" className="block text-gray-700 text-sm font-bold mb-2">Cantidad:</label>
                                    <input
                                        type="number"
                                        id="cantidad"
                                        name="cantidad"
                                        value={nuevoIngrediente.cantidad}
                                        onChange={handleNuevoIngredienteChange}
                                        step="0.01"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="unidad" className="block text-gray-700 text-sm font-bold mb-2">Unidad:</label>
                                    <input
                                        type="text"
                                        id="unidad"
                                        name="unidad"
                                        value={nuevoIngrediente.unidad || ''}
                                        onChange={handleNuevoIngredienteChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Ej: gramos, ml, unidad"
                                    />
                                </div>
                                <div className="md:col-span-2 text-right">
                                    <button
                                        type="submit"
                                        className="bg-pa-blue hover:bg-pa-blue-dark text-white font-bold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pa-blue focus:ring-offset-2 transform transition duration-150 hover:scale-105"
                                    >
                                        Añadir Ingrediente
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Lista de Ingredientes de la Receta */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h4 className="text-lg font-semibold text-gray-700 mb-4">Lista de Ingredientes</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                                    <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                        <tr>
                                            <th className="py-3 px-6 text-left">ID</th>                                            
                                            <th className="py-3 px-6 text-left">Tipo</th>
                                            <th className="py-3 px-6 text-left">Nombre</th>
                                            <th className="py-3 px-6 text-right">Cantidad</th>
                                            <th className="py-3 px-6 text-left">Unidad</th>
                                            <th className="py-3 px-6 text-right">Costo Unitario</th>
                                            <th className="py-3 px-6 text-center">Acciones</th>
                                            <th className="py-3 px-6 text-right">Costo Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600 text-sm font-light">
                                        {ingredientesReceta.length > 0 ? (
                                            ingredientesReceta.map(ing => (
                                                <tr key={ing.id} className="border-b border-gray-200 hover:bg-gray-100">
                                                    <td className="py-3 px-6 text-left">{ing.materia_prima_id || ing.subreceta_referencia_id || ing.id}</td>
                                                    <td className="py-3 px-6 text-left">{ing.tipo_componente === 'ingrediente_base' ? 'Base' : 'Sub-Receta'}</td>
                                                    <td className="py-3 px-6 text-left">{ing.nombre_componente}</td>
                                                    <td className="py-3 px-6 text-right">{parseFloat(ing.cantidad).toFixed(2)}</td>
                                                    <td className="py-3 px-6 text-left">{ing.unidad}</td>
                                                    <td className="py-3 px-6 text-right">${parseFloat(ing.costo_unitario || 0).toFixed(4)}</td> {/* Muestra 4 decimales */}
                                                    <td className="py-3 px-6 text-center">
                                                        <button
                                                            onClick={() => seleccionarIngrediente(ing)}
                                                            className="bg-pa-orange hover:bg-pa-orange-dark text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out mr-2"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => eliminarIngrediente(ing.id, ing.receta_id)}
                                                            className="bg-feedback-error hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-6 text-right">${parseFloat(ing.costo_total_componente || 0).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="py-4 text-center text-gray-500">No hay ingredientes añadidos a esta receta.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
<div className="flex justify-end mt-4 text-lg font-bold text-gray-800">
    Costo Total de Ingredientes: ${costoTotalVerticalIngredientes.toFixed(2)}
</div>
                        {/* Formulario para editar ingrediente */}
                        {editandoIngrediente && (
                            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                                <h4 className="text-lg font-semibold text-gray-700 mb-4">Editar Ingrediente: {editandoIngrediente.nombre_componente}</h4>
                                <form onSubmit={actualizarIngrediente} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Campos de edición */}
                                    <div>
                                        <label htmlFor="edit_tipo_componente" className="block text-gray-700 text-sm font-bold mb-2">Tipo de Componente:</label>
                                        <select
                                            id="edit_tipo_componente"
                                            name="tipo_componente"
                                            value={editandoIngrediente.tipo_componente}
                                            onChange={handleEditandoIngredienteChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                            disabled={true} // No permitir cambiar el tipo de componente al editar
                                        >
                                            <option value="ingrediente_base">Ingrediente Base</option>
                                            <option value="sub_receta">Sub-Receta</option>
                                        </select>
                                    </div>

                                    {editandoIngrediente.tipo_componente === 'ingrediente_base' && (
                                        <>
                                            <div>
                                                <label htmlFor="edit_materia_prima_id" className="block text-gray-700 text-sm font-bold mb-2">Seleccionar Materia Prima de Despensa:</label>
                                                <select
                                                    id="edit_materia_prima_id"
                                                    name="materia_prima_id"
                                                    value={editandoIngrediente.materia_prima_id || ''}
                                                    onChange={handleEditandoIngredienteChange}
                                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                >
                                                    <option value="">-- O seleccionar una Materia Prima --</option>
                                                    {materiaPrimaInventario.map(mp => (
                                                        <option key={mp.id} value={mp.id}>
                                                            {mp.nombre} (${parseFloat(mp.costo_unitario_estandar).toFixed(4)}/{mp.unidad_estandar})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="edit_nombre_componente" className="block text-gray-700 text-sm font-bold mb-2">Nombre del Componente (si no es de despensa):</label>
                                                <input
                                                    type="text"
                                                    id="edit_nombre_componente"
                                                    name="nombre_componente"
                                                    value={editandoIngrediente.nombre_componente || ''}
                                                    onChange={handleEditandoIngredienteChange}
                                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    placeholder="Ej: Agua, Sal"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="edit_costo_unitario" className="block text-gray-700 text-sm font-bold mb-2">Costo Unitario ($) (si no es de despensa):</label>
                                                <input
                                                    type="number"
                                                    id="edit_costo_unitario"
                                                    name="costo_unitario"
                                                    value={editandoIngrediente.costo_unitario || ''}
                                                    onChange={handleEditandoIngredienteChange}
                                                    step="0.0001"
                                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    placeholder="Ej: 0.005"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {editandoIngrediente.tipo_componente === 'sub_receta' && (
                                        <div>
                                            <label htmlFor="edit_subreceta_referencia_id" className="block text-gray-700 text-sm font-bold mb-2">Seleccionar Sub-Receta:</label>
                                            <select
                                                id="edit_subreceta_referencia_id"
                                                name="subreceta_referencia_id"
                                                value={editandoIngrediente.subreceta_referencia_id || ''}
                                                onChange={handleEditandoIngredienteChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                required
                                            >
                                                <option value="">-- Seleccionar una Sub-Receta --</option>
                                                {subRecetasDisponibles.map(sr => (
                                                    <option key={sr.id} value={sr.id}>
                                                        {sr.nombre_platillo} (${parseFloat(sr.costo_total_calculado).toFixed(2)})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="edit_cantidad" className="block text-gray-700 text-sm font-bold mb-2">Cantidad:</label>
                                        <input
                                            type="number"
                                            id="edit_cantidad"
                                            name="cantidad"
                                            value={editandoIngrediente.cantidad || ''}
                                            onChange={handleEditandoIngredienteChange}
                                            step="0.01"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="edit_unidad" className="block text-gray-700 text-sm font-bold mb-2">Unidad:</label>
                                        <input
                                            type="text"
                                            id="edit_unidad"
                                            name="unidad"
                                            value={editandoIngrediente.unidad || ''}
                                            onChange={handleEditandoIngredienteChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            placeholder="Ej: gramos, ml, unidad"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2 text-right">
                                        <button
                                            type="submit"
                                            className="bg-pa-blue hover:bg-pa-blue-dark text-white font-bold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pa-blue focus:ring-offset-2 transform transition duration-150 hover:scale-105 mr-2"
                                        >
                                            Actualizar Ingrediente
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditandoIngrediente(null)}
                                            className="bg-gray-400 hover:bg-gray-500 text-pa-white font-bold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transform transition duration-150 hover:scale-105"
                                        >
                                            Cancelar Edición
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )} {/* Cierre del condicional editandoIngrediente */}
                    </div> {/* Cierre del div de la sección de ingredientes (editandoReceta) */}
                </div>
            )} {/* Cierre del condicional editandoReceta */}


            {/* Tabla de recetas estándar */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Menú Actual</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por nombre de platillo..."
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        // Aquí podrías añadir un estado y un onChange para filtrar la lista de recetas
                    />
                </div>
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                        <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <tr>
                                <th className="py-3 px-6 text-left">ID</th>
                                <th className="py-3 px-6 text-left">Platillo</th>
                                <th className="py-3 px-6 text-left">Tipo</th>
                                <th className="py-3 px-6 text-right">Costo Calc.</th>
                                <th className="py-3 px-6 text-right">P. Venta</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                                <th className="py-3 px-6 text-right">Utilidad Bruta</th>
                                <th className="py-3 px-6 text-right">Porcentaje Utilidad</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {recetas.length > 0 ? (
                                recetas.map(receta => (
                                    <tr key={receta.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left">{receta.id}</td> {/* ID */}
                                <td className="py-3 px-6 text-left whitespace-nowrap">{receta.nombre_platillo}</td> {/* Platillo */}
                                <td className="py-3 px-6 text-left">{receta.es_producto_final ? 'Producto Final' : 'Sub-Receta'}</td> {/* Tipo */}
                                <td className="py-3 px-6 text-right">${parseFloat(receta.costo_total_calculado).toFixed(2)}</td> {/* Costo Calc. */}
                                <td className="py-3 px-6 text-right">${parseFloat(receta.precio_venta).toFixed(2)}</td> {/* P. Venta */}
                                <td className="py-3 px-6 text-center"> {/* Acciones */}                                            
                                    <button
                                                onClick={() => seleccionarReceta(receta)}
                                                className="bg-pa-orange hover:bg-pa-orange-dark text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out mr-2"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => eliminarReceta(receta.id)}
                                                className="bg-feedback-error hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition duration-200 ease-in-out"
                                            >
                                                Eliminar
                                            </button>
 </td>
                                <td className="py-3 px-6 text-right">${parseFloat(receta.utilidad_bruta || 0).toFixed(2)}</td> {/* 7. Utilidad Bruta */}
                                <td className="py-3 px-6 text-right">{parseFloat(receta.porcentaje_utilidad || 0).toFixed(2)}%</td> {/* 8. Porcentaje Utilidad */}
                                       
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-4 text-center text-gray-500">No hay recetas registradas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
               <div className="md:hidden mt-4">
    {recetas.length > 0 ? (
        recetas.map((receta) => (
            <div key={receta.id} className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500 mb-1">ID: <span className="font-medium">{receta.id}</span></p>
                    <h3 className="text-lg font-semibold text-gray-800">{receta.nombre_platillo}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${receta.es_producto_final ? 'bg-verde-dinamico text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {receta.es_producto_final ? 'Producto Final' : 'Sub-receta'}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Costo Calc.: <span className="font-medium">${parseFloat(receta.costo_total_calculado).toFixed(2)}</span></p>
                <p className="text-sm text-gray-600 mb-3">P. Venta: <span className="font-medium">${parseFloat(receta.precio_venta).toFixed(2)}</span></p>
                <p className="text-sm text-gray-600 mb-1">Utilidad Bruta: <span className="font-medium">${parseFloat(receta.utilidad_bruta || 0).toFixed(2)}</span></p>
                <p className="text-sm text-gray-600 mb-3">Porcentaje Utilidad: <span className="font-medium">{parseFloat(receta.porcentaje_utilidad || 0).toFixed(2)}%</span></p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => seleccionarReceta(receta)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition duration-200 ease-in-out"                    >
                        Editar
                    </button>
                    <button
                        onClick={() => eliminarReceta(receta.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold transition duration-200 ease-in-out"                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ))
    ) : (
        <p className="text-center text-gray-500 py-4">No hay recetas registradas.</p>
    )}
</div>
            </div>
        </div>
    );
};

export default RecetasEstandar;
