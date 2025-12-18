import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputLabel,
    Stack
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = await login(formData.username, formData.password);

            // Redirect based on role
            if (user.role === 'docent' || user.role === 'admin') {
                navigate('/teacher/dashboard');
            } else if (user.role === 'student') {
                navigate('/student/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || 'Inloggen mislukt. Controleer je gebruikersnaam en wachtwoord.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 50% 0%, #E0E7FF 0%, #F5F3FF 50%, #FDF4FF 100%)',
                padding: 2,
            }}
        >
            <Container maxWidth="xs">
                {/* Header Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        }}
                    >
                        <LockOutlinedIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
                        Leerlingvolgsysteem
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Log in om door te gaan
                    </Typography>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                        Inloggen
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Vul je gebruikersnaam en wachtwoord in
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 2 }}>
                            <InputLabel shrink htmlFor="username" sx={{ fontWeight: 500, color: '#374151', mb: 1, transform: 'none', fontSize: '0.875rem' }}>
                                Gebruikersnaam
                            </InputLabel>
                            <TextField
                                id="username"
                                fullWidth
                                placeholder="Voer gebruikersnaam in"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#F9FAFB',
                                        '& fieldset': { borderColor: '#E5E7EB' },
                                        '&:hover fieldset': { borderColor: '#D1D5DB' },
                                        '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
                                    },
                                    '& .MuiInputBase-input': {
                                        padding: '12px 14px',
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <InputLabel shrink htmlFor="password" sx={{ fontWeight: 500, color: '#374151', mb: 1, transform: 'none', fontSize: '0.875rem' }}>
                                Wachtwoord
                            </InputLabel>
                            <TextField
                                id="password"
                                fullWidth
                                placeholder="Voer wachtwoord in"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#F9FAFB',
                                        '& fieldset': { borderColor: '#E5E7EB' },
                                        '&:hover fieldset': { borderColor: '#D1D5DB' },
                                        '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
                                    },
                                    '& .MuiInputBase-input': {
                                        padding: '12px 14px',
                                    }
                                }}
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                bgcolor: '#0F172A',
                                color: 'white',
                                py: 1.5,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                                '&:hover': {
                                    bgcolor: '#1E293B',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Inloggen'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #F3F4F6' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Test accounts:
                        </Typography>
                        <Stack spacing={1.5}>
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: '#EFF6FF',
                                    border: '1px solid #DBEAFE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#2563EB', bgcolor: 'white', px: 0.8, py: 0.2, borderRadius: 0.5, border: '1px solid #BFDBFE' }}>
                                    Leerling
                                </Typography>
                                <Typography variant="body2" color="#1E40AF">
                                    student1 / Student123!
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: '#F5F3FF',
                                    border: '1px solid #EDE9FE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#7C3AED', bgcolor: 'white', px: 0.8, py: 0.2, borderRadius: 0.5, border: '1px solid #DDD6FE' }}>
                                    Docent
                                </Typography>
                                <Typography variant="body2" color="#5B21B6">
                                    docent1 / Docent123!
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
