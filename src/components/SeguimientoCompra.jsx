import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
    TextField,
    LinearProgress,
    Chip,
    IconButton,
    Collapse,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    ArrowBack,
    LocalShipping,
    Construction,
    ExpandMore,
    ExpandLess,
    ListAlt,
    Cancel
} from '@mui/icons-material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig'; // Asegúrate de tener configurado axios para tus peticiones
import { generarOrdenCompraPDF } from '../utils/generarOrdenCompraPDF';

const SeguimientoOrdenesCompra = () => {
    const [valoresOriginales, setValoresOriginales] = useState({
        cantidadEntregada: null,
        cantidadInstalada: null,
    });
    const [incidencias, setIncidencias] = useState('');
    const { obraId } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedOrden, setExpandedOrden] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedOrden, setSelectedOrden] = useState(null);
    const [ordenesPage, setOrdenesPage] = useState(1);
    const [itemsPage, setItemsPage] = useState(1);
    const [openCancelarDialog, setOpenCancelarDialog] = useState(false);
    const [confirmCancelar, setConfirmCancelar] = useState(false);
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const [detallesItem, setDetallesItem] = useState(null);
    const authType = localStorage.getItem('_auth_type');  // e.g. 'Bearer'
    const token = localStorage.getItem('_auth');
    const authHeader = `${authType} ${token}`;
    const ordenesPerPage = 5;
    const itemsPerPage = 3;
    const [refreshPage, setRefreshPage] = useState(false);
    const handleActualizarSeguimiento = async () => {
        const deltaEntregada = detallesItem.cantidadEntregada - valoresOriginales.cantidadEntregada;
        const deltaInstalada = detallesItem.cantidadInstalada - valoresOriginales.cantidadInstalada;

        const cambios = deltaEntregada !== 0 || deltaInstalada !== 0;

        if (!cambios) {
            console.log('No hubo cambios, no se envía al backend');
            return;
        }

        try {
            const response = await axiosInstance.put(
                `/badema/api/seguimiento/detalle/actualizar/${selectedOrden.id}/${selectedItem.idMaterial}`,
                {
                    cantidadEntregada: deltaEntregada,
                    cantidadInstalada: deltaInstalada,
                    incidencias: incidencias
                },
                {
                    headers: {
                        Authorization: authHeader
                    }
                }
            );
            console.log('Respuesta de actualización:', response.data);
            if (response.status === 200) {
                setValoresOriginales({
                    cantidadEntregada: detallesItem.cantidadEntregada,
                    cantidadInstalada: detallesItem.cantidadInstalada,
                });
                fetchDetallesItem(selectedItem.idMaterial, selectedOrden.id);
                setRefreshPage(prev => !prev);
            } else {
                console.error('Error al actualizar las órdenes:', response.statusText);
            }
        } catch (error) {
            console.error('Error al actualizar las órdenes:', error);
        }
    };

    const [ordenes, setOrdenes] = useState([
        {
            id: 1,
            nombre: "Orden de compra #1",
            fecha: "2023-05-15",
            realizadoPor: {
                nombre: "Juan Pérez",
                rol: "Jefe de Compras",
                fechaAccion: "2023-05-15 09:30"
            },
            items: [
                {
                    id: 1,
                    materialNombre: "Tablones de roble 2x4",
                    proveedorNombre: "Maderera El Bosque",
                    cantidad: 100,
                    total: "S/ 2,500.00",
                    estado: "realizada",
                    especificacionesProveedor: [
                        "Madera de roble estándar",
                        "Dimensiones 1.9x3.9 pulgadas",
                        "Puede contener pequeños nudos"
                    ],
                    entregado: 0,
                    instalado: 0,
                    incidencias: "",
                    fechaCompra: "2023-05-15",
                    fechaEntregaEstimada: "2023-05-25"
                },
                {
                    id: 2,
                    materialNombre: "Clavos galvanizados 3\"",
                    proveedorNombre: "Suministros Industriales",
                    cantidad: 500,
                    total: "S/ 250.00",
                    estado: "realizada",
                    especificacionesProveedor: [
                        "Acero galvanizado grado industrial",
                        "Longitud exacta 3 pulgadas"
                    ],
                    entregado: 0,
                    instalado: 0,
                    incidencias: "",
                    fechaCompra: "2023-05-15",
                    fechaEntregaEstimada: "2023-05-25"
                }
            ]
        },
        {
            id: 2,
            nombre: "Orden de compra #2",
            fecha: "2023-05-18",
            realizadoPor: {
                nombre: "María Gómez",
                rol: "Coordinadora de Logística",
                fechaAccion: "2023-05-18 14:15"
            },
            items: [
                {
                    id: 3,
                    materialNombre: "Láminas de triplay 1/2\"",
                    proveedorNombre: "Acabados Premium",
                    cantidad: 30,
                    total: "S/ 1,350.00",
                    estado: "finalizada",
                    especificacionesProveedor: [
                        "Espesor exacto 1/2 pulgada",
                        "Dimensiones 4x8 pies"
                    ],
                    entregado: 30,
                    instalado: 30,
                    incidencias: "Retraso en entrega por clima",
                    fechaCompra: "2023-05-18",
                    fechaEntregaEstimada: "2023-05-25"
                }
            ]
        },
        {
            id: 3,
            nombre: "Orden de compra #3",
            fecha: "2023-05-10",
            realizadoPor: {
                nombre: "Carlos Ruiz",
                rol: "Administrador de Proyectos",
                fechaAccion: "2023-05-10 11:45"
            },
            items: [
                {
                    id: 4,
                    materialNombre: "Barniz transparente",
                    proveedorNombre: "Químicos Industriales",
                    cantidad: 20,
                    total: "S/ 650.00",
                    estado: "finalizada",
                    especificacionesProveedor: [
                        "Transparente ultrabrillante",
                        "Resistente a rayos UV"
                    ],
                    entregado: 20,
                    instalado: 18,
                    incidencias: "2 unidades dañadas en transporte",
                    fechaCompra: "2023-05-10",
                    fechaEntregaEstimada: "2023-05-15"
                }
            ]
        }
    ]);
    async function fetchDetallesItem(itemId, ordenId) {
        try {
            const response = await axiosInstance.get(`/badema/api/seguimiento/detalle/${ordenId}/${itemId}`, {
                headers: {
                    Authorization: authHeader
                }
            });
            if (response.status === 200) {
                const itemData = response.data;
                setDetallesItem(itemData);
                setValoresOriginales({
                    cantidadEntregada: itemData.cantidadEntregada,
                    cantidadInstalada: itemData.cantidadInstalada,
                });
                console.log('Detalles del item:', itemData);
                setRefreshPage(prev => !prev); // Forzar actualización de la página
            }
        } catch (error) {
            console.error('Error al obtener los detalles del item:', error);
        }
    }
    const ordenTest = {
        numero: 1234,
        proveedorNombre: "Proveedores S.A.",
        proveedorRut: "76.123.456-7",
        proveedorDireccion: "Av. Siempre Viva 742",
        proveedorComuna: "Santiago",
        proveedorTelefono: "+56911112222",
        proveedorEmail: "contacto@proveedor.cl",
        items: [
            {
                descripcion: "Cemento gris",
                unidad: "saco",
                cantidad: 50,
                precioUnitario: 3000,
                descuento: 5,
                valor: 142500,
            }
        ],
        totalNeto: 142500,
        totalDescuento: 7500,
        iva: 25650,
        total: 160650,
        lugarDespacho: "Obra San Miguel",
        recepciona: "Carlos Pérez",
        fechaInicio: "2025-07-15",
        condiciones: "30 días factura"
    }
    async function fetchOrdenesCompra() {
        try {
            const response = await axiosInstance.get(`/badema/api/seguimiento/ordenes/${obraId}`, {
                headers: {
                    Authorization: authHeader
                },
            });
            console.log(response.data);
            if (response.status === 200) {
                setOrdenes(response.data);
            } else {
                console.error('Error al obtener las órdenes de compra:', response.statusText);
            }
        } catch (error) {
            console.error('Error al obtener las órdenes de compra:', error);
        }
    }
    function adaptarDatosDesdeBackend(datosBackend) {
        return {
            numero: datosBackend.numeroOrden,
            fecha: datosBackend.fechaEmision,
            proveedorNombre: datosBackend.nombreProveedor,
            proveedorRut: datosBackend.rutProveedor || '',
            proveedorDireccion: datosBackend.direccionProveedor || '',
            proveedorComuna: '', // Si tienes comuna, colócala aquí
            proveedorTelefono: datosBackend.telefonoVendedor || '',
            proveedorEmail: datosBackend.emailVendedor || '',
            proveedorAtencion: datosBackend.nombreVendedor || '',
            valorUF: '',
            empresaRut: '76.504.799-4', // Puedes ponerlo fijo si aplica
            empresaDireccion: 'Capitán Ignacio Carrera Pinto Nº 4846 J1',
            empresaComuna: 'Macul',
            obra: datosBackend.obraNombre,
            lugarDespacho: 'VENTURA LAVALLE 470, SANTIAGO', // Completar si está en la data
            recepciona: 'Sr. Christian Abarca Cel: +569-961146671',    // Completar si está en la data
            fechaInicio: 'Según programa de obra',   // Completar si está en la data
            condicionesPago: datosBackend.condiciones, // Completar si está en la data
            totalNeto: datosBackend.totalNeto,
            totalDescuento: 0,
            totalNetoFinal: datosBackend.totalNeto,
            iva: datosBackend.iva,
            total: datosBackend.totalGlobal,
            items: datosBackend.items.map(item => ({
                codigo: '',
                descripcion: item.nombreMaterial,
                unidad: 'UN',
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                descuento: 0,
                valor: item.precioUnitario * item.cantidad
            }))
        };
    }

    // Cargar órdenes al montar el componente
    useEffect(() => {
        fetchOrdenesCompra();
    }, [obraId, refreshPage]);
    // Manejar cambios en los campos de seguimiento
    const handleCambioSeguimiento = (ordenId, itemId, campo, valor) => {
        setOrdenes(prev => prev.map(orden => {
            if (orden.id === ordenId) {
                const updatedItems = orden.items.map(item =>
                    item.id === itemId ? { ...item, [campo]: valor } : item
                );

                // Actualizar el selectedItem si es el que estamos modificando
                if (selectedItem && selectedItem.id === itemId) {
                    setSelectedItem(prev => ({ ...prev, [campo]: valor }));
                }

                return {
                    ...orden,
                    items: updatedItems
                };
            }
            return orden;
        }));
    };

    // Cambiar estado del item a finalizada
    const handleFinalizarItem = (ordenId, itemId) => {
        setOrdenes(prev => prev.map(orden => {
            if (orden.id === ordenId) {
                const updatedItems = orden.items.map(item =>
                    item.id === itemId ? { ...item, estado: 'finalizada' } : item
                );

                return {
                    ...orden,
                    items: updatedItems
                };
            }
            return orden;
        }));

        // Actualizar la vista si es el item seleccionado
        if (selectedItem?.id === itemId) {
            setSelectedItem(prev => ({ ...prev, estado: 'finalizada' }));
        }
    };

    // Cancelar una orden realizada
    const handleCancelarOrden = (ordenId) => {
        setOrdenes(prev => prev.filter(orden => orden.id !== ordenId));
        if (selectedOrden?.id === ordenId) {
            setSelectedOrden(null);
            setSelectedItem(null);
        }
        setOpenCancelarDialog(false);
        setConfirmCancelar(false);
        setMotivoCancelacion('');
    };
    const generarOrdenDeCompra = async (idOrden) => {

        const resp = await axiosInstance.get(`/badema/api/ordencompra/documento/${idOrden}`, { headers: { Authorization: authHeader } });
        const datosAdaptados = adaptarDatosDesdeBackend(resp.data);
        generarOrdenCompraPDF(datosAdaptados)
        console.log("DATOS PDF")
        console.log(resp.data);
    }
    // Verificar estado general de la orden
    const getEstadoOrden = (orden) => {
        if (orden.items.every(item => item.estado === 'finalizada')) {
            return 'finalizada';
        }
        return 'realizada';
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Diálogo para cancelar orden */}
            <Dialog open={openCancelarDialog} onClose={() => {
                setOpenCancelarDialog(false);
                setConfirmCancelar(false);
                setMotivoCancelacion('');
            }}>
                {!confirmCancelar ? (
                    <>
                        <DialogTitle>¿Por qué cancela la orden?</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Motivo de cancelación"
                                type="text"
                                fullWidth
                                multiline
                                rows={4}
                                value={motivoCancelacion}
                                onChange={(e) => setMotivoCancelacion(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                setOpenCancelarDialog(false);
                                setMotivoCancelacion('');
                            }}>Cancelar</Button>
                            <Button
                                onClick={() => setConfirmCancelar(true)}
                                disabled={!motivoCancelacion.trim()}
                                color="error"
                            >
                                Confirmar Cancelación
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <>
                        <DialogTitle>Confirmación</DialogTitle>
                        <DialogContent>
                            <Typography>Esta acción es irreversible. ¿Estás seguro de cancelar esta orden?</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setConfirmCancelar(false)}>No</Button>
                            <Button
                                onClick={() => handleCancelarOrden(selectedOrden.id)}
                                color="error"
                                variant="contained"
                            >
                                Sí, cancelar orden
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Título */}
            <Box sx={{ textAlign: 'center', mb: 4, width: '100%' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Seguimiento de Órdenes de Compra
                </Typography>
            </Box>

            {/* Tarjetas principales */}
            <Grid container spacing={3} justifyContent="center" sx={{ width: '100%', maxWidth: '1800px' }}>
                {/* Tarjeta 1: Lista de órdenes */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                            Lista de Órdenes
                        </Typography>

                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Buscar órdenes..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setOrdenesPage(1);
                            }}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: <ListAlt fontSize="small" sx={{ mr: 1 }} />
                            }}
                        />

                        <List sx={{ flex: 1, overflow: 'auto' }}>
                            {ordenes
                                ?.map(orden => (
                                    <React.Fragment key={orden.id}>
                                        <ListItem
                                            button
                                            onClick={() => setExpandedOrden(expandedOrden === orden.id ? null : orden.id)}
                                            sx={{
                                                backgroundColor: expandedOrden === orden.id ? 'action.selected' : 'inherit',
                                                pr: 1 // Añadir padding derecho para mejor espaciado
                                            }}
                                        >
                                            {/* Icono para ver PDF */}
                                            <IconButton
                                                onClick={() => generarOrdenDeCompra(orden.id)}
                                                sx={{ mr: 1, color: 'error.main' }}
                                            >
                                                <DescriptionIcon />
                                            </IconButton>

                                            <ListItemText
                                                primary={orden.numeroOrden}
                                                secondary={
                                                    <>
                                                        {orden.fechaEmision} - {orden.estado}
                                                        <br />
                                                        Realizado por: {orden.responsable}
                                                    </>
                                                }
                                                primaryTypographyProps={{ fontWeight: 'medium' }}
                                                sx={{ flex: 1 }}
                                            />

                                            

                                            <IconButton>
                                                {expandedOrden === orden.id ? <ExpandLess /> : <ExpandMore />}
                                            </IconButton>
                                        </ListItem>

                                        <Collapse in={expandedOrden === orden.id} timeout="auto" unmountOnExit>
                                            <Box sx={{ pl: 2, pr: 1, py: 1, backgroundColor: 'background.default' }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder="Buscar materiales..."
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        startAdornment: <ListAlt fontSize="small" sx={{ mr: 1 }} />
                                                    }}
                                                />
                                                <List dense>
                                                    {orden.items
                                                        .slice((itemsPage - 1) * itemsPerPage, itemsPage * itemsPerPage)
                                                        .map(item => (
                                                            <ListItem
                                                                key={item.id}
                                                                button
                                                                selected={selectedItem?.id === item.id}
                                                                onClick={() => {
                                                                    setSelectedItem(item);
                                                                    setSelectedOrden(orden);
                                                                    fetchDetallesItem(item.idMaterial, orden.id);
                                                                }}
                                                                sx={{
                                                                    mb: 1,
                                                                    borderRadius: 1,
                                                                    backgroundColor: selectedItem?.id === item.id ? 'action.selected' : 'inherit'
                                                                }}
                                                            >
                                                                <ListItemText
                                                                    primary={`${item.nombreMaterial} - ${orden.nombreProveedor}`}
                                                                    secondary={`${item.cantidad} unidades - ${item.total}`}
                                                                />

                                                            </ListItem>
                                                        ))}
                                                </List>
                                                {orden.items.length > itemsPerPage && (
                                                    <Pagination
                                                        count={Math.ceil(orden.items.length / itemsPerPage)}
                                                        page={itemsPage}
                                                        onChange={(e, page) => setItemsPage(page)}
                                                        size="small"
                                                        sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}
                                                    />
                                                )}
                                            </Box>
                                        </Collapse>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                        </List>
                        {ordenes.length > ordenesPerPage && (
                            <Pagination
                                count={Math.ceil(ordenes.length / ordenesPerPage)}
                                page={ordenesPage}
                                onChange={(e, page) => setOrdenesPage(page)}
                                color="primary"
                                size="small"
                                sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}
                            />
                        )}
                    </Paper>
                </Grid>

                {/* Tarjeta 2: Detalles del item seleccionado */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3, height: '80vh', display: 'flex', flexDirection: 'column' }}>
                        {selectedItem ? (
                            <>
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 'bold',
                                            mb: 2,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {selectedItem.materialNombre}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                                        <Typography variant="body2">
                                            <Box component="span" fontWeight="bold">Proveedor:</Box> {detallesItem?.nombreProveedor}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" fontWeight="bold">Cantidad:</Box> {detallesItem?.cantidadOrdenada} unidades
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" fontWeight="bold">Total:</Box> {detallesItem?.precioTotal}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" fontWeight="bold">Estado:</Box>
                                            <Chip
                                                label={detallesItem?.estado}
                                                color={
                                                    detallesItem?.estado === 'finalizada' ? 'success' : 'primary'
                                                }
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        </Typography>
                                    </Box>

                                    {/* Sección de fechas */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Fechas Importantes
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" fontWeight="bold">Fecha de compra:</Box> {detallesItem?.fechaCompra || 'No especificada'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" fontWeight="bold">Fecha estimada de entrega:</Box> {detallesItem?.fechaEstimadaEntrega || 'No especificada'}
                                        </Typography>

                                        {/* Botones para subir documentos */}
                                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<LocalShipping />}
                                                onClick={() => navigate(`/lectorArchivos/${obraId}/${detallesItem?.idDetalleOrden}`)}
                                                sx={{ flex: 1 }}
                                            >
                                                Subir Guía de Despacho
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* Sección de seguimiento */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                            Seguimiento de Entrega
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography sx={{ flex: 1 }}>
                                                Recibido: {detallesItem?.cantidadEntregada} / {detallesItem?.cantidadOrdenada} unidades
                                            </Typography>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={detallesItem?.cantidadEntregada === 0 ? '' : detallesItem?.cantidadEntregada}
                                                onChange={(e) => {
                                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                    setDetallesItem(prev => ({
                                                        ...prev,
                                                        cantidadEntregada: isNaN(value) ? 0 : value
                                                    }));
                                                }}
                                                sx={{ width: 100 }}
                                                disabled={selectedItem?.estado === 'finalizada'}
                                                inputProps={{
                                                    min: 0,
                                                    max: selectedItem.cantidad,
                                                    step: 1
                                                }}
                                            />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(detallesItem?.cantidadEntregada / detallesItem?.cantidadOrdenada) * 100}
                                            sx={{ height: 8, borderRadius: 4, mb: 3 }}
                                        />

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Construction sx={{ mr: 1, color: 'secondary.main' }} />
                                            <Typography sx={{ flex: 1 }}>
                                                Entregado: {detallesItem?.cantidadInstalada} / {detallesItem?.cantidadOrdenada} unidades
                                            </Typography>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={detallesItem?.cantidadInstalada === 0 ? '' : detallesItem?.cantidadInstalada}
                                                onChange={(e) => {
                                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                    setDetallesItem(prev => ({
                                                        ...prev,
                                                        cantidadInstalada: isNaN(value) ? 0 : value
                                                    }));
                                                }}
                                                sx={{ width: 100 }}
                                                inputProps={{
                                                    min: 0,
                                                    max: selectedItem.cantidad,
                                                    step: 1
                                                }}
                                            />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(detallesItem?.cantidadInstalada / detallesItem?.cantidadOrdenada) * 100}
                                            sx={{ height: 8, borderRadius: 4, mb: 3 }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Incidencias"
                                            multiline
                                            rows={3}
                                            value={incidencias || ''}
                                            onChange={(e) => setIncidencias(e.target.value)}
                                        />
                                    </Box>

                                    {/* Especificaciones técnicas */}
                                    <Box>
                                        <Typography variant="subtitle1" sx={{
                                            fontWeight: 'bold',
                                            mb: 1,
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <ListAlt sx={{ mr: 1 }} />
                                            Especificaciones Técnicas:
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                            }}
                                        >
                                            {Object.entries(detallesItem?.especificaciones || {})
                                                .filter(([key]) => key !== "id" && key !== "idProveedorMaterial")
                                                .map(([key, value]) => (
                                                    <Box
                                                        key={key}
                                                        sx={{
                                                            width: 'calc(50% - 4px)',
                                                            display: 'flex',
                                                        }}
                                                    >
                                                        <Chip
                                                            label={`${key}: ${value.valor}`}
                                                            size="small"
                                                            color="default"
                                                            variant="outlined"
                                                            sx={{ flexGrow: 1 }}
                                                        />
                                                    </Box>
                                                ))}

                                        </Box>
                                    </Box>
                                </Box>

                                {/* Botones según estado */}
                                <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleActualizarSeguimiento()}
                                        disabled={selectedItem.entregado < selectedItem.cantidad}
                                    >
                                        Marcar Recepción
                                    </Button>

                                </Box>
                            </>
                        ) : (
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center'
                            }}>
                                <Typography variant="body1">
                                    Seleccione un item de la lista para ver los detalles
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Botón de regreso */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, width: '100%', maxWidth: '1800px' }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                >
                    Regresar
                </Button>
            </Box>
        </Container>
    );
};

export default SeguimientoOrdenesCompra;