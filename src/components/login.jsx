import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Link,
} from '@mui/material';
import BademaLogo from '../images/BademaLogo.png';
import BademaLogoBlack from '../images/BademaBlack.png';
import { Lock as LockIcon } from '@mui/icons-material';
import axios from 'axios';
// Import correcto del hook useSignIn
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { useNavigate } from 'react-router-dom';
import { MuiTelInput } from 'mui-tel-input';
const API = 'http://146.190.115.47:8090/auth';

const Login = ({ darkMode }) => {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '+56'
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const toggleMode = () => {
    setError(null);
    setForm({ nombre: '', apellido: '', email: '', password: '', confirmPassword: '', telefono: '' });
    setIsRegisterMode(prev => !prev);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    // 👉 VALIDACION DE CORREO
    if (isRegisterMode) {
      if (!form.nombre.trim()) {
        setError("El nombre no puede estar vacío.");
        setFieldErrors({ nombre: true });
        return;
      }

      // Validar apellido
      if (!form.apellido.trim()) {
        setError("El apellido no puede estar vacío.");
        setFieldErrors({ apellido: true });
        return;
      }
      if (!form.telefono.trim()) {
        setError("El teléfono no puede estar vacío.");
        setFieldErrors({ telefono: true });
        return;
      }

      const telefonoSinEspacios = form.telefono.replace(/\s/g, '');
      const telefonoRegex = /^\+569\d{8}$/;
      if (!telefonoRegex.test(telefonoSinEspacios)) {
        setError("El teléfono debe tener el formato +569XXXXXXXX.");
        setFieldErrors({ telefono: true });
        return;
      }

    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Por favor ingrese un correo válido.");
      setFieldErrors({ email: true });
      return; // no continúa si es inválido
    }
    if (isRegisterMode && form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setFieldErrors({ password: true, confirmPassword: true });
      return;
    }

    if (!form.password.trim()) {
      setError("La contraseña no puede estar vacía.");
      setFieldErrors({ password: true });
      return;
    }

    try {
      if (isRegisterMode) {
        const payload = {
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.email,
          contrasena: form.password
        };
        const response = await axios.post(`${API}/register`, payload, { withCredentials: true });
        console.log(response);
        if (response.status == 200) {
          setIsRegisterMode(false);
        }
      } else {
        const payload = { correo: form.email, contrasena: form.password };

        console.log(payload);
        const response = await axios.post(`${API}/login`, payload, { withCredentials: true });
        console.log(response);
        const bearer = response.headers['authorization'] || response.headers['Authorization'];
        const token = bearer?.split(' ')[1] || response.data.token;
        if (!token) throw new Error('Token no recibido');

        const userData = {
          email: response.data.correo || form.email,
          userId: response.data.userId || response.data.userId
        };
        const signed = signIn({
          auth: { token, type: 'Bearer' },
          userState: userData
        });
        if (signed) {
          navigate('/');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Dialog open fullWidth maxWidth="sm" >
      <DialogContent sx={{ borderRadius: 3, p: 4, minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Box component="img" src={darkMode ? BademaLogoBlack : BademaLogo} alt="Logo" sx={{ width: '200px', maxWidth: '100%' }} />
        </Box>

        <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
          {isRegisterMode ? 'Registre correo y contraseña' : 'Ingrese correo y contraseña'}
        </Typography>
        {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}

        {isRegisterMode && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField fullWidth name="nombre" label="Nombre" error={fieldErrors.nombre || false} value={form.nombre} onChange={handleChange} />
            <TextField fullWidth name="apellido" label="Apellido" error={fieldErrors.apellido || false} value={form.apellido} onChange={handleChange} />
          </Box>
        )}
        {isRegisterMode && (<MuiTelInput
          placeholder='+56 9 1234 5678'
          error={fieldErrors.telefono || false}
          defaultCountry="CL" // Chile
          value={form.telefono}
          onChange={(value) => setForm({ ...form, telefono: value })}
          sx={{ mb: 2 }}
        />)}

        <TextField fullWidth name="email" label="Correo electrónico" value={form.email} error={fieldErrors.email || false} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth name="password" type="password" error={fieldErrors.password || false} label="Contraseña" value={form.password} onChange={handleChange} sx={{ mb: 2 }} />
        {isRegisterMode && <TextField fullWidth name="confirmPassword" type="password" label="Confirmar contraseña" error={fieldErrors.confirmPassword || false} value={form.confirmPassword} onChange={handleChange} sx={{ mb: 2 }} />}

        <Button fullWidth variant="contained" size="large" startIcon={<LockIcon />} onClick={handleSubmit} sx={{ py: 2, mb: 2 }}>
          {isRegisterMode ? 'Registrarse' : 'Ingresar'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link component="button" onClick={toggleMode} underline="hover">
            {isRegisterMode ? 'Ingresar con cuenta ya creada' : 'Registrarse'}
          </Link>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Login;
