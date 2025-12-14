import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Card,
    Button,
    CircularProgress,
    Alert,
    Paper,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Chip
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    EmojiEvents as EmojiEventsIcon,
    School as SchoolIcon
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

    const getGradeColor = (grade) => {
        if (grade >= 8) return '#22C55E'; // Green
        if (grade >= 6) return '#EAB308'; // Yellow/Orange
        if (grade >= 5.5) return '#F97316'; // Orange
        return '#EF4444'; // Red
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#F3F4F6">
                <CircularProgress />
            </Box>
        );
    }

    const totalTests = 32; // Hardcoded goal from design or derived
    const completedTests = stats?.total_attempts || 0;
    const progress = Math.min((completedTests / totalTests) * 100, 100);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F3F4F6', pb: 8 }}>
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', py: 2, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Ingelogd als leerling: <span style={{ color: '#111827', fontWeight: 500 }}>{user?.username}</span>
                </Typography>
                <Button variant="outlined" size="small" onClick={logout} sx={{ textTransform: 'none', borderColor: '#E5E7EB', color: '#374151', '&:hover': { bgcolor: '#F9FAFB' } }}>
                    Uitloggen
                </Button>
            </Box>

            <Container maxWidth="lg" sx={{ pt: 4 }}>
                {/* Welcome Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                            Welkom, {user?.username}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Bekijk hier je toetsresultaten en voortgang
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Golden Badge */}
                        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                bgcolor: '#FACC15',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgba(250, 204, 21, 0.4)'
                            }}>
                                <EmojiEventsIcon sx={{ color: 'white' }} />
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#D97706', fontWeight: 700 }}>
                                Goud Badge
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {completedTests}/{totalTests} toetsen
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Progress Bar */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 4, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#059669' }}>
                            {completedTests} van {totalTests} toetsen voltooid
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ flexGrow: 1, bgcolor: '#E5E7EB', borderRadius: 4, height: 12 }}>
                            <Box sx={{
                                width: `${progress}%`,
                                bgcolor: '#22C55E',
                                height: '100%',
                                borderRadius: 4,
                                transition: 'width 1s ease-in-out'
                            }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            {Math.round(progress)}%
                        </Typography>
                    </Box>
                </Paper>

                {/* Results Table Section */}
                {stats && (
                    <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <CheckCircleIcon color="success" />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                                    Gemaakte Toetsen ({stats.total_attempts})
                                </Typography>
                            </Box>

                            <Paper sx={{ p: 2, bgcolor: '#F9FAFB', border: 'none', boxShadow: 'none', maxWidth: 400 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Gemiddeld Cijfer
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1F2937' }}>
                                    {stats.average_grade?.toFixed(1) || '0.0'}
                                </Typography>
                            </Paper>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>Toets</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>Vak</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>Datum</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>Cijfer</TableCell>
                                        <TableCell width={50} sx={{ borderBottom: '1px solid #F3F4F6' }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.recent_attempts && stats.recent_attempts.map((attempt) => (
                                        <TableRow key={attempt.attempt_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 500, color: '#111827' }}>{attempt.quiz_title}</TableCell>
                                            <TableCell sx={{ color: '#6B7280' }}>
                                                {/* Assuming subject is available or using placeholder/mock logic if not in API yet */}
                                                Discipline
                                            </TableCell>
                                            <TableCell sx={{ color: '#6B7280' }}>
                                                {attempt.completed_at && format(new Date(attempt.completed_at), 'd MMM yyyy', { locale: nl })}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{
                                                    display: 'inline-flex',
                                                    bgcolor: getGradeColor(attempt.grade),
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    minWidth: 40,
                                                    justifyContent: 'center'
                                                }}>
                                                    {attempt.grade.toFixed(1)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="small" onClick={() => handleViewResults(attempt.attempt_id)} sx={{ minWidth: 'auto' }}>
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!stats.recent_attempts || stats.recent_attempts.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#6B7280' }}>
                                                Nog geen toetsen gemaakt.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {/* Available Quizzes - Keep this functional but style it simply to match */}
                {availableQuizzes.length > 0 && (
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937', mb: 2 }}>
                            Beschikbare Toetsen
                        </Typography>
                        <Stack spacing={2}>
                            {availableQuizzes.map((quiz) => (
                                <Paper key={quiz.id} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1, bgcolor: '#E0E7FF', borderRadius: 2, color: '#4F46E5' }}>
                                            <SchoolIcon />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                                                {quiz.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {quiz.question_count} vragen
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleStartQuiz(quiz.id)}
                                        sx={{ bgcolor: '#111827', textTransform: 'none', '&:hover': { bgcolor: '#374151' } }}
                                    >
                                        Start
                                    </Button>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default StudentDashboard;
