import React, { useState, useEffect } from "react";
import './App.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from "@mui/material/styles";

import CrearObra from "./components/CrearObra.jsx";
import ListaObras from "./components/ListaObras.jsx";
import Obra from "./components/Obra.jsx";
import LectorArchivos from "./components/LectorArchivos.jsx";
import Traza from "./components/Traza.jsx";
import Layout from "./components/Layout.jsx";
import SeguimientoCompra from "./components/SeguimientoCompra.jsx";
import Login from "./components/login.jsx";
import GestionarPedidos from "./components/GestionPedidos.jsx";
import Adquisiciones from "./components/Adquisciones.jsx";
import OrdenDeCompra from "./components/ManejarAdquisiciones.jsx";

/* Protege rutas directamente leyendo el token */
function ProtectedRoute({ children }) {
    const token = localStorage.getItem('_auth');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function App() {
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = sessionStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    const lightTheme = createTheme({
        palette: {
            primary: { main: '#4A90E2', light: '#7FB2F0', dark: '#357ABD', contrastText: '#FFFFFF' },
            secondary: { main: '#7D7D7D', light: '#A0A0A0', dark: '#5A5A5A', contrastText: '#FFFFFF' },
            background: { default: '#FFFFFF', paper: '#F5F5F5' },
            text: { primary: '#4A90E2', secondary: '#333333' },
            accent: { main: '#E0E0E0', contrastText: '#333333' }
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", sans-serif',
            h1: { fontWeight: 700, fontSize: '2.5rem', color: '#4A90E2' },
            h2: { fontWeight: 600, fontSize: '2rem', color: '#4A90E2' },
            h3: { fontWeight: 500, fontSize: '1.5rem', color: '#333333' },
            button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.5px' },
            body1: { color: '#333333', lineHeight: 1.6 }
        },
        shape: { borderRadius: 6 }
    });

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: { main: '#4A90E2', light: '#7FB2F0', dark: '#357ABD', contrastText: '#FFFFFF' },
            secondary: { main: '#9E9E9E', light: '#BDBDBD', dark: '#757575', contrastText: '#FFFFFF' },
            background: { default: '#121212', paper: '#1E1E1E' },
            text: { primary: '#E0E0E0', secondary: '#B0B0B0' },
            accent: { main: '#424242', contrastText: '#E0E0E0' }
        },
        typography: {
            ...lightTheme.typography,
            h3: { ...lightTheme.typography.h3, color: '#E0E0E0' },
            body1: { ...lightTheme.typography.body1, color: '#E0E0E0' }
        },
        shape: { borderRadius: 6 }
    });

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
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
                        {/* Ruta pública */}
                        <Route path="/login" element={<Login darkMode={darkMode} />} />

                        {/* Rutas protegidas */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/crearObra/:id?" element={<CrearObra />} />
                            <Route path="/" element={<ListaObras />} />
                            <Route path="/obra/:obraId" element={<Obra />} />
                            <Route path="/lectorArchivos" element={<LectorArchivos />} />
                            <Route path="/traza/:obraId" element={<Traza />} />
                            <Route path="/seguimientoCompra/:obraId" element={<SeguimientoCompra />} />
                            <Route path="/gestionarPedidos/:obraId" element={<GestionarPedidos />} />
                            <Route path="/adquisiciones/:obraId" element={<Adquisiciones />} />
                            <Route path="/ordenDeCompra/:obraId" element={<OrdenDeCompra />} />
                            <Route
                                path="*"
                                element={
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                                        <h1>BADEMA - Soluciones Constructivas</h1>
                                        <p>Selecciona una opción del menú cuando esté disponible</p>
                                    </div>
                                }
                            />
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
