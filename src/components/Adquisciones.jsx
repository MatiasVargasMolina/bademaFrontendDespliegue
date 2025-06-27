import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    useTheme,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Pagination,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
    Menu,
    MenuItem,
    Badge,
    Alert,
    ListItemIcon, Snackbar, CardContent, Stack, Card, CardHeader, ListItemAvatar, FormControlLabel, Checkbox, Collapse
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import NavigateBefore from '@mui/icons-material/NavigateBefore';
import NavigateNext from '@mui/icons-material/NavigateNext';
import MoreVert from '@mui/icons-material/MoreVert';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Warning from '@mui/icons-material/Warning';
import Error from '@mui/icons-material/Error';
import Info from '@mui/icons-material/Info';
import Close from '@mui/icons-material/Close';
import Link from '@mui/icons-material/Link';
import GroupsIcon from '@mui/icons-material/Groups';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InputAdornment from '@mui/material/InputAdornment';
import LocalPhone from '@mui/icons-material/LocalPhone';
import Email from '@mui/icons-material/Email';
import Home from '@mui/icons-material/Home';
import Payment from '@mui/icons-material/Payment';
import Block from '@mui/icons-material/Block';
import Delete from '@mui/icons-material/Delete';
import axios from 'axios';
const Adquisiciones = () => {
    const { obraId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const authType = localStorage.getItem('_auth_type');  // 'Bearer'
    const token = localStorage.getItem('_auth');       // tu JWT

    // Variable que los une
    const authHeader = `${authType} ${token}`;
    // Estados para pedidos
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [searchPedido, setSearchPedido] = useState('');
    const [searchMaterial, setSearchMaterial] = useState('');
    const [pedidosPage, setPedidosPage] = useState(1);
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [proveedoresAsociadosPage, setProveedoresAsociadosPage] = useState(1);
    const [expandedPedidos, setExpandedPedidos] = useState({});
    const pedidosPerPage = 9;
    const [materialesPage, setMaterialesPage] = useState(1);
    const [searchProveedorAsociado, setSearchProveedorAsociado] = useState('');
    const [precio, setPrecio] = useState('');
    // Estados para proveedores
    const [searchProveedor, setSearchProveedor] = useState('');
    const [proveedoresPage, setProveedoresPage] = useState(1);
    const proveedoresPerPage = 3;
    const [selectedProveedor, setSelectedProveedor] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openProveedorDialog, setOpenProveedorDialog] = useState(false);
    const [proveedorToShow, setProveedorToShow] = useState(null);
    const [openComentariosDialog, setOpenComentariosDialog] = useState(false);
    const [comentariosTemp, setComentariosTemp] = useState('');
    const [openRechazarDialog, setOpenRechazarDialog] = useState(false);
    const [confirmRechazar, setConfirmRechazar] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [proveedoresAsociados, setProveedoresAsociados] = useState([]);
    const [proveedorAsociadoSelected, setProveedorAsociadoSelected] = useState(null);
    const [openAddProveedorDialog, setOpenAddProveedorDialog] = useState(false);
    const [refreshPage, setRefreshPage] = useState(false);
    const handleDesenlazarProveedor = () => {
        console.log('Desenlazando proveedor:', proveedorAsociadoSelected, 'de material:', selectedMaterial);
        const resp = axios.delete(`http://146.190.115.47:8090/badema/api/proveedormaterial/eliminar/${proveedorAsociadoSelected.idProveedor}/${proveedorAsociadoSelected.idMaterial}`, {
            headers: {
                Authorization: authHeader
            }
        });
        setRefreshPage(!refreshPage);
        console.log('Proveedor desenlazado:', resp.data);
    };
    const [detallesProveedor, setDetallesProveedor] = useState(null);
    const [newProveedor, setNewProveedor] = useState({
        nombreProveedor: '',
        rutProveedor: '',
        telefonoProveedor: '',
        direccionProveedor: '',
        nombreVendedor: '',
        telefonoVendedor: '',
        emailVendedor: '',
        condiciones: '',
        restricciones: '',
        comentarios: ''
    });
    const fetchDetallesProveedor = async (proveedorId) => {
        try {
            const response = await axios.get(`http://http://146.190.115.47:8090/badema/api/proveedor/id/${proveedorId}`, {
                headers: {
                    Authorization: authHeader
                },
            });
            console.log('Detalles del proveedor fetched:', response.data);
            setDetallesProveedor(response.data);
            setProveedorToShow(response.data);
            setOpenProveedorDialog(true); 
            handleShowProveedorDetails(proveedorAsociadoSelected.idProveedor)
        } catch (error) {
            console.error('Error fetching proveedor details:', error);
        }
    }
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });
    const handleAddProveedor = () => {
        const resp = axios.post(`http://http://146.190.115.47:8090/badema/api/proveedor/guardar`, newProveedor, {
            headers: {
                Authorization: authHeader
            }
        }
        );
        console.log('Proveedor added:', resp.data);
        setRefreshPage(!refreshPage);
    };
    // Datos de ejemplo para pedidos
    const [pedidos, setPedidos] = useState([
        {
            id: 1,
            nombre: 'Pedido Estructura Principal',
            solicitadoPor: 'Juan Pérez',
            fechaEsperada: '15/07/2023',
            materiales: [
                {
                    id: 1,
                    nombre: 'Tablones de roble 2x4',
                    proveedores: [1, 2, 3],
                },
                {
                    id: 2,
                    nombre: 'Clavos galvanizados 3"',
                    proveedores: [4],
                },
                {
                    id: 3,
                    nombre: 'Tornillos para madera #8',
                    proveedores: [5],
                },
                {
                    id: 4,
                    nombre: 'Lijas #120',
                    proveedores: [6, 7, 8, 9],
                },
                {
                    id: 5,
                    nombre: 'Pintura blanca mate',
                    proveedores: [],
                }
            ]
        },
        {
            id: 2,
            nombre: 'Pedido Acabados',
            solicitadoPor: 'María Gómez',
            fechaEsperada: '20/07/2023',
            materiales: [
                {
                    id: 6,
                    nombre: 'Barniz transparente',
                    proveedores: [10, 11],
                },
                {
                    id: 7,
                    nombre: 'Masilla para madera',
                    proveedores: [12],
                },
                {
                    id: 8,
                    nombre: 'Láminas de triplay 1/2"',
                    proveedores: [13, 14, 15],
                }
            ]
        }
    ]);

    // Datos de ejemplo para proveedores
    const [proveedores, setProveedores] = useState([
        {
            id: 1,
            nombre: 'Maderera El Bosque',
            rut: '12.345.678-9',
            telefono: '987654321',
            direccion: 'Av. Los Árboles 123, Lima',
            nombreVendedor: 'Carlos Rojas',
            rutVendedor: '9.876.543-2',
            telefonoVendedor: '987111222',
            emailVendedor: 'crojas@madereraelbosque.com',
            condicionPago: 'Crédito a 30 días',
            precioUnidad: 150.50,
            restricciones: 'Mínimo de compra 300 unidades',
            especificaciones: [
                { tipo: 'Madera', valor: 'Roble estándar' },
                { tipo: 'Dimensiones', valor: '1.9x3.9 pulgadas' },
                { tipo: 'Problema admitido', valor: 'Puede contener pequeños nudos' }
            ],
            verificaciones: [false, false, false]
        },
        // ... (otros proveedores se mantienen igual)
    ]);

    const handleToggleExpandPedido = (pedidoId) => {
        setExpandedPedidos(prev => ({
            ...prev,
            [pedidoId]: !prev[pedidoId]
        }));
    };

    const handleSelectPedido = (pedido) => {
        setSelectedPedido(pedido);
        setSelectedMaterial(null);
    };

    const handleUnlinkProveedor = (proveedorId) => {
        if (!selectedMaterial) return;

        const updatedPedidos = pedidos.map(pedido => {
            const updatedMateriales = pedido.materiales.map(material => {
                if (material.id === selectedMaterial.id) {
                    return {
                        ...material,
                        proveedores: material.proveedores.filter(id => id !== proveedorId)
                    };
                }
                return material;
            });

            return {
                ...pedido,
                materiales: updatedMateriales
            };
        });

        setPedidos(updatedPedidos);
        const updatedMaterial = updatedPedidos
            .flatMap(p => p.materiales)
            .find(m => m.id === selectedMaterial.id);
        setSelectedMaterial(updatedMaterial);
        handleCloseProveedorMenu();
    };

    const filteredProveedores = proveedores.filter(proveedor =>
        proveedor.nombre?.toLowerCase().includes(searchProveedor.toLowerCase()) ||
        proveedor.material?.toLowerCase().includes(searchProveedor.toLowerCase())
    );

    const proveedoresPaginados = filteredProveedores.slice(
        (proveedoresPage - 1) * proveedoresPerPage,
        proveedoresPage * proveedoresPerPage
    );

    const handleRegresar = () => navigate(-1);
    const handleManejarAdquisiciones = () => navigate(`/manejarAdquisiciones/${obraId}`);

    const filteredPedidos = pedidos.filter(pedido =>
        pedido.nombre.toLowerCase().includes(searchPedido.toLowerCase())
    );

    const paginatedPedidos = filteredPedidos.slice(
        (pedidosPage - 1) * pedidosPerPage,
        pedidosPage * pedidosPerPage
    );

    const handlePedidosPageChange = (event, value) => {
        setPedidosPage(value);
        setSelectedMaterial(null);
    };

    const getProveedorColor = (count) => {
        if (count === 0) return 'error';
        if (count < 3) return 'warning';
        return 'success';
    };

    const getProveedorIcon = (count) => {
        if (count === 0) return <Error />;
        if (count < 3) return <Warning />;
        return <CheckCircle />;
    };

    const handleSelectMaterial = (material) => {
        setSelectedMaterial(material);
        console.log('Material seleccionado:', material);
    };

    const handleClickProveedorMenu = (event, proveedor) => {
        setAnchorEl(event.currentTarget);
        setSelectedProveedor(proveedor);
        console.log(selectedProveedor);
    };

    const handleCloseProveedorMenu = () => {
        setAnchorEl(null);
        setSelectedProveedor(null);
    };

    const handleShowProveedorDetails = (proveedorId) => {
        const proveedor = proveedores.find(p => p.id === proveedorId);
        const resp= axios.get(`http://http://146.190.115.47:8090/badema/api/proveedor/id/${proveedorId}`, {
            headers: {
                Authorization: authHeader
            }
        });
        setDetallesProveedor(resp.data);
        setProveedorToShow(proveedor);
        setOpenProveedorDialog(true);
        handleCloseProveedorMenu();
    };
    const fetchPedidos = async () => {
        try {
            const response = await axios.get(`http://http://146.190.115.47:8090/badema/api/pedido/pedidos/adquisiciones/${obraId}`, {
                headers: {
                    Authorization: authHeader
                },
            });
            console.log('Pedidos fetched:', response.data);
            setPedidos(response.data);
        } catch (error) {
            console.error('Error fetching pedidos:', error);
        }
    }
    const fetchProveedores = async () => {
        try {
            const response = await axios.get(`http://http://146.190.115.47:8090/badema/api/proveedor/proveedores`, {
                headers: {
                    Authorization: authHeader
                },
            });
            console.log('Proveedores fetched:', response.data);
            setProveedores(response.data);
        } catch (error) {
            console.error('Error fetching proveedores:', error);
        }
    };
    const fetchProveedoresAsociados = async (materialId) => {
        try {
            const response = await axios.get(`http://http://146.190.115.47:8090/badema/api/proveedormaterial/materialproveedor/${materialId}`, {
                headers: {
                    Authorization: authHeader
                },
            });
            console.log('Proveedores asociados fetched:', response.data);
            setProveedoresAsociados(response.data);
        } catch (error) {
            console.error('Error fetching proveedores asociados:', error);
        }
    };

    useEffect(() => {
        fetchPedidos()
        fetchProveedores()
        fetchProveedoresAsociados(selectedMaterial?.id);
    }, [refreshPage])



    const handleLinkProveedor = async (proveedorId) => {

        const resp = await axios.post(`http://http://146.190.115.47:8090/badema/api/proveedormaterial/guardar/${selectedProveedor.id}/${selectedMaterial.id}`, { idMaterial: selectedMaterial.id, nombreMaterial: selectedMaterial.nombre, idProveedor: selectedProveedor.id, nombreProveedor: selectedProveedor.nombreProveedor, precio: precio, comentarios: comentariosTemp }, {
            headers: {
                Authorization: authHeader
            },
        });
        console.log({ idMaterial: selectedMaterial.id, nombreMaterial: selectedMaterial.nombre, idProveedor: selectedProveedor.id, nombreProveedor: selectedProveedor.nombreProveedor, precio: precio, comentarios: comentariosTemp })
            ;
    };

    const getProveedoresMaterial = (material) => {
        if (!material || !material.proveedores) return [];
        return proveedores.filter(p => material.proveedores.includes(p.id));
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    Adquisiciones
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
                {/* Tarjeta de Lista de Pedidos */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Paper elevation={3} sx={{
                        p: 3,
                        width: '100%',
                        maxWidth: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '500px'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                            Lista de pedidos
                        </Typography>

                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Buscar pedidos..."
                            value={searchPedido}
                            onChange={(e) => {
                                setSearchPedido(e.target.value);
                                setPedidosPage(1);
                            }}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                ),
                            }}
                        />

                        <List sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                            {paginatedPedidos.length > 0 ? (
                                paginatedPedidos.map((pedido) => (
                                    <React.Fragment key={pedido.id}>
                                        <ListItem
                                            button
                                            onClick={() => {
                                                handleSelectPedido(pedido);
                                                handleToggleExpandPedido(pedido.id);
                                            }}
                                            selected={selectedPedido?.id === pedido.id}
                                            sx={{
                                                backgroundColor: selectedPedido?.id === pedido.id ?
                                                    theme.palette.action.selected : 'inherit',
                                                '&:hover': {
                                                    backgroundColor: theme.palette.action.hover
                                                }
                                            }}
                                        >
                                            <IconButton
                                                edge="end"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPedido(pedido);
                                                    setOpenRechazarDialog(true);
                                                }}
                                                size="small"
                                            >
                                                <Delete />
                                            </IconButton>
                                            <ListItemText
                                                primary={pedido.nombre}
                                                primaryTypographyProps={{ fontWeight: 'medium' }}
                                            />
                                        </ListItem>

                                        <Collapse in={expandedPedidos[pedido.id]}>
                                            <Box sx={{ pl: 4, pr: 2, py: 1, backgroundColor: 'background.default' }}>
                                                <Typography variant="body2">
                                                    <strong>Solicitado por:</strong> {pedido.nombreResponsable}  {pedido.apellidoResponsable}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Fecha esperada:</strong> {pedido.fechaEsperada}
                                                </Typography>
                                            </Box>
                                        </Collapse>
                                        <Divider />
                                    </React.Fragment>
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                                    No se encontraron pedidos
                                </Typography>
                            )}
                        </List>

                        <Pagination
                            count={Math.ceil(filteredPedidos.length / pedidosPerPage)}
                            page={pedidosPage}
                            onChange={handlePedidosPageChange}
                            color="primary"
                            size="small"
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        />
                    </Paper>
                </Grid>

                {/* Tarjeta de Enlazar Material con Proveedores */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{ height: '100%', minHeight: 500 }}>
                        <CardContent sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: 'calc(100% - 64px)',
                            p: 0
                        }}>
                            {selectedPedido ? (
                                <>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center', p: 3, pb: 0 }}>
                                        Detalles del pedido: {selectedPedido.nombre}
                                    </Typography>

                                    <Box sx={{ p: 3 }}>
                                        <Grid container spacing={3}>
                                            {/* Columna de Materiales */}
                                            <Grid item xs={6}>
                                                <Paper elevation={0} sx={{
                                                    p: 2,
                                                    height: '100%',
                                                    bgcolor: 'background.default',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}>
                                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <GroupsIcon color="primary" fontSize="small" />
                                                            <Typography variant="subtitle1" fontWeight="medium">
                                                                Materiales del pedido
                                                            </Typography>
                                                        </Stack>
                                                        <Chip
                                                            label={`${selectedPedido.materiales.length}`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </Stack>

                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        placeholder="Buscar materiales..."
                                                        value={searchMaterial}
                                                        onChange={(e) => {
                                                            setSearchMaterial(e.target.value);
                                                            setMaterialesPage(1);
                                                        }}
                                                        sx={{ mb: 2 }}
                                                        InputProps={{
                                                            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                                                        }}
                                                    />

                                                    <Box sx={{ flex: 1, minHeight: '200px', maxHeight: '250px', overflow: 'auto', mb: 1 }}>
                                                        <List dense>
                                                            {selectedPedido.materiales
                                                                .filter(m => m.nombre.toLowerCase().includes(searchMaterial.toLowerCase()))
                                                                .slice((materialesPage - 1) * 3, materialesPage * 3)
                                                                .map(material => (
                                                                    <ListItem
                                                                        key={material.id}
                                                                        button
                                                                        selected={selectedMaterial?.id === material.id}
                                                                        onClick={() => { fetchProveedoresAsociados(material.id); handleSelectMaterial(material) }}
                                                                        sx={{
                                                                            px: 2,
                                                                            py: 1,
                                                                            my: 1,
                                                                            border: 1,
                                                                            borderColor: 'divider',
                                                                            borderRadius: 1,
                                                                            bgcolor: 'background.paper',
                                                                            '&:hover': {
                                                                                borderColor: 'primary.light',
                                                                                boxShadow: 1
                                                                            }
                                                                        }}
                                                                    >
                                                                        <ListItemText
                                                                            primary={
                                                                                <Typography variant="body2" fontWeight="medium">
                                                                                    {material.nombre}
                                                                                </Typography>
                                                                            }
                                                                        />
                                                                        <Badge
                                                                            badgeContent={material?.proveedores?.length}
                                                                            color={getProveedorColor(material?.proveedores?.length)}
                                                                            sx={{ mr: 1 }}
                                                                        >
                                                                            {getProveedorIcon(material?.proveedores?.length)}
                                                                        </Badge>
                                                                    </ListItem>
                                                                ))}
                                                        </List>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                                                        <IconButton
                                                            onClick={() => setMaterialesPage(p => Math.max(1, p - 1))}
                                                            disabled={materialesPage === 1}
                                                            size="small"
                                                        >
                                                            <NavigateBefore />
                                                        </IconButton>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Página {materialesPage} de {Math.ceil(selectedPedido.materiales.filter(m => m.nombre.toLowerCase().includes(searchMaterial.toLowerCase())).length / 3)}
                                                        </Typography>
                                                        <IconButton
                                                            onClick={() => setMaterialesPage(p => p + 1)}
                                                            disabled={materialesPage * 3 >= selectedPedido.materiales.filter(m => m.nombre.toLowerCase().includes(searchMaterial.toLowerCase())).length}
                                                            size="small"
                                                        >
                                                            <NavigateNext />
                                                        </IconButton>
                                                    </Box>
                                                </Paper>
                                            </Grid>

                                            {/* Columna de Proveedores Asociados */}
                                            <Grid item xs={6}>
                                                <Paper elevation={0} sx={{
                                                    p: 2,
                                                    height: '100%',
                                                    bgcolor: 'background.default',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',

                                                }}

                                                >
                                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <GroupsIcon color="primary" fontSize="small" />
                                                            <Typography variant="subtitle1" fontWeight="medium">
                                                                Proveedores asociados
                                                            </Typography>
                                                        </Stack>
                                                        <Chip
                                                            label={`${selectedMaterial?.proveedoresAsignados}`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </Stack>

                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        placeholder="Buscar proveedores..."
                                                        value={searchProveedorAsociado}
                                                        onChange={(e) => {
                                                            setSearchProveedorAsociado(e.target.value);
                                                            setProveedoresAsociadosPage(1);
                                                        }}
                                                        sx={{ mb: 2 }}
                                                        InputProps={{
                                                            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                                                        }}
                                                    />

                                                    <Box sx={{ flex: 1, minHeight: '200px', maxHeight: '250px', overflow: 'auto', mb: 1 }}>
                                                        {proveedoresAsociados.length > 0 ? (
                                                            <List>
                                                                {proveedoresAsociados
                                                                    ?.map((proveedor) => (
                                                                        <ListItem
                                                                            onClick={() => {
                                                                                setProveedorAsociadoSelected(proveedor);
                                                                                console.log('Proveedor Asociado seleccionado:', proveedor);
                                                                            }}
                                                                            key={proveedor.id}
                                                                            secondaryAction={
                                                                                <IconButton
                                                                                    edge="end"
                                                                                    onClick={(e) => handleClickProveedorMenu(e, proveedor.id)}
                                                                                    size="small"
                                                                                >
                                                                                    <MoreVert />
                                                                                </IconButton>
                                                                            }
                                                                            sx={{
                                                                                px: 2,
                                                                                py: 1,
                                                                                my: 1,
                                                                                border: 1,
                                                                                borderColor: 'divider',
                                                                                borderRadius: 1,
                                                                                bgcolor: 'background.paper',
                                                                                '&:hover': {
                                                                                    borderColor: 'primary.light',
                                                                                    boxShadow: 1
                                                                                }
                                                                            }}
                                                                        >
                                                                            <ListItemAvatar>
                                                                                <Avatar sx={{
                                                                                    width: 32,
                                                                                    height: 32,
                                                                                    bgcolor: 'primary.main',
                                                                                    color: 'primary.contrastText'
                                                                                }}>
                                                                                    {proveedor.nombreProveedor?.charAt(0).toUpperCase()}
                                                                                </Avatar>
                                                                            </ListItemAvatar>
                                                                            <ListItemText
                                                                                primary={
                                                                                    <Typography variant="body2" fontWeight="medium">
                                                                                        {proveedor.nombreProveedor}
                                                                                    </Typography>
                                                                                }
                                                                                secondary={
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        {proveedor.nombreMaterial}
                                                                                    </Typography>
                                                                                }
                                                                            />
                                                                        </ListItem>
                                                                    ))
                                                                }
                                                            </List>
                                                        ) : (
                                                            <Box sx={{
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                textAlign: 'center'
                                                            }}>
                                                                <Alert severity="info" icon={<Info />} sx={{ width: '100%' }}>
                                                                    {selectedMaterial
                                                                        ? 'No hay proveedores.'
                                                                        : 'Selecciona un material.'}
                                                                </Alert>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    {getProveedoresMaterial(selectedMaterial).length > 0 && (
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                                                            <IconButton
                                                                onClick={() => setProveedoresAsociadosPage(p => Math.max(1, p - 1))}
                                                                disabled={proveedoresAsociadosPage === 1}
                                                                size="small"
                                                            >
                                                                <NavigateBefore />
                                                            </IconButton>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Página {proveedoresAsociadosPage} de {Math.ceil(getProveedoresMaterial(selectedMaterial).filter(p => p.nombre.toLowerCase().includes(searchProveedorAsociado.toLowerCase())).length / 3)}
                                                            </Typography>
                                                            <IconButton
                                                                onClick={() => setProveedoresAsociadosPage(p => p + 1)}
                                                                disabled={proveedoresAsociadosPage * 3 >= getProveedoresMaterial(selectedMaterial).filter(p => p.nombre.toLowerCase().includes(searchProveedorAsociado.toLowerCase())).length}
                                                                size="small"
                                                            >
                                                                <NavigateNext />
                                                            </IconButton>
                                                        </Box>
                                                    )}
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Box>


                                    {/* Sección de Proveedor Seleccionado */}
                                    {selectedProveedor && (
                                        <Box sx={{ p: 3 }}>
                                            <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                                <Stack spacing={2}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight="bold">Proveedor seleccionado:</Typography>
                                                            <Typography variant="body2">
                                                                {selectedProveedor.nombreProveedor}
                                                            </Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight="bold">Precio por unidad:</Typography>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={precio}
                                                                onChange={(e) => {
                                                                    setPrecio(e.target.value);
                                                                    console.log('Precio actualizado:', precio);
                                                                }}
                                                                InputProps={{
                                                                    startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>

                                                    <div>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                            Especificaciones técnicas:
                                                        </Typography>

                                                        <Stack spacing={2}>
                                                            {/* Especificaciones fijas (primeras 3) */}
                                                            {proveedores.find(p => p.id === selectedProveedor)?.especificaciones?.slice(0, 3).map((espec, index) => (
                                                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Box>
                                                                        <Typography variant="body2">
                                                                            <strong>Tipo:</strong> {espec.tipo}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>Valor:</strong> {espec.valor}
                                                                        </Typography>
                                                                    </Box>
                                                                    <FormControlLabel
                                                                        control={
                                                                            <Checkbox
                                                                                checked={proveedores.find(p => p.id === selectedProveedor)?.verificaciones[index] || false}
                                                                                onChange={(e) => {
                                                                                    const updatedProveedores = proveedores.map(p => {
                                                                                        if (p.id === selectedProveedor) {
                                                                                            const newVerificaciones = [...p.verificaciones];
                                                                                            newVerificaciones[index] = e.target.checked;
                                                                                            return { ...p, verificaciones: newVerificaciones };
                                                                                        }
                                                                                        return p;
                                                                                    });
                                                                                    setProveedores(updatedProveedores);
                                                                                }}
                                                                            />
                                                                        }
                                                                        label="Incluye"
                                                                    />
                                                                </Box>
                                                            ))}

                                                            {/* Especificaciones adicionales (editable) */}
                                                            {proveedores.find(p => p.id === selectedProveedor)?.especificaciones?.slice(3).map((espec, index) => (
                                                                <Box key={index + 3} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                    <TextField
                                                                        size="small"
                                                                        label={`Tipo ${index + 4}`}
                                                                        value={espec.tipo}
                                                                        onChange={(e) => {
                                                                            const updatedProveedores = proveedores.map(p => {
                                                                                if (p.id === selectedProveedor) {
                                                                                    const newEspecs = [...p.especificaciones];
                                                                                    newEspecs[index + 3].tipo = e.target.value;
                                                                                    return { ...p, especificaciones: newEspecs };
                                                                                }
                                                                                return p;
                                                                            });
                                                                            setProveedores(updatedProveedores);
                                                                        }}
                                                                    />
                                                                    <TextField
                                                                        size="small"
                                                                        label={`Valor ${index + 4}`}
                                                                        value={espec.valor}
                                                                        onChange={(e) => {
                                                                            const updatedProveedores = proveedores.map(p => {
                                                                                if (p.id === selectedProveedor) {
                                                                                    const newEspecs = [...p.especificaciones];
                                                                                    newEspecs[index + 3].valor = e.target.value;
                                                                                    return { ...p, especificaciones: newEspecs };
                                                                                }
                                                                                return p;
                                                                            });
                                                                            setProveedores(updatedProveedores);
                                                                        }}
                                                                    />
                                                                    <Button
                                                                        color="error"
                                                                        variant="outlined"
                                                                        onClick={() => {
                                                                            const updatedProveedores = proveedores.map(p => {
                                                                                if (p.id === selectedProveedor) {
                                                                                    const newEspecs = [...p.especificaciones];
                                                                                    newEspecs.splice(index + 3, 1);
                                                                                    return { ...p, especificaciones: newEspecs };
                                                                                }
                                                                                return p;
                                                                            });
                                                                            setProveedores(updatedProveedores);
                                                                        }}
                                                                    >
                                                                        Eliminar
                                                                    </Button>
                                                                </Box>
                                                            ))}
                                                        </Stack>
                                                    </div>

                                                    {/* Campo de comentarios */}
                                                    {proveedores.find(p => p.id === selectedProveedor)?.comentarios && (
                                                        <Box sx={{ mt: 2 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold">Comentarios:</Typography>
                                                            <Typography variant="body2">
                                                                {proveedores.find(p => p.id === selectedProveedor)?.comentarios}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => {
                                                                const updatedProveedores = proveedores.map(p => {
                                                                    if (p.id === selectedProveedor) {
                                                                        return {
                                                                            ...p,
                                                                            especificaciones: [...p.especificaciones, { tipo: '', valor: '' }]
                                                                        };
                                                                    }
                                                                    return p;
                                                                });
                                                                setProveedores(updatedProveedores);
                                                            }}
                                                        >
                                                            Agregar especificación
                                                        </Button>

                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => {
                                                                setComentariosTemp(proveedores.find(p => p.id === selectedProveedor)?.comentarios || '');
                                                                setOpenComentariosDialog(true);
                                                            }}
                                                        >
                                                            Agregar comentarios
                                                        </Button>

                                                        <Button
                                                            variant="contained"
                                                            startIcon={<Link />}
                                                            onClick={async() => {
                                                                handleLinkProveedor(selectedProveedor);
                                                                setRefreshPage(prev => !prev); // Forzar actualización de la página
                                                            }}
                                                            fullWidth
                                                            disabled={
                                                                proveedores.find(p => p.id === selectedProveedor)?.especificaciones
                                                                    ?.slice(3) // solo especificaciones agregadas
                                                                    .some(e => e.tipo.trim() === '' || e.valor.trim() === '') // alguna vacía
                                                            }
                                                        >
                                                            Enlazar Proveedor
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </Paper>
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <CardContent sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    textAlign: 'center'
                                }}>
                                    <Typography variant="body1">
                                        Selecciona un pedido de la lista para ver sus detalles y materiales.
                                    </Typography>
                                </CardContent>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tarjeta de Proveedores */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Paper elevation={3} sx={{
                        p: 3,
                        width: '100%',
                        maxWidth: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '500px'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Proveedores
                            </Typography>
                            <Tooltip title="Agregar nuevo proveedor">
                                <IconButton
                                    color="primary"
                                    onClick={() => setOpenAddProveedorDialog(true)}
                                    sx={{
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark'
                                        }
                                    }}
                                >
                                    <AddCircleIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Buscar proveedores..."
                            value={searchProveedor}
                            onChange={(e) => {
                                setSearchProveedor(e.target.value);
                                setProveedoresPage(1);
                            }}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                ),
                            }}
                        />

                        <Box sx={{ flex: 1, mb: 2, overflow: 'auto' }}>
                            <Grid container spacing={2}>
                                {proveedores.map((proveedor) => (
                                    <Grid item key={proveedor.id} xs={12}>
                                        <Paper
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                width: '100%',
                                                p: 2,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: selectedProveedor === proveedor.id ?
                                                    theme.palette.primary.main : 'divider',
                                                transition: 'transform 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4
                                                }
                                            }}
                                            onClick={() => {
                                                setSelectedProveedor(proveedor);
                                                console.log('Proveedor seleccionado:', proveedor);
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 40,
                                                    height: 40,
                                                    bgcolor: 'primary.main',
                                                    mr: 2
                                                }}>
                                                    {proveedor.nombreProveedor}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {proveedor.nombreProveedor} - {proveedor.rutProveedor}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Tel: {proveedor.telefonoProveedor}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ mb: 1.5 }}>
                                                <Typography variant="body2">
                                                    <strong>Vendedor:</strong> {proveedor.nombreVendedor}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Contacto:</strong> {proveedor.telefonoVendedor} | {proveedor.emailVendedor}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ mb: 1.5 }}>
                                                <Typography variant="body2">
                                                    <strong>Dirección:</strong> {proveedor.direccionProveedor}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                                <Chip
                                                    label={proveedor.condiciones}
                                                    color="primary"
                                                    size="small"
                                                />
                                                <Chip
                                                    label={proveedor.restricciones}
                                                    variant="outlined"
                                                    size="small"
                                                    color="secondary"
                                                />
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <IconButton
                                onClick={() => setProveedoresPage(p => Math.max(1, p - 1))}
                                disabled={proveedoresPage === 1}
                            >
                                <NavigateBefore />
                            </IconButton>

                            <Typography variant="body2" sx={{ mx: 2 }}>
                                Página {proveedoresPage} de {Math.ceil(filteredProveedores.length / proveedoresPerPage)}
                            </Typography>

                            <IconButton
                                onClick={() => setProveedoresPage(p => p + 1)}
                                disabled={proveedoresPage * proveedoresPerPage >= filteredProveedores.length}
                            >
                                <NavigateNext />
                            </IconButton>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseProveedorMenu}
            >
                <MenuItem onClick={() => {fetchDetallesProveedor(proveedorAsociadoSelected.idProveedor);setRefreshPage((prev) => !prev) ;  }}>
                    <ListItemIcon>
                        <Info fontSize="small" />
                    </ListItemIcon>
                    Ver detalles
                </MenuItem>
                <MenuItem onClick={() => handleDesenlazarProveedor(proveedorAsociadoSelected)}>
                    <ListItemIcon>
                        <Link fontSize="small" />
                    </ListItemIcon>
                    Desenlazar proveedor
                </MenuItem>
                <MenuItem onClick={handleCloseProveedorMenu}>
                    <ListItemIcon>
                        <Close fontSize="small" />
                    </ListItemIcon>
                    Cancelar
                </MenuItem>
            </Menu>

            <Dialog
                open={openProveedorDialog}
                onClose={() => setOpenProveedorDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Detalles del Proveedor</DialogTitle>
                <DialogContent>
                    {proveedorToShow && (
                        <>
                            <Box mb={2}>
                                <Typography variant="subtitle1" fontWeight="bold">Datos de la empresa</Typography>
                                <DialogContentText><strong>Nombre:</strong> {detallesProveedor?.nombreProveedor}</DialogContentText>
                                <DialogContentText><strong>RUT:</strong> {detallesProveedor?.rutProveedor}</DialogContentText>
                                <DialogContentText><strong>Teléfono:</strong> {detallesProveedor?.telefonoProveedor}</DialogContentText>
                                <DialogContentText><strong>Dirección:</strong> {detallesProveedor?.direccion}</DialogContentText>
                                <DialogContentText><strong>Precio por unidad:</strong> S/ {detallesProveedor?.precioUnidad?.toFixed(2) || 'No especificado'}</DialogContentText>
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1" fontWeight="bold">Datos del vendedor</Typography>
                                <DialogContentText><strong>Nombre:</strong> {proveedorToShow.nombreVendedor}</DialogContentText>
                                <DialogContentText><strong>RUT:</strong> {proveedorToShow.rutVendedor}</DialogContentText>
                                <DialogContentText><strong>Teléfono:</strong> {proveedorToShow.telefonoVendedor}</DialogContentText>
                                <DialogContentText><strong>Email:</strong> {proveedorToShow.emailVendedor}</DialogContentText>
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1" fontWeight="bold">Condiciones</Typography>
                                <DialogContentText><strong>Condición de pago:</strong> {proveedorToShow.condicionPago}</DialogContentText>
                                <DialogContentText><strong>Restricciones:</strong> {proveedorToShow.restricciones}</DialogContentText>
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1" fontWeight="bold">Comentarios</Typography>
                                <DialogContentText>
                                    {proveedorToShow?.comentarios || 'Sin comentarios'}
                                </DialogContentText>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenProveedorDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 4,
                gap: 2
            }}>
                <Box sx={{ flex: 1 }} />
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={handleRegresar}
                        sx={{
                            textTransform: 'none',
                            px: 4,
                            py: 1.5
                        }}
                    >
                        Regresar
                    </Button>
                </Box>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Dialog
                open={openAddProveedorDialog}
                onClose={() => setOpenAddProveedorDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <AddCircleIcon /> Nuevo Proveedor
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box display="flex" flexDirection="column" gap={3}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Datos de la Empresa</Typography>
                            <Box display="flex" gap={2} mb={2}>
                                <TextField
                                    fullWidth
                                    label="Nombre Empresa"
                                    value={newProveedor.nombreEmpresa}
                                    onChange={(e) => setNewProveedor({ ...newProveedor, nombreProveedor: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    label="RUT Empresa"
                                    value={newProveedor.rutEmpresa}
                                    onChange={(e) => setNewProveedor({ ...newProveedor, rutProveedor: e.target.value })}
                                />
                            </Box>
                            <Box display="flex" gap={2}>
                                <TextField
                                    fullWidth
                                    label="Teléfono Empresa"
                                    value={newProveedor.telefonoEmpresa}
                                    onChange={(e) => setNewProveedor({ ...newProveedor, telefonoProveedor: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocalPhone />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Dirección Empresa"
                                    value={newProveedor.direccionEmpresa}
                                    onChange={(e) => setNewProveedor({ ...newProveedor, direccionProveedor: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Home />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Datos del Vendedor</Typography>
                            <Box display="flex" gap={2} mb={2}>
                                <TextField
                                    fullWidth
                                    label="Nombre Completo del Vendedor"
                                    value={newProveedor.nombreVendedor}
                                    onChange={(e) => setNewProveedor({ ...newProveedor, nombreVendedor: e.target.value })}
                                />
                            </Box>
                            <Box display="flex" gap={2}>
                                <TextField
                                    fullWidth
                                    label="Teléfono Vendedor"
                                    value={newProveedor.telefonoVendedor}
                                    onChange={(e) => setNewProveedor({ ...newProveedor, telefonoVendedor: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocalPhone />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Email Vendedor"
                                    value={newProveedor.emailVendedor}
                                    onChange={(e) => setNewProveedor({ ...newProveedor, emailVendedor: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Condiciones</Typography>
                            <Box display="flex" gap={2}>
                                <TextField
                                    fullWidth
                                    label="Condición de pago"
                                    value={newProveedor.condicionesPago}
                                    onChange={(e) => setNewProveedor({ ...newProveedor, condiciones: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Payment />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Restricciones"
                                    value={newProveedor.restricciones}
                                    onChange={(e) => setNewProveedor({ ...newProveedor, restricciones: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Block />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => setOpenAddProveedorDialog(false)}
                        variant="outlined"
                        color="secondary"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={async () => {
                            handleAddProveedor()// Forzar actualización de la página
                            setOpenAddProveedorDialog(false);
                            setNewProveedor({
                                nombreProveedor: '',
                                rutEmpresa: '',
                                telefonoEmpresa: '',
                                direccionEmpresa: '',
                                nombreVendedor: '',
                                rutVendedor: '',
                                telefonoVendedor: '',
                                emailVendedor: '',
                                condicionesPago: '',
                                restricciones: '',
                            });
                            setSnackbar({
                                open: true,
                                message: 'Proveedor agregado correctamente',
                                severity: 'success',
                            });
                        }}
                        variant="contained"
                        color="primary"
                        sx={{ ml: 2 }}
                    >
                        Guardar Proveedor
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openComentariosDialog} onClose={() => setOpenComentariosDialog(false)}>
                <DialogTitle>Agregar Comentarios</DialogTitle>
                <DialogContent>
                    <TextField
                        multiline
                        rows={4}
                        fullWidth
                        value={comentariosTemp}
                        onChange={(e) => setComentariosTemp(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenComentariosDialog(false)}>Cancelar</Button>
                    <Button onClick={() => {
                        const updatedProveedores = proveedores.map(p => {
                            if (p.id === selectedProveedor) {
                                return { ...p, comentarios: comentariosTemp };
                            }
                            return p;
                        });
                        setProveedores(updatedProveedores);
                        setOpenComentariosDialog(false);
                    }} color="primary">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openRechazarDialog} onClose={() => {
                setOpenRechazarDialog(false);
                setConfirmRechazar(false);
                setMotivoRechazo('');
            }}>
                {!confirmRechazar ? (
                    <>
                        <DialogTitle>¿Por qué rechaza el pedido?</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Motivo del rechazo"
                                type="text"
                                fullWidth
                                multiline
                                rows={4}
                                value={motivoRechazo}
                                onChange={(e) => setMotivoRechazo(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                setOpenRechazarDialog(false);
                                setMotivoRechazo('');
                            }}>Cancelar</Button>
                            <Button
                                onClick={() => setConfirmRechazar(true)}
                                disabled={!motivoRechazo.trim()}
                                color="error"
                            >
                                Rechazar
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <>
                        <DialogTitle>Confirmación</DialogTitle>
                        <DialogContent>
                            <Typography>Esta acción es irreversible. ¿Estás seguro?</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setConfirmRechazar(false)}>No</Button>
                            <Button
                                onClick={() => {
                                    setPedidos(pedidos.filter(p => p.id !== selectedPedido.id));
                                    setSelectedPedido(null);
                                    setOpenRechazarDialog(false);
                                    setConfirmRechazar(false);
                                    setMotivoRechazo('');
                                }}
                                color="error"
                                variant="contained"
                            >
                                Sí, rechazar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default Adquisiciones;