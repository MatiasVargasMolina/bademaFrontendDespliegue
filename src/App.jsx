import React, { useState, useEffect } from "react";
import './App.css';
import { Route, Routes} from 'react-router-dom';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CrearObra from "./components/CrearObra.jsx";
import ListaObras from "./components/ListaObras.jsx";
import Obra from "./components/Obra.jsx";
import LectorArchivos from "./components/LectorArchivos.jsx";
import Traza from "./components/Traza.jsx";
import Layout from "./components/Layout.jsx";
import SeguimientoCompra from "./components/SeguimientoCompra.jsx";
import Login from "./components/login.jsx"
import GestionarPedidos from "./components/GestionPedidos.jsx";
import Adquisiciones from "./components/Adquisciones.jsx";
import OrdenDeCompra from "./components/ManejarAdquisiciones.jsx";

function App() {
    // Tema personalizado basado en los colores de BADEMA
    const [darkMode, setDarkMode] = useState(() => {
        // Usamos una función inicializadora para el estado
        const savedMode = sessionStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    const lightTheme = createTheme({
        palette: {
            primary: {
                main: '#4A90E2',  // Celeste principal de las caras de los cubos
                light: '#7FB2F0', // Celeste más claro
                dark: '#357ABD',  // Celeste más oscuro
                contrastText: '#FFFFFF',
            },
            secondary: {
                main: '#7D7D7D',  // Gris de las paredes laterales de los cubos
                light: '#A0A0A0',
                dark: '#5A5A5A',
                contrastText: '#FFFFFF',
            },
            background: {
                default: '#FFFFFF',  // Blanco puro del fondo del logo
                paper: '#F5F5F5',    // Gris muy claro para componentes
            },
            text: {
                primary: '#4A90E2',  // Celeste igual que el texto "BADEMA"
                secondary: '#333333', // Negro/gris oscuro como "soluciones constructivas"
            },
            accent: {
                main: '#E0E0E0',     // Gris claro para detalles
                contrastText: '#333333',
            }
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", sans-serif',
            h1: {
                fontWeight: 700,
                fontSize: '2.5rem',
                color: '#4A90E2', // Celeste BADEMA
                letterSpacing: '0.5px'
            },
            h2: {
                fontWeight: 600,
                fontSize: '2rem',
                color: '#4A90E2',
            },
            h3: {
                fontWeight: 500,
                fontSize: '1.5rem',
                color: '#333333', // Negro/gris para subtítulos
            },
            button: {
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '0.5px'
            },
            body1: {
                color: '#333333',
                lineHeight: 1.6
            }
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#FFFFFF', // Fondo blanco como el logo
                        color: '#4A90E2', // Texto celeste
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        borderBottom: '1px solid #E0E0E0',
                        height: '80px'
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    contained: {
                        backgroundColor: '#4A90E2',
                        borderRadius: '4px',
                        padding: '8px 24px',
                        '&:hover': {
                            backgroundColor: '#357ABD',
                        }
                    },
                    outlined: {
                        borderColor: '#4A90E2',
                        color: '#4A90E2',
                        borderWidth: '2px',
                        '&:hover': {
                            borderWidth: '2px',
                            backgroundColor: 'rgba(74, 144, 226, 0.08)'
                        },
                    },
                    text: {
                        color: '#4A90E2',
                        '&:hover': {
                            backgroundColor: 'rgba(74, 144, 226, 0.08)'
                        }
                    }
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        border: '1px solid #E0E0E0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }
                }
            },
            MuiDivider: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#E0E0E0' // Gris claro de los cubos
                    }
                }
            }
        },
        shape: {
            borderRadius: 6 // Bordes ligeramente cuadrados como los cubos
        }
    });

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#4A90E2',  // Mantenemos el celeste como color primario
                light: '#7FB2F0',
                dark: '#357ABD',
                contrastText: '#FFFFFF',
            },
            secondary: {
                main: '#9E9E9E',  // Gris más claro para mejor contraste
                light: '#BDBDBD',
                dark: '#757575',
                contrastText: '#FFFFFF',
            },
            background: {
                default: '#121212',  // Fondo oscuro estándar
                paper: '#1E1E1E',    // Un poco más claro que el fondo
            },
            text: {
                primary: '#E0E0E0',  // Texto claro
                secondary: '#B0B0B0', // Texto secundario
            },
            accent: {
                main: '#424242',     // Gris oscuro para detalles
                contrastText: '#E0E0E0',
            }
        },
        // Mantenemos la misma tipografía
        typography: {
            ...lightTheme.typography,
            h1: {
                ...lightTheme.typography.h1,
                color: '#4A90E2', // Mantenemos el celeste para títulos
            },
            h2: {
                ...lightTheme.typography.h2,
                color: '#4A90E2',
            },
            h3: {
                ...lightTheme.typography.h3,
                color: '#E0E0E0', // Cambiamos a texto claro
            },
            body1: {
                ...lightTheme.typography.body1,
                color: '#E0E0E0',
            }
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#1E1E1E', // Fondo oscuro
                        color: '#4A90E2', // Texto celeste
                        boxShadow: 'none',
                        borderBottom: '1px solid #424242', // Borde más oscuro
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    contained: {
                        backgroundColor: '#4A90E2',
                        '&:hover': {
                            backgroundColor: '#357ABD',
                        }
                    },
                    outlined: {
                        borderColor: '#4A90E2',
                        color: '#4A90E2',
                        '&:hover': {
                            backgroundColor: 'rgba(74, 144, 226, 0.1)' // Más transparente
                        },
                    },
                    text: {
                        color: '#4A90E2',
                        '&:hover': {
                            backgroundColor: 'rgba(74, 144, 226, 0.1)'
                        }
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        border: '1px solid #424242',
                        backgroundColor: '#1E1E1E',
                    }
                }
            },
            MuiDivider: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#424242'
                    }
                }
            }
        },
        shape: {
            borderRadius: 6
        }
    });

    // Función para alternar entre modos
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        // Guardar en sessionStorage
        sessionStorage.setItem('darkMode', JSON.stringify(newMode));
    };

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        document.body.className = darkMode ? 'dark' : 'light';
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [darkMode]);

    return (
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <div className="container">
                {isOnline ? (
                    <Routes>
                            <Route element={<Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode} />}>
                            <Route path="/crearObra/:id?" element={<CrearObra />} />
                            <Route path="/" element={<ListaObras />} />
                            <Route path="/obra/:obraId" element={<Obra />} />
                            <Route path="/lectorArchivos/:obraId" element={<LectorArchivos />} />
                            <Route path="/traza/:obraId" element={<Traza />} />
                            <Route path="/login" element={<Login darkMode={darkMode} />} />
                            <Route path="/seguimientoCompra/:obraId" element={<SeguimientoCompra />} />
                            <Route path="/gestionarPedidos/:obraId" element={<GestionarPedidos />} />
                            <Route path="/adquisiciones/:obraId" element={<Adquisiciones/>} />
                            <Route path="/ordenDeCompra/:obraId" element={<OrdenDeCompra/>} />

                            {/* Ruta por defecto - actualiza cuando implementes ListaObras*/}
                            <Route path="*" element={
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <h1>BADEMA - Soluciones Constructivas</h1>
                                    <p>Selecciona una opción del menú cuando esté disponible</p>
                                </div>
                            } />
                        </Route>
                    </Routes>
                ) : (
                    <div className="offline-container" style={{ textAlign: "center", marginTop: "50px" }}>
                        <h2>Sin conexión a Internet</h2>
                        <p>Por favor, verifica tu conexión e inténtalo nuevamente.</p>
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
}

export default App;