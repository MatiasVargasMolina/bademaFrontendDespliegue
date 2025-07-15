import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    Pagination,
    Divider,
    Chip,
    Avatar,
    Stack,
    Grid
} from '@mui/material';
import { ArrowBack, CheckCircle, Pending, HourglassEmpty } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import axiosInstance from '../axiosConfig';
const Traza = () => {
    const authType = localStorage.getItem('_auth_type');  // e.g. 'Bearer'
    const token = localStorage.getItem('_auth');
    const authHeader = `${authType} ${token}`;
    const { obraId } = useParams();
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [paginaMateriales, setPaginaMateriales] = useState(1);
    const [paginaOrdenes, setPaginaOrdenes] = useState(1);
    const [materialSeleccionado, setMaterialSeleccionado] = useState(0);
    const [materiales, setMateriales] = useState([]);


    // Datos de ejemplo de órdenes de compra para cada material
    const [ordenesCompra, setOrdenesCompra] = useState([]);
    const fetchTrazas = async (obraId) => {
        // Aquí deberías hacer la llamada a tu API para obtener las trazas de la obra
        try {
            const response = await axiosInstance.get(`/badema/api/traza/materiales/${obraId}`, {
                headers: {
                    Authorization: authHeader
                }
            });
            console.log(response.data);
            setMateriales(response.data);

        } catch (error) {
            console.error('Error al obtener las trazas:', error);
        }
    };

    const materialesPorPagina = 8;
    const ordenesPorPagina = 4;

    const materialesPaginados = materiales.slice(
        (paginaMateriales - 1) * materialesPorPagina,
        paginaMateriales * materialesPorPagina
    );

    const materialActual = materialesPaginados[materialSeleccionado] || materialesPaginados[0];
    const ordenesDelMaterial = ordenesCompra[materialActual] || [];
    const ordenesPaginadas = ordenesDelMaterial.slice(
        (paginaOrdenes - 1) * ordenesPorPagina,
        paginaOrdenes * ordenesPorPagina
    );
    async function fetchDetalleOrdenes(idMaterial) {
        try {
            const response = await axiosInstance.get(`/badema/api/traza/ordenes/${obraId}/${idMaterial}`, {
                headers: {
                    Authorization: authHeader
                }
            });
            console.log(response.data);
            setOrdenesCompra(response.data);

        } catch (error) {
            console.error('Error al obtener los detalles de las órdenes:', error);
        }
    }

    const getEstadoIcon = (estado) => {
        switch (estado.toLowerCase()) {
            case 'completada':
                return <CheckCircle color="success" sx={{ fontSize: '1rem', mr: 1 }} />;
            case 'parcialmente entregada':
                return <HourglassEmpty color="warning" sx={{ fontSize: '1rem', mr: 1 }} />;
            case 'realizada':
                return <CheckCircle color="primary" sx={{ fontSize: '1rem', mr: 1 }} />;
            default:
                return <Pending color="action" sx={{ fontSize: '1rem', mr: 1 }} />;
        }
    };
    useEffect(() => {
        fetchTrazas(obraId);
    }, [obraId]);
    return (
        <Container maxWidth="xl" sx={{
            p: 3,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Botón de regreso */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ alignSelf: 'flex-end' }}
                >
                    Regresar
                </Button>
            </Box>
            {/* Contenido principal - 2 columnas (materiales y órdenes) */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden',
                gap: 2
            }}>
                {/* Columna 1: Lista de materiales (20%) */}
                <Paper sx={{
                    width: '20%',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Lista de materiales
                    </Typography>

                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Buscar materiales..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ mr: 1, color: 'action.active' }}>
                                    <SearchIcon fontSize="small" />
                                </Box>
                            ),
                        }}
                    />

                    <List sx={{
                        flex: 1,
                        overflowY: 'auto',
                        mb: 2,
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#888',
                            borderRadius: '3px',
                        }
                    }}>
                        {materiales
                            .map((material, index) => (
                                <ListItem
                                    key={index}
                                    button
                                    selected={materialSeleccionado === index}
                                    onClick={() => {
                                        setMaterialSeleccionado(material);
                                        setPaginaOrdenes(1);
                                        fetchDetalleOrdenes(material.idMaterial);
                                    }}
                                    sx={{
                                        mb: 0.5,
                                        borderRadius: 1,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.light',
                                            '&:hover': {
                                                bgcolor: 'primary.light'
                                            }
                                        }
                                    }}
                                >
                                    <ListItemText
                                        primary={material.nombreMaterial}
                                        primaryTypographyProps={{
                                            noWrap: true,
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                    <Chip
                                        label={material.cantidadOrdenesAsociadas}
                                        size="small"
                                        color="primary"
                                    />
                                </ListItem>
                            ))}
                    </List>

                    <Pagination
                        count={Math.ceil(materiales.length / materialesPorPagina)}
                        page={paginaMateriales}
                        onChange={(e, value) => setPaginaMateriales(value)}
                        size="small"
                        sx={{ alignSelf: 'center' }}
                    />
                </Paper>

                {/* Columna 2: Órdenes de compra (80%) */}
                <Box sx={{
                    width: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <Typography variant="h6" sx={{
                        mb: 2,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        Órdenes de compra para:
                        <Chip
                            label={materialSeleccionado?.nombreMaterial || ''}
                            color="primary"
                            sx={{ ml: 2, fontWeight: 'bold' }}
                        />
                    </Typography>

                    <Box sx={{
                        flex: 1,
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#888',
                            borderRadius: '3px',
                        }
                    }}>
                        {(ordenesCompra) ?
                            <Grid container spacing={2}>
                                {ordenesCompra.map((orden, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Paper sx={{
                                            p: 2,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: 1
                                            }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {orden.numeroOrden}
                                                </Typography>
                                                <Button
                                                    onClick={() => navigate(`/lectorArchivos/${obraId}`)}
                                                    sx={{ minWidth: 0, p: 0.5 }}
                                                >
                                                    <PictureAsPdfIcon color="error" />
                                                </Button>
                                            </Box>

                                            <Divider sx={{ mb: 2 }} />

                                            {/* Información del proveedor */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 'bold',
                                                    mb: 1,
                                                    color: 'text.secondary'
                                                }}>
                                                    Proveedor
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Avatar sx={{
                                                        width: 32,
                                                        height: 32,
                                                        mr: 1,
                                                        bgcolor: 'primary.main'
                                                    }}>
                                                        {orden.nombreProveedor.charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="body1" sx={{ fontWeight: '500' }}>
                                                        {orden.nombreProveedor}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                                    {orden.direccionProveedor}
                                                </Typography>
                                            </Box>

                                            {/* Detalles de la orden */}
                                            <Box sx={{ mb: 2 }}>
                                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                                        Cantidad:
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {orden.cantidadTotal} unidades
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                                        Precio:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                                        ${orden.precioUnitario}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                                        por unidad
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                                        Estado:
                                                    </Typography>
                                                    <Chip
                                                        label={orden.estado}
                                                        icon={getEstadoIcon(orden.estado)}
                                                        size="small"
                                                        color={
                                                            orden.estado === 'Completada' ? 'success' :
                                                                orden.estado === 'Parcialmente entregada' ? 'warning' :
                                                                    orden.estado === 'Realizada' ? 'primary' :
                                                                        'default'
                                                        }
                                                    />
                                                </Stack>
                                            </Box>

                                            {/* Progreso de entrega e instalación */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 'bold',
                                                    mb: 1,
                                                    color: 'text.secondary'
                                                }}>
                                                    Progreso
                                                </Typography>

                                                <Box sx={{ mb: 1.5 }}>
                                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                                        Entregado: {orden.cantidadEntregada}/{orden.cantidadTotal}
                                                    </Typography>
                                                    <Box sx={{
                                                        height: 6,
                                                        width: '100%',
                                                        backgroundColor: '#e0e0e0',
                                                        borderRadius: 3,
                                                        overflow: 'hidden'
                                                    }}>
                                                        <Box sx={{
                                                            height: '100%',
                                                            width: `${(orden.cantidadEntregada / orden.cantidadTotal) * 100}%`,
                                                            backgroundColor: 'primary.main'
                                                        }} />
                                                    </Box>
                                                </Box>

                                                <Box>
                                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                                        Instalado: {orden.cantidadInstalada}/{orden.cantidadTotal}
                                                    </Typography>
                                                    <Box sx={{
                                                        height: 6,
                                                        width: '100%',
                                                        backgroundColor: '#e0e0e0',
                                                        borderRadius: 3,
                                                        overflow: 'hidden'
                                                    }}>
                                                        <Box sx={{
                                                            height: '100%',
                                                            width: `${(orden.cantidadInstalada / orden.cantidadTotal) * 100}%`,
                                                            backgroundColor: 'secondary.main'
                                                        }} />
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Fechas importantes */}
                                            <Box sx={{ mt: 'auto' }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 'bold',
                                                    mb: 1,
                                                    color: 'text.secondary'
                                                }}>
                                                    Fechas
                                                </Typography>
                                                <Stack spacing={1}>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ display: 'block' }}>
                                                            Compra:
                                                        </Typography>
                                                        <Chip
                                                            label={orden.fechaCompra}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ display: 'block' }}>
                                                            Entrega estimada:
                                                        </Typography>
                                                        <Chip
                                                            label={orden.fechaEstimadaEntrega}
                                                            size="small"
                                                            variant="outlined"
                                                            color={
                                                                orden.estado === 'Entregado' ? 'success' :
                                                                    orden.estado === 'En proceso' ? 'warning' : 'default'
                                                            }
                                                        />
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid> : <><Typography>No hay órdenes de compra disponibles</Typography></>}
                    </Box>

                    {ordenesDelMaterial.length > ordenesPorPagina && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Pagination
                                count={Math.ceil(ordenesDelMaterial.length / ordenesPorPagina)}
                                page={paginaOrdenes}
                                onChange={(e, value) => setPaginaOrdenes(value)}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default Traza;