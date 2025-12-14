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
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, isDocent, isStudent } = useAuth();
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
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        RoTT Assessment
                    </Typography>
                    <Typography variant="body1" gutterBottom align="center" color="text.secondary" mb={3}>
                        Log in om door te gaan
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Gebruikersnaam"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoFocus
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Wachtwoord"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 3 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Inloggen'}
                        </Button>
                    </form>

                    <Box mt={3}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            Demo accounts:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                            Docent: docent1 / Docent123!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                            Student: student1 / Student123!
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
