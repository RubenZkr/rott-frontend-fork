import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Grid,
    Chip,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { dashboardService, quizService } from '@/services/apiService';

const TeacherQuizStats = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, [quizId]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [quizData, statsData] = await Promise.all([
                quizService.getById(quizId),
                dashboardService.getQuizStats(quizId),
            ]);
            setQuiz(quizData);
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load stats:', err);
            setError('Kon statistieken niet laden');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !stats) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Statistieken niet gevonden'}</Alert>
                <Button onClick={() => navigate('/teacher/dashboard')} sx={{ mt: 2 }}>
                    Terug naar Dashboard
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box mb={3}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/teacher/quiz/${quizId}`)}
                >
                    Terug naar Toets
                </Button>
            </Box>

            <Typography variant="h4" gutterBottom>
                Statistieken: {stats.quiz_title}
            </Typography>

            {/* Overview Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="primary">
                                {stats.total_attempts}
                            </Typography>
                            <Typography color="text.secondary">Totaal Pogingen</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="secondary">
                                {stats.average_score?.toFixed(1)}%
                            </Typography>
                            <Typography color="text.secondary">Gemiddelde Score</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="success.main">
                                {stats.average_grade?.toFixed(1)}
                            </Typography>
                            <Typography color="text.secondary">Gemiddeld Cijfer</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Difficult Questions */}
            {stats.difficult_questions && stats.difficult_questions.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <TrendingDownIcon color="error" />
                        <Typography variant="h6">
                            Moeilijkste Vragen (Success rate &lt; 50%)
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Vraag</TableCell>
                                    <TableCell align="right">Success Rate</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.difficult_questions.map((q, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{q.question_text}</TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={`${q.success_rate.toFixed(1)}%`}
                                                color="error"
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Student Scores */}
            {stats.student_scores && stats.student_scores.length > 0 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Student Resultaten
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell align="right">Score</TableCell>
                                    <TableCell align="right">Cijfer</TableCell>
                                    <TableCell align="right">Datum</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.student_scores.map((student, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{student.student_name}</TableCell>
                                        <TableCell align="right">{student.score.toFixed(1)}%</TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={student.grade.toFixed(1)}
                                                color={student.grade >= 6 ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {student.completed_at ? new Date(student.completed_at).toLocaleDateString('nl-NL') : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {stats.total_attempts === 0 && (
                <Alert severity="info">
                    Nog geen studenten hebben deze toets gemaakt.
                </Alert>
            )}
        </Container>
    );
};

export default TeacherQuizStats;
