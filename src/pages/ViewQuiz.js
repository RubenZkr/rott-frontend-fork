import React, { useEffect, useState, useCallback, useRef } from 'react';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Box, CircularProgress, IconButton, List, ListItem, Typography } from '@mui/material';
import { getQuiz, regenerateQuestion, exportQuiz, subscribeToQuizProgress } from '@/api/QuizApi';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Download, Refresh, Quiz } from '@mui/icons-material';
import AppBarButton from '@/components/AppBar/AppBarButton';
import Answers from '@/components/answers/Answers';

export default function ViewQuiz() {
    const [downloadingQuiz, setDownloadingQuiz] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [waitingForGenerationStart, setWaitingForGenerationStart] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");
    const closeStreamRef = useRef(null);
    let { quizUuid } = useParams();
    const navigate = useNavigate();

    // Function to fetch the quiz data
    const fetchQuiz = useCallback(async () => {
        const response = await getQuiz(quizUuid);
        setQuiz(response);
        setProgressMessage("");
        setDownloadingQuiz(false);
        setWaitingForGenerationStart(false);
    }, [quizUuid]);

    // Function to subscribe to quiz progress via SSE
    const subscribeProgress = useCallback(() => {
        setProgressMessage("Moment, het genereren is bezig...");

        // Close any existing stream
        if (closeStreamRef.current) {
            closeStreamRef.current();
        }

        closeStreamRef.current = subscribeToQuizProgress(
            quizUuid,
            // onProgress
            (progress) => {
                setProgressMessage(progress || "Starten...");
            },
            // onComplete
            async (finalProgress) => {
                await fetchQuiz();
            },
            // onError
            (error) => {
                console.error('SSE Error:', error);
                // Try to fetch quiz anyway in case generation completed
                fetchQuiz();
            }
        );
    }, [quizUuid, fetchQuiz]);

    // useEffect for initial loading
    useEffect(() => {
        subscribeProgress();

        // Cleanup on unmount
        return () => {
            if (closeStreamRef.current) {
                closeStreamRef.current();
            }
        };
    }, [subscribeProgress]);

    async function startQuestionRegenerate(questionId) {
        setWaitingForGenerationStart(true);
        setProgressMessage("Starten...");

        regenerateQuestion(quiz.id, questionId);

        // Subscribe to progress for regeneration
        subscribeProgress();
    }

    async function downloadBrightspaceCsv() {
        const brightspaceCsvBlob = await exportQuiz(quizUuid);
        const fileURL = URL.createObjectURL(brightspaceCsvBlob);
        const fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.download = `Quiz-${new Date().toISOString()}.csv`;
        fileLink.click();
    }

    return (
        <AppShell>{{
            appBarButtons: !downloadingQuiz && !waitingForGenerationStart && (
                <>
                    <AppBarButton onClick={() => navigate('/')}>
                        <ArrowBack />&nbsp;Begin opnieuw
                    </AppBarButton>
                    <AppBarButton onClick={() => navigate(`/take-quiz/${quizUuid}`)}>
                        <Quiz />&nbsp;Neem de quiz
                    </AppBarButton>
                    <div style={{ marginLeft: 'auto' }}>
                        <AppBarButton onClick={downloadBrightspaceCsv}>
                            <Download />&nbsp;Download .csv voor Brightspace
                        </AppBarButton>
                    </div>
                </>
            ),
            body: downloadingQuiz || progressMessage ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress />
                    <Box sx={{ p: 2 }}>
                        <Typography>Moment, het genereren is bezig...</Typography>
                        <Typography>Status: {progressMessage}</Typography>
                    </Box>
                </Box>
            ) : (
                <>
                    <h1>Uw quiz:</h1>
                    <h2>Onderwerp: {quiz.title}</h2>
                    <List dense component="ol" sx={{ listStyle: 'decimal', pl: '2em' }}>
                        {quiz.questions.map((question, i) => (
                            <ListItem key={`question-${i}`} sx={{ display: 'list-item' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    {question.question_text}
                                    <IconButton onClick={() => startQuestionRegenerate(question.id)}>
                                        <Refresh />
                                    </IconButton>
                                </div>
                                <Answers to={question} />
                            </ListItem>
                        ))}
                    </List>
                </>
            ),
        }}</AppShell>
    );
}
