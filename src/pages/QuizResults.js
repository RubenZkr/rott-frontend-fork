import React from 'react';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Box, Button, Card, CardContent, List, ListItem, Paper, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Cancel, Home } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export default function QuizResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const results = location.state?.results;

    if (!results) {
        return (
            <AppShell>{{
                appBarButtons: null,
                body: (
                    <>
                        <Typography variant="h4">Geen resultaten gevonden</Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            sx={{ mt: 2 }}
                        >
                            Terug naar Home
                        </Button>
                    </>
                ),
            }}</AppShell>
        );
    }

    const { score, total_questions, percentage, answers } = results;

    return (
        <AppShell>{{
            appBarButtons: (
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    startIcon={<Home />}
                >
                    Terug naar Home
                </Button>
            ),
            body: (
                <>
                    <h1>Quiz Resultaten</h1>
                    
                    <Card sx={{ mb: 4, backgroundColor: theme.palette.primary.light }}>
                        <CardContent>
                            <Typography variant="h3" align="center" sx={{ mb: 2 }}>
                                {percentage.toFixed(1)}%
                            </Typography>
                            <Typography variant="h5" align="center">
                                Score: {score} / {total_questions}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Gedetailleerde Feedback
                    </Typography>

                    <List sx={{ width: '100%' }}>
                        {answers && answers.map((answer, index) => (
                            <ListItem key={`answer-${index}`} sx={{ display: 'block', mb: 3 }}>
                                <Paper elevation={2} sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                        {answer.is_correct ? (
                                            <CheckCircle sx={{ color: theme.palette.success.main, mr: 1, mt: 0.5 }} />
                                        ) : (
                                            <Cancel sx={{ color: theme.palette.error.main, mr: 1, mt: 0.5 }} />
                                        )}
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ mb: 1 }}>
                                                Vraag {index + 1}
                                            </Typography>
                                            <Typography variant="body1" sx={{ mb: 2 }}>
                                                {answer.question_text}
                                            </Typography>
                                            
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Uw antwoord:</strong> {formatAnswer(answer.user_answer, answer.question_type)}
                                            </Typography>
                                            
                                            {!answer.is_correct && (
                                                <Typography variant="body2" sx={{ color: theme.palette.success.main }}>
                                                    <strong>Juiste antwoord:</strong> {formatAnswer(answer.correct_answer, answer.question_type)}
                                                </Typography>
                                            )}
                                            
                                            {answer.feedback && (
                                                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                                    💡 {answer.feedback}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Paper>
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/')}
                            startIcon={<Home />}
                        >
                            Terug naar Home
                        </Button>
                    </Box>
                </>
            ),
        }}</AppShell>
    );
}

function formatAnswer(answer, questionType) {
    if (questionType === 'TF') {
        return answer === 'TRUE' ? 'Waar' : 'Onwaar';
    } else if (questionType === 'MC' && Array.isArray(answer)) {
        return answer.join(', ');
    }
    return answer;
}
