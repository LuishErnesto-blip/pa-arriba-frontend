import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

const Compras = () => {
  const API_URL = 'https://pa-arriba-backend-api.onrender.com'; // URL de tu backend desplegado
  const [compras, setCompras] = useState([]);
  const [nuevaCompra, setNuevaCompra] = useState({
    producto: '',
    cantidad: '',
    unidad: '',
    costo_unitario: ''
  });
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  // Estados para la edición
  const [compraEditando, setCompraEditando] = useState(null);

  // 👇 NUEVOS ESTADOS para los filtros de compras
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');

  // Opciones predefinidas para unidades
  const unidades = ['gramos', 'kilogramos', 'ml', 'litros', 'unidades', 'tazas', 'cucharadas', 'galones', 'libras', 'onzas', 'pizcas'];

  // Efecto para cargar las compras al inicio o cuando cambian los filtros
  useEffect(() => {
    // Llama a obtenerCompras con los filtros actuales
    obtenerCompras(filtroFechaInicio, filtroFechaFin, filtroProducto);
  }, [filtroFechaInicio, filtroFechaFin, filtroProducto]); // Dependencias del useEffect

  // Función para obtener compras, ahora acepta filtros y no se limita al día
  const obtenerCompras = async (fechaInicio = '', fechaFin = '', producto = '') => {
    try {
let url = `${API_URL}/compras`;
      const params = [];

      if (fechaInicio) params.push(`fecha_inicio=${fechaInicio}`);
      if (fechaFin) params.push(`fecha_fin=${fechaFin}`);
      if (producto) params.push(`producto=${producto}`);

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await axios.get(url);
      setCompras(response.data || []);
    } catch (error) {
      console.error('❌ Error al obtener compras:', error);
      setMensajeError('Error al cargar las compras. Revisa la consola del navegador.');
      setTimeout(() => setMensajeError(''), 5000);
    }
  };

  // Manejador de cambios para el formulario de nueva compra
  const manejarCambioNuevaCompra = (e) => {
    const { name, value } = e.target;
    // Si estamos editando una compra, actualizamos ese estado
    if (compraEditando) {
      setCompraEditando(prev => ({ ...prev, [name]: value }));
    } else {
      // Si no, actualizamos el estado de la nueva compra
      setNuevaCompra(prev => ({ ...prev, [name]: value }));
    }
  };

  // 👇 NUEVA FUNCIÓN: Maneja los cambios en los campos de filtro
  const manejarCambioFiltro = (e) => {
    const { name, value } = e.target;
    if (name === 'filtroFechaInicio') {
      setFiltroFechaInicio(value);
    } else if (name === 'filtroFechaFin') {
      setFiltroFechaFin(value);
    } else if (name === 'filtroProducto') {
      setFiltroProducto(value);
    }
  };


  // Función para registrar una nueva compra
  const registrarCompra = async (e) => {
    e.preventDefault();
    const { producto, cantidad, unidad, costo_unitario } = nuevaCompra;

    // Validaciones básicas
    if (!producto || !cantidad || !unidad || !costo_unitario) {
      setMensajeError('❌ Por favor, completa todos los campos.');
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }
    if (parseFloat(cantidad) <= 0 || parseFloat(costo_unitario) <= 0) {
      setMensajeError('❌ Cantidad y costo unitario deben ser mayores que cero.');
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }

    try {
await axios.post(`${API_URL}/compras`, {
      producto,
      cantidad: parseFloat(cantidad),
      unidad,
      costo_unitario: parseFloat(costo_unitario)
    });
      setMensajeExito('✅ Compra registrada exitosamente.');
      setTimeout(() => setMensajeExito(''), 3000);
      setNuevaCompra({ producto: '', cantidad: '', unidad: '', costo_unitario: '' }); // Limpiar formulario
      obtenerCompras(filtroFechaInicio, filtroFechaFin, filtroProducto); // Refrescar con filtros
    } catch (error) {
      console.error('❌ Error al registrar compra:', error);
      let errorMessage = 'Error al registrar la compra.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = `❌ ${error.response.data.error}`;
      }
      setMensajeError(errorMessage);
      setTimeout(() => setMensajeError(''), 5000);
    }
  };

  // Inicia la edición de una compra
  const iniciarEdicionCompra = (compra) => {
    setCompraEditando({
      ...compra,
      cantidad: String(compra.cantidad), // Asegurarse de que sea string para el input
      costo_unitario: String(compra.costo_unitario), // Asegurarse de que sea string para el input
    });
    setMensajeExito('');
    setMensajeError('');
  };

  // Cancela la edición de una compra
  const cancelarEdicionCompra = () => {
    setCompraEditando(null);
    setNuevaCompra({ producto: '', cantidad: '', unidad: '', costo_unitario: '' }); // Limpiar formulario de nueva compra
    setMensajeExito('');
    setMensajeError('');
  };

  // Actualiza una compra existente
  const actualizarCompra = async (e) => {
    e.preventDefault();
    if (!compraEditando) return;

    const { id, producto, cantidad, unidad, costo_unitario } = compraEditando;

    // Validaciones
    if (!producto || !cantidad || !unidad || !costo_unitario) {
      setMensajeError('❌ Por favor, completa todos los campos para actualizar.');
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }
    if (parseFloat(cantidad) <= 0 || parseFloat(costo_unitario) <= 0) {
      setMensajeError('❌ Cantidad y costo unitario deben ser mayores que cero para actualizar.');
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }

    try {
await axios.put(API_URL/compras/{id}, {
      producto,
        cantidad: parseFloat(cantidad),
        unidad,
        costo_unitario: parseFloat(costo_unitario)
      });
      setMensajeExito('✅ Compra actualizada exitosamente.');
      setTimeout(() => setMensajeExito(''), 3000);
      cancelarEdicionCompra(); // Sale del modo edición
      obtenerCompras(filtroFechaInicio, filtroFechaFin, filtroProducto); // Refresca con filtros
    } catch (error) {
      console.error('❌ Error al actualizar compra:', error);
      let errorMessage = 'Error al actualizar la compra.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = `❌ ${error.response.data.error}`;
      }
      setMensajeError(errorMessage);
      setTimeout(() => setMensajeError(''), 5000);
    }
  };

  // Elimina una compra
  const eliminarCompra = async (compraId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta compra? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
await axios.delete(API_URL/compras/{compraId});
      setMensajeExito('✅ Compra eliminada exitosamente.');
      setTimeout(() => setMensajeExito(''), 3000);
      obtenerCompras(filtroFechaInicio, filtroFechaFin, filtroProducto); // Refresca con filtros
    } catch (error) {
      console.error('❌ Error al eliminar compra:', error);
      let errorMessage = 'Error al eliminar la compra.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = `❌ ${error.response.data.error}`;
      }
      setMensajeError(errorMessage);
      setTimeout(() => setMensajeError(''), 5000);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Montserrat, sans-serif', 
      color: PAARRIBA_COLORS.negro,
      backgroundColor: PAARRIBA_COLORS.blanco,
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ 
        color: PAARRIBA_COLORS.verdeDinamico, // Color principal para compras
        borderBottom: `2px solid ${PAARRIBA_COLORS.naranjaVibrante}`, 
        paddingBottom: '10px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        CONTROL FINANCIERO - Sección de Compras
      </h2>

      {/* Mensajes al usuario */}
      {mensajeExito && <p style={{ color: PAARRIBA_COLORS.verdeDinamico, fontWeight: 'bold', textAlign: 'center' }}>{mensajeExito}</p>}
      {mensajeError && <p style={{ color: PAARRIBA_COLORS.rojoError, fontWeight: 'bold', textAlign: 'center' }}>{mensajeError}</p>}

      {/* Formulario para registrar/editar compras */}
      <h3 style={{ color: PAARRIBA_COLORS.negro, marginTop: '30px', marginBottom: '15px' }}>
        {compraEditando ? 'Editar Compra' : 'Registrar Nueva Compra'}
      </h3>
      <form onSubmit={compraEditando ? actualizarCompra : registrarCompra} style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '15px', 
        maxWidth: '700px', 
        margin: '0 auto',
        padding: '25px',
        border: `1px solid ${PAARRIBA_COLORS.grisBorde}`,
        borderRadius: '8px',
        backgroundColor: PAARRIBA_COLORS.grisClaro
      }}>
        {/* Producto */}
        <div>
          <label htmlFor="producto" style={labelStyle}>Producto:</label>
          <input 
            type="text" 
            id="producto"
            name="producto" 
            placeholder="Ej: Arroz, Pollo" 
            value={compraEditando ? compraEditando.producto : nuevaCompra.producto} 
            onChange={manejarCambioNuevaCompra} 
            required 
            style={inputStyle}
          />
        </div>

        {/* Cantidad */}
        <div>
          <label htmlFor="cantidad" style={labelStyle}>Cantidad:</label>
          <input 
            type="number" 
            id="cantidad"
            name="cantidad" 
            placeholder="Ej: 50" 
            value={compraEditando ? compraEditando.cantidad : nuevaCompra.cantidad} 
            onChange={manejarCambioNuevaCompra} 
            required 
            min="0.01" 
            step="0.01"
            style={inputStyle}
          />
        </div>

        {/* Unidad */}
        <div>
          <label htmlFor="unidad" style={labelStyle}>Unidad:</label>
          <select 
            id="unidad"
            name="unidad" 
            value={compraEditando ? compraEditando.unidad : nuevaCompra.unidad} 
            onChange={manejarCambioNuevaCompra} 
            required 
            style={inputStyle}
          >
            <option value="">-- Selecciona Unidad --</option>
            {unidades.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Costo Unitario */}
        <div>
          <label htmlFor="costo_unitario" style={labelStyle}>Costo Unitario:</label>
          <input 
            type="number" 
            id="costo_unitario"
            name="costo_unitario" 
            placeholder="Ej: 0.75" 
            value={compraEditando ? compraEditando.costo_unitario : nuevaCompra.costo_unitario} 
            onChange={manejarCambioNuevaCompra} 
            required 
            min="0.01" 
            step="0.01"
            style={inputStyle}
          />
        </div>

        {/* Botón de Submit */}
        <button 
          type="submit"
          style={{ 
            ...buttonStyle, 
            gridColumn: '1 / -1', 
            backgroundColor: compraEditando ? PAARRIBA_COLORS.azulElectrico : PAARRIBA_COLORS.verdeDinamico, 
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = PAARRIBA_COLORS.naranjaVibrante}
          onMouseOut={e => e.currentTarget.style.backgroundColor = compraEditando ? PAARRIBA_COLORS.azulElectrico : PAARRIBA_COLORS.verdeDinamico}
        >
          {compraEditando ? 'Actualizar Compra' : 'Registrar Compra'}
        </button>

        {/* Botón de Cancelar Edición */}
        {compraEditando && (
          <button 
            type="button" 
            onClick={cancelarEdicionCompra}
            style={{ 
              ...buttonStyle, 
              gridColumn: '1 / -1',
              backgroundColor: PAARRIBA_COLORS.grisBorde,
              color: PAARRIBA_COLORS.negro
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = PAARRIBA_COLORS.negro}
            onMouseOut={e => e.currentTarget.style.backgroundColor = PAARRIBA_COLORS.grisBorde}
          >
            Cancelar Edición
          </button>
        )}
      </form>

      {/* 👇 NUEVO FORMULARIO DE FILTROS PARA COMPRAS 👇 */}
      <h3 style={{ color: PAARRIBA_COLORS.negro, marginTop: '50px', marginBottom: '15px' }}>Filtrar Historial de Compras</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '15px', 
        maxWidth: '700px', 
        margin: '0 auto',
        padding: '25px',
        border: `1px solid ${PAARRIBA_COLORS.grisBorde}`,
        borderRadius: '8px',
        backgroundColor: PAARRIBA_COLORS.grisClaro,
        marginBottom: '40px' 
      }}>
        {/* Fecha Inicio */}
        <div>
          <label htmlFor="filtroFechaInicio" style={labelStyle}>Fecha Inicio:</label>
          <input 
            type="date" 
            id="filtroFechaInicio"
            name="filtroFechaInicio" 
            value={filtroFechaInicio} 
            onChange={manejarCambioFiltro} 
            style={inputStyle}
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label htmlFor="filtroFechaFin" style={labelStyle}>Fecha Fin:</label>
          <input 
            type="date" 
            id="filtroFechaFin"
            name="filtroFechaFin" 
            value={filtroFechaFin} 
            onChange={manejarCambioFiltro} 
            style={inputStyle}
          />
        </div>

        {/* Filtrar por Producto */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="filtroProducto" style={labelStyle}>Filtrar por Producto:</label>
          <input 
            type="text" 
            id="filtroProducto"
            name="filtroProducto" 
            placeholder="Buscar producto..." 
            value={filtroProducto} 
            onChange={manejarCambioFiltro} 
            style={inputStyle}
          />
        </div>
      </div>


      {/* Sección para mostrar el historial de compras */}
      <h3 style={{ color: PAARRIBA_COLORS.negro, marginTop: '50px', marginBottom: '15px' }}>Historial Completo de Compras</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr style={{ backgroundColor: PAARRIBA_COLORS.verdeDinamico, color: PAARRIBA_COLORS.blanco }}>
            <th style={tableHeaderStyle}>ID</th>
            <th style={tableHeaderStyle}>Fecha</th>
            <th style={tableHeaderStyle}>Producto</th>
            <th style={tableHeaderStyle}>Cantidad</th>
            <th style={tableHeaderStyle}>Unidad</th>
            <th style={tableHeaderStyle}>Costo Unitario</th>
            <th style={tableHeaderStyle}>Costo Total</th>
            <th style={tableHeaderStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {compras.length > 0 ? (
            compras.map((compra) => (
              <tr key={compra.id} style={{ backgroundColor: PAARRIBA_COLORS.blanco, borderBottom: `1px solid ${PAARRIBA_COLORS.grisBorde}` }}>
                <td style={tableCellStyle}>{compra.id}</td>
                <td style={tableCellStyle}>{compra.fecha}</td>
                <td style={tableCellStyle}>{compra.producto}</td>
                <td style={tableCellStyle}>{compra.cantidad}</td>
                <td style={tableCellStyle}>{compra.unidad}</td>
                <td style={tableCellStyle}>${parseFloat(compra.costo_unitario).toFixed(2)}</td>
                <td style={{ ...tableCellStyle, fontWeight: 'bold' }}>${parseFloat(compra.costo_total).toFixed(2)}</td>
                <td style={tableCellStyle}>
                  <button 
                    onClick={() => iniciarEdicionCompra(compra)} 
                    style={{ ...actionButtonStyle, marginRight: '5px', backgroundColor: PAARRIBA_COLORS.azulElectrico }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = PAARRIBA_COLORS.naranjaVibrante}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = PAARRIBA_COLORS.azulElectrico}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => eliminarCompra(compra.id)} 
                    style={{ ...actionButtonStyle, backgroundColor: PAARRIBA_COLORS.rojoError }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = PAARRIBA_COLORS.negro}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = PAARRIBA_COLORS.rojoError}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ ...tableCellStyle, textAlign: 'center', fontStyle: 'italic' }}>
                No hay compras registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Estilos comunes
const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: `1px solid ${PAARRIBA_COLORS.grisBorde}`,
  fontSize: '1em',
  fontFamily: 'Montserrat, sans-serif',
  width: '100%',
  boxSizing: 'border-box'
};

const buttonStyle = {
  padding: '10px 20px',
  color: PAARRIBA_COLORS.blanco, 
  border: 'none', 
  borderRadius: '5px', 
  cursor: 'pointer',
  fontSize: '1em',
  fontWeight: 'bold',
  transition: 'background-color 0.3s ease'
};

const actionButtonStyle = {
  ...buttonStyle,
  padding: '8px 12px',
  fontSize: '0.8em',
  backgroundColor: PAARRIBA_COLORS.azulElectrico, 
  display: 'inline-block'
};

const tableHeaderStyle = {
  padding: '12px 8px',
  border: `1px solid ${PAARRIBA_COLORS.grisBorde}`,
  textAlign: 'left',
  fontSize: '0.9em'
};

const tableCellStyle = {
  padding: '8px',
  border: `1px solid ${PAARRIBA_COLORS.grisBorde}`,
  fontSize: '0.85em'
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: 'bold',
  color: PAARRIBA_COLORS.negro
};

export default Compras;
