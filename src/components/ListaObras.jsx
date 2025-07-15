import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Paper,
    Typography,
    Divider,
    InputAdornment,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Check from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BusinessIcon from '@mui/icons-material/Business';
import PublicIcon from '@mui/icons-material/Public';
import PrivateIcon from '@mui/icons-material/Lock';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import StraightenIcon from '@mui/icons-material/Straighten';
import { useNavigate } from 'react-router-dom';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axiosInstance from '../axiosConfig';

const ListaObras = () => {
    const user = useAuthUser();
    const userId = user?.userId;
    const authType = localStorage.getItem('_auth_type');  // e.g. 'Bearer'
    const token = localStorage.getItem('_auth');       // tu JWT

    // Variable que los une
    const authHeader = `${authType} ${token}`;
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [minMetros, setMinMetros] = useState('');
    const [maxMetros, setMaxMetros] = useState('');
    const [empresaContratista, setEmpresaContratista] = useState(''); // Estado agregado
    const [tipoObra, setTipoObra] = useState(''); // Estado agregado
    const [estadoObra, setEstadoObra] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 6;
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados posibles para las obras
    const ESTADOS_OBRA = {
        LICITACION: 'En licitación',
        ESTUDIO_PROPUESTA: 'Estudio de propuesta',
        PROYECTO_OFERTADO: 'Proyecto ofertado',
        PROYECTO_ADJUDICADO: 'Proyecto adjudicado',
        PROYECTO_NO_ADJUDICADO: 'Proyecto no adjudicado',
        EN_PROGRESO: 'En progreso',
        COMPLETADO: 'Completado',
        CANCELADO: 'Cancelado'
    };
    const renderFiltros = () => (
        <div style={{ paddingTop:"10px" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    label="Fecha de inicio"
                    value={startDate ? new Date(startDate) : null}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            sx: { mb: 1.5 },
                            InputLabelProps: { style: { fontSize: '1rem' } },
                            inputProps: { style: { fontSize: '1rem' } }
                        }
                    }}
                />
                <DatePicker
                    label="Fecha de término"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            sx: { mb: 1.5 },
                            InputLabelProps: { style: { fontSize: '1rem' } },
                            inputProps: { style: { fontSize: '1rem' } }
                        }
                    }}
                />
            </LocalizationProvider>

            <TextField
                label="M² mínimos"
                type="number"
                fullWidth
                value={minMetros}
                onChange={(e) => setMinMetros(e.target.value)}
                InputProps={{
                    endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                }}
                sx={{ mb: 1.5 }}
                InputLabelProps={{ style: { fontSize: '1rem' } }}
                inputProps={{ style: { fontSize: '1rem' } }}
            />

            <TextField
                label="M² máximos"
                type="number"
                fullWidth
                value={maxMetros}
                onChange={(e) => setMaxMetros(e.target.value)}
                InputProps={{
                    endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                }}
                sx={{ mb: 1.5 }}
                InputLabelProps={{ style: { fontSize: '1rem' } }}
                inputProps={{ style: { fontSize: '1rem' } }}
            />

            <TextField
                label="Empresa contratista"
                fullWidth
                value={empresaContratista}
                onChange={(e) => setEmpresaContratista(e.target.value)}
                sx={{ mb: 1.5 }}
                InputLabelProps={{ style: { fontSize: '1rem' } }}
                inputProps={{ style: { fontSize: '1rem' } }}
            />

            <TextField
                select
                label="Tipo de obra"
                fullWidth
                SelectProps={{ native: true }}
                value={tipoObra}
                onChange={(e) => setTipoObra(e.target.value)}
                sx={{ mb: 1.5 }}
                InputLabelProps={{ style: { fontSize: '1rem' } }}
                inputProps={{ style: { fontSize: '1rem' } }}
            >
                <option value=""></option>
                <option value="Pública">Pública</option>
                <option value="Privada">Privada</option>
            </TextField>

            <TextField
                select
                label="Estado de la obra"
                fullWidth
                SelectProps={{ native: true }}
                value={estadoObra}
                onChange={(e) => setEstadoObra(e.target.value)}
                sx={{ mb: 1.5 }}
                InputLabelProps={{ style: { fontSize: '1rem' } }}
                inputProps={{ style: { fontSize: '1rem' } }}
            >
                <option value=""></option>
                {Object.values(ESTADOS_OBRA).map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                ))}
            </TextField>
        </div>
    );

    const seleccionarObra = async (obraId) => {
        console.log(authHeader)
        const resp = await axiosInstance.post(
            // 1) Pasamos idObra como query param
            `/auth/seleccionar-obra?idObra=${obraId}`,
            null,    // <-- body vacío
            {
                headers: { Authorization: authHeader }
            }
        );
        console.log(resp.data);
        localStorage.setItem('selectedObraRol', resp.data.rol);

        // 2) (Opcional) también su ID
        localStorage.setItem('selectedObraId', obraId);
        navigate(`/obra/${obraId}`);
    }
    const limpiarFiltros = () => {
        setSearchTerm('');
        setStartDate(null);
        setEndDate(null);
        setMinMetros('');
        setMaxMetros('');
        setEmpresaContratista('');
        setTipoObra('');
        setEstadoObra('');
    };
    useEffect(() => {
        const fetchObras = async () => {
            try {
                console.log('Fetching obras for userId:', userId);
                const response = await axiosInstance.get(`/badema/api/obra/obras/${userId}`, {
                    headers: {
                        Authorization: authHeader
                    },

                });
                console.log(response)
                setObras(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching obras:', error);
                setError(error);
                setLoading(false);
            }
        };
        if (!token) {
            navigate('/login'); // Redirige al login si no hay token
        }
        fetchObras();
    }, []);

    const handleSearch = () => {
        console.log('Buscando:', { searchTerm, startDate, endDate, minMetros, maxMetros });
    };

    const handleAddObra = () => {
        navigate('/crearObra');
    };

    const handleEditObra = (id) => {
        navigate(`/crearObra/${id}`);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };
    const filteredObras = obras.filter((obra) => {
        const matchesTitle = searchTerm ? obra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        const obraFechaInicio = obra.fechaInicio ? obra.fechaInicio.split(" ")[0] : null;
        const obraFechaTermino = obra.fechaTermino ? obra.fechaTermino.split(" ")[0] : null;

        // Convertir las fechas seleccionadas (startDate, endDate) a formato YYYY-MM-DD
        const startDateFormat = startDate ? new Date(startDate).toISOString().split("T")[0] : null;
        const endDateFormat = endDate ? new Date(endDate).toISOString().split("T")[0] : null;
        console.log("startDateFormat", startDateFormat)
        // Comparar solo las fechas para coincidencia exacta
        const matchesStartDate = startDateFormat ? (obraFechaInicio === startDateFormat) : true;
        const matchesEndDate = endDateFormat ? (obraFechaTermino === endDateFormat) : true;


        const matchesMinMetros = minMetros ? obra.metrosCuadrados >= parseFloat(minMetros) : true;
        const matchesMaxMetros = maxMetros ? obra.metrosCuadrados <= parseFloat(maxMetros) : true;

        // Verifica que el campo de empresa contratista exista y se llama correctamente
        const matchesEmpresa = empresaContratista
            ? (obra.empresaContratista && obra.empresaContratista.toLowerCase().includes(empresaContratista.toLowerCase()))
            : true;

        const matchesTipo = tipoObra
            ? (tipoObra === "Pública" ? obra.esPublico === true : obra.esPublico === false)
            : true;

        const matchesEstado = estadoObra ? obra.estado === estadoObra : true;

        return (
            matchesTitle &&
            matchesStartDate &&
            matchesEndDate &&
            matchesMinMetros &&
            matchesMaxMetros &&
            matchesEmpresa &&
            matchesTipo &&
            matchesEstado
        );
    });
    // Calcular obras para la página actual
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const obrasPaginadas = filteredObras.slice(startIndex, endIndex);
    const totalPages = Math.ceil(obras.length / rowsPerPage);

    // Obtener icono según el estado
    const getEstadoIcon = (estado) => {
        switch (estado) {
            case ESTADOS_OBRA.LICITACION:
                return <GavelIcon fontSize="small" />;
            case ESTADOS_OBRA.ESTUDIO_PROPUESTA:
                return <DescriptionIcon fontSize="small" />;
            case ESTADOS_OBRA.PROYECTO_OFERTADO:
                return <AssignmentIcon fontSize="small" />;
            case ESTADOS_OBRA.PROYECTO_ADJUDICADO:
                return <AssignmentTurnedInIcon fontSize="small" />;
            case ESTADOS_OBRA.PROYECTO_NO_ADJUDICADO:
                return <AssignmentLateIcon fontSize="small" />;
            case ESTADOS_OBRA.EN_PROGRESO:
                return <BusinessIcon fontSize="small" />;
            case ESTADOS_OBRA.COMPLETADO:
                return <Check fontSize="small" />;
            case ESTADOS_OBRA.CANCELADO:
                return <DeleteIcon fontSize="small" />;
            default:
                return <BusinessIcon fontSize="small" />;
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Estudio de propuesta':
                return { bgcolor: 'info.light', color: 'black' };
            case 'En estudio de propuesta':
                return { bgcolor: 'secondary.light', color: 'black' };
            case 'Proyecto ofertado':
                return { bgcolor: 'warning.light', color: 'black' };
            case 'Proyecto adjudicado':
                return { bgcolor: 'success.light', color: 'black' };
            case 'Proyecto no adjudicado':
                return { bgcolor: 'error.light', color: 'black' };
            case 'En proceso':
                return { bgcolor: 'primary.light', color: 'black' };
            case 'Finalizada':
                return { bgcolor: 'success.light', color: 'black' };
            default:
                return { bgcolor: 'grey.300', color: 'black' };
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Primera fila: Barra de búsqueda */}
            <Box sx={{
                display: 'flex',
                gap: 2,
                mb: 3,
                alignItems: 'center'
            }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Busqueda por título"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            fontSize: '1.1rem'
                        },
                        '& input::placeholder': {
                            fontSize: '1.1rem'
                        }
                    }}
                />
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    sx={{
                        px: 4,
                        py: 1.8,
                        borderRadius: 1,
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        fontSize: '1.1rem'
                    }}
                >
                    Buscar
                </Button>
            </Box>

            {/* Segunda fila: Filtros y listado */}
            <Grid container spacing={3}>
                {/* Columna de filtros */}
                <Grid item xs={12} md={3}>
                    {/* versión móvil: acordeón */}
                    <Box sx={{ display: { xs: "block", md: "none" } }}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Filtros</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {renderFiltros()}

                                {/* botones debajo del acordeón */}
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => limpiarFiltros()}
                                    sx={{ my: 1, py: 1, fontSize: '1rem' }}
                                >
                                    Limpiar filtros
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    fullWidth
                                    onClick={handleAddObra}
                                    sx={{ py: 1.5, fontSize: '1.1rem' }}
                                >
                                    Añadir Obra
                                </Button>
                            </AccordionDetails>
                        </Accordion>
                    </Box>

                    {/* versión escritorio: panel fijo */}
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                display: "flex",
                                flexDirection: "column",
                                height: "500px",
                                width: "100%",
                                maxWidth: "250px",
                                gap: 1.5,
                            }}
                        >
                            <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                Filtros
                            </Typography>
                            <Divider />
                            <Box
                                sx={{
                                    overflowY: "auto",
                                    flex: 1,
                                    mb: 1.5,
                                    pr: 1,
                                    "&::-webkit-scrollbar": {
                                        width: "4px",
                                    },
                                    "&::-webkit-scrollbar-track": {
                                        background: "#f1f1f1",
                                        borderRadius: "10px",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        background: "#888",
                                        borderRadius: "10px",
                                    },
                                    "&::-webkit-scrollbar-thumb:hover": {
                                        background: "#555",
                                    },
                                    "& > *": {
                                        maxWidth: "100%",
                                        width: "100%",
                                    },
                                }}
                            >
                                {renderFiltros()}
                            </Box>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => limpiarFiltros()}
                                sx={{ mb: 1.5, py: 1, fontSize: '1rem' }}
                            >
                                Limpiar filtros
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                fullWidth
                                onClick={handleAddObra}
                                sx={{ py: 1.5, fontSize: '1.1rem' }}
                            >
                                Añadir Obra
                            </Button>
                        </Paper>
                    </Box>
                </Grid>


                {/* Columna de listado (2/3) */}
                <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ mb: 2, fontSize: '1.3rem' }}>
                        {obras.length} Obras encontradas
                    </Typography>

                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1, // Reducido de 2
                            mb: 1.5, // Reducido de 2
                            width: '100%'
                        }}
                    >
                        <Table sx={{ minWidth: '100%' }} size="small"> {/* Añadido size="small" */}
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', width: '5%', py: 1 }}>ID</TableCell> {/* Reducido fontSize y padding */}
                                    <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', width: '20%', py: 1 }}>Nombre Obra</TableCell>
                                    <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', width: '15%', py: 1 }}>Empresa</TableCell> {/* Acortado etiqueta */}
                                    <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', width: '8%', py: 1 }}>Tipo</TableCell> {/* Reducido width */}
                                    <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', width: '8%', py: 1 }}>M²</TableCell>
                                    <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', width: '12%', py: 1 }}>Inicio</TableCell> {/* Acortado etiqueta */}
                                    <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', width: '12%', py: 1 }}>Término</TableCell> {/* Acortado etiqueta */}
                                    <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', width: '10%', py: 1 }}>Estado</TableCell>
                                    <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', width: '10%', py: 1 }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {obrasPaginadas.map((obra) => (
                                    <TableRow
                                        key={obra.id}
                                        hover
                                        sx={{
                                            '&:hover': { backgroundColor: 'action.hover' },
                                            '& td': { py: 1 } // Reducir padding vertical en celdas
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: '0.9rem' }}>{obra.id}</TableCell> {/* Reducido fontSize */}
                                        <TableCell sx={{ fontSize: '0.9rem' }}>{obra.nombre}</TableCell>
                                        <TableCell sx={{ fontSize: '0.9rem' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}> {/* Reducido gap */}
                                                <BusinessIcon fontSize="small" />
                                                {obra.empresaContratista}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={obra.esPublico ? <PublicIcon fontSize="small" /> : <PrivateIcon fontSize="small" />}
                                                label={obra.esPublico ? 'Pública' : 'Privada'}
                                                size="small" // Chip más pequeño
                                                sx={{
                                                    fontSize: '0.8rem', // Reducido fontSize
                                                    backgroundColor: obra.esPublico ? 'primary.light' : 'secondary.light',
                                                    color: obra.esPublico ? 'primary.dark' : 'secondary.dark'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.9rem' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}> {/* Reducido gap */}
                                                <StraightenIcon fontSize="small" />
                                                {obra.metrosCuadrados || '-'}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.9rem' }}>{obra.fechaInicio || '-'}</TableCell>
                                        <TableCell sx={{ fontSize: '0.9rem' }}>{obra.fechaTermino || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getEstadoIcon(obra.estado)}
                                                label={obra.estado}
                                                size="small" // Chip más pequeño
                                                sx={{
                                                    fontSize: '0.8rem', // Reducido fontSize
                                                    ...getEstadoColor(obra.estado)
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}> {/* Reducido gap */}
                                                <IconButton
                                                    aria-label="ver detalles"
                                                    onClick={() => seleccionarObra(obra.id)}
                                                    size="small" // Botón más pequeño
                                                    sx={{
                                                        backgroundColor: 'success.light',
                                                        '&:hover': { backgroundColor: 'success.main' },
                                                        fontSize: '1rem', // Reducido de 1.3rem
                                                        padding: '6px', // Reducido de 12px
                                                        color: 'white'
                                                    }}
                                                >
                                                    <VisibilityIcon fontSize="inherit" />
                                                </IconButton>

                                                <IconButton
                                                    aria-label="editar"
                                                    onClick={() => handleEditObra(obra.id)}
                                                    size="small" // Botón más pequeño
                                                    sx={{
                                                        backgroundColor: 'primary.light',
                                                        '&:hover': { backgroundColor: 'primary.main' },
                                                        fontSize: '1rem', // Reducido de 1.3rem
                                                        padding: '6px', // Reducido de 12px
                                                        color: 'white'
                                                    }}
                                                >
                                                    <EditIcon fontSize="inherit" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Paginación */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                        mt: 3
                    }}>
                        <IconButton
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            sx={{
                                fontSize: '1.5rem',
                                padding: '12px'
                            }}
                        >
                            <ArrowBackIosIcon fontSize="inherit" />
                        </IconButton>

                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                            siblingCount={1}
                            boundaryCount={1}
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontSize: '1.2rem',
                                    height: '40px',
                                    minWidth: '40px'
                                }
                            }}
                        />

                        <IconButton
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            sx={{
                                fontSize: '1.5rem',
                                padding: '12px'
                            }}
                        >
                            <ArrowForwardIosIcon fontSize="inherit" />
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ListaObras;