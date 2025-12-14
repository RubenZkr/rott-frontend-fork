import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, quizService } from '@/services/apiService';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [availableQuizzes, setAvailableQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [statsData, quizzesData] = await Promise.all([
                dashboardService.getStudentDashboard(),
                quizService.getAll({ status: 'published' }),
            ]);
            setStats(statsData);
            setAvailableQuizzes(quizzesData);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
            setError('Kon dashboard niet laden');
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (quizId) => {
        navigate(`/student/quiz/${quizId}`);
    };

    const handleViewResults = (attemptId) => {
        navigate(`/student/results/${attemptId}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4">
                    Welkom, {user?.username}!
                </Typography>
                <Button variant="outlined" onClick={logout}>
                    Uitloggen
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Stats Overview */}
            {stats && (
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4">{stats.total_attempts}</Typography>
                            <Typography color="text.secondary">Gemaakte Toetsen</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <TrendingUpIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                            <Typography variant="h4">{stats.average_score?.toFixed(1)}%</Typography>
                            <Typography color="text.secondary">Gemiddelde Score</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4">{stats.average_grade?.toFixed(1)}</Typography>
                            <Typography color="text.secondary">Gemiddeld Cijfer</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Recent Attempts */}
            {stats?.recent_attempts && stats.recent_attempts.length > 0 && (
                <Box mb={4}>
                    <Typography variant="h5" gutterBottom>
                        Recente Resultaten
                    </Typography>
                    <Grid container spacing={2}>
                        {stats.recent_attempts.map((attempt) => (
                            <Grid item xs={12} md={6} key={attempt.attempt_id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {attempt.quiz_title}
                                        </Typography>
                                        <Box display="flex" gap={1} mb={1}>
                                            <Chip
                                                label={`${attempt.score.toFixed(1)}%`}
                                                color="primary"
                                                size="small"
                                            />
                                            <Chip
                                                label={`Cijfer: ${attempt.grade.toFixed(1)}`}
                                                color="secondary"
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {attempt.completed_at && format(new Date(attempt.completed_at), 'PPP', { locale: nl })}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" onClick={() => handleViewResults(attempt.attempt_id)}>
                                            Bekijk Details
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Available Quizzes */}
            <Box>
                <Typography variant="h5" gutterBottom>
                    Beschikbare Toetsen
                </Typography>
                {availableQuizzes.length === 0 ? (
                    <Alert severity="info">Geen beschikbare toetsen op dit moment</Alert>
                ) : (
                    <Grid container spacing={2}>
                        {availableQuizzes.map((quiz) => (
                            <Grid item xs={12} md={6} lg={4} key={quiz.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {quiz.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {quiz.subject_name || 'Geen onderwerp'}
                                        </Typography>
                                        <Typography variant="body2">
                                            {quiz.question_count || 0} vragen
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => handleStartQuiz(quiz.id)}
                                        >
                                            Start Toets
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default StudentDashboard;
