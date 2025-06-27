import React, { useState } from 'react';
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

const SeguimientoOrdenesCompra = () => {
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

    const ordenesPerPage = 5;
    const itemsPerPage = 3;

    // Datos de ejemplo de órdenes de compra
    // Datos de ejemplo de órdenes de compra (actualizados)
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

    // Filtrar órdenes
    const filteredOrdenes = ordenes.filter(orden =>
        orden.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.items.some(item =>
            item.materialNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.proveedorNombre.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

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
                            {filteredOrdenes
                                .slice((ordenesPage - 1) * ordenesPerPage, ordenesPage * ordenesPerPage)
                                .map(orden => (
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/lectorArchivos/${obraId}`);
                                                }}
                                                sx={{ mr: 1, color: 'error.main' }}
                                            >
                                                <DescriptionIcon />
                                            </IconButton>

                                            <ListItemText
                                                primary={orden.nombre}
                                                secondary={
                                                    <>
                                                        {orden.fecha} - {getEstadoOrden(orden)}
                                                        <br />
                                                        Realizado por: {orden.realizadoPor.nombre} ({orden.realizadoPor.rol})
                                                    </>
                                                }
                                                primaryTypographyProps={{ fontWeight: 'medium' }}
                                                sx={{ flex: 1 }}
                                            />

                                            {/* Botón para cancelar orden si está realizada - Versión compacta */}
                                            {getEstadoOrden(orden) === 'realizada' && (
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOrden(orden);
                                                        setOpenCancelarDialog(true);
                                                    }}
                                                    color="error"
                                                    sx={{ mr: 1 }}
                                                >
                                                    <Cancel />
                                                </IconButton>
                                            )}

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
                                                                }}
                                                                sx={{
                                                                    mb: 1,
                                                                    borderRadius: 1,
                                                                    backgroundColor: selectedItem?.id === item.id ? 'action.selected' : 'inherit'
                                                                }}
                                                            >
                                                                <ListItemText
                                                                    primary={`${item.materialNombre} - ${item.proveedorNombre}`}
                                                                    secondary={`${item.cantidad} unidades - ${item.total}`}
                                                                />
                                                                <Chip
                                                                    label={item.estado}
                                                                    color={
                                                                        item.estado === 'finalizada' ? 'success' : 'primary'
                                                                    }
                                                                    size="small"
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
                        {filteredOrdenes.length > ordenesPerPage && (
                            <Pagination
                                count={Math.ceil(filteredOrdenes.length / ordenesPerPage)}
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
                                            <Box component="span" fontWeight="bold">Proveedor:</Box> {selectedItem.proveedorNombre}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" fontWeight="bold">Cantidad:</Box> {selectedItem.cantidad} unidades
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" fontWeight="bold">Total:</Box> {selectedItem.total}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" fontWeight="bold">Estado:</Box>
                                            <Chip
                                                label={selectedItem.estado}
                                                color={
                                                    selectedItem.estado === 'finalizada' ? 'success' : 'primary'
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
                                            <Box component="span" fontWeight="bold">Fecha de compra:</Box> {selectedItem.fechaCompra || 'No especificada'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" fontWeight="bold">Fecha estimada de entrega:</Box> {selectedItem.fechaEntregaEstimada || 'No especificada'}
                                        </Typography>

                                        {/* Botones para subir documentos */}
                                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<LocalShipping />}
                                                onClick={() => navigate(`/lectorArchivos/${obraId}`)}
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
                                                Entregado: {selectedItem.entregado} / {selectedItem.cantidad} unidades
                                            </Typography>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={selectedItem.entregado}
                                                onChange={(e) => handleCambioSeguimiento(
                                                    selectedOrden.id,
                                                    selectedItem.id,
                                                    'entregado',
                                                    parseInt(e.target.value) || 0
                                                )}
                                                sx={{ width: 100 }}
                                                disabled={selectedItem.estado === 'finalizada'}
                                                inputProps={{
                                                    min: 0,
                                                    max: selectedItem.cantidad
                                                }}
                                            />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(selectedItem.entregado / selectedItem.cantidad) * 100}
                                            sx={{ height: 8, borderRadius: 4, mb: 3 }}
                                        />

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Construction sx={{ mr: 1, color: 'secondary.main' }} />
                                            <Typography sx={{ flex: 1 }}>
                                                Instalado: {selectedItem.instalado} / {selectedItem.cantidad} unidades
                                            </Typography>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={selectedItem.instalado}
                                                onChange={(e) => handleCambioSeguimiento(
                                                    selectedOrden.id,
                                                    selectedItem.id,
                                                    'instalado',
                                                    parseInt(e.target.value) || 0
                                                )}
                                                sx={{ width: 100 }}
                                                inputProps={{
                                                    min: 0,
                                                    max: selectedItem.entregado
                                                }}
                                            />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(selectedItem.instalado / selectedItem.cantidad) * 100}
                                            sx={{ height: 8, borderRadius: 4, mb: 3 }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Incidencias"
                                            multiline
                                            rows={3}
                                            value={selectedItem.incidencias || ''}
                                            onChange={(e) => handleCambioSeguimiento(
                                                selectedOrden.id,
                                                selectedItem.id,
                                                'incidencias',
                                                e.target.value
                                            )}
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
                                            {selectedItem.especificacionesProveedor.map((espec, i) => (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        width: 'calc(50% - 4px)', // para 2 por fila con un pequeño gap
                                                        display: 'flex',
                                                    }}
                                                >
                                                    <Chip
                                                        label={espec}
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
                                    {selectedItem.estado === 'realizada' && (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleFinalizarItem(selectedOrden.id, selectedItem.id)}
                                            disabled={selectedItem.entregado < selectedItem.cantidad}
                                        >
                                            Marcar como Finalizada
                                        </Button>
                                    )}
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