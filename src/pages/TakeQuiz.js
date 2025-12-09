import React, { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Box, Button, CircularProgress, List, ListItem, Typography } from '@mui/material';
import { getQuiz, submitQuizAnswers } from '@/api/QuizApi';
import { useNavigate, useParams } from 'react-router-dom';
import { Send } from '@mui/icons-material';
import InteractiveMultipleChoice from '@/components/interactive/InteractiveMultipleChoice';
import InteractiveTrueFalse from '@/components/interactive/InteractiveTrueFalse';
import InteractiveShortAnswer from '@/components/interactive/InteractiveShortAnswer';

export default function TakeQuiz() {
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    let { quizUuid } = useParams();
    const navigate = useNavigate();

    // Function to fetch the quiz data
    const fetchQuiz = useCallback(async () => {
        try {
            const response = await getQuiz(quizUuid);
            setQuiz(response.quiz);
            // Initialize answers object
            const initialAnswers = {};
            response.quiz.questions.forEach((question, index) => {
                if (question.type === 'MC') {
                    initialAnswers[index] = [];
                } else if (question.type === 'TF') {
                    initialAnswers[index] = null;
                } else if (question.type === 'SA') {
                    initialAnswers[index] = '';
                }
            });
            setAnswers(initialAnswers);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setLoading(false);
        }
    }, [quizUuid]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

    const handleAnswerChange = (questionIndex, value) => {
        setAnswers({
            ...answers,
            [questionIndex]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const response = await submitQuizAnswers(quizUuid, answers);
            // Navigate to results page
            navigate(`/quiz-results/${quizUuid}`, { state: { results: response } });
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Er is een fout opgetreden bij het indienen van de quiz. Probeer het opnieuw.');
            setSubmitting(false);
        }
    };

    const isQuizComplete = () => {
        return quiz?.questions.every((question, index) => {
            const answer = answers[index];
            if (question.type === 'MC') {
                return answer && answer.length > 0;
            } else if (question.type === 'TF') {
                return answer !== null && answer !== '';
            } else if (question.type === 'SA') {
                return answer && answer.trim().length > 0;
            }
            return false;
        });
    };

    const renderAnswerInput = (question, questionIndex) => {
        if (question.type === 'MC') {
            return (
                <List dense component="ol" sx={{ listStyle: 'upper-alpha', pl: '2em' }}>
                    {question.options.map((option, optionIndex) => (
                        <InteractiveMultipleChoice
                            key={`mc-${questionIndex}-${optionIndex}`}
                            option={option}
                            index={optionIndex}
                            selectedAnswers={answers[questionIndex] || []}
                            onAnswerChange={(value) => handleAnswerChange(questionIndex, value)}
                        />
                    ))}
                </List>
            );
        } else if (question.type === 'TF') {
            return (
                <InteractiveTrueFalse
                    selectedAnswer={answers[questionIndex]}
                    onAnswerChange={(value) => handleAnswerChange(questionIndex, value)}
                />
            );
        } else if (question.type === 'SA') {
            return (
                <InteractiveShortAnswer
                    answer={answers[questionIndex]}
                    onAnswerChange={(value) => handleAnswerChange(questionIndex, value)}
                />
            );
        }
    };

    return (
        <AppShell>{{
            appBarButtons: null,
            body: loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress />
                    <Box sx={{ p: 2 }}>
                        <Typography>Quiz laden...</Typography>
                    </Box>
                </Box>
            ) : (
                <>
                    <h1>Quiz: {quiz.title}</h1>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Beantwoord alle vragen en klik op "Quiz Indienen" wanneer u klaar bent.
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <List dense component="ol" sx={{ listStyle: 'decimal', pl: '2em' }}>
                            {quiz.questions.map((question, i) => (
                                <ListItem key={`question-${i}`} sx={{ display: 'list-item', mb: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {question.question_text}
                                    </Typography>
                                    {renderAnswerInput(question, i)}
                                </ListItem>
                            ))}
                        </List>
                        <Box sx={{ mt: 4, mb: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<Send />}
                                disabled={!isQuizComplete() || submitting}
                            >
                                {submitting ? 'Indienen...' : 'Quiz Indienen'}
                            </Button>
                            {!isQuizComplete() && (
                                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                                    Beantwoord alle vragen voordat u de quiz indient.
                                </Typography>
                            )}
                        </Box>
                    </form>
                </>
            ),
        }}</AppShell>
    );
}
