import React, { useState } from 'react';
import AppBarButton from '@/components/AppBar/AppBarButton';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Box, Button, CircularProgress, IconButton, TextField, Typography, Stack } from '@mui/material';
import { Add, AutoAwesome, Delete, Refresh } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { generateQuiz, getQuizProgress } from '@/api/QuizApi';
import { useNavigate } from "react-router-dom";

export default function GenerateQuiz() {
    const [subject, setSubject] = useState('');
    const [teachingMaterials, setTeachingMaterials] = useState([]);
    const [multiple_choice_count, setMultipleChoiceCount] = useState(5);
    const [true_false_count, setTrueFalseCount] = useState(5);
    const [short_answer_count, setShortAnswerCount] = useState(5);
    const theme = useTheme();
    const [waitingForGenerationStart, setWaitingForGenerationStart] = useState(false)
    const [progressMessage, setProgressMessage] = useState("")
    const navigate = useNavigate();

    function resetState() {
        setSubject('');
        setTeachingMaterials([]);
        setMultipleChoiceCount(5);
        setTrueFalseCount(5);
        setShortAnswerCount(5);
    }

    function deleteTeachingMaterial(teachingMaterial) {
        setTeachingMaterials(teachingMaterials.filter((listTeachingMaterial) => listTeachingMaterial !== teachingMaterial));
    }

    async function startQuizGeneration(ev) {
        ev.preventDefault();
        setProgressMessage("Starten...");
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('multiple_choice_count', multiple_choice_count);
        formData.append('true_false_count', true_false_count);
        formData.append('short_answer_count', short_answer_count);
        for (let key in teachingMaterials) {
            formData.append(`files`, teachingMaterials[key]);
        }

        setWaitingForGenerationStart(true);
        const generateResponse = await generateQuiz(formData);
        const quizUuid = generateResponse.quiz_uuid;
        // TODO: add error handling

        for (;;) {
            await new Promise(r => setTimeout(r, 2000));
            const progressResponse = await getQuizProgress(quizUuid);
            setProgressMessage(progressResponse.progress);
            
            if (progressResponse.progress === null || progressResponse.progress === "Quiz generatie voltooid") {
                break;
            }
        }

        // Generation is done, forward user to result page.
        navigate(`/quiz/${quizUuid}`);
    }

    return (
        <AppShell>{{
            appBarButtons: 
                !waitingForGenerationStart && <AppBarButton onClick={resetState}><Refresh />&nbsp;Begin opnieuw</AppBarButton>,
            body: waitingForGenerationStart ? <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress />
                <Box sx={{ p: 2 }}>
                    <Typography>Moment, het genereren is bezig...</Typography>
                    <Typography>Status: {progressMessage}</Typography>
                </Box>
            </Box> : 
            <>
                <h2>Nieuwe quiz</h2>
                <p>Genereer in stappen een quiz.</p>
                
                <form onSubmit={startQuizGeneration}>
                    <h3>Stap 1. Een of meerdere onderwerpen (kommagescheiden):</h3>
                    <p>Vul hier het onderwerp in van uw quiz.</p>
                    <TextField
                        id="outlined-basic"
                        label="Onderwerpen"
                        helperText="Bijvoorbeeld: SQL, Data warehouse"
                        variant="outlined"
                        required
                        sx={{ width: '270px' }}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)} 
                        slotProps={{ htmlInput: {minLength: 3, maxLength: 30 }}}
                    />

                    <br /><br />

                    <h3>Stap 2. Voeg lesmateriaal toe:</h3>
                    <p>Hier voegt u bestanden toe als bronmateriaal voor de vragen.</p>
                    <p>Minimaal 1 document is vereist. U kunt Word-, PowerPoint- en PDF-bestanden toevoegen (.docx, .pptx en .pdf).</p>
                    <ul>
                        {teachingMaterials.map((object, i) =>
                        <li key={`material-${i}`}>
                            <IconButton onClick={() => deleteTeachingMaterial(object)}><Delete htmlColor={theme.palette.error.main} /></IconButton>
                            &nbsp;{object.name}
                        </li>)}
                    </ul>
                    <Button component="label" variant="contained" tabIndex={-1} startIcon={<Add />}>
                        Voeg {teachingMaterials.length > 0 ? 'meer ' : ''}bestanden toe
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => {setTeachingMaterials([
                                ...teachingMaterials,
                                ...event.target.files,
                            ])}}
                            multiple
                            required
                        />
                    </Button>

                    <br /><br />

                    <h3>Stap 3. Aantal vragen:</h3>
                    <p>Voer per soort vraag het aantal vragen in dat u wilt genereren.</p>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            required
                            id="outlined-number"
                            label="Meerkeuze vragen"
                            type="number"
                            sx={{ width: '270px' }}
                            value={multiple_choice_count.toString()}
                            slotProps={{ min: 5, max: 30 }}
                            onChange={(e) => setMultipleChoiceCount(e.target.value)}
                        />
                        <TextField
                            required
                            id="outlined-number"
                            label="Waar/onwaar vragen"
                            type="number"
                            sx={{ width: '270px' }}
                            value={true_false_count.toString()}
                            slotProps={{ min: 5, max: 30 }}
                            onChange={(e) => setTrueFalseCount(e.target.value)}
                        />
                        <TextField
                            required
                            id="outlined-number"
                            label="Open vragen"
                            type="number"
                            sx={{ width: '270px' }}
                            value={short_answer_count.toString()}
                            slotProps={{ min: 5, max: 30 }}
                            onChange={(e) => setShortAnswerCount(e.target.value)}
                        />
                    </Stack>
                    <br /><br />

                    <h3>Stap 4. Genereer quiz:</h3>
                    <p>Let op dat het genereren enige tijd kan duren. Na het genereren kunt u de quiz bewerken en/of exporteren voor Brightspace.</p>
                    <Button type="submit" variant="contained" startIcon={<AutoAwesome />}>
                        Genereer quiz
                    </Button>
                </form>
            </>
        }}</AppShell>
    )
};

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});
