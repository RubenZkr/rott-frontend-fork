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
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Card,
    CardContent,
    LinearProgress,
} from '@mui/material';
import { attemptService, quizService } from '@/services/apiService';

const StudentQuizTaking = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        startQuiz();
    }, [quizId]);

    const startQuiz = async () => {
        try {
            setLoading(true);
            const [quizData, attemptData] = await Promise.all([
                quizService.getById(quizId),
                attemptService.startAttempt(quizId),
            ]);
            setQuiz(quizData);
            setAttempt(attemptData);

            // Initialize answers object
            const initialAnswers = {};
            quizData.questions.forEach((q) => {
                initialAnswers[q.id] = { question_id: q.id };
            });
            setAnswers(initialAnswers);
        } catch (err) {
            console.error('Failed to start quiz:', err);
            setError('Kon toets niet starten');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value, type) => {
        setAnswers({
            ...answers,
            [questionId]: {
                question_id: questionId,
                ...(type === 'SA' ? { text_answer: value } : { choice_id: value }),
            },
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm('Weet je zeker dat je de toets wilt indienen?')) {
            return;
        }

        try {
            setSubmitting(true);
            const answerList = Object.values(answers);
            const result = await attemptService.submitAnswers(attempt.id, answerList);
            navigate(`/student/results/${attempt.id}`);
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            setError('Kon toets niet indienen');
            setSubmitting(false);
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

    if (!quiz || quiz.questions.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="warning">Deze toets heeft geen vragen.</Alert>
                <Button onClick={() => navigate('/student/dashboard')} sx={{ mt: 2 }}>
                    Terug naar Dashboard
                </Button>
            </Container>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    {quiz.title}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Vraag {currentQuestionIndex + 1} van {quiz.questions.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {currentQuestion.points} {currentQuestion.points === 1 ? 'punt' : 'punten'}
                    </Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
            </Paper>

            {/* Question */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {currentQuestion.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {currentQuestion.question_text}
                    </Typography>

                    {currentQuestion.hint && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <strong>Hint:</strong> {currentQuestion.hint}
                        </Alert>
                    )}

                    {/* Multiple Choice or True/False */}
                    {(currentQuestion.type === 'MC' || currentQuestion.type === 'TF') && (
                        <RadioGroup
                            value={answers[currentQuestion.id]?.choice_id || ''}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, currentQuestion.type)}
                        >
                            {currentQuestion.choices.map((choice) => (
                                <FormControlLabel
                                    key={choice.id}
                                    value={choice.id}
                                    control={<Radio />}
                                    label={choice.text}
                                />
                            ))}
                        </RadioGroup>
                    )}

                    {/* Short Answer */}
                    {currentQuestion.type === 'SA' && (
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Type je antwoord hier..."
                            value={answers[currentQuestion.id]?.text_answer || ''}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, 'SA')}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Navigation */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button
                    variant="outlined"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    Vorige
                </Button>

                {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <Button variant="contained" onClick={handleNext}>
                        Volgende
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'Indienen'}
                    </Button>
                )}
            </Box>

            {/* Progress Indicator */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Beantwoord: {Object.values(answers).filter(a => a.choice_id || a.text_answer).length} / {quiz.questions.length}
                </Typography>
            </Box>
        </Container>
    );
};

export default StudentQuizTaking;
