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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    ExpandMore as ExpandMoreIcon,
    Publish as PublishIcon,
    Unpublished as UnpublishedIcon,
    Assessment as AssessmentIcon,
    PictureAsPdf as PdfIcon,
    Assignment as AnswerSheetIcon,
    Refresh as RefreshIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { quizService } from '@/services/apiService';
import apiConfig from '@/config/apiConfig';

const TeacherQuizView = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [regeneratingQuestionId, setRegeneratingQuestionId] = useState(null);

    // Publish dialog state
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [availableFrom, setAvailableFrom] = useState('');
    const [availableUntil, setAvailableUntil] = useState('');
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    const loadQuiz = async () => {
        try {
            setLoading(true);
            const data = await quizService.getById(quizId);
            setQuiz(data);
        } catch (err) {
            console.error('Failed to load quiz:', err);
            setError('Kon toets niet laden');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        try {
            setPublishing(true);
            const fromDate = availableFrom ? new Date(availableFrom).toISOString() : null;
            const untilDate = availableUntil ? new Date(availableUntil).toISOString() : null;
            await quizService.publish(quizId, fromDate, untilDate);
            setPublishDialogOpen(false);
            setAvailableFrom('');
            setAvailableUntil('');
            loadQuiz();
        } catch (err) {
            console.error('Failed to publish quiz:', err);
            setError('Kon toets niet publiceren');
        } finally {
            setPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        if (!window.confirm('Weet je zeker dat je deze toets wilt depubliceren? Studenten kunnen de toets dan niet meer maken.')) {
            return;
        }
        try {
            await quizService.unpublish(quizId);
            loadQuiz();
        } catch (err) {
            console.error('Failed to unpublish quiz:', err);
            setError('Kon toets niet depubliceren');
        }
    };

    const handleOpenPublishDialog = () => {
        // Pre-fill with existing availability if editing
        if (quiz?.available_from) {
            setAvailableFrom(quiz.available_from.slice(0, 16)); // Format for datetime-local
        }
        if (quiz?.available_until) {
            setAvailableUntil(quiz.available_until.slice(0, 16));
        }
        setPublishDialogOpen(true);
    };

    const handleViewStats = () => {
        navigate(`/teacher/quiz/${quizId}/stats`);
    };

    const handleDownloadQuizPdf = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${apiConfig.baseUrl}/api/quizzes/${quizId}/pdf/student`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Download mislukt');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${quiz.title}_toets.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to download quiz PDF:', err);
            setError('Kon PDF niet downloaden');
        }
    };

    const handleDownloadAnswersPdf = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${apiConfig.baseUrl}/api/quizzes/${quizId}/pdf/answers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Download mislukt');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${quiz.title}_antwoorden.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to download answer sheet PDF:', err);
            setError('Kon antwoordenblad niet downloaden');
        }
    };

    const handleRegenerateQuestion = async (questionId) => {
        if (regeneratingQuestionId) return; // Prevent multiple simultaneous regenerations

        try {
            setRegeneratingQuestionId(questionId);
            setError('');

            await quizService.regenerateQuestion(quizId, questionId);

            // Poll for completion (the regeneration happens async via Celery)
            // Wait a bit then reload the quiz to see the new question
            setTimeout(async () => {
                await loadQuiz();
                setRegeneratingQuestionId(null);
            }, 5000); // Wait 5 seconds for regeneration to complete

        } catch (err) {
            console.error('Failed to regenerate question:', err);
            setError('Kon vraag niet hergenereren');
            setRegeneratingQuestionId(null);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !quiz) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Toets niet gevonden'}</Alert>
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
                    onClick={() => navigate('/teacher/dashboard')}
                >
                    Terug naar Dashboard
                </Button>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {quiz.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            {quiz.subject_name || 'Geen onderwerp'}
                        </Typography>
                        <Chip
                            label={quiz.status}
                            color={quiz.status === 'published' ? 'success' : 'default'}
                            sx={{ mt: 1 }}
                        />
                        {/* Show availability info if published with time window */}
                        {quiz.status === 'published' && (quiz.available_from || quiz.available_until) && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                    {quiz.available_from && `Vanaf: ${new Date(quiz.available_from).toLocaleString('nl-NL')}`}
                                    {quiz.available_from && quiz.available_until && ' - '}
                                    {quiz.available_until && `Tot: ${new Date(quiz.available_until).toLocaleString('nl-NL')}`}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        {quiz.status === 'draft' && (
                            <Button
                                variant="contained"
                                startIcon={<PublishIcon />}
                                onClick={handleOpenPublishDialog}
                            >
                                Publiceer
                            </Button>
                        )}
                        {quiz.status === 'published' && (
                            <>
                                <Button
                                    variant="contained"
                                    startIcon={<AssessmentIcon />}
                                    onClick={handleViewStats}
                                >
                                    Statistieken
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<UnpublishedIcon />}
                                    onClick={handleUnpublish}
                                >
                                    Depubliceren
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<PdfIcon />}
                            onClick={handleDownloadQuizPdf}
                        >
                            Download Toets (PDF)
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<AnswerSheetIcon />}
                            onClick={handleDownloadAnswersPdf}
                        >
                            Download Antwoordenblad
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Questions */}
            <Typography variant="h5" gutterBottom>
                Vragen ({quiz.questions?.length || 0})
            </Typography>

            {quiz.questions && quiz.questions.length > 0 ? (
                quiz.questions.map((question, index) => (
                    <Accordion key={question.id} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" alignItems="center" gap={2} flex={1}>
                                <Typography variant="h6">
                                    {index + 1}.
                                </Typography>
                                <Typography flex={1}>
                                    {question.title || question.question_text}
                                </Typography>
                                <Chip
                                    label={question.type === 'MC' ? 'Meerkeuze' : question.type === 'TF' ? 'Waar/Onwaar' : 'Open'}
                                    size="small"
                                />
                                <Chip
                                    label={`${question.points} pt`}
                                    size="small"
                                    color="primary"
                                />
                                {quiz.status === 'draft' && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={regeneratingQuestionId === question.id ? <CircularProgress size={16} /> : <RefreshIcon />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRegenerateQuestion(question.id);
                                        }}
                                        disabled={regeneratingQuestionId !== null}
                                        sx={{ ml: 1 }}
                                    >
                                        {regeneratingQuestionId === question.id ? 'Bezig...' : 'Hergenereren'}
                                    </Button>
                                )}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Typography variant="body1" paragraph>
                                    <strong>Vraag:</strong> {question.question_text}
                                </Typography>

                                {question.hint && (
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        <strong>Hint:</strong> {question.hint}
                                    </Alert>
                                )}

                                {/* Multiple Choice / True False */}
                                {(question.type === 'MC' || question.type === 'TF') && question.choices && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Antwoordopties:
                                        </Typography>
                                        <List dense>
                                            {question.choices.map((choice) => (
                                                <ListItem
                                                    key={choice.id}
                                                    sx={{
                                                        backgroundColor: choice.is_correct ? 'success.light' : 'transparent',
                                                        borderRadius: 1,
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={choice.text}
                                                        secondary={choice.is_correct ? 'Correct antwoord' : ''}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}

                                {/* Short Answer */}
                                {question.type === 'SA' && question.short_answer && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Correcte antwoorden:
                                        </Typography>
                                        <List dense>
                                            {question.short_answer.correct_answers.map((answer, idx) => (
                                                <ListItem key={idx}>
                                                    <ListItemText primary={answer} />
                                                </ListItem>
                                            ))}
                                        </List>
                                        <Typography variant="body2" color="text.secondary">
                                            Hoofdlettergevoelig: {question.short_answer.case_sensitive ? 'Ja' : 'Nee'}
                                        </Typography>
                                    </Box>
                                )}

                                {question.feedback && (
                                    <Alert severity="success" sx={{ mt: 2 }}>
                                        <strong>Feedback:</strong> {question.feedback}
                                    </Alert>
                                )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Alert severity="info">Deze toets heeft nog geen vragen.</Alert>
            )}

            {/* Publish Dialog */}
            <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Toets Publiceren</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Optioneel: Stel een tijdbestek in waarin de toets beschikbaar is voor studenten.
                        Laat leeg voor directe en permanente beschikbaarheid.
                    </Typography>
                    <TextField
                        label="Beschikbaar vanaf"
                        type="datetime-local"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        helperText="Laat leeg voor direct beschikbaar"
                    />
                    <TextField
                        label="Beschikbaar tot"
                        type="datetime-local"
                        value={availableUntil}
                        onChange={(e) => setAvailableUntil(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        helperText="Laat leeg voor geen einddatum"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPublishDialogOpen(false)}>
                        Annuleren
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handlePublish}
                        disabled={publishing}
                        startIcon={publishing ? <CircularProgress size={16} /> : <PublishIcon />}
                    >
                        {publishing ? 'Bezig...' : 'Publiceren'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherQuizView;
