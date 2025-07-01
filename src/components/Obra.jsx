import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    Typography,
    Divider,
    List,
    ListItem,
    Paper,
    Grid,
    IconButton,
    Pagination,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
// Agrega estos imports al inicio del archivo
import Chip from '@mui/material/Chip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { id } from 'date-fns/locale';

const Obra = () => {
    const { obraId } = useParams();
    const navigate = useNavigate();
    const [pageComprados, setPageComprados] = useState(1);
    const [pageFaltantes, setPageFaltantes] = useState(1);
    const [pageHitos, setPageHitos] = useState(1);
    const [estadoEE, setEstadoEE] = useState(1);
    const [hitoEditando, setHitoEditando] = useState(null);
    const [refreshObras, setRefreshObras] = useState(false);
    const [openPedidoDialog, setOpenPedidoDialog] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    // Estados para los diálogos
    const [openUsuarioDialog, setOpenUsuarioDialog] = useState(false);
    const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', rol: '' });
    const authType = localStorage.getItem('_auth_type');  // e.g. 'Bearer'
    const token = localStorage.getItem('_auth');       // tu JWT
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    // Variable que los une
    const authHeader = `${authType} ${token}`;
    const rolesAdministrativos = [
        'Gerencia',
        'Administrador de obra',
        'Prevencionista de riesgo',
        'Adquisiciones',
        'Jefe de terreno',
        'Oficina técnica'
    ];

    const rolesAsociados = [
        { nombre: 'Jefe de obra', id: 0 },
        { nombre: 'Bodega', id: 1 }
    ];
    const fetchData = async () => {
        try {
            const resp = await axios.get(
                `http://localhost:8090/badema/api/obra/id/${obraId}`,
                { headers: { Authorization: authHeader } }
            );
            const data = resp.data;
            console.log('Datos de la obra (raw):', data);

            setObra(prev => ({
                ...prev,
                titulo: data.nombre,
                empresaContratista: data.empresaContratista,
                esPublico: data.esPublico,
                estado: data.estado,
                fechaInicio: data.fechaInicio,
                fechaTermino: data.fechaTermino,

                // Administrativos
                administrativos: Array.isArray(data.administrativos)
                    ? data.administrativos.map(a => ({
                        id: a.id,
                        nombre: a.nombre,
                        apellidos: a.apellidos,
                        telefono: a.telefono,
                        areaTrabajo: a.rol
                    }))
                    : [],

                // ¡Asociados correctamente mapeados!
                asociados: Array.isArray(data.asociados)
                    ? data.asociados.map(a => ({
                        id: a.id,
                        nombre: a.nombre,
                        apellidos: a.apellidos,
                        rut: a.rut,
                        email: a.email,
                        telefono: a.telefono,
                        areaTrabajo: a.rol
                    }))
                    : [],

                // El resto igual que antes
                subcontratos: Array.isArray(data.subContratados)
                    ? data.subContratados.map(s => ({
                        id: s.id,
                        nombre: s.nombre,
                        apellidos: s.apellidos,
                        rut: s.rut,
                        email: s.email,
                        telefono: s.telefono,
                        areaTrabajo: s.areaTrabajo
                    }))
                    : [],

                hitos: Array.isArray(data.hitos)
                    ? data.hitos
                    : data.hitos
                        ? [data.hitos]
                        : [],

                ordenesDeCompra: prev.ordenesDeCompra,
                materialesFaltantes: [
  ...(data.pedidosATrabajar?.map(p => ({
    id: p.id,
    grupo: p.nombre || 'Sin nombre',
    cantidad: 1, // o algún campo real si tienes cantidad
    fechaCreacion: p.fechaPedido || new Date().toISOString()
  })) ?? []),
  ...prev.materialesFaltantes
]
            }));

            console.log('Obra cargada en estado:', obra);
        } catch (err) {
            console.error('Error cargando obra:', err);
        }
    };

    // Datos de ejemplo con arrays vacíos para demostrar la funcionalidad
    useEffect(() => {
        fetchData();
        console.log(obra);
    }, [refreshObras]);

    const [obra, setObra] = useState({
        id: obraId,
        titulo: '',
        administrativos: [], // Cambiar a nueva estructura
        asociados: [], // Nuevo array
        subcontratos: [], // Nuevo array
        hitos: [

        ],
        ordenesDeCompra: [
            {
                id: 1,
                nombre: 'Orden de compra #1',
                fechaCreacion: '2023-06-15',
                estado: 'Finalizada',
            },
            {
                id: 2,
                nombre: 'Orden de compra #2',
                fechaCreacion: '2023-06-18',
                estado: 'Realizada',
            },
            {
                id: 3,
                nombre: 'Orden de compra #3',
                fechaCreacion: '2023-06-20',
                estado: 'Cancelada',
            },
        ],
        materialesFaltantes: [
            {
                id: 7,
                grupo: 'Sistema eléctrico',
                cantidad: 1,
                fechaCreacion: '2023-07-01',
                estado: 'Finalizada',
                fechaLlegadaEstimada: '2023-07-15',
                responsable: 'Juan Pérez'
            },
            {
                id: 8,
                grupo: 'Ascensores',
                cantidad: 2,
                fechaCreacion: '2023-07-05',
                estado: 'Rechazada',
                motivoRechazo: 'No se cumplieron las especificaciones técnicas',
                fechaLlegadaEstimada: '2023-07-20',
                responsable: 'María Gómez'
            },
            {
                id: 9,
                grupo: 'Sistema de climatización',
                cantidad: 1,
                fechaCreacion: '2023-07-10',
                estado: 'Pendiente',
                fechaLlegadaEstimada: '2023-07-25',
                responsable: 'Carlos Rodríguez'
            },
        ]
    });

    // Estados para los diálogos
    const [openAdminDialog, setOpenAdminDialog] = useState(false);
    const [openAsociadoDialog, setOpenAsociadoDialog] = useState(false);
    const [openSubcontratoDialog, setOpenSubcontratoDialog] = useState(false);
    const [openDetallesDialog, setOpenDetallesDialog] = useState(false);
    const [openHitoDialog, setOpenHitoDialog] = useState(false);
    const [detallesPersona, setDetallesPersona] = useState(null);

    const [nuevoAdmin, setNuevoAdmin] = useState({
        idUsuario: "",   // 👈 cadena vacía en vez de undefined
        rol: ""// Puedes mantener esto o eliminarlo ya que no se usará
    });

    const [nuevoAsociado, setNuevoAsociado] = useState({
        nombre: '',
        apellidos: '',
        rut: '',
        email: '',
        telefono: '',
        rol: ''
    });

    const [nuevoSubcontrato, setNuevoSubcontrato] = useState({
        nombre: '',
        apellidos: '',
        rut: '',
        email: '',
        telefono: '',
        areaTrabajo: ''
    });

    const [nuevoHito, setNuevoHito] = useState({
        nombre: '',
        fecha: new Date()
    });

    const itemsPorPagina = 4;

    const ordenesDeCompraPaginados = obra.ordenesDeCompra.slice(
        (pageComprados - 1) * itemsPorPagina,
        pageComprados * itemsPorPagina
    );

    const materialesFaltantesPaginados = obra.materialesFaltantes.slice(
        (pageFaltantes - 1) * itemsPorPagina,
        pageFaltantes * itemsPorPagina
    );

    const hitosPaginados = obra.hitos.slice(
        (pageHitos - 1) * itemsPorPagina,
        pageHitos * itemsPorPagina
    );

    // Manejadores para hitos importantes
    const handleOpenHitoDialog = () => {
        setOpenHitoDialog(true);
    };

    const handleOpenPedidoDialog = (pedido) => {
        setPedidoSeleccionado(pedido);
        setOpenPedidoDialog(true);
    };

    const handleCloseHitoDialog = () => {
        setOpenHitoDialog(false);
        setNuevoHito({ nombre: '', fecha: new Date() });
        setHitoEditando(null);
    };
const handleAddHito = async () => {
  if (
    nuevoHito.nombre &&
    nuevoHito.nombre.trim() !== "" &&
    nuevoHito.fecha
  ) {
    const idHito = Math.floor(Math.random() * 1000000);
    const fechaISO = nuevoHito.fecha.toISOString().split("T")[0];

    const url = `http://localhost:8090/badema/api/hito/agregar?nombreHito=${encodeURIComponent(
      nuevoHito.nombre
    )}&fecha=${fechaISO}`;

    console.log("URL final:", url);

    try {
      await axios.put(url, {}, { headers: { Authorization: authHeader } });
      setRefreshObras((prev) => !prev);
      handleCloseHitoDialog();
    } catch (err) {
      console.error("Error al agregar hito:", err);
      alert(err.response?.data?.message || err.message);
    }
  } else {
    alert("Debes completar nombre y fecha.");
  }
};


    const handleAddAdmin = () => {
        if (nuevoAdmin.nombre && nuevoAdmin.rol) {
            const nuevoId = obra.administrativos.length > 0
                ? Math.max(...obra.administrativos.map(a => a.id)) + 1
                : 1;

            setObra(prev => ({
                ...prev,
                administrativos: [
                    ...prev.administrativos,
                    {
                        id: nuevoId,
                        nombre: nuevoAdmin.nombre.split(' ')[0],
                        apellidos: nuevoAdmin.nombre.split(' ').slice(1).join(' ') || '',
                        areaTrabajo: nuevoAdmin.rol,
                        fechaAsignacion: new Date().toISOString().split('T')[0] // Fecha actual automática
                    }
                ]
            }));
            setOpenAdminDialog(false);
            setNuevoAdmin({ nombre: '', areaTrabajo: '', fechaAsignacion: new Date() });
        }
    };

    const handleCloseUsuarioDialog = () => {
        setOpenUsuarioDialog(false);
        setNuevoUsuario({ nombre: '', rol: '' });
    };

    const handleAddUsuario = () => {
        if (nuevoUsuario.nombre && nuevoUsuario.rol) {
            const nuevoId = obra.usuarios.length > 0
                ? Math.max(...obra.usuarios.map(u => u.id)) + 1
                : 1;

            setObra(prev => ({
                ...prev,
                usuarios: [
                    ...prev.usuarios,
                    {
                        id: nuevoId,
                        nombre: nuevoUsuario.nombre.split(' ')[0],
                        apellido: nuevoUsuario.nombre.split(' ').slice(1).join(' ') || '',
                        rol: nuevoUsuario.rol
                    }
                ]
            }));
            handleCloseUsuarioDialog();
        }
    };

    // Resto de handlers
    const handleVerEE = () => {
        navigate('/lectorArchivos/1');
    };

    const handleVerTraza = () => {
        navigate(`/traza/1`);
    };

    // 3. Implementa los handlers para los nuevos cuadrantes:
    const handleOpenDetalles = (persona) => {
        setDetallesPersona(persona);
        setOpenDetallesDialog(true);
    };

    const handleAddAsociado = async () => {
        try {
            console.log('Nuevo asociado:', { ...nuevoAsociado, idObra: parseInt(obraId, 10) });
            const resp = await axios.post(`http://localhost:8090/badema/api/asociado/guardar/${obraId}`, { ...nuevoAsociado, obraId: parseInt(obraId, 10) }, { headers: { Authorization: authHeader } });
            console.log(resp.data);
            setOpenAsociadoDialog(false);
            setRefreshObras(prev => !prev);
        }
        catch (error) {
            console.error('Error al guardar el asociado:', error);
        }
    };

    const handleAddSubcontrato = async () => {
        try {
            console.log('Nuevo subcontrato:', { ...nuevoSubcontrato, idObra: parseInt(obraId, 10) });
            const resp = await axios.post(`http://localhost:8090/badema/api/subcontrato/guardar/${obraId}`, { ...nuevoSubcontrato, obraId: parseInt(obraId, 10) }, { headers: { Authorization: authHeader } });
            console.log(resp.data);
            setOpenSubcontratoDialog(false);
            setRefreshObras(prev => !prev);
        }
        catch (error) {
            console.error('Error al guardar el subcontrato:', error);
        }
    };
    const handleOpenAdminDialog = async () => {
        setOpenAdminDialog(true);
        try {
            const response = await axios.get(
                `http://localhost:8090/badema/api/administrativo/obra/${obraId}`,
                { headers: { Authorization: authHeader } }
            );
            setUsuariosDisponibles(response.data);
        } catch (error) {
            console.error("Error cargando usuarios disponibles:", error);
        }
    };
    const handleGuardarAdmin = async () => {
        try {
            const payload = {
                idObra: obraId,
                idUsuario: nuevoAdmin.idUsuario,
                rol: nuevoAdmin.rol
            };

            const resp = await axios.post(`http://localhost:8090/badema/api/administrativo/save`, payload, {
                headers: { Authorization: authHeader }
            });
            console.log("Administrativo guardado:", resp.data);


            // Actualiza lista y cierra diálogo
            setOpenAdminDialog(false);
            setNuevoAdmin({ idUsuario: '', rol: '' });
            setRefreshObras(prev => !prev); // o fetchAdministrativos() si es una función separada
        } catch (error) {
            const mensaje = error.response?.data?.message || error.message || "Error al guardar administrativo";
            setSnackbar({
                open: true,
                message: mensaje,
                severity: "error"
            });
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: 3 }}>
                {/* Sección de título y descripción con botón EE */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3
                }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {obra.titulo}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<DescriptionIcon />}
                        onClick={handleVerEE}
                        sx={{
                            backgroundColor: 'secondary.main',
                            '&:hover': { backgroundColor: 'secondary.dark' },
                            fontSize: '1rem',
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Visualizar Archivos de la Obra
                    </Button>
                </Box>

                {/* Sección combinada de Administrativos y Usuarios */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4,
                    mb: 4
                }}>
                    {/* Administrativos Responsables */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 2 }}>
                                Administrativos Responsables
                            </Typography>
                            <IconButton
                                color="primary"
                                onClick={handleOpenAdminDialog}
                                sx={{ backgroundColor: 'primary.main', color: 'white' }}
                            >
                                <AddCircleIcon />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: 300, overflowY: 'auto', p: 1 }}>
                            {obra.administrativos.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    No hay administrativos asignados
                                </Typography>
                            )}
                            {obra.administrativos.map((admin) => (
                                <Paper
                                    key={admin.id}
                                    elevation={2}
                                    sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, minWidth: 200, cursor: 'pointer' }}
                                    onClick={() => handleOpenDetalles({
                                        ...admin,
                                        tipo: 'Administrativo'
                                    })}
                                >
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        {admin.nombre}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            {admin.nombre}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {admin.areaTrabajo}
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Box>

                    {/* Asociados */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 2 }}>
                                Asociados
                            </Typography>
                            <IconButton
                                color="primary"
                                onClick={() => setOpenAsociadoDialog(true)}
                                sx={{ backgroundColor: 'primary.main', color: 'white' }}
                            >
                                <AddCircleIcon />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: 300, overflowY: 'auto', p: 1 }}>
                            {obra.asociados.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    No hay asociados registrados
                                </Typography>
                            )}
                            {obra.asociados.map((asociado) => (
                                <Paper
                                    key={asociado.id}
                                    elevation={2}
                                    sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, minWidth: 200, cursor: 'pointer' }}
                                    onClick={() => handleOpenDetalles({
                                        ...asociado,
                                        tipo: 'Asociado'
                                    })}
                                >
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                        {asociado.nombre}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            {asociado.nombre} {asociado.apellidos}
                                        </Typography>

                                        {(asociado.areaTrabajo === 0) ? <Typography variant="caption" color="text.secondary">Jefe de obra</Typography> : <Typography variant="caption" color="text.secondary">Bodega</Typography>}

                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Box>

                    {/* Subcontratos */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 2 }}>
                                Subcontratos
                            </Typography>
                            <IconButton
                                color="primary"
                                onClick={() => setOpenSubcontratoDialog(true)}
                                sx={{ backgroundColor: 'primary.main', color: 'white' }}
                            >
                                <AddCircleIcon />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: 300, overflowY: 'auto', p: 1 }}>
                            {obra.subcontratos.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    No hay subcontratos registrados
                                </Typography>
                            )}
                            {obra.subcontratos.map((subcontrato) => (
                                <Paper
                                    key={subcontrato.id}
                                    elevation={2}
                                    sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, minWidth: 200, cursor: 'pointer' }}
                                    onClick={() => handleOpenDetalles({
                                        ...subcontrato,
                                        tipo: 'Subcontrato'
                                    })}
                                >
                                    <Avatar sx={{ bgcolor: 'success.main' }}>
                                        {subcontrato.nombre + ' ' + subcontrato.apellidos}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            {subcontrato.nombre} {subcontrato.apellidos}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {subcontrato.areaTrabajo}
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Sección de listas de materiales e hitos */}
                <Grid container spacing={3} sx={{
                    width: '100%',
                    margin: 0,
                    justifyContent: 'center'
                }}>
                    {/* Hitos Importantes */}
                    <Grid item xs={12} md={4} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0 !important',
                        minWidth: '575px'
                    }}>
                        <Paper elevation={0} sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                            minWidth: '300px'
                        }}>
                            <Box sx={{
                                p: 2,
                                backgroundColor: 'rgba(125, 125, 125, 0.05)', // mismo fondo suave
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                borderBottom: '1px solid',
                                borderBottomColor: 'secondary.light', // mismo color de borde
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6" sx={{
                                    color: 'secondary.dark', // mismo color de texto
                                    fontWeight: 'bold'
                                }}>
                                    Hitos Importantes
                                </Typography>
                                <IconButton
                                    color="primary"
                                    onClick={handleOpenHitoDialog}
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
                            </Box>

                            {/* Buscador para hitos */}
                            <TextField
                                placeholder="Buscar hitos..."
                                variant="outlined"
                                size="small"
                                sx={{ m: 2, mb: 1 }}
                            />

                            <List sx={{ flex: 1, overflow: 'auto', width: '100%' }}>

                                {obra.hitos.slice(0, 3).flatMap((hito) =>
                                    Object.entries(hito)
                                        .filter(([key]) => key !== 'id' && key !== 'idObra')
                                        .map(([clave, valor]) => (
                                            <ListItem key={`hito-${hito.id}-${clave}`} sx={{
                                                borderBottom: '1px solid',
                                                borderColor: 'divider',
                                                width: '100%',
                                                py: 2,
                                                pr: 0
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    width: '100%',
                                                    px: 2
                                                }}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        flex: 1,
                                                        minWidth: 0
                                                    }}>
                                                        <EventIcon color="info" fontSize="small" />
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 500,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {clave} : {new Date(valor).toLocaleDateString('es-ES')}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        ml: 2,
                                                        flexShrink: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <IconButton onClick={() => {
                                                            setNuevoHito({
                                                                nombre: clave,
                                                                fecha: new Date(valor),
                                                                nombreAntiguo: clave
                                                            });
                                                            setHitoEditando(hito.id);
                                                            setOpenHitoDialog(true);
                                                        }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton onClick={() => {
                                                            setObra(prev => ({
                                                                ...prev,
                                                                hitos: prev.hitos.map(h =>
                                                                    h.id === hito.id
                                                                        ? Object.fromEntries(Object.entries(h).filter(([k]) => k !== clave))
                                                                        : h
                                                                )
                                                            }));
                                                        }}>
                                                            <DeleteIcon fontSize="small" color="error" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        ))
                                )}

                            </List>
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <Pagination
                                    count={Math.ceil(obra.hitos.length / 3)} // Mostrar solo 3 elementos por página
                                    page={pageHitos}
                                    onChange={(e, value) => setPageHitos(value)}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Lista de pedidos a trabajar */}
                    <Grid item xs={12} md={4} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0 !important',
                        minWidth: '575px'
                    }}>
                        <Paper elevation={0} sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                            minWidth: '350px'
                        }}>
                            <Box sx={{
                                p: 2,
                                backgroundColor: 'rgba(125, 125, 125, 0.05)',
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                borderBottom: '1px solid',
                                borderBottomColor: 'secondary.light',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6" sx={{
                                    color: 'secondary.dark',
                                    fontWeight: 'bold'
                                }}>
                                    Lista de pedidos a trabajar
                                </Typography>
                                <IconButton
                                    color="primary"
                                    onClick={() => navigate(`/gestionarPedidos/${obraId}`)}
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
                            </Box>

                            {/* Buscador para pedidos a trabajar */}
                            <TextField
                                placeholder="Buscar pedidos..."
                                variant="outlined"
                                size="small"
                                sx={{ m: 2, mb: 1 }}
                            />

                            <List sx={{ flex: 1, overflow: 'auto', width: '100%' }}>
                                {materialesFaltantesPaginados.slice(0, 3).map((material, index) => (
                                    <ListItem
                                        key={`faltante-${material.id}-${index}`}
                                        secondaryAction={
                                            <Box sx={{
                                                display: 'flex',
                                                gap: 2,
                                                alignItems: 'center',
                                                ml: 4,
                                                minWidth: '320px'
                                            }}>

                                                {/* Resto de los botones... */}
                                                {index === 0 && (
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => navigate('/adquisiciones/1')}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '0.9rem',
                                                            minWidth: '180px',
                                                            py: 1,
                                                            px: 2,
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        Ver Adquisiciones
                                                    </Button>
                                                )}

                                                {/* Segundo elemento muestra "Ver Orden de compra" */}
                                                {index === 1 && (
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => navigate('/ordenDeCompra/1')} // Actualizar ruta luego
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '0.9rem',
                                                            minWidth: '180px',
                                                            py: 1,
                                                            px: 2,
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        Manejar Adquisiciones
                                                    </Button>
                                                )}

                                                {/* Tercer elemento muestra "Ver Seguimiento" */}
                                                {index === 2 && (
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => navigate('/seguimientoCompra/1/1')} // Actualizar ruta luego
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '0.9rem',
                                                            minWidth: '180px',
                                                            py: 1,
                                                            px: 2,
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        Ver Seguimiento
                                                    </Button>
                                                )}
                                            </Box>
                                        }
                                        sx={{
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            width: '100%',
                                            py: 2,
                                            pr: 0
                                        }}
                                    >


                                        {/* Contenido principal */}
                                        {/* Botón de ojo a la izquierda */}
                                        <IconButton
                                            onClick={() => handleOpenPedidoDialog(material)}
                                            sx={{
                                                color: 'primary.main',
                                                mr: 1
                                            }}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                            width: '100%',
                                            maxWidth: 'calc(100% - 320px)',
                                            pr: 2
                                        }}>

                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: 500,
                                                    whiteSpace: 'pre-wrap',
                                                    color: material.estado === 'Rechazada' ? 'error.main' : 'inherit' // Agrega esta línea
                                                }}
                                            >
                                                {material.grupo
                                                    .match(/.{1,19}/g)
                                                    ?.map((linea, index, arr) => {
                                                        const esUltima = index === arr.length - 1;
                                                        return !esUltima ? linea + '-' + '\n' : linea;
                                                    })
                                                    .join('')}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                Creado: {new Date(material.fechaCreacion).toLocaleDateString('es-ES')}
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <Pagination
                                    count={Math.ceil(obra.materialesFaltantes.length / 3)}
                                    page={pageFaltantes}
                                    onChange={(e, value) => setPageFaltantes(value)}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Lista de pedidos finalizados */}
                    <Grid item xs={12} md={4} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0 !important',
                        minWidth: '575px'
                    }}>
                        <Paper elevation={0} sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                            minWidth: '350px'
                        }}>
                            <Box sx={{
                                p: 2,
                                backgroundColor: 'rgba(125, 125, 125, 0.05)', // mismo fondo
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                borderBottom: '1px solid',
                                borderBottomColor: 'secondary.light', // agregamos para mantener consistencia
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6" sx={{
                                    color: 'secondary.dark', // mismo color de texto
                                    fontWeight: 'bold'
                                }}>
                                    Lista de Órdenes de Compra
                                </Typography>
                            </Box>

                            {/* Buscador para pedidos finalizados */}
                            <TextField
                                placeholder="Buscar Ordenes..."
                                variant="outlined"
                                size="small"
                                sx={{ m: 2, mb: 1 }}
                            />

                            <List sx={{ flex: 1, overflow: 'auto', width: '100%' }}>
                                {ordenesDeCompraPaginados.slice(0, 3).map((orden) => (
                                    <ListItem
                                        key={`orden-${orden.id}`}
                                        secondaryAction={
                                            <Box sx={{
                                                display: 'flex',
                                                gap: 2,
                                                alignItems: 'center',
                                                ml: 4,
                                                minWidth: '240px'
                                            }}>
                                                {/* Botón de seguimiento solo para estados específicos */}
                                                {(orden.estado === 'Realizada' || orden.estado === 'Finalizada') && (
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => navigate(`/seguimientoCompra/${id}`)}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '0.9rem',
                                                            minWidth: '120px',
                                                            py: 1,
                                                            px: 2,
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        Ver Seguimiento
                                                    </Button>
                                                )}

                                                {/* Botón de traza */}
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleVerTraza(orden.nombre)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontSize: '0.9rem',
                                                        minWidth: '120px',
                                                        py: 1,
                                                        px: 2,
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    Ver Traza
                                                </Button>
                                            </Box>
                                        }
                                        sx={{
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            width: '100%',
                                            py: 2,
                                            pr: 0
                                        }}
                                    >
                                        {/* Icono PDF a la izquierda */}
                                        <IconButton
                                            onClick={() => navigate('/lectorArchivos/1')}
                                            sx={{
                                                color: 'error.main',
                                                mr: 2,
                                                alignSelf: 'flex-start' // Alinea el icono con la primera línea
                                            }}
                                        >
                                            <DescriptionIcon />
                                        </IconButton>

                                        {/* Contenido principal */}
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0.5,
                                            width: '100%',
                                            maxWidth: 'calc(100% - 280px)',
                                            pr: 2
                                        }}>
                                            {/* Nombre de la orden */}
                                            <Typography variant="h6" sx={{
                                                fontSize: '1.1rem',
                                                fontWeight: 500,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                lineHeight: 1.2
                                            }}>
                                                {orden.nombre}
                                            </Typography>

                                            {/* Fecha y estado en la misma línea */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Creada: {new Date(orden.fechaCreacion).toLocaleDateString('es-ES')}
                                                </Typography>

                                                {/* Estado al lado de la fecha */}
                                                <Chip
                                                    label={orden.estado}
                                                    color={
                                                        orden.estado === 'Finalizada' ? 'success' :
                                                            orden.estado === 'Realizada' ? 'primary' :
                                                                'error'
                                                    }
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        height: '24px',
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <Pagination
                                    count={Math.ceil(obra.ordenesDeCompra.length / 3)}
                                    page={pageComprados}
                                    onChange={(e, value) => setPageComprados(value)}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Botones finales */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{
                            textTransform: 'none',
                            fontSize: '1rem',
                            py: 1.5,
                            px: 4
                        }}
                    >
                        Regresar
                    </Button>
                </Box>

                {/* Diálogo para agregar hitos importantes */}
                <Dialog open={openHitoDialog} onClose={handleCloseHitoDialog}>
                    <DialogTitle>Agregar Hito Importante</DialogTitle>
                    <DialogContent sx={{ minWidth: 400 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nombre del hito"
                            fullWidth
                            value={nuevoHito.nombre}
                            onChange={(e) => setNuevoHito({ ...nuevoHito, nombre: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <DatePicker
                            label="Fecha"
                            value={nuevoHito.fecha}
                            onChange={(newValue) => setNuevoHito({ ...nuevoHito, fecha: newValue })}
                            renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 1 }} />}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseHitoDialog}>Cancelar</Button>
                        <Button onClick={handleAddHito} variant="contained">Agregar</Button>
                    </DialogActions>
                </Dialog>


                {/* Diálogo para agregar usuarios */}
                <Dialog open={openUsuarioDialog} onClose={handleCloseUsuarioDialog}>
                    <DialogTitle>Agregar Usuario con Acceso</DialogTitle>
                    <DialogContent sx={{ minWidth: 400 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nombre completo"
                            fullWidth
                            variant="outlined"
                            value={nuevoUsuario.nombre}
                            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                            sx={{ mb: 3 }}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Rol del usuario</InputLabel>
                            <Select
                                value={nuevoUsuario.rol}
                                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
                                label="Rol del usuario"
                            >
                                {rolesAsociados.map((rol) => (
                                    <MenuItem key={rol.id} value={rol.id}>{rol.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUsuarioDialog}>Cancelar</Button>
                        <Button onClick={handleAddUsuario} variant="contained">Agregar</Button>
                    </DialogActions>
                </Dialog>

                {/* Diálogo para detalles */}
                <Dialog open={openDetallesDialog} onClose={() => setOpenDetallesDialog(false)}>
                    <DialogTitle>Detalles de {detallesPersona?.tipo}</DialogTitle>
                    <DialogContent>
                        {detallesPersona && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Nombre: {detallesPersona.nombre} {detallesPersona.apellidos}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Área de trabajo: {detallesPersona.areaTrabajo}
                                </Typography>

                                {detallesPersona.tipo === 'Administrativo' && (
                                    <Typography variant="body1">
                                        Fecha asignación: {detallesPersona.fechaAsignacion}
                                    </Typography>
                                )}

                                {(detallesPersona.tipo === 'Asociado' || detallesPersona.tipo === 'Subcontrato') && (
                                    <>
                                        <Typography variant="body1" gutterBottom>
                                            RUT: {detallesPersona.rut}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                            Email: {detallesPersona.email}
                                        </Typography>
                                        <Typography variant="body1">
                                            Teléfono: {detallesPersona.telefono}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDetallesDialog(false)}>Cerrar</Button>
                    </DialogActions>
                </Dialog>

                {/* Diálogo para agregar administrativos */}
                <Dialog open={openAdminDialog} onClose={() => setOpenAdminDialog(false)}>
                    <DialogTitle>Agregar Administrativo Responsable</DialogTitle>
                    <DialogContent sx={{ minWidth: 400 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Selecciona un usuario</InputLabel>
                        <Select
                            value={nuevoAdmin.idUsuario}
                            onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, idUsuario: e.target.value })}
                            label="Usuario"
                            placeholder="Selecciona un usuario"
                        >
                            {usuariosDisponibles.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.nombre} {user.apellidos}
                                </MenuItem>
                            ))}
                        </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Área de trabajo</InputLabel>
                            <Select
                                value={nuevoAdmin.rol}
                                onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, rol: e.target.value })}
                                label="Área de trabajo"
                            >
                                {rolesAdministrativos.map((rol) => (
                                    <MenuItem key={rol} value={rol}>{rol}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAdminDialog(false)}>Cancelar</Button>
                        <Button onClick={handleGuardarAdmin} variant="contained">Agregar</Button>
                    </DialogActions>
                </Dialog>

                {/* Diálogo para agregar asociados */}
                <Dialog open={openAsociadoDialog} onClose={() => setOpenAsociadoDialog(false)}>
                    <DialogTitle>Agregar Asociado</DialogTitle>
                    <DialogContent sx={{ minWidth: 400 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nombre"
                            fullWidth
                            value={nuevoAsociado.nombre}
                            onChange={(e) => setNuevoAsociado({ ...nuevoAsociado, nombre: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Apellidos"
                            fullWidth
                            value={nuevoAsociado.apellidos}
                            onChange={(e) => setNuevoAsociado({ ...nuevoAsociado, apellidos: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="RUT"
                            fullWidth
                            value={nuevoAsociado.rut}
                            onChange={(e) => setNuevoAsociado({ ...nuevoAsociado, rut: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Email"
                            type="email"
                            fullWidth
                            value={nuevoAsociado.email}
                            onChange={(e) => setNuevoAsociado({ ...nuevoAsociado, email: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Teléfono"
                            fullWidth
                            value={nuevoAsociado.telefono}
                            onChange={(e) => setNuevoAsociado({ ...nuevoAsociado, telefono: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Área de trabajo</InputLabel>
                            <Select
                                value={nuevoAsociado.rol}
                                onChange={(e) => setNuevoAsociado({ ...nuevoAsociado, rol: e.target.value })}
                                label="Área de trabajo"
                            >
                                {rolesAsociados.map((rol) => (
                                    <MenuItem key={rol.id} value={rol.id}>{rol.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAsociadoDialog(false)}>Cancelar</Button>
                        <Button onClick={handleAddAsociado} variant="contained">Agregar</Button>
                    </DialogActions>
                </Dialog>

                {/* Diálogo para ver detalles del pedido */}
                <Dialog open={openPedidoDialog} onClose={() => setOpenPedidoDialog(false)}>
                    <DialogTitle>Detalles del Pedido</DialogTitle>
                    <DialogContent sx={{ minWidth: 400 }}>
                        {pedidoSeleccionado && (
                            <Box sx={{ mt: 2 }}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle1" component="span">
                                            <strong>ID:</strong> {pedidoSeleccionado.id}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle1" component="span">
                                            <strong>Nombre:</strong> {pedidoSeleccionado.grupo}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" component="span" sx={{ mr: 1 }}>
                                            <strong>Estado:</strong>
                                        </Typography>
                                        <Chip
                                            label={pedidoSeleccionado.estado || 'Pendiente'}
                                            color={
                                                pedidoSeleccionado.estado === 'Finalizada' ? 'success' :
                                                    pedidoSeleccionado.estado === 'Rechazada' ? 'error' : 'primary'
                                            }
                                            variant="outlined"
                                        />
                                    </Box>

                                    {pedidoSeleccionado.estado === 'Rechazada' && (
                                        <TextField
                                            label="Motivo de rechazo"
                                            value={pedidoSeleccionado.motivoRechazo || ''}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            variant="outlined"
                                            InputProps={{
                                                readOnly: true
                                            }}
                                        />
                                    )}

                                    <Box>
                                        <Typography variant="body1">
                                            <strong>Responsable:</strong> {pedidoSeleccionado.responsable || 'No asignado'}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body1">
                                            <strong>Fecha de creación:</strong> {new Date(pedidoSeleccionado.fechaCreacion).toLocaleDateString('es-ES')}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body1">
                                            <strong>Fecha estimada de llegada:</strong> {pedidoSeleccionado.fechaLlegadaEstimada ? new Date(pedidoSeleccionado.fechaLlegadaEstimada).toLocaleDateString('es-ES') : 'No especificada'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenPedidoDialog(false)}>Cerrar</Button>
                    </DialogActions>
                </Dialog>

                {/* Diálogo para agregar subcontratos */}
                <Dialog open={openSubcontratoDialog} onClose={() => setOpenSubcontratoDialog(false)}>
                    <DialogTitle>Agregar Subcontrato</DialogTitle>
                    <DialogContent sx={{ minWidth: 400 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nombre"
                            fullWidth
                            value={nuevoSubcontrato.nombre}
                            onChange={(e) => setNuevoSubcontrato({ ...nuevoSubcontrato, nombre: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Apellidos"
                            fullWidth
                            value={nuevoSubcontrato.apellidos}
                            onChange={(e) => setNuevoSubcontrato({ ...nuevoSubcontrato, apellidos: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="RUT"
                            fullWidth
                            value={nuevoSubcontrato.rut}
                            onChange={(e) => setNuevoSubcontrato({ ...nuevoSubcontrato, rut: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Email"
                            type="email"
                            fullWidth
                            value={nuevoSubcontrato.email}
                            onChange={(e) => setNuevoSubcontrato({ ...nuevoSubcontrato, email: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Teléfono"
                            fullWidth
                            value={nuevoSubcontrato.telefono}
                            onChange={(e) => setNuevoSubcontrato({ ...nuevoSubcontrato, telefono: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Área de trabajo"
                            fullWidth
                            value={nuevoSubcontrato.areaTrabajo}
                            onChange={(e) => setNuevoSubcontrato({ ...nuevoSubcontrato, areaTrabajo: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenSubcontratoDialog(false)}>Cancelar</Button>
                        <Button onClick={handleAddSubcontrato} variant="contained">Agregar</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default Obra;