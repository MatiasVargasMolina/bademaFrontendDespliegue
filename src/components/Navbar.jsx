import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Button,
    Popover,
    Container,
    Avatar,
    Divider
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import SettingsIcon from '@mui/icons-material/Settings'; // Nuevo icono de configuración
import BademaLogo from '../images/BademaLogo.png';
import BademaLogoBlack from '../images/BademaBlack.png';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate, useParams, useLocation } from "react-router-dom";

const Navbar = ({ toggleDarkMode, darkMode }) => {
    const [helpAnchor, setHelpAnchor] = useState(null);
    const [settingsAnchor, setSettingsAnchor] = useState(null); // Estado para el popover de configuración
    const [helpClicked, setHelpClicked] = useState(false);
    const [showHelpAnimation, setShowHelpAnimation] = useState(false);
    const navigate = useNavigate();
    const params = useParams();
    const authState = JSON.parse(localStorage.getItem("_auth_state"));
    const selectedObraRol = localStorage.getItem("selectedObraRol");
    const email = authState?.email || "";
    const rol = selectedObraRol || "";
    // Datos simulados del usuario
    const [userData] = useState({
        name: "Juan Pérez",
        email: "juan.perez@badema.com",
        role: "Administrador",
        avatar: "JP" // Para el avatar con iniciales
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHelpAnimation(true);
        }, 180000); // 3 minutos = 180,000 milisegundos

        return () => clearTimeout(timer);
    }, []);

    const handleHelpClick = (event) => {
        setHelpAnchor(event.currentTarget);
        setHelpClicked(true);
    };

    const handleHelpClose = () => {
        setHelpAnchor(null);
    };

    const handleSettingsClick = (event) => {
        setSettingsAnchor(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setSettingsAnchor(null);
    };

    const handleNavigation = (path) => {
        console.log('Navegando a:', path);
        navigate(path);
    };

    const handleLogout = () => {
        // Aquí iría la lógica para cerrar sesión
        console.log("Cerrando sesión...");
        handleSettingsClose();
    };

    const helpOpen = Boolean(helpAnchor);
    const helpId = helpOpen ? 'help-popover' : undefined;
    const settingsOpen = Boolean(settingsAnchor);
    const settingsId = settingsOpen ? 'settings-popover' : undefined;

    const hasObraId = params.obraId !== undefined;
    const hasItemId = params.itemId !== undefined;

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="sticky" sx={{
                backgroundColor: 'background.default',
                boxShadow: 'none',
                borderBottom: '1px solid',
                borderColor: 'divider',
                height: '100px',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Container maxWidth="xl" disableGutters>
                    <Toolbar sx={{
                        justifyContent: "space-between",
                        padding: "0 2rem",
                        height: "100%",
                    }}>
                        {/* Logo */}
                        <Box
                            onClick={() => handleNavigation("/")}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                height: "100%",
                                '& img': {
                                    height: "80px",
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)'
                                    }
                                }
                            }}
                        >
                            <img
                                src={darkMode ? BademaLogoBlack : BademaLogo}
                                alt="Badema Logo"
                            />
                        </Box>

                        {/* Grupo de botones dinámicos */}
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            height: "100%"
                        }}>
                            {/* Botones base */}
                            <Button
                                onClick={() => handleNavigation("/")}
                                sx={{
                                    color: 'text.primary',
                                    fontSize: '1.1rem',
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    '&:hover': {
                                        color: '#357ABD',
                                        backgroundColor: 'transparent'
                                    }
                                }}
                            >
                                Ver Lista de Obras
                            </Button>

                            <Button
                                onClick={() => handleNavigation("/crearObra")}
                                sx={{
                                    color: 'text.primary',
                                    fontSize: '1.1rem',
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    '&:hover': {
                                        color: '#357ABD',
                                        backgroundColor: 'transparent'
                                    }
                                }}
                            >
                                Crear Obra
                            </Button>

                            {/* Botones condicionales cuando hay obraId */}
                            {hasObraId && (
                                <>
                                    <Button
                                        onClick={() => handleNavigation(`/obra/${params.obraId}`)}
                                        sx={{
                                            color: 'text.primary',
                                            fontSize: '1.1rem',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            '&:hover': {
                                                color: '#357ABD',
                                                backgroundColor: 'transparent'
                                            }
                                        }}
                                    >
                                        Ver Obra
                                    </Button>

                                    <Button
                                        onClick={() => handleNavigation(`/adquisiciones/${params.obraId}`)}
                                        sx={{
                                            color: 'text.primary',
                                            fontSize: '1.1rem',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            '&:hover': {
                                                color: '#357ABD',
                                                backgroundColor: 'transparent'
                                            }
                                        }}
                                    >
                                        Adquisiciones
                                    </Button>

                                    <Button
                                        onClick={() => handleNavigation(`/ordenDeCompra/${params.obraId}`)}
                                        sx={{
                                            color: 'text.primary',
                                            fontSize: '1.1rem',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            '&:hover': {
                                                color: '#357ABD',
                                                backgroundColor: 'transparent'
                                            }
                                        }}
                                    >
                                        Manejando Adquisiciones
                                    </Button>

                                    <Button
                                        onClick={() => handleNavigation(`/seguimientoCompra/${params.obraId}`)}
                                        sx={{
                                            color: 'text.primary',
                                            fontSize: '1.1rem',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            '&:hover': {
                                                color: '#357ABD',
                                                backgroundColor: 'transparent'
                                            }
                                        }}
                                    >
                                        Seguimiento de Compras
                                    </Button>
                                </>
                            )}
                        </Box>

                        {/* Grupo de controles de la derecha */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* Nuevo botón de opciones/configuración */}
                            <IconButton
                                color="inherit"
                                onClick={handleSettingsClick}
                                sx={{
                                    color: 'text.primary',
                                    '&:hover': {
                                        color: 'primary.main',
                                        transform: 'rotate(30deg)',
                                        transition: 'transform 0.3s ease'
                                    }
                                }}
                            >
                                <SettingsIcon />
                            </IconButton>

                            {/* Botón de toggle para modo oscuro */}
                            <IconButton
                                onClick={toggleDarkMode}
                                color="inherit"
                                sx={{ ml: 1 }}
                            >
                                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>

                            {/* Icono de ayuda (existente) */}
                            <Box sx={{
                                position: 'relative',
                                animation: (helpClicked || !showHelpAnimation) ? 'none' : 'waveAnimation 1s infinite'
                            }}>
                                <IconButton
                                    color="primary"
                                    onClick={handleHelpClick}
                                    sx={{ fontSize: 70 }}
                                >
                                    <HelpIcon sx={{ fontSize: 'inherit' }} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Popover de configuración/opciones */}
            <Popover
                id={settingsId}
                open={settingsOpen}
                anchorEl={settingsAnchor}
                onClose={handleSettingsClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    '& .MuiPaper-root': {
                        borderRadius: '12px',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                        minWidth: '250px'
                    }
                }}
            >
                <Box sx={{ p: 2 }}>
                    {/* Información del usuario */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {userData.avatar}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {rol}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Opciones */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleLogout}
                            sx={{
                                mt: 1,
                                textTransform: 'none',
                                borderRadius: '8px'
                            }}
                        >
                            Cerrar sesión
                        </Button>
                    </Box>
                </Box>
            </Popover>

            {/* Popover de ayuda */}
            <Popover
                id={helpId}
                open={helpOpen}
                anchorEl={helpAnchor}
                onClose={handleHelpClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ p: 2, maxWidth: 300 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                        Ayuda
                    </Typography>
                    <Typography variant="body1">
                        Bienvenido al sistema de gestión de BADEMA. Para asistencia técnica, contacte al departamento de TI.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                        Teléfono: +123 456 7890
                        <br />
                        Email: soporte@badema.com
                    </Typography>
                </Box>
            </Popover>

            {/* Animación CSS para las ondas */}
            <style>{`
                @keyframes waveAnimation {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.7;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </Box>
    );
};

export default Navbar;