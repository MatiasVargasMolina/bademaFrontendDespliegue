import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Pagination,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    InputAdornment,
    Avatar,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import {
    ArrowBack,
    ZoomIn,
    ZoomOut,
    Fullscreen,
    Download,
    Print,
    NavigateBefore,
    NavigateNext,
    Folder,
    Description,
    Assignment,
    Receipt,
    Inventory,
    Search
} from '@mui/icons-material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from '../axiosConfig';
const LectorArchivos = () => {
    const [searchParams] = useSearchParams();
    const obraId = searchParams.get('obraId');
    const idOrden = searchParams.get('idOrden');
    const idSeguimiento = searchParams.get('idSeguimiento');
    const idDetalleOrdenCompra = searchParams.get('idDetalleOrdenCompra');
    const authType = localStorage.getItem('_auth_type');  // e.g. 'Bearer'
    const token = localStorage.getItem('_auth');       // tu JWT
    const authHeader = `${authType} ${token}`;
    const navigate = useNavigate();
    const [zoom, setZoom] = useState(100);
    const [carpetaSeleccionada, setCarpetaSeleccionada] = useState(null);
    const [paginaArchivos, setPaginaArchivos] = useState(1);
    const [busqueda, setBusqueda] = useState('');
    const archivosPorPagina = 5;
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [openDialog, setOpenDialog] = useState(false);
    const [carpetaSeleccionadaDialog, setCarpetaSeleccionadaDialog] = useState(null);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [archivos, setArchivos] = useState([]);
    const [archivoVistaPrevia, setArchivoVistaPrevia] = useState(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Datos de ejemplo para las carpetas
    const [documentosDeObra, setDocumentosDeObra] = useState([])
    const cargarVistaPrevia = async (archivo) => {
        try {
            const response = await axiosInstance.get(
                `/badema/api/seguimiento/guias/archivos/pdf/${archivo.id}`,
                {
                    headers: {
                        Authorization: authHeader
                    },
                    responseType: 'blob'
                }
            );
            const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setArchivoVistaPrevia({ url, nombre: archivo.nombreArchivo });
        } catch (err) {
            console.error('Error al cargar vista previa:', err);
            setSnackbar({
                open: true,
                message: 'No se pudo cargar vista previa del archivo.',
                severity: 'error'
            });
        }
    };

    const carpetas = [
        {
            id: 'obra',
            nombre: 'Documentos de Obra',
            icono: <Folder fontSize="medium" />,
            color: '#4e342e'
        },
        {
            id: 'pedido',
            nombre: 'Certificaciones',
            icono: <Description fontSize="medium" />,
            color: '#2e7d32'
        },
        {
            id: 'ordenCompra',
            nombre: 'Órdenes de Compra',
            icono: <Assignment fontSize="medium" />,
            color: '#1565c0'
        },
        {
            id: 'detalleOC',
            nombre: 'Varios/Otros',
            icono: <Receipt fontSize="medium" />,
            color: '#6a1b9a'
        },
        {
            id: 'recepcion',
            nombre: 'Recepción',
            icono: <Inventory fontSize="medium" />,
            color: '#d84315'
        }
    ];

    // Datos de ejemplo para los archivos
    const archivosPorCarpeta = {
        obra: [
            { id: 1, nombre: 'Planos arquitectónicos.pdf', fecha: '2023-05-15' },
            { id: 2, nombre: 'Memoria descriptiva.pdf', fecha: '2023-05-16' },
            { id: 3, nombre: 'Especificaciones técnicas.pdf', fecha: '2023-05-17' },
            { id: 4, nombre: 'Cronograma de obra.pdf', fecha: '2023-05-18' },
            { id: 5, nombre: 'Presupuesto.pdf', fecha: '2023-05-19' },
            { id: 6, nombre: 'Permisos municipales.pdf', fecha: '2023-05-20' }
        ],
        pedido: [
            { id: 1, nombre: 'Certificación pedido #123.pdf', fecha: '2023-06-01' },
            { id: 2, nombre: 'Certificación pedido #124.pdf', fecha: '2023-06-02' }
        ],
        ordenCompra: [
            { id: 1, nombre: 'OC-2023-001.pdf', fecha: '2023-06-10' },
            { id: 2, nombre: 'OC-2023-002.pdf', fecha: '2023-06-11' }
        ],
        detalleOC: [
            { id: 1, nombre: 'Certificado calidad acero.pdf', fecha: '2023-06-15' },
            { id: 2, nombre: 'Certificado calidad cemento.pdf', fecha: '2023-06-16' }
        ],
        recepcion: [
            { id: 1, nombre: 'Guía despacho #4567.pdf', fecha: '2023-06-20' },
            { id: 2, nombre: 'Guía despacho #4568.pdf', fecha: '2023-06-21' }
        ]
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
        setCarpetaSeleccionadaDialog(null);
        setArchivoSeleccionado(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSeleccionarCarpetaDialog = (carpeta) => {
        setCarpetaSeleccionadaDialog(carpeta);
        console.log("Carpeta seleccionada:", carpeta);
    };

    const handleFileChange = (event) => {
        setArchivoSeleccionado(event.target.files[0]);

    };

    const handleSubirPDF = async () => {
        if (!carpetaSeleccionadaDialog || !archivoSeleccionado) {
            setSnackbar({
                open: true,
                message: 'Debes seleccionar una carpeta y un archivo',
                severity: 'error'
            });
            return;
        }

        // Si es carpeta "recepcion", necesitamos el idDetalleOrdenCompra
        if (carpetaSeleccionadaDialog.id === 'recepcion' && !idDetalleOrdenCompra) {
            setSnackbar({
                open: true,
                message: 'No se puede subir guía sin idDetalleOrdenCompra',
                severity: 'error'
            });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("file", archivoSeleccionado);

        try {
            let response;

            if (carpetaSeleccionadaDialog.id === 'recepcion') {
                // Enviar a la API de guías, con idDetalleOrdenCompra en la ruta
                response = await axiosInstance.post(
                    `/badema/api/seguimiento/guias/subir/${idDetalleOrdenCompra}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: authHeader
                        }
                    }
                );
            }
            if (carpetaSeleccionadaDialog.id === 'ordenCompra') {
                // Actualizar la lista de documentos de obra
                const response = await axiosInstance.post(
                    `/badema/api/ordencompra/subir/${idOrden}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: authHeader
                        }
                    }
                );
                console.log("Respuesta de subir archivo a orden de compra:", response.data);
            }
            if (carpetaSeleccionadaDialog.id === 'obra') {
                // Actualizar la lista de documentos de obra
                const response = await axiosInstance.post(
                    `/badema/api/obra/subir/${obraId}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: authHeader
                        }
                    }
                );
                console.log("Respuesta de subir archivo a obra:", response.data);
            }

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(response.data || "Error al subir archivo");
            }

            setSnackbar({
                open: true,
                message: 'Archivo subido correctamente',
                severity: 'success'
            });
            setOpenDialog(false);

            if (carpetaSeleccionadaDialog.id === 'recepcion') {
                await handleSeleccionarCarpeta(carpetaSeleccionadaDialog);
            }

        } catch (error) {
            const mensaje = error.response?.data || error.message || "Error inesperado";
            setSnackbar({
                open: true,
                message: `Error al subir archivo: ${mensaje}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };



    // Filtrar y paginar archivos
    const archivosFiltrados = documentosDeObra
        .filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    const archivosPaginados = archivosFiltrados.slice(
        (paginaArchivos - 1) * archivosPorPagina,
        paginaArchivos * archivosPorPagina
    );

    const handleSeleccionarCarpeta = async (carpeta) => {
        setCarpetaSeleccionada(carpeta);
        console.log(carpeta)
        if (carpeta.id === 'recepcion') {
            const response = await axiosInstance.get(
                `/badema/api/seguimiento/guias/archivos/${idDetalleOrdenCompra}`,
                {
                    headers: {
                        Authorization: authHeader
                    }
                }
            );
            setArchivos(response.data);
            console.log("Archivos de recepción:", response.data);
        }
        if (carpeta.id === 'ordenCompra') {
            const response = await axiosInstance.get(
                `/badema/api/ordencompra/archivos/${idOrden}`,
                {
                    headers: {
                        Authorization: authHeader
                    }
                }
            );
            setArchivos(response.data);
            console.log("Archivos de orden de compra:", response.data);
        }
        if (carpeta.id === 'obra') {
            const response = await axiosInstance.get(
                `/badema/api/obra/archivos/${obraId}`,
                {
                    headers: {
                        Authorization: authHeader
                    }
                }
            );
            setArchivos(response.data);
            console.log("Archivos de obra:", response.data);
        }

        setPaginaArchivos(1);
        setBusqueda('');
    };

    return (
        <Box sx={{
            p: 3,
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Título */}
            <Box sx={{
                textAlign: 'center',
                mb: 3,
                flexShrink: 0
            }}>
                <Typography variant="h4" component="h1">
                    Documentos - Obra #{obraId}
                </Typography>
            </Box>

            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                flex: 1,
                mb: 3,
                width: '100%',
                overflow: 'hidden'
            }}>
                <Grid
                    container
                    spacing={3}
                    sx={{
                        maxWidth: '95%',
                        height: '100%',
                        margin: '0 auto',
                        overflow: 'hidden'
                    }}
                >
                    {/* Primera columna: Carpetas de documentos (15%) */}
                    <Grid
                        item
                        xs={12}
                        md={2}
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: isSmallScreen ? '100%' : '200px'
                        }}
                    >
                        <Paper sx={{
                            flex: 1,
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Carpetas
                            </Typography>
                            <List sx={{
                                overflowY: 'auto',
                                flex: 1,
                                '&::-webkit-scrollbar': {
                                    width: '6px'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: theme.palette.grey[400],
                                    borderRadius: '3px'
                                }
                            }}>
                                {carpetas.map((carpeta) => (
                                    <ListItem
                                        key={carpeta.id}
                                        button
                                        selected={carpetaSeleccionada?.id === carpeta.id}
                                        onClick={() => handleSeleccionarCarpeta(carpeta)}
                                        sx={{
                                            mb: 1,
                                            borderRadius: 1,
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.light',
                                                '&:hover': {
                                                    bgcolor: 'primary.light'
                                                }
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: '36px' }}>
                                            <Avatar sx={{
                                                bgcolor: carpeta.color,
                                                width: 32,
                                                height: 32
                                            }}>
                                                {carpeta.icono}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={carpeta.nombre}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                fontWeight: carpetaSeleccionada?.id === carpeta.id
                                                    ? 'bold'
                                                    : 'normal'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Button
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                onClick={handleOpenDialog}
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Subir PDF
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Segunda columna: Visor de PDF (70%) */}
                    <Grid
                        item
                        xs={12}
                        md={7}
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Paper sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            minWidth: '800px'
                        }}>
                            {/* Barra de herramientas del PDF */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1,
                                bgcolor: 'background.paper',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                flexShrink: 0
                            }}>
                                <IconButton onClick={() => setZoom(Math.max(50, zoom - 10))}>
                                    <ZoomOut />
                                </IconButton>
                                <Typography variant="body2" sx={{ mx: 1 }}>
                                    {zoom}%
                                </Typography>
                                <IconButton onClick={() => setZoom(Math.min(200, zoom + 10))}>
                                    <ZoomIn />
                                </IconButton>
                                <IconButton sx={{ ml: 1 }}>
                                    <Fullscreen />
                                </IconButton>
                                <IconButton>
                                    <Download />
                                </IconButton>
                                <IconButton>
                                    <Print />
                                </IconButton>
                                <Box sx={{ flexGrow: 1 }} />
                                <IconButton disabled>
                                    <NavigateBefore />
                                </IconButton>
                                <Typography variant="body2" sx={{ mx: 1 }}>
                                    Página 1 de 1
                                </Typography>
                                <IconButton disabled>
                                    <NavigateNext />
                                </IconButton>
                            </Box>

                            {/* Vista del PDF */}
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: theme.palette.background.default, // Usando el color de fondo del tema
                                p: 2,
                                overflow: 'auto',
                                '&::-webkit-scrollbar': {
                                    width: '6px'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: theme.palette.action.selected, // Usando el color de selección
                                    borderRadius: '3px'
                                }
                            }}>
                                <Paper sx={{
                                    p: 2,
                                    bgcolor: theme.palette.background.paper, // Fondo del papel consistente
                                    boxShadow: 3,
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: 'top center',
                                    width: 'fit-content',
                                    minWidth: '300px',
                                    border: `1px solid ${theme.palette.divider}` // Borde sutil
                                }}>
                                    <Typography variant="h6" sx={{
                                        textAlign: 'center',
                                        mb: 2,
                                        color: theme.palette.text.primary // Color de texto principal
                                    }}>
                                        {carpetaSeleccionada
                                            ? ` || 'Seleccione un archivo'}`
                                            : 'Seleccione una carpeta para comenzar'}
                                    </Typography>
                                    <Typography sx={{
                                        textAlign: 'center',
                                        color: theme.palette.text.secondary // Color de texto secundario
                                    }}>
                                        <Box
                                            sx={{
                                                flex: 1,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                bgcolor: theme.palette.background.default,
                                                p: 2,
                                                overflow: 'auto',
                                                '&::-webkit-scrollbar': {
                                                    width: '6px'
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: theme.palette.action.selected,
                                                    borderRadius: '3px'
                                                }
                                            }}
                                        >
                                            {archivoVistaPrevia ? (
                                                <Box sx={{ width: '100%' }}>
                                                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
                                                        Visualizando: {archivoVistaPrevia.nombre}
                                                    </Typography>
                                                    <iframe
                                                        src={archivoVistaPrevia.url}
                                                        title="Vista previa PDF"
                                                        width="100%"
                                                        height="600px"
                                                        style={{ border: 'none' }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                                    Selecciona un archivo PDF para previsualizarlo.
                                                </Typography>
                                            )}
                                        </Box>
                                    </Typography>
                                </Paper>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Tercera columna: Lista de archivos (15%) */}
                    <Grid
                        item
                        xs={12}
                        md={3}
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: isSmallScreen ? '100%' : '250px'
                        }}
                    >
                        <Paper sx={{
                            flex: 1,
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                {carpetaSeleccionada?.nombre || 'Archivos'}
                            </Typography>

                            {carpetaSeleccionada ? (
                                <>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Buscar archivos..."
                                        value={busqueda}
                                        onChange={(e) => {
                                            setBusqueda(e.target.value);
                                            setPaginaArchivos(1);
                                        }}
                                        sx={{ mb: 2 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <List sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        p: 0,
                                        '&::-webkit-scrollbar': {
                                            width: '6px'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: theme.palette.grey[400],
                                            borderRadius: '3px'
                                        }
                                    }}>
                                        {archivos.length > 0 ? (
                                            archivos.map((archivo) => (
                                                <ListItem
                                                    key={archivo.id}
                                                    onClick={() => cargarVistaPrevia(archivo)}
                                                    button
                                                    sx={{
                                                        borderBottom: '1px solid',
                                                        borderColor: 'divider',
                                                        '&:last-child': {
                                                            borderBottom: 'none'
                                                        },
                                                        '&:hover': {
                                                            bgcolor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={archivo.nombreArchivo}
                                                        secondary={`Subido: ${archivo.fechaSubida}`}
                                                        primaryTypographyProps={{
                                                            variant: 'body2',
                                                            noWrap: true
                                                        }}
                                                        secondaryTypographyProps={{
                                                            variant: 'caption',
                                                            noWrap: true
                                                        }}
                                                    />
                                                </ListItem>
                                            ))
                                        ) : (
                                            <Box sx={{
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 2
                                            }}>
                                                <Typography variant="body2" color="text.secondary" align="center">
                                                    {busqueda
                                                        ? 'No se encontraron archivos'
                                                        : 'No hay documentos en esta carpeta'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </List>

                                    {archivosFiltrados.length > archivosPorPagina && (
                                        <Box sx={{
                                            pt: 2,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Pagination
                                                count={Math.ceil(archivosFiltrados.length / archivosPorPagina)}
                                                page={paginaArchivos}
                                                onChange={(e, value) => setPaginaArchivos(value)}
                                                size="small"
                                                color="primary"
                                            />
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <Box sx={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 2
                                }}>
                                    <Typography variant="body2" color="text.secondary" align="center">
                                        Seleccione una carpeta para ver los archivos
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Botón de regresar */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                flexShrink: 0
            }}>
                <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/obra/${obraId}`)}
                    sx={{
                        textTransform: 'none',
                        px: 4,
                        py: 1.5
                    }}
                >
                    Regresar
                </Button>
            </Box>
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Subir nuevo PDF</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1" gutterBottom>
                        Selecciona la carpeta destino:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                        {carpetas.map((carpeta) => (
                            <IconButton
                                key={carpeta.id}
                                onClick={() => handleSeleccionarCarpetaDialog(carpeta)}
                                sx={{
                                    p: 2,
                                    border: carpetaSeleccionadaDialog?.id === carpeta.id
                                        ? `2px solid ${theme.palette.primary.main}`
                                        : '1px solid #ddd',
                                    borderRadius: 1
                                }}
                            >
                                <Avatar sx={{ bgcolor: carpeta.color, width: 40, height: 40 }}>
                                    {carpeta.icono}
                                </Avatar>
                            </IconButton>
                        ))}
                    </Box>

                    {carpetaSeleccionadaDialog && (
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Carpeta seleccionada: <strong>{carpetaSeleccionadaDialog.nombre}</strong>
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            sx={{ mb: 2 }}
                        >
                            Seleccionar archivo
                            <input
                                type="file"
                                hidden
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                        </Button>
                        {archivoSeleccionado && (
                            <Typography variant="body2">
                                Archivo seleccionado: {archivoSeleccionado.name}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button
                        onClick={handleSubirPDF}
                        variant="contained"
                        disabled={loading || !carpetaSeleccionadaDialog || !archivoSeleccionado}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Guardar PDF'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LectorArchivos;