import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { getQuiz, regenerateQuestion, exportQuiz } from '@/api/QuizApi';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, CheckBox, CheckBoxOutlineBlank, Download, Save } from '@mui/icons-material';
import AppBarButton from '@/components/AppBar/AppBarButton';

export default function ViewQuiz() {
    //const theme = useTheme();
    const [downloadingQuiz, setDownloadingQuiz] = useState(true)
    const [quiz, setQuiz] = useState(null)
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
    }, [quizUuid]);

    function startQuestionRegenerate(questionId) {
        regenerateQuestion(quiz.id, questionId);
    }

    function getAnswers(question) {
        if (question.type === 'MC') {
            return <ol>
                {
                    question.options.map((option) => {
                        return <li>
                            {option[0] === '100' ? <CheckBox/> : <CheckBoxOutlineBlank/>}
                            {option[1]}
                        </li>
                    })
                }
            </ol>
        } else if (question.type === 'TF') {
            return <ol>
                {
                    question.options.find((option) => option[1] === "100")[0] === 'TRUE' ? <b>Waar</b> : <b>Onwaar</b>
                }
            </ol>
        } else if (question.type === 'SA') {
            return <><b>Mogelijk(e) antwoord(en):</b><ol>
                {
                    question.options.map((option) => {
                        return <li>
                            {option[1]}
                        </li>
                    })
                }
            </ol></>
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
            appBarButtons: [
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
            </Box> : 
            <>
                <h1>Uw quiz:</h1>
                <h2>Onderwerp: {quiz.title}</h2>
                    <ol>
                        {quiz.questions.map((question, i) =>
                            <li>
                                {/* <Button onClick={() => startQuestionRegenerate(question.id)}>Regenerate</Button> */}
                                {question.question_text}
                                <ul>
                                    {getAnswers(question)}
                                </ul>
                            </li>)}
                    </ol>
                
            </>
        }}</AppShell>
    )
};
