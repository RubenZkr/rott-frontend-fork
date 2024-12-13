import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Box, CircularProgress, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { getQuiz, regenerateQuestion, exportQuiz, getQuizProgress } from '@/api/QuizApi';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, CheckBox, CheckBoxOutlineBlank, Download, Refresh, VerticalAlignBottom } from '@mui/icons-material';
import AppBarButton from '@/components/AppBar/AppBarButton';

export default function ViewQuiz() {
    //const theme = useTheme();
    const [downloadingQuiz, setDownloadingQuiz] = useState(true)
    const [quiz, setQuiz] = useState(null)
    const [waitingForGenerationStart, setWaitingForGenerationStart] = useState(false)
    const [progressMessage, setProgressMessage] = useState("")
    let { quizUuid } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        console.log(quizUuid);
        const fetchData = async () => {
            const response = await getQuiz(quizUuid)
            setQuiz(response.quiz);
            setDownloadingQuiz(false);
            console.log(response);
        }

        fetchData().catch(console.error); // TODO: better error handling
    }, [quizUuid, waitingForGenerationStart]);

    async function startQuestionRegenerate(questionId) {
        setWaitingForGenerationStart(true);
        setProgressMessage("Starten...");

        regenerateQuestion(quiz.id, questionId);

        for (; ;) {
            await new Promise(r => setTimeout(r, 2000));
            const progressResponse = await getQuizProgress(quizUuid);
            setProgressMessage(progressResponse.progress);

            if (progressResponse.progress === null || progressResponse.progress === "Regeneratie voltooid") {
                break;
            }
        }

        setWaitingForGenerationStart(false);
    }

    function getAnswers(question) {
        if (question.type === 'MC') {
            return <List dense component='ol' sx={{listStyle: 'upper-alpha', pl: '2em'}}> 
                {question.options.map((option, i) => (
                    <ListItem key={`mc=${i}`} disablePadding={true} sx={{display: 'list-item'}}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                             
                            <ListItemIcon sx={{paddingLeft: '0.8em'}}>
                                { option[0] === '100' ? 
                                    <CheckBox             sx={{width: '50%'}}/> : 
                                    <CheckBoxOutlineBlank sx={{width: '50%'}}/> }
                            </ListItemIcon>
                            {option[1]}
                        </div>
                    </ListItem>
                ))}
            </List>
        } else if (question.type === 'TF') {
            return <List dense component='ol' sx={{listStyle: 'upper-alpha', pl: '2em'}}> 
                <ListItem disablePadding={true} sx={{display: 'list-item', paddingLeft: '0.8em'}}>
                    {question.options.find((option) => option[1] === "100")[0] === 'TRUE' ? <b>Waar</b> : <b>Onwaar</b>}
                </ListItem>
            </List>
        } else if (question.type === 'SA') {
            return <>
                <b>Mogelijk(e) antwoord(en):</b>
                <List dense component='ol' sx={{listStyle: 'upper-alpha', pl: '2em'}}> 
                    {question.options.map((option, i) => {
                            return <ListItem key={`sa-${i}`} disablePadding={true} sx={{display: 'list-item', paddingLeft: '0.8em'}}>
                                {option[1]}
                            </ListItem>
                        })
                    }
                </List>
            </>
        }
    }

    async function downloadBrightspaceCsv() {
        let brightspaceCsvBlob = await exportQuiz(quizUuid);
        var fileURL = URL.createObjectURL(brightspaceCsvBlob);
        var fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.download = `Quiz-${new Date().toISOString()}.csv`;
        fileLink.click();
    }

    return (
        <AppShell>{{
            appBarButtons: waitingForGenerationStart ? [] : [
                <AppBarButton onClick={() => { navigate('/') }}><ArrowBack />&nbsp;Begin opnieuw</AppBarButton>,
                <div style={{marginLeft: 'auto'}}>
                    <AppBarButton onClick={() => { downloadBrightspaceCsv() }}><Download />&nbsp;Download .csv voor Brightspace</AppBarButton>
                </div>
            ],
            body: downloadingQuiz || !quiz ? <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress />
                <Box sx={{ p: 2 }}>
                    <Typography>Moment, de quiz wordt ingeladen...</Typography>
                </Box>
            </Box> : waitingForGenerationStart ? <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress />
                <Box sx={{ p: 2 }}>
                    <Typography>Moment, het hergenereren van de vraag is bezig...</Typography>
                    <Typography>Status: {progressMessage}</Typography>
                </Box>
            </Box> : 
            <>
                <h1>Uw quiz:</h1>
                <h2>Onderwerp: {quiz.title}</h2>
                    <List dense component='ol' sx={{listStyle: 'decimal', pl: '2em'}}> 
                        {quiz.questions.map((question, i) =>
                            <ListItem key={`question-${i}`} sx={{display: 'list-item'}}>
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                    {question.question_text}
                                    <IconButton onClick={() => startQuestionRegenerate(question.id)}><Refresh /></IconButton>
                                </div>
                                {getAnswers(question)}
                            </ListItem>)}
                    </List>
            </>
        }}</AppShell>
    )
};
