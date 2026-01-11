import React, { useState, useEffect, useCallback } from 'react';
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
    LinearProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    School as SchoolIcon,
    EmojiEvents as TrophyIcon,
    TrendingUp as TrendingUpIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import { dashboardService } from '@/services/apiService';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const TeacherStudentView = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadStudentData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getStudentProgress(studentId);
            setStudent(data);
        } catch (err) {
            console.error('Failed to load student data:', err);
            setError('Kon studentgegevens niet laden');
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        loadStudentData();
    }, [loadStudentData]);

    const getGradeColor = (grade) => {
        if (!grade) return '#E5E7EB';
        if (grade >= 8.0) return '#22C55E';
        if (grade >= 6.0) return '#EAB308';
        if (grade >= 5.5) return '#F97316';
        return '#EF4444';
    };

    const getGradeBgColor = (grade) => {
        if (!grade) return '#F3F4F6';
        if (grade >= 8.0) return '#DCFCE7';
        if (grade >= 6.0) return '#FEF9C3';
        if (grade >= 5.5) return '#FFEDD5';
        return '#FEE2E2';
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#F3F4F6">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !student) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Student niet gevonden'}</Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/teacher/dashboard')}
                    sx={{ mt: 2 }}
                >
                    Terug naar Dashboard
                </Button>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F3F4F6', py: 4 }}>
            <Container maxWidth="lg">
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/teacher/dashboard')}
                    sx={{ mb: 3 }}
                >
                    Terug naar Dashboard
                </Button>

                {/* Student Header */}
                <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                                {student.student_name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Student overzicht en resultaten
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: getGradeBgColor(student.average_grade),
                            px: 3,
                            py: 2,
                            borderRadius: 2
                        }}>
                            <TrophyIcon sx={{ color: getGradeColor(student.average_grade), fontSize: 32 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Gemiddeld Cijfer
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: getGradeColor(student.average_grade) }}>
                                    {student.average_grade ? student.average_grade.toFixed(1) : '-'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <SchoolIcon sx={{ fontSize: 40, color: '#6366F1' }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937' }}>
                                            {student.completed_attempts}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toetsen Voltooid
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <TrendingUpIcon sx={{ fontSize: 40, color: '#22C55E' }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937' }}>
                                            {student.average_score ? `${student.average_score.toFixed(0)}%` : '-'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Gemiddelde Score
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <AssessmentIcon sx={{ fontSize: 40, color: '#F59E0B' }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937' }}>
                                            {student.total_attempts}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Totaal Pogingen
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Recent Quizzes */}
                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                            Recente Toetsen
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Toets</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>Score</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>Cijfer</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Datum</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {student.recent_quizzes?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            Deze student heeft nog geen toetsen gemaakt
                                        </TableCell>
                                    </TableRow>
                                )}
                                {student.recent_quizzes?.map((quiz, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>
                                            {quiz.quiz_title}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={quiz.score || 0}
                                                    sx={{
                                                        width: 80,
                                                        height: 8,
                                                        borderRadius: 4,
                                                        bgcolor: '#E5E7EB',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: getGradeColor(quiz.grade)
                                                        }
                                                    }}
                                                />
                                                <Typography variant="body2">
                                                    {quiz.score ? `${quiz.score.toFixed(0)}%` : '-'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{
                                                display: 'inline-flex',
                                                bgcolor: getGradeColor(quiz.grade),
                                                color: 'white',
                                                fontWeight: 700,
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 1,
                                                minWidth: 40,
                                                justifyContent: 'center'
                                            }}>
                                                {quiz.grade ? quiz.grade.toFixed(1) : '-'}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" color="text.secondary">
                                                {quiz.completed_at
                                                    ? format(new Date(quiz.completed_at), 'dd MMM yyyy, HH:mm', { locale: nl })
                                                    : '-'
                                                }
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </Box>
    );
};

export default TeacherStudentView;
