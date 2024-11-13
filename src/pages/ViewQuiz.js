import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Box, CircularProgress, Typography } from '@mui/material';
import { getQuiz } from '@/api/QuizApi';
import { useParams } from 'react-router-dom';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';

export default function ViewQuiz() {
    //const theme = useTheme();
    const [downloadingQuiz, setDownloadingQuiz] = useState(true)
    const [quiz, setQuiz] = useState(null)
    let { quizUuid } = useParams();

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

    return (
        <AppShell>{{
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
