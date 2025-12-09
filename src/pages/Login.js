import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Link, Alert, CircularProgress } from '@mui/material';
import AppShell from '@/components/AppShell';
import { login } from '@/api/AuthApi';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(email, password);
            localStorage.setItem('token', response.token);
            navigate('/dashboard');
        } catch (err) {
            setError('Ongeldige inloggegevens. Probeer het opnieuw.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell>{{
            appBarButtons: null,
            body: (
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        maxWidth: 400,
                        mx: 'auto',
                        mt: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                        Log in
                    </Typography>

                    {error && (
                        <Alert severity="error">{error}</Alert>
                    )}

                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                    />

                    <TextField
                        label="Wachtwoord"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                    />

                    <Link
                        href="#"
                        underline="hover"
                        sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
                        onClick={(e) => e.preventDefault()}
                    >
                        Wachtwoord vergeten?
                    </Link>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                            backgroundColor: '#7C3AED',
                            '&:hover': {
                                backgroundColor: '#6D28D9'
                            },
                            py: 1.5,
                            mt: 1
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Inloggen'}
                    </Button>
                </Box>
            )
        }}</AppShell>
    );
}
