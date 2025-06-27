import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Typography,
    IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate, useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
const CrearObra = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [errores, setErrores] = useState({});
    const user = useAuthUser();
    const userId = user?.userId;
    const [datosObra, setDatosObra] = useState({
        nombre: '',
        empresaContratista: '',
        esPublico: false,
        fechaInicio: null,
        fechaTermino: null,
        estado: 0,
        metrosCuadrados: '',
        hitos: [{ nombre: '', fecha: null }]
    });

    const tiposObra = [
        { value: false, label: 'Privada' },
        { value: true, label: 'Pública' }
    ];

    const estadosObra = [
        { value: 0, label: 'Estudio de propuesta' },
        { value: 1, label: 'Proyecto ofertado' },
        { value: 2, label: 'Proyecto adjudicado' },
        { value: 3, label: 'Proyecto no adjudicado' },
        { value: 4, label: 'En ejecución' },
        { value: 5, label: 'Finalizada' },
    ];
        const authType = localStorage.getItem('_auth_type');  // 'Bearer'
        const token = localStorage.getItem('_auth');       // tu JWT

        // Variable que los une
        const authHeader = `${authType} ${token}`;
    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8090/badema/api/obra/id/${id}`, {
                headers: {
                    Authorization: authHeader
                },
                withCredentials: true
            })
                .then(response => {
                    const obraData = response.data;
                    setDatosObra({
                        ...obraData,
                        esPublico: obraData.tipo === 'publica',
                        fechaInicio: obraData.fechaInicio ? new Date(obraData.fechaInicio) : null,
                        fechaTermino: obraData.fechaTermino ? new Date(obraData.fechaTermino) : null,
                        hitos: [] // No mostramos hitos en edición
                    });
                })
                .catch(error => {
                    console.error('Error al cargar la obra:', error);
                });
        }
    }, [id]);

    const handleChange = (campo, valor) => {
        setDatosObra(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: false }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};
        if (!datosObra.nombre) nuevosErrores.nombre = true;
        if (!datosObra.empresaContratista) nuevosErrores.empresaContratista = true;
        if (!datosObra.fechaInicio) nuevosErrores.fechaInicio = true;
        if (!datosObra.fechaTermino) nuevosErrores.fechaTermino = true;

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleGuardar = async () => {
        if (validarFormulario()) {
            try {
                const hitosMap = {
                    hitos: datosObra.hitos.reduce((acc, hito) => {
                        if (hito.nombre && hito.fecha) {
                            acc[hito.nombre] = hito.fecha;
                        }
                        return acc;
                    }, {})
                };
                const obraData = {
                    nombre: datosObra.nombre,
                    empresaContratista: datosObra.empresaContratista,
                    esPublico: datosObra.esPublico,
                    fechaInicio: datosObra.fechaInicio?.toISOString().split('T')[0],
                    fechaTermino: datosObra.fechaTermino?.toISOString().split('T')[0],
                    estado: datosObra.estado,
                    metrosCuadrados: datosObra.metrosCuadrados,
                    hitos: hitosMap,
                    idUsuario: userId
                };


                if (id) {
                    await axios.put(`http://localhost:8090/badema/api/obra/actualizar/${id}`, {
                        nombre: datosObra.nombre,
                        empresaContratista: datosObra.empresaContratista,
                        esPublico: datosObra.esPublico,
                        fechaInicio: datosObra.fechaInicio?.toISOString().split('T')[0],
                        fechaTermino: datosObra.fechaTermino?.toISOString().split('T')[0],
                        estado: datosObra.estado,
                        metrosCuadrados: datosObra.metrosCuadrados,
                    })
                    console.log("Obra actualizada:", {
                        nombre: datosObra.nombre,
                        empresaContratista: datosObra.empresaContratista,
                        esPublico: datosObra.esPublico,
                        fechaInicio: datosObra.fechaInicio?.toISOString().split('T')[0],
                        fechaTermino: datosObra.fechaTermino?.toISOString().split('T')[0],
                        estado: datosObra.estado,
                        metrosCuadrados: datosObra.metrosCuadrados,
                    });
                    alert('Obra actualizada exitosamente');
                    navigate("/");
                } else {
                    console.log("Creando nueva obra:", obraData);
                    const response = await axios.post("http://localhost:8090/badema/api/obra/guardar", obraData, {
                        headers: {
                            Authorization: authHeader
                        },
                        withCredentials: true
                    });
                    console.log("Obra creada:", response.data);
                    alert('Obra creada exitosamente');
                    navigate("/");

                }

            } catch (error) {
                console.error("Error al guardar la obra:", error);
                alert("Error al guardar la obra");
            }
        }
    };

    const isFieldDisabled = (fieldName) => {
        if (!id) return false; // No deshabilitar nada en modo creación
        const editableFields = ['nombre', 'estado', 'fechaTermino'];
        return !editableFields.includes(fieldName);
    };

    return (
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
                maxWidth: 1000,
                mx: 'auto'
            }}>
                <Typography variant="h4" gutterBottom sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    textAlign: 'center',
                    mb: 4
                }}>
                    {id ? 'Editar Obra' : 'Crear Nueva Obra'}
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Grid container spacing={3}>
                        {/* Primera fila: Nombre, Empresa y Metros */}
                        <Grid container item spacing={3}>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Título de la obra"
                                    value={datosObra.nombre}
                                    onChange={(e) => handleChange('nombre', e.target.value)}
                                    error={errores.nombre}
                                    required
                                    disabled={isFieldDisabled('nombre')} // Este campo sigue editable
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Empresa Contratista"
                                    value={datosObra.empresaContratista}
                                    onChange={(e) => handleChange('empresaContratista', e.target.value)}
                                    error={errores.empresaContratista}
                                    required
                                    disabled={isFieldDisabled('empresaContratista')} // Deshabilitado en edición
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Metros cuadrados"
                                    type="number"
                                    value={datosObra.metrosCuadrados}
                                    onChange={(e) => handleChange('metrosCuadrados', e.target.value)}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                                    }}
                                    disabled={isFieldDisabled('metrosCuadrados')} // Deshabilitado en edición
                                />
                            </Grid>
                        </Grid>

                        {/* Segunda fila: Tipo, Estado y Fechas */}
                        <Grid container item spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{
                                        transform: 'translate(14px, 14px) scale(1)',
                                        '&.Mui-focused': {
                                            transform: 'translate(14px, -9px) scale(0.75)'
                                        },
                                        '&.MuiFormLabel-filled': {
                                            transform: 'translate(14px, -9px) scale(0.75)'
                                        }
                                    }}>
                                        Tipo de obra
                                    </InputLabel>
                                    <Select
                                        value={datosObra.esPublico}
                                        onChange={(e) => handleChange('esPublico', e.target.value)}
                                        label="Tipo de obra"
                                        sx={{
                                            '& .MuiSelect-select': {
                                                padding: '14px 32px 14px 14px'
                                            }
                                        }}
                                        disabled={isFieldDisabled('esPublico')} // Deshabilitado en edición
                                    >
                                        {tiposObra.map((tipo) => (
                                            <MenuItem key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Estado de la obra</InputLabel>
                                    <Select
                                        value={datosObra.estado}
                                        onChange={(e) => handleChange('estado', e.target.value)}
                                        label="Estado de la obra"
                                        disabled={isFieldDisabled('estado')} // Este campo sigue editable
                                    >
                                        {estadosObra.map((estado) => (
                                            <MenuItem key={estado.value} value={estado.label}>
                                                {estado.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <DatePicker
                                    label="Fecha de inicio"
                                    value={datosObra.fechaInicio}
                                    onChange={(newValue) => handleChange('fechaInicio', newValue)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: errores.fechaInicio,
                                            required: true,
                                            disabled: isFieldDisabled('fechaInicio') // Deshabilitado en edición
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <DatePicker
                                    label="Fecha de término"
                                    value={datosObra.fechaTermino}
                                    onChange={(newValue) => handleChange('fechaTermino', newValue)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: errores.fechaTermino,
                                            required: true,
                                            disabled: isFieldDisabled('fechaTermino') // Este campo sigue editable
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        {/* Tercera fila: Hitos (solo en creación) */}
                        {!id && (
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                    Hitos Importantes
                                </Typography>
                                {datosObra.hitos.map((hito, index) => (
                                    <Box key={index} sx={{
                                        display: 'flex',
                                        gap: 2,
                                        mb: 2,
                                        alignItems: 'center'
                                    }}>
                                        <TextField
                                            fullWidth
                                            label="Nombre del hito"
                                            value={hito.nombre}
                                            onChange={(e) => {
                                                const nuevosHitos = [...datosObra.hitos];
                                                nuevosHitos[index].nombre = e.target.value;
                                                handleChange('hitos', nuevosHitos);
                                            }}
                                            sx={{ flex: 2 }}
                                        />
                                        <DatePicker
                                            label="Fecha"
                                            value={hito.fecha}
                                            onChange={(newValue) => {
                                                const nuevosHitos = [...datosObra.hitos];
                                                nuevosHitos[index].fecha = newValue;
                                                handleChange('hitos', nuevosHitos);
                                            }}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    sx: { flex: 1 }
                                                }
                                            }}
                                        />
                                        {index !== 0 && (
                                            <IconButton
                                                onClick={() => {
                                                    const nuevosHitos = [...datosObra.hitos];
                                                    nuevosHitos.splice(index, 1);
                                                    handleChange('hitos', nuevosHitos);
                                                }}
                                                size="small"
                                                sx={{
                                                    color: 'error.main',
                                                    alignSelf: 'center',
                                                    ml: 1
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                                <Button
                                    variant="outlined"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={() => handleChange('hitos', [...datosObra.hitos, { nombre: '', fecha: null }])}
                                    sx={{ mt: 1 }}
                                >
                                    Agregar Hito
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </LocalizationProvider>

                {/* Botones de acción */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    pt: 4,
                    mt: 4,
                    borderTop: '1px solid #eee'
                }}>
                    {/* Este Box actuará como espaciador en modo creación */}
                    <Box sx={{ minWidth: 180 }}>
                        {id && ( // Solo mostrar el botón si hay un id (modo edición)
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate(`/gestionarPedidos/${id}`)}
                                sx={{ minWidth: 180 }}
                            >
                                Agregar Pedidos
                            </Button>
                        )}
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        marginLeft: 'auto' // Esto empujará los botones a la derecha
                    }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => window.history.back()}
                            sx={{ minWidth: 120 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleGuardar}
                            sx={{ minWidth: 180 }}
                        >
                            {id ? 'Actualizar Obra' : 'Guardar Obra'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default CrearObra;