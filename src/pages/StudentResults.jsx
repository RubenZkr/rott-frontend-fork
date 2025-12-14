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
    LinearProgress,
    Stack
} from '@mui/material';
import {
    CheckCircleOutline as CheckCircleOutlineIcon,
    RemoveCircleOutline as RemoveCircleOutlineIcon,
    ArrowBack as ArrowBackIcon
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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#F3F4F6">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => navigate('/student/dashboard')} sx={{ mt: 2 }}>
                    Terug naar overzicht
                </Button>
            </Container>
        );
    }

    if (!results) return null;

    const percentage = (results.earned_points / results.total_points) * 100;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF', py: 4 }}>
            <Container maxWidth="md">
                {/* Header Link */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                    <Button
                        startIcon={<ArrowBackIcon fontSize="small" />}
                        onClick={() => navigate('/student/dashboard')}
                        sx={{
                            color: '#4B5563',
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': { bgcolor: 'transparent', color: '#111827' }
                        }}
                    >
                        Terug naar overzicht
                    </Button>
                </Box>

                {/* Main Summary Card */}
                <Paper sx={{ p: 4, borderRadius: 4, mb: 4, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                            {results.quiz_title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 2 }}>
                            {/* Placeholder icons/text for subject/date */}
                            <span>Wiskunde</span> {/* Mock subject */}
                            <span>{results.completed_at && format(new Date(results.completed_at), 'd MMMM yyyy', { locale: nl })}</span>
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Cijfer
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 700, color: '#1F2937', lineHeight: 1 }}>
                                {results.grade.toFixed(1)}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Score
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937' }}>
                                {results.earned_points} / {results.total_points}
                            </Typography>
                        </Box>
                    </Box>

                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Behaald percentage
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {Math.round(percentage)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                                height: 12,
                                borderRadius: 6,
                                bgcolor: '#F3F4F6',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: '#111827', // Black/Dark bar as per design
                                    borderRadius: 6
                                }
                            }}
                        />
                    </Box>
                </Paper>

                {/* Questions List Header */}
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#4B5563', mb: 2 }}>
                    Vraag per Vraag
                </Typography>

                <Stack spacing={2}>
                    {results.questions.map((question, index) => (
                        <Paper key={index} sx={{ p: 0, borderRadius: 3, overflow: 'hidden', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                            <Box sx={{ p: 3, display: 'flex', gap: 2 }}>
                                <Box sx={{ pt: 0.5 }}>
                                    {question.is_correct ? (
                                        <CheckCircleOutlineIcon color="success" fontSize="large" sx={{ color: '#22C55E' }} />
                                    ) : (
                                        <RemoveCircleOutlineIcon color="warning" fontSize="large" sx={{ color: '#F59E0B' }} />
                                    )}
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: results.is_correct ? '#22C55E' : (question.points_earned > 0 ? '#F59E0B' : '#EF4444') }}>
                                            Vraag {index + 1}: {question.question_text}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280', bgcolor: '#F9FAFB', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #E5E7EB', height: 'fit-content' }}>
                                            {question.points_earned}/{question.points}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                        Antwoord: <span style={{ color: '#1F2937', fontWeight: 500 }}>{question.student_answer || '-'}</span>
                                    </Typography>

                                    {!question.is_correct && (
                                        <Box sx={{ mt: 1, p: 1.5, bgcolor: '#FEF2F2', borderRadius: 1, border: '1px solid #FEE2E2' }}>
                                            <Typography variant="body2" color="error" sx={{ fontSize: '0.875rem' }}>
                                                Correct antwoord: <span style={{ fontWeight: 600 }}>{question.correct_answer}</span>
                                            </Typography>
                                            {question.feedback && (
                                                <Typography variant="body2" sx={{ mt: 0.5, color: '#DC2626', fontSize: '0.85rem' }}>
                                                    {question.feedback}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Stack>

            </Container>
        </Box>
    );
};

export default StudentResults;
