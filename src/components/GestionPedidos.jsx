import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useParams } from 'react-router-dom';
const GestionarPedidos = ({  }) => {
    const { obraId } = useParams();
    const raw = localStorage.getItem('_auth_state');

    // 2. Lo parseas a objeto (asegurándote de que exista)
    let userId = null;
    if (raw) {
    try {
        const auth = JSON.parse(raw);
        userId = auth.userId;
    } catch (e) {
        console.error('Error parseando _auth_state:', e);
    }
    }
    const authType = localStorage.getItem('_auth_type');  // e.g. 'Bearer'
    const token = localStorage.getItem('_auth');       // tu JWT

    // Variable que los une
    const authHeader = `${authType} ${token}`;
    const mapEstado = estado =>
        estado === 'realizada' ? 0
            : estado === 'finalizada' ? 1
                : 0;

    const formatFecha = date =>
        date ? date.toISOString().slice(0, 10) : null;

    const mapEspecificaciones = specsArray =>
        specsArray.reduce((obj, esp, idx) => {
            obj[`esp${idx + 1}`] = esp;
            return obj;
        }, {});

    const handleGuardarCambios = async () => {
        try {
            // Enviamos cada pedido por separado
            for (let pedido of pedidos) {
                const payload = {
                    idResponsable: userId ,
                    idObra: pedido.idObra,
                    estado: mapEstado(pedido.estado),
                    fechaEstimadaLlegada: formatFecha(pedido.fechaEsperada),
                    nombre: pedido.nombre,
                    materiales: pedido.materiales.map(mat => ({
                        nombreMaterial: mat.nombre,
                        comentarios: mat.comentarios,
                        cantidad: mat.cantidad,
                        estado: mapEstado(mat.estado),
                        especificaciones: mapEspecificaciones(mat.especificaciones)
                    }))
                };
                console.log('Guardando pedido:', payload);
                await axios.post('http://localhost:8090/badema/api/pedido/guardar', payload, { headers: { Authorization: authHeader } });
            }
            alert('Pedidos guardados correctamente');
        } catch (err) {
            console.error(err);
            alert('Error al guardar pedidos');
        }
    };
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
    const [materialesDelPedido, setMaterialesDelPedido] = useState([]);

    // Datos de ejemplo (en un caso real vendrían de una API)
    const [pedidos, setPedidos] = useState([]);

    const handleSelectMaterial = (material) => {
        setMaterialSeleccionado(material);
    };

    const handleSelectPedido = (pedido) => {
        setPedidoSeleccionado(pedido);
        setMaterialesDelPedido([...pedido.materiales]);
        setMaterialSeleccionado(null);
    };

    const handleActualizarMaterial = () => {
        if (materialSeleccionado.especificaciones.filter(esp => esp.trim() !== '').length < 3) {
            alert('Debe completar al menos 3 especificaciones técnicas');
            return;
        }

        if (!materialSeleccionado.nombre.trim()) {
            alert('Debe ingresar un nombre para el material');
            return;
        }

        setPedidos(prev =>
            prev.map(p =>
                p.id === pedidoSeleccionado.id
                    ? {
                        ...p,
                        materiales: p.materiales.map(m =>
                            m.id === materialSeleccionado.id
                                ? materialSeleccionado
                                : m
                        )
                    }
                    : p
            )
        );

        setMaterialesDelPedido(prev =>
            prev.map(m =>
                m.id === materialSeleccionado.id ? materialSeleccionado : m
            )
        );

        alert('Material actualizado correctamente');
    };

    const handleAddPedido = (obraId) => {
        const nuevoPedido = {
            id: Date.now(),
            idObra: obraId,
            nombre: '',
            materiales: [],
            estado: 'realizada', // Cambiado de 'pendiente'
            fechaEsperada: null
        };

        setPedidos([...pedidos, nuevoPedido]);
        setPedidoSeleccionado(nuevoPedido);
        setMaterialSeleccionado(null);
    };

    const handleAddMaterial = () => {
        if (!pedidoSeleccionado) return;

        const nuevoMaterial = {
            id: Date.now(),
            nombre: '',
            especificaciones: ['', '', ''],
            cantidad: 1,
            comentarios: '',
            estado: 'realizada', // Cambiado de 'pendiente'
            proveedorId: null,
            proveedorData: null
        };

        setMaterialesDelPedido([...materialesDelPedido, nuevoMaterial]);
        setMaterialSeleccionado(nuevoMaterial);

        setPedidos(prev =>
            prev.map(p =>
                p.id === pedidoSeleccionado.id
                    ? {
                        ...p,
                        materiales: [...p.materiales, nuevoMaterial]
                    }
                    : p
            )
        );
    };

    const handlePedidoChange = (pedidoId, campo, valor) => {
        setPedidos(prev =>
            prev.map(p =>
                p.id === pedidoId ? { ...p, [campo]: valor } : p
            )
        );
    };

    const handleMaterialChange = (campo, valor) => {
        setMaterialSeleccionado(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handleEspecificacionChange = (index, valor) => {
        setMaterialSeleccionado(prev => {
            const nuevasEspecificaciones = [...prev.especificaciones];
            nuevasEspecificaciones[index] = valor;
            return {
                ...prev,
                especificaciones: nuevasEspecificaciones
            };
        });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <Paper elevation={3} sx={{
                    p: 4,
                    borderRadius: 3,
                    width: '100%',
                    maxWidth: 1400,
                    mx: 'auto'
                }}>
                    <Typography variant="h4" gutterBottom sx={{
                        fontWeight: 'bold',
                        color: 'primary.main',
                        textAlign: 'center',
                        mb: 4
                    }}>
                        Gestión de Pedidos - Obra #{obraId}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => handleAddPedido(obraId)}
                        >
                            Agregar Nuevo Pedido
                        </Button>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        gap: 3,
                        height: '650px',
                        justifyContent: 'center'
                    }}>
                        {/* Listado de Pedidos */}
                        <Paper elevation={2} sx={{
                            p: 3,
                            width: '100%',
                            maxWidth: 400,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <Typography variant="h6" sx={{
                                mb: 3,
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                            }}>
                                Listado de Pedidos
                            </Typography>

                            <Box sx={{
                                flex: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {pedidos.length === 0 ? (
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                            Agregue un Pedido para visualizar aquí
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        pr: 1
                                    }}>
                                        {pedidos.map((pedido) => (
                                            <Card
                                                key={pedido.id}
                                                sx={{
                                                    mb: 2,
                                                    borderLeft: '4px solid',
                                                    borderColor: pedido.estado === 'finalizada'
                                                        ? '#4CAF50'  // Verde para Finalizada
                                                        : '#FFC107', // Amarillo para Realizada
                                                    backgroundColor: pedidoSeleccionado?.id === pedido.id
                                                        ? 'rgba(74, 144, 226, 0.08)'
                                                        : 'background.paper',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(74, 144, 226, 0.04)'
                                                    }
                                                }}
                                                onClick={() => handleSelectPedido(pedido)}
                                            >
                                                <CardContent sx={{ p: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <TextField
                                                            fullWidth
                                                            variant="standard"
                                                            placeholder="Nombre del pedido"
                                                            value={pedido.nombre}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => handlePedidoChange(pedido.id, 'nombre', e.target.value)}
                                                            sx={{
                                                                '& .MuiInput-input': {
                                                                    fontWeight: 'bold',
                                                                    color: 'text.primary'
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                                            <InputLabel>Estado</InputLabel>
                                                            <Select
                                                                value={pedido.estado}
                                                                onChange={(e) => handlePedidoChange(pedido.id, 'estado', e.target.value)}
                                                                label="Estado"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MenuItem value="realizada">Realizada</MenuItem>
                                                                <MenuItem value="finalizada">Finalizada</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                    <Box sx={{ mt: 2 }}>
                                                        <DatePicker
                                                            label="Fecha esperada"
                                                            value={pedido.fechaEsperada}
                                                            onChange={(newValue) => handlePedidoChange(pedido.id, 'fechaEsperada', newValue)}
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    size: 'small'
                                                                }
                                                            }}
                                                            disablePast
                                                        />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Paper>

                        {/* Edición de material seleccionado */}
                        <Paper elevation={2} sx={{
                            p: 3,
                            width: '100%',
                            maxWidth: 450,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <Typography variant="h6" sx={{
                                mb: 3,
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                            }}>
                                {materialSeleccionado ? `Edición de Material` : 'Edición de Material'}
                            </Typography>

                            <Box sx={{
                                flex: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {!materialSeleccionado ? (
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                            {!pedidoSeleccionado
                                                ? 'Seleccione un pedido y un material para editarlo'
                                                : 'Seleccione un material de la lista para editarlo'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        pr: 1,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <TextField
                                            fullWidth
                                            label="Nombre del material"
                                            value={materialSeleccionado.nombre}
                                            onChange={(e) => handleMaterialChange('nombre', e.target.value)}
                                            sx={{ mb: 2 }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Comentarios"
                                            multiline
                                            rows={3}
                                            value={materialSeleccionado.comentarios}
                                            onChange={(e) => handleMaterialChange('comentarios', e.target.value)}
                                            sx={{ mb: 2 }}
                                        />

                                        <Grid container spacing={2} sx={{ mb: 2 }}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Cantidad"
                                                    type="number"
                                                    value={materialSeleccionado.cantidad}
                                                    onChange={(e) => handleMaterialChange('cantidad', parseInt(e.target.value) || 0)}
                                                />
                                            </Grid>
                                        </Grid>

                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Estado</InputLabel>
                                            <Select
                                                value={materialSeleccionado.estado}
                                                onChange={(e) => handleMaterialChange('estado', e.target.value)}
                                                label="Estado"
                                            >
                                                <MenuItem value="realizada">Realizada</MenuItem>
                                                <MenuItem value="finalizada">Finalizada</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Box sx={{ mb: 2, flex: 1 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Especificaciones Técnicas (mínimo 3):
                                            </Typography>
                                            <Box sx={{
                                                maxHeight: 200,
                                                overflowY: 'auto',
                                                mb: 1
                                            }}>
                                                {materialSeleccionado.especificaciones.map((esp, index) => (
                                                    <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                                                        <TextField
                                                            fullWidth
                                                            value={esp}
                                                            onChange={(e) => handleEspecificacionChange(index, e.target.value)}
                                                            size="small"
                                                            placeholder='Ej: Largo = 50m'
                                                            required={index < 3}
                                                            error={index < 3 && !esp.trim()}
                                                        />
                                                        
                                                        {index >= 3 && (
                                                            <IconButton
                                                                onClick={() => {
                                                                    setMaterialSeleccionado(prev => {
                                                                        const nuevasEspecificaciones = prev.especificaciones.filter((_, i) => i !== index);
                                                                        return {
                                                                            ...prev,
                                                                            especificaciones: nuevasEspecificaciones
                                                                        };
                                                                    });
                                                                }}
                                                                size="small"
                                                                sx={{ ml: 1, color: 'error.main' }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                            {materialSeleccionado.especificaciones.length < 3 && (
                                                <Typography color="error" variant="caption">
                                                    Debe agregar al menos 3 especificaciones
                                                </Typography>
                                            )}
                                            <Button
                                                variant="text"
                                                size="small"
                                                startIcon={<AddCircleOutlineIcon fontSize="small" />}
                                                onClick={() => {
                                                    setMaterialSeleccionado(prev => ({
                                                        ...prev,
                                                        especificaciones: [...prev.especificaciones, '']
                                                    }));
                                                }}
                                                sx={{ mt: 1 }}
                                                disabled={materialSeleccionado.especificaciones.length >= 10}
                                            >
                                                Agregar Especificación
                                            </Button>
                                        </Box>

                                        <Box sx={{ mt: 2, mb: 2 }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                onClick={handleActualizarMaterial}
                                            >
                                                Actualizar Datos de Material
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Paper>

                        {/* Lista de materiales del pedido */}
                        <Paper elevation={2} sx={{
                            p: 3,
                            width: '100%',
                            maxWidth: 400,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <Typography variant="h6" sx={{
                                mb: 3,
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                            }}>
                                Materiales del Pedido
                            </Typography>

                            <Box sx={{
                                flex: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {!pedidoSeleccionado ? (
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                            Seleccione un pedido para ver sus materiales
                                        </Typography>
                                    </Box>
                                ) : materialesDelPedido.length === 0 ? (
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                            Ingrese al menos un material para empezar a trabajar
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        pr: 1
                                    }}>
                                        {materialesDelPedido.map((material) => (
                                            <Card
                                                key={material.id}
                                                sx={{
                                                    mb: 2,
                                                    backgroundColor: materialSeleccionado?.id === material.id
                                                        ? 'rgba(74, 144, 226, 0.08)'
                                                        : 'background.paper',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(74, 144, 226, 0.04)'
                                                    }
                                                }}
                                                onClick={() => handleSelectMaterial(material)}
                                            >
                                                <CardContent sx={{ p: 2 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {material.nombre || "Material sin nombre"}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Cantidad: {material.cantidad}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Estado: {material.estado === 'finalizada' ? 'Finalizada' : 'Realizada'}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            {pedidoSeleccionado && (
                                <Button
                                    variant="outlined"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={handleAddMaterial}
                                    sx={{ mt: 2 }}
                                    fullWidth
                                >
                                    Agregar Material
                                </Button>
                            )}
                        </Paper>
                    </Box>

                    {/* Botones de navegación */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        pt: 2,
                        mt: 7,
                        borderTop: '1px solid #eee'
                    }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => window.history.back()}
                            sx={{ minWidth: 120 }}
                        >
                            Volver
                        </Button>

                        <Button
                            variant="contained"
                            onClick={() => {
                                // Lógica para guardar los cambios
                                handleGuardarCambios();
                            }}
                            sx={{ minWidth: 120 }}
                        >
                            Guardar Cambios
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default GestionarPedidos;