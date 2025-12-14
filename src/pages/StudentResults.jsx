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
    Card,
    CardContent,
    Chip,
    Grid,
    Divider,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { attemptService } from '@/services/apiService';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const StudentResults = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadResults();
    }, [attemptId]);

    const loadResults = async () => {
        try {
            setLoading(true);
            const data = await attemptService.getResults(attemptId);
            setResults(data);
        } catch (err) {
            console.error('Failed to load results:', err);
            setError('Kon resultaten niet laden');
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

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => navigate('/student/dashboard')} sx={{ mt: 2 }}>
                    Terug naar Dashboard
                </Button>
            </Container>
        );
    }

    if (!results) {
        return null;
    }

    const getGradeColor = (grade) => {
        if (grade >= 8) return 'success';
        if (grade >= 6) return 'primary';
        if (grade >= 5.5) return 'warning';
        return 'error';
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    {results.quiz_title}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Voltooid op {results.completed_at && format(new Date(results.completed_at), 'PPP', { locale: nl })}
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={4}>
                        <Box>
                            <Typography variant="h3" color="primary">
                                {results.score.toFixed(1)}%
                            </Typography>
                            <Typography color="text.secondary">Score</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box>
                            <Chip
                                label={results.grade.toFixed(1)}
                                color={getGradeColor(results.grade)}
                                sx={{ fontSize: '2rem', height: '60px', width: '80px' }}
                            />
                            <Typography color="text.secondary" sx={{ mt: 1 }}>Cijfer</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box>
                            <Typography variant="h3" color="secondary">
                                {results.earned_points}/{results.total_points}
                            </Typography>
                            <Typography color="text.secondary">Punten</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Questions Review */}
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Vraag voor Vraag
            </Typography>

            {results.questions.map((question, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                            <Box flex={1}>
                                <Typography variant="h6" gutterBottom>
                                    Vraag {index + 1}: {question.question_text}
                                </Typography>
                            </Box>
                            <Box>
                                {question.is_correct ? (
                                    <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                                ) : (
                                    <CancelIcon color="error" sx={{ fontSize: 40 }} />
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Student Answer */}
                        <Box mb={2}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Jouw antwoord:
                            </Typography>
                            <Typography variant="body1">
                                {question.student_answer || 'Geen antwoord gegeven'}
                            </Typography>
                        </Box>

                        {/* Correct Answer (if wrong) */}
                        {!question.is_correct && (
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Correct antwoord:
                                </Typography>
                                <Typography variant="body1" color="success.main">
                                    {question.correct_answer}
                                </Typography>
                            </Box>
                        )}

                        {/* Points */}
                        <Box mb={2}>
                            <Chip
                                size="small"
                                label={`${question.points_earned} / ${question.points} punten`}
                                color={question.is_correct ? 'success' : 'error'}
                            />
                        </Box>

                        {/* Feedback */}
                        {question.feedback && (
                            <Alert severity={question.is_correct ? 'success' : 'info'} sx={{ mt: 2 }}>
                                <strong>Feedback:</strong> {question.feedback}
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            ))}

            {/* Actions */}
            <Box display="flex" justifyContent="center" gap={2} mt={4}>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/student/dashboard')}
                >
                    Terug naar Dashboard
                </Button>
            </Box>
        </Container>
    );
};

export default StudentResults;
