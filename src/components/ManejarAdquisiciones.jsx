import React, { useEffect, useState } from 'react';
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
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Pagination,
    Collapse,
    Badge,
    Alert,
    Card,
    CardContent,
    Stack,
    Chip,
    DialogActions, DialogContent, DialogTitle, Dialog
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import { useNavigate, useParams } from 'react-router-dom';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Warning from '@mui/icons-material/Warning';
import Error from '@mui/icons-material/Error';
import Payment from '@mui/icons-material/Payment';
import AttachMoney from '@mui/icons-material/AttachMoney';
import Block from '@mui/icons-material/Block';
import ListAlt from '@mui/icons-material/ListAlt';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
const OrdenDeCompra = () => {
    const { obraId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();

    // Estados para paginación
    const [expandedPedido, setExpandedPedido] = useState(null);
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [searchPedido, setSearchPedido] = useState('');
    const [materialSearches, setMaterialSearches] = useState("");
    const [searchProveedor, setSearchProveedor] = useState('');
    const [pedidosPage, setPedidosPage] = useState(1);
    const [materialesPage, setMaterialesPage] = useState(1);
    const [proveedoresPage, setProveedoresPage] = useState(1);
    const [selectedProveedor, setSelectedProveedor] = useState(null);
    const [materialesPorProveedor, setMaterialesPorProveedor] = useState([]);
    const [proveedorPorMaterial, setProveedorPorMaterial] = useState(null);
    // Items por página
    const pedidosPerPage = 3;
    const materialesPerPage = 3;
    const proveedoresPerPage = 3;

    const [currentStep, setCurrentStep] = useState(1); // 1 = selección inicial, 2 = trabajo con proveedor
    const [selectedMaterialPorProveedor, setSelectedMaterialPorProveedor] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [observations, setObservations] = useState('');
    const [quantityToOrder, setQuantityToOrder] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [estimatedDate, setEstimatedDate] = useState('');
    const [searchOrderItems, setSearchOrderItems] = useState('');
    const authType = localStorage.getItem('_auth_type');  // 'Bearer'
    const token = localStorage.getItem('_auth');       // tu JWT
    const handleSelectMaterialPorProveedor = async(proveedorId,materialId) => {
        const resp= await axios.get(`http://localhost:8090/badema/api/manejarAdquisiciones/detalleProveedorMaterial/${proveedorId}/${materialId}`, {
            headers: {     
                Authorization: authHeader
            },
        });
        console.log('Proveedor por material fetched:', resp.data);
        setProveedorPorMaterial(resp.data);
    };
    const handleSelectProveedor = (proveedor) => {
        setSelectedProveedor(proveedor);
        console.log('Proveedor seleccionado:', proveedor);
    };
    const fetchMaterialesPorProveedor = async (proveedorId, materialId) => {
        try {
            const response = await axios.get(`http://localhost:8090/badema/api/manejarAdquisiciones/materialesPorProveedor/${proveedorId}/${obraId}/${materialId}`, {
                headers: {
                    Authorization: authHeader
                },
            });
            setMaterialesPorProveedor(response.data);
            console.log('Materiales por proveedor fetched:', response.data);
        } catch (error) {
            console.error('Error fetching materiales por proveedor:', error);
        }
    };

    // Variable que los une
    const authHeader = `${authType} ${token}`;
    // Datos de ejemplo
    const [pedidos, setPedidos] = useState([
        {
            id: 1,
            nombre: 'Pedido Estructura Principal',
            materiales: [
                {
                    id: 1,
                    nombre: 'Tablones de roble 2x4',
                    proveedores: [1, 2, 3, 16],
                    especificaciones: ['Madera de roble de primera calidad', 'Dimensiones exactas 2x4 pulgadas', 'Tratamiento antihumedad'],
                    cantidad: 100,
                    cantidadComprada: 0
                },
                {
                    id: 2,
                    nombre: 'Clavos galvanizados 3"',
                    proveedores: [4],
                    especificaciones: ['Acero galvanizado grado industrial', 'Longitud exacta 3 pulgadas', 'Resistentes a la corrosión'],
                    cantidad: 500,
                    cantidadComprada: 120
                },
                {
                    id: 4,
                    nombre: 'Lijas #120',
                    proveedores: [6, 7, 8],
                    especificaciones: ['Granulometría #120', 'Base de papel resistente', 'Para uso en madera y metal'],
                    cantidad: 200,
                    cantidadComprada: 50
                }
            ],
            ordenCompra: [

            ]
        },
        {
            id: 2,
            nombre: 'Pedido Acabados',
            materiales: [
                {
                    id: 5,
                    nombre: 'Barniz transparente',
                    proveedores: [9, 10],
                    especificaciones: ['Transparente ultrabrillante', 'Resistente a rayos UV', 'Secado rápido 30 minutos'],
                    cantidad: 50,
                    cantidadComprada: 0
                },
                {
                    id: 6,
                    nombre: 'Láminas de triplay 1/2"',
                    proveedores: [11, 12, 13],
                    especificaciones: ['Espesor exacto 1/2 pulgada', 'Dimensiones 4x8 pies', 'Resistente a la humedad'],
                    cantidad: 80,
                    cantidadComprada: 30
                }
            ],
            ordenCompra: [
                {
                    materialId: 6,
                    proveedorId: 11,
                    proveedorNombre: 'Acabados Premium',
                    materialNombre: 'Láminas de triplay 1/2"',
                    cantidad: 30,
                    precio: 'S/ 45.00',
                    total: 'S/ 1,350.00'

                }
            ]
        },
        {
            id: 3,
            nombre: 'Pedido Electricidad',
            materiales: [
                {
                    id: 7,
                    nombre: 'Cable eléctrico 2.5mm',
                    proveedores: [14, 15],
                    especificaciones: ['Cobre electrolítico', 'Aislación PVC', 'Resistente a altas temperaturas'],
                    cantidad: 150,
                    cantidadComprada: 75
                }
            ],
            ordenCompra: []
        }
    ]);
    const fetchPedidos = async () => {
        try {
            const response = await axios.get(`http://localhost:8090/badema/api/manejarAdquisiciones/pedidos/${obraId}`, {
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
        try{
            const resp= await axios.get(`http://localhost:8090/badema/api/manejarAdquisiciones/materiales/${selectedPedido.id}/${selectedMaterial.id}`, {
                headers: {
                    Authorization: authHeader
                },
            });
            setSelectedProveedor(resp.data);
            console.log('Proveedores fetched:', resp.data);
        } catch (error) {
            console.error('Error fetching proveedores:', error);
        }
    }
    useEffect(() => {
        fetchPedidos();
    }, [])

    const [proveedores] = useState([
        {
            id: 1, nombre: 'Maderera El Bosque', condicionPago: 'Crédito a 30 días', precio: 'S/ 25.00', restricciones: 'Mínimo compra 300 unidades', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos',
            ], comentarios: ''
        },
        {
            id: 16, nombre: 'Maderera El Bosque', condicionPago: 'Crédito a 30 días', precio: 'S/ 25.00', restricciones: 'Mínimo compra 300 unidades', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 2, nombre: 'Forestal Andina', condicionPago: 'Contado', precio: 'S/ 28.50', restricciones: 'No acepta devoluciones', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 3, nombre: 'Maderera San Pedro', condicionPago: 'Transferencia bancaria', precio: 'S/ 30.00', restricciones: 'Entrega en 15 días', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 4, nombre: 'Suministros Industriales', condicionPago: '50% adelantado', precio: 'S/ 0.50', restricciones: 'Pedidos mínimos S/ 1,000', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 5, nombre: 'Ferretería El Constructor', condicionPago: 'Contado con 5% descuento', precio: 'S/ 0.80', restricciones: 'Solo ventas al por mayor', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 6, nombre: 'Proveedor Lijas 1', condicionPago: 'Contado', precio: 'S/ 1.20', restricciones: 'Mínimo 100 unidades', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 7, nombre: 'Proveedor Lijas 2', condicionPago: 'Crédito 15 días', precio: 'S/ 1.10', restricciones: 'Sin restricciones', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 8, nombre: 'Proveedor Lijas 3', condicionPago: 'Transferencia', precio: 'S/ 1.15', restricciones: 'Pedidos > S/ 500', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 9, nombre: 'Barnices Premium', condicionPago: '30 días', precio: 'S/ 35.00', restricciones: 'Mínimo 10 unidades', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 10, nombre: 'Químicos Industriales', condicionPago: 'Contado', precio: 'S/ 32.50', restricciones: 'No aplica', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 11, nombre: 'Acabados Premium', condicionPago: '15 días', precio: 'S/ 45.00', restricciones: 'Mínimo 5 unidades', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 12, nombre: 'Maderas Finas', condicionPago: 'Contado', precio: 'S/ 42.00', restricciones: 'No acepta cambios', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 13, nombre: 'Distribuidora Triplay', condicionPago: 'Crédito', precio: 'S/ 40.00', restricciones: 'Pedidos > S/ 2,000', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 14, nombre: 'Eléctricos Perú', condicionPago: 'Contado', precio: 'S/ 3.20', restricciones: 'Mínimo 50 metros', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        },
        {
            id: 15, nombre: 'Cables Nacionales', condicionPago: '30 días', precio: 'S/ 3.00', restricciones: 'Pedidos > S/ 1,500', especificaciones: [
                'Madera de roble estándar',
                'Dimensiones 1.9x3.9 pulgadas',
                'Puede contener pequeños nudos'
            ], comentarios: ''
        }
    ]);

    // Obtener color según cantidad de proveedores
    const getProveedorColor = (count) => {
        if (count === 0) return 'error';
        if (count < 3) return 'warning';
        return 'success';
    };

    const handleFinalizarOrden = () => {
        if (!selectedPedido || !selectedProvider) return;

        // Calcular el total ordenado por material
        const materialTotals = {};
        orderItems.forEach(item => {
            if (!materialTotals[item.materialId]) {
                materialTotals[item.materialId] = 0;
            }
            materialTotals[item.materialId] += item.quantity;
        });

        // Actualizar cantidades compradas
        const updatedPedidos = pedidos.map(pedido => {
            if (pedido.id === selectedPedido.id) {
                const updatedMateriales = pedido.materiales.map(material => {
                    if (materialTotals[material.id]) {
                        return {
                            ...material,
                            cantidadComprada: material.cantidadComprada + materialTotals[material.id]
                        };
                    }
                    return material;
                });

                // Agregar a la orden de compra
                const newOrdenCompra = orderItems.map(item => ({
                    materialId: item.materialId,
                    proveedorId: selectedProvider.id,
                    proveedorNombre: selectedProvider.nombre,
                    materialNombre: item.materialName,
                    cantidad: item.quantity,
                    precio: item.price,
                    total: item.total,
                    fechaEstimada: estimatedDate
                }));

                return {
                    ...pedido,
                    materiales: updatedMateriales,
                    ordenCompra: [...pedido.ordenCompra, ...newOrdenCompra]
                };
            }
            return pedido;
        });

        setPedidos(updatedPedidos);
        setOrderItems([]);
        setEstimatedDate('');
        setOpenDialog(false);
    };

    const handleWorkWithProvider = () => {
        const provider = selectedProveedor;
        setSelectedProvider(provider);
        console.log(selectedMaterial)
        fetchMaterialesPorProveedor(provider.idProveedor,selectedMaterial.idMaterial);
        setCurrentStep(2);
        setOrderItems([]);
        setQuantityToOrder(0);
        setObservations('');
    };

    // Obtener icono según cantidad de proveedores
    const getProveedorIcon = (count) => {
        if (count === 0) return <Error />;
        if (count < 3) return <Warning />;
        return <CheckCircle />;
    };

    // Manejar selección de pedido
    const handleSelectPedido = (pedido) => {
        setSelectedPedido(pedido);
        setExpandedPedido(pedido.id);
        setSelectedMaterial(null);
    };

    // Manejar selección de material
    const handleSelectMaterial = async (material, pedido) => {
        const resp = await axios.get(`http://localhost:8090/badema/api/manejarAdquisiciones/materiales/${pedido.id}/${material.id}`, {
            headers: {
                Authorization: authHeader
            }
        })
        setSelectedMaterial(resp.data);
        setProveedoresPage(1);
        setSearchProveedor('');
        setSelectedProveedor(null);
        console.log(resp.data);
    }

    // Manejar cambio de página
    const handlePageChange = (setPage) => (event, newPage) => {
        setPage(newPage);
    };

    // Filtrar materiales que no están completos
    const materialesFiltrados = (materiales) =>
        materiales?.filter(m => m.cantidadComprada < m.cantidad);

    // Obtener proveedores de un material
    const getProveedoresMaterial = (materialId) => {
        if (!selectedPedido) return [];

        const material = selectedPedido.materiales.find(m => m.id === materialId);
        if (!material || !material.proveedores) return [];

        // Asegurarse que los IDs de proveedores sean números
        const proveedoresIds = material.proveedores.map(id => Number(id));

        return proveedores.filter(p => proveedoresIds.includes(p.id));
    };

    // Verificar si todos los materiales del pedido seleccionado están completos
    const isPedidoCompleto = () => {
        if (!selectedPedido) return false;
        return selectedPedido.materiales.every(m => m.cantidadComprada >= m.cantidad);
    };

    // Filtrar datos
    const filteredPedidos = pedidos.filter(pedido =>
        pedido.nombre?.toLowerCase().includes(searchPedido.toLowerCase())
    );

    const filteredProveedores = selectedMaterial
        ? getProveedoresMaterial(selectedMaterial.id).filter(p =>
            p.nombre.toLowerCase().includes(searchProveedor.toLowerCase())
        )
        : [];

    const renderStep2 = () => {
        if (!selectedProvider || !selectedMaterial) return null;

        // Materiales que provee este proveedor
        const providerMaterials = pedidos.flatMap(pedido =>
            pedido.materiales.filter(material =>
                material.proveedores?.includes(selectedProvider.id) &&
                material.cantidadComprada < material.cantidad
            )
        );

        // Agrega esta función helper al componente
        const getPendingQuantity = (material) => {
            const orderedQuantity = orderItems
                .filter(item => item.materialId === material.id)
                .reduce((sum, item) => sum + item.quantity, 0);

            return material.cantidad - material.cantidadComprada - orderedQuantity;
        };

        // Y actualiza availableMaterials para usar esta función
        const availableMaterials = pedidos.flatMap(pedido =>
            (pedido.materiales || []).map(material => ({
                ...material,
                idPedido: pedido.id,
                nombrePedido: pedido.nombre
            }))
        );

        // Manejar agregar a la orden
        const handleAddToOrder = (material) => {
            if (quantityToOrder <= 0 || quantityToOrder > getPendingQuantity(material)) {
                alert('Cantidad inválida');
                return;
            }

            const newItem = {
                materialId: material.id,
                materialName: material.nombre,
                quantity: quantityToOrder,
                price: selectedProvider.precio,
                total: `S/ ${(parseFloat(selectedProvider.precio.replace('S/ ', '')) * quantityToOrder)}`,
                specifications: material.especificaciones,
                observations: observations
            };

            setOrderItems([...orderItems, newItem]);
            setQuantityToOrder(0);
            setObservations('');
            // Forzar actualización del material seleccionado
            setSelectedMaterial({ ...material });
        };

        // Manejar remover de la orden
        const handleRemoveFromOrder = (index) => {
            const newItems = [...orderItems];
            newItems.splice(index, 1);
            setOrderItems(newItems);
        };

        return (
            <>
                {/* Título con subtítulo */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                        Manejando Adquisiciones
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
                        Proveedor: {selectedProvider.nombreProveedor}
                    </Typography>
                </Box>

                <Grid container spacing={2} justifyContent="center">
                    {/* Columna 1: Lista de materiales */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                                Lista de Materiales
                            </Typography>

                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Buscar materiales..."
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                                }}
                            />

                            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                                {materialesPorProveedor
                                    
                                    .map(material => (
                                        <ListItem
                                            key={material.id}
                                            button
                                            onClick={() => handleSelectMaterialPorProveedor(selectedProvider.idProveedor, material.idMaterial)}
                                            selected={selectedMaterial?.id === material.id}
                                        >
                                            <ListItemText
                                                primary={material.nombre}
                                                secondary={`Pedido: ${material.nombrePedido} | Faltan comprar ${getPendingQuantity(material)} de ${material.cantidad}`}
                                            />
                                        </ListItem>
                                    ))}
                            </List>

                            <Pagination
                                count={Math.ceil(availableMaterials.length / 10)}
                                color="primary"
                                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
                            />
                        </Paper>
                    </Grid>

                    {/* Columna 2: Información del proveedor */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                                Información del Proveedor
                            </Typography>

                            {selectedMaterial && (
                                <>
                                    <Card variant="outlined" sx={{ mb: 3 }}>

                                            <CardContent>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {selectedProvider.nombreProveedor}
                                                </Typography>

                                                <Stack spacing={1}>
                                                    <Typography variant="body2">
                                                        <Payment fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                        <strong>Condición:</strong> {selectedProvider.condiciones}
                                                    </Typography>

                                                    <Typography variant="body2">
                                                        <AttachMoney fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                        <strong>Precio:</strong> {selectedProvider.precio} por unidad
                                                    </Typography>

                                                    <Typography variant="body2">
                                                        <Block fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                        <strong>Restricciones:</strong> {selectedProvider.restricciones}
                                                    </Typography>

                                                    <Typography variant="body2">
                                                        <ChatBubbleOutline fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                        <strong>Comentarios:</strong> {selectedProvider.comentarios || 'Sin comentarios'}
                                                    </Typography>
                                                </Stack>
                                            </CardContent>
                                    </Card>

                                    <TextField
                                        fullWidth
                                        label="Cantidad a ordenar"
                                        type="number"
                                        value={quantityToOrder}
                                        onChange={(e) => setQuantityToOrder(parseInt(e.target.value) || 0)}
                                        sx={{ mb: 2 }}
                                        inputProps={{
                                            min: 1,
                                            max: selectedMaterial ? selectedMaterial.cantidad : 0
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Observaciones"
                                        multiline
                                        rows={3}
                                        value={observations}
                                        onChange={(e) => setObservations(e.target.value)}
                                        sx={{ mb: 2 }}
                                    />

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => handleAddToOrder(selectedMaterial)}
                                        disabled={!selectedMaterial || quantityToOrder <= 0}
                                    >
                                        Agregar a Orden
                                    </Button>
                                </>
                            )}
                        </Paper>
                    </Grid>

                    {/* Columna 3: Orden de compra */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                                Orden de Compra
                            </Typography>

                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Buscar en orden..."
                                value={searchOrderItems}
                                onChange={(e) => setSearchOrderItems(e.target.value)}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                                }}
                            />

                            <List sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                                {orderItems
                                    .filter(item => item.materialName.toLowerCase().includes(searchOrderItems.toLowerCase()))
                                    .slice(0, 3) // Mostrar solo 3 elementos a la vez
                                    .map((item, index) => (
                                        <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                                            <CardContent sx={{ position: 'relative' }}>
                                                <IconButton
                                                    size="small"
                                                    sx={{ position: 'absolute', top: 4, right: 4 }}
                                                    onClick={() => handleRemoveFromOrder(index)}
                                                >
                                                    <Close fontSize="small" />
                                                </IconButton>

                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    {item.materialName}
                                                </Typography>

                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    <strong>Cantidad:</strong> {item.quantity}
                                                </Typography>

                                                <Typography variant="body2">
                                                    <strong>Total:</strong> {item.total}
                                                </Typography>

                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    <strong>Especificaciones:</strong>
                                                </Typography>
                                                <Box component="ul" sx={{ pl: 2, mb: 1, fontSize: '0.75rem' }}>
                                                    {item.specifications.map((spec, i) => (
                                                        <li key={i}>{spec}</li>
                                                    ))}
                                                </Box>

                                                {item.observations && (
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
                                                        <strong>Obs:</strong> {item.observations}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                            </List>

                            {orderItems.length > 3 && (
                                <Pagination
                                    count={Math.ceil(orderItems.length / 3)}
                                    color="primary"
                                    sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}
                                />
                            )}

                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => setOpenDialog(true)}
                                sx={{ mt: 2 }}
                                disabled={orderItems.length === 0}
                            >
                                Finalizar Orden
                            </Button>

                        </Paper>
                    </Grid>
                </Grid>
            </>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {currentStep === 1 ? (
                // Renderizar el paso 1 (vista original)
                <>
                    {/* Título */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Manejando Adquisiciones
                        </Typography>
                    </Box>

                    {/* Tarjetas principales */}
                    <Grid container spacing={2} justifyContent="center">
                        {/* Tarjeta 1: Lista de pedidos */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                                    Lista de Pedidos
                                </Typography>

                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    placeholder="Buscar pedidos..."
                                    value={searchPedido}
                                    onChange={(e) => setSearchPedido(e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                                    }}
                                />

                                <List sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                                    {pedidos.slice((pedidosPage - 1) * pedidosPerPage, pedidosPage * pedidosPerPage)
                                        .map(pedido => (
                                            <React.Fragment key={pedido.id}>
                                                <ListItem
                                                    button
                                                    onClick={() => handleSelectPedido(pedido)}
                                                    selected={selectedPedido?.id === pedido.id}
                                                >
                                                    <ListItemText
                                                        primary={pedido.nombre}
                                                        primaryTypographyProps={{ fontWeight: 'medium' }}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <IconButton onClick={() => setExpandedPedido(expandedPedido === pedido.id ? null : pedido.id)}>
                                                            {expandedPedido === pedido.id ? <ExpandLess /> : <ExpandMore />}
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>

                                                <Collapse in={expandedPedido === pedido.id} timeout="auto" unmountOnExit>
                                                    <Box sx={{
                                                        pl: 2,
                                                        pr: 1,
                                                        py: 1,
                                                        backgroundColor: 'background.paper',
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        borderRadius: 1,
                                                        mt: 1
                                                    }}>
                                                        <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            size="small"
                                                            placeholder="Buscar materiales..."
                                                            value={materialSearches}
                                                            onChange={(e) => setmaterialSearches(e.target.value)}
                                                            sx={{ mb: 2 }}
                                                            InputProps={{
                                                                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                                                            }}
                                                        />

                                                        <List dense>
                                                            {pedido.materiales

                                                                ?.slice((materialesPage - 1) * materialesPerPage, materialesPage * materialesPerPage)
                                                                .map(material => (
                                                                    <ListItem
                                                                        key={material.id}
                                                                        button
                                                                        selected={selectedMaterial?.id === material.id}
                                                                        onClick={() => handleSelectMaterial(material, selectedPedido)}
                                                                        sx={{
                                                                            mb: 0.5,
                                                                            borderRadius: 1,
                                                                            backgroundColor: selectedMaterial?.id === material.id
                                                                                ? 'action.selected'
                                                                                : 'inherit',
                                                                            '&:hover': {
                                                                                backgroundColor: 'action.hover'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <ListItemText
                                                                            primary={material.nombre}
                                                                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                                                                            secondary={`${material.cantidadComprada}/${material.cantidad}`}
                                                                            secondaryTypographyProps={{
                                                                                color: material.cantidadComprada === material.cantidad
                                                                                    ? 'success.main'
                                                                                    : 'text.secondary',
                                                                                fontSize: '0.75rem'
                                                                            }}
                                                                        />
                                                                        <Badge
                                                                            badgeContent={material.proveedores?.length}
                                                                            color={getProveedorColor(material.proveedores?.length)}
                                                                        >
                                                                            {getProveedorIcon(material.proveedores?.length)}
                                                                        </Badge>
                                                                    </ListItem>
                                                                ))}
                                                        </List>

                                                        {materialesFiltrados(pedido.materiales)?.length > materialesPerPage && (
                                                            <Pagination
                                                                count={Math.ceil(materialesFiltrados(pedido.materiales).length / materialesPerPage)}
                                                                page={materialesPage}
                                                                onChange={handlePageChange(setMaterialesPage)}
                                                                size="small"
                                                                sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Collapse>
                                                <Divider />
                                            </React.Fragment>
                                        ))}
                                </List>

                                {filteredPedidos.length > pedidosPerPage && (
                                    <Pagination
                                        count={Math.ceil(filteredPedidos.length / pedidosPerPage)}
                                        page={pedidosPage}
                                        onChange={handlePageChange(setPedidosPage)}
                                        color="primary"
                                        size="small"
                                        sx={{ display: 'flex', justifyContent: 'center' }}
                                    />
                                )}
                            </Paper>
                        </Grid>

                        {/* Tarjeta 2: Distribuir orden de compra */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                                    Cuadro Comparativo
                                </Typography>

                                {!selectedMaterial ? (
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="body1">
                                            {selectedPedido
                                                ? "Seleccione un material de la lista para continuar"
                                                : "Seleccione un pedido para ver su orden de compra correspondiente"}
                                        </Typography>
                                    </Box>
                                ) : selectedMaterial.proveedores?.length === 0 ? (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        Este material no tiene proveedores asignados. No se puede generar orden de compra.
                                    </Alert>
                                ) : (
                                    <>
                                        <Box sx={{ mb: 3 }}>
                                            {/* Primera fila: Nombre del material y cantidad requerida en línea */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 1,
                                                gap: 2
                                            }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {selectedMaterial.nombreMaterial}
                                                </Typography>

                                                <Typography variant="body2">
                                                    <strong>Cantidad requerida:</strong> {selectedMaterial.cantidad} unidades
                                                </Typography>
                                            </Box>

                                            {/* Segunda fila: Título de especificaciones técnicas */}
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                <ListAlt fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                Especificaciones técnicas:
                                            </Typography>

                                            {/* Tercera fila: Especificaciones en línea */}
                                            <Box sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                                mb: 2
                                            }}>
                                                {selectedMaterial.especificacionesMaterial &&
                                                    Object.entries(selectedMaterial.especificacionesMaterial)
                                                        .filter(([key, _]) => key.startsWith("esp"))
                                                        .map(([_, espec], i) => (
                                                            <Chip
                                                                key={i}
                                                                label={espec}
                                                                variant="outlined"
                                                                sx={{
                                                                    borderRadius: 1,
                                                                    backgroundColor: 'background.paper',
                                                                    borderColor: 'divider',
                                                                    color: 'text.primary',
                                                                    '& .MuiChip-label': {
                                                                        fontSize: '0.8125rem'
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                            </Box>
                                        </Box>

                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            placeholder="Buscar proveedores..."
                                            value={searchProveedor}
                                            onChange={(e) => setSearchProveedor(e.target.value)}
                                            sx={{ mb: 2 }}
                                            InputProps={{
                                                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                                            }}
                                        />

                                        <Box sx={{
                                            display: 'flex',
                                            overflowX: 'auto',
                                            gap: 2,
                                            pb: 2,
                                            mb: 2
                                        }}>
                                            {selectedMaterial.proveedores
                                                .slice((proveedoresPage - 1) * proveedoresPerPage, proveedoresPage * proveedoresPerPage)
                                                .map(proveedor => (
                                                    <Card
                                                        key={proveedor.proveedorId}
                                                        variant="outlined"
                                                        onClick={() => { handleSelectProveedor(proveedor); console.log('Seleccionaste proveedor:', proveedor); }}
                                                        sx={{
                                                            minWidth: 250,
                                                            borderColor: selectedProveedor === proveedor.id
                                                                ? theme.palette.primary.main
                                                                : 'divider',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                borderColor: theme.palette.primary.light
                                                            }
                                                        }}

                                                    >
                                                        <CardContent>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                                {proveedor.nombreProveedor}
                                                            </Typography>

                                                            <Stack spacing={0.5}>
                                                                <Typography variant="body2">
                                                                    <Payment fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                                    <strong>Condición:</strong>
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {proveedor.condiciones}
                                                                </Typography>

                                                                <Typography variant="body2">
                                                                    <AttachMoney fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                                    <strong>Precio:</strong>
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {proveedor.precio} por unidad
                                                                </Typography>

                                                                <Typography variant="body2">
                                                                    <Block fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                                    <strong>Restricciones:</strong>
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {proveedor.restricciones}
                                                                </Typography>

                                                                {/* Nueva sección para especificaciones técnicas */}
                                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                                    <ListAlt fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                                    <strong>Especificaciones:</strong>
                                                                </Typography>
                                                                <Box component="ul" sx={{
                                                                    pl: 2,
                                                                    mb: 0,
                                                                    '& li': {
                                                                        fontSize: '0.75rem',
                                                                        lineHeight: 1.5,
                                                                        color: 'text.secondary'
                                                                    }
                                                                }}>
                                                                    {(proveedor.especificaciones || ['No especificado']).map((espec, i) => (
                                                                        <li key={i}>{espec}</li>
                                                                    ))}
                                                                </Box>
                                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                                    <ChatBubbleOutline fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                                    <strong>Comentarios:</strong>
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                                                                    {proveedor.comentarios || 'Sin comentarios'}
                                                                </Typography>
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                        </Box>

                                        {filteredProveedores.length > proveedoresPerPage && (
                                            <Pagination
                                                count={Math.ceil(filteredProveedores.length / proveedoresPerPage)}
                                                page={proveedoresPage}
                                                onChange={handlePageChange(setProveedoresPage)}
                                                size="small"
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    my: 1,  // Cambiado de mb: 2 a my: 1 para reducir espacio vertical
                                                    py: 1    // Añadido padding vertical reducido
                                                }}
                                            />
                                        )}

                                        {selectedProveedor && (
                                            <Box sx={{ mt: 'auto' }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => { handleWorkWithProvider() }}
                                                    sx={{ mt: 2 }}
                                                >
                                                    Trabajar con este proveedor
                                                </Button>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            ) : (
                // Renderizar el paso 2
                renderStep2()
            )}

            {/* Fila de botones */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 6,
                mb: 2
            }}>
                <Box sx={{ flex: 1 }} />
                {currentStep === 2 && (
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setCurrentStep(1);
                                setSelectedProvider(null);
                                setOrderItems([]);
                            }}
                        >
                            Seleccionar otro proveedor
                        </Button>
                    </Box>
                )}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => currentStep === 2 ? setCurrentStep(1) : navigate(-1)}
                    >
                        Regresar
                    </Button>
                </Box>
            </Box>
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                    Finalizar Orden de Compra
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                            Fecha estimada de entrega
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
                            Por favor indique la fecha en que espera recibir los materiales
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Fecha estimada de llegada"
                                value={estimatedDate}
                                onChange={(newValue) => setEstimatedDate(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        sx={{ mt: 1, width: '80%' }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        variant="outlined"
                        sx={{ mr: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleFinalizarOrden}
                        variant="contained"
                        disabled={!estimatedDate}
                    >
                        Generar Orden
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default OrdenDeCompra;