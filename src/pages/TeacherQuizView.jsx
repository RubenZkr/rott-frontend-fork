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
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    ExpandMore as ExpandMoreIcon,
    Publish as PublishIcon,
    Assessment as AssessmentIcon,
    PictureAsPdf as PdfIcon,
    Assignment as AnswerSheetIcon,
} from '@mui/icons-material';
import { quizService } from '@/services/apiService';
import apiConfig from '@/config/apiConfig';

const TeacherQuizView = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            await quizService.publish(quizId);
            loadQuiz();
        } catch (err) {
            console.error('Failed to publish quiz:', err);
            setError('Kon toets niet publiceren');
        }
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
                    </Box>
                    <Box display="flex" gap={1}>
                        {quiz.status === 'draft' && (
                            <Button
                                variant="contained"
                                startIcon={<PublishIcon />}
                                onClick={handlePublish}
                            >
                                Publiceer
                            </Button>
                        )}
                        {quiz.status === 'published' && (
                            <Button
                                variant="contained"
                                startIcon={<AssessmentIcon />}
                                onClick={handleViewStats}
                            >
                                Statistieken
                            </Button>
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
        </Container>
    );
};

export default TeacherQuizView;
