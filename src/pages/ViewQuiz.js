import React, { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Box, CircularProgress, IconButton, List, ListItem, Typography } from '@mui/material';
import { getQuiz, regenerateQuestion, exportQuiz, getQuizProgress } from '@/api/QuizApi';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Download, Refresh } from '@mui/icons-material';
import AppBarButton from '@/components/AppBar/AppBarButton';
import Answers from '@/components/answers/Answers';

export default function ViewQuiz() {
    const [downloadingQuiz, setDownloadingQuiz] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [waitingForGenerationStart, setWaitingForGenerationStart] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");
    let { quizUuid } = useParams();
    const navigate = useNavigate();

    // Function to fetch the quiz data
    const fetchQuiz = useCallback(async () => {
        const response = await getQuiz(quizUuid);
        setQuiz(response.quiz);
        setProgressMessage("");
        setDownloadingQuiz(false);
    }, [quizUuid]);

    // Function to check quiz progress
    const pollQuizProgress = useCallback(async () => {
        setProgressMessage("Moment, het genereren is bezig...");
        while (true) {
            const progressResponse = await getQuizProgress(quizUuid);

            if (progressResponse.progress === null || progressResponse.progress === "Quiz generatie voltooid" || progressResponse.progress === "Regeneratie voltooid") {
                await fetchQuiz();
                break;
            }

            setProgressMessage(progressResponse.progress || "Starten...");
            await new Promise(r => setTimeout(r, 2000));
        }
    }, [quizUuid, fetchQuiz]);

    // useEffect for initial loading
    useEffect(() => {
        pollQuizProgress();
    }, [pollQuizProgress]);

    async function startQuestionRegenerate(questionId) {
        setWaitingForGenerationStart(true);
        setProgressMessage("Starten...");

        regenerateQuestion(quiz.id, questionId);
        await pollQuizProgress();

        setWaitingForGenerationStart(false);
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
