import React, { useState } from 'react';
import AppBarButton from '@/components/AppBar/AppBarButton';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Button, IconButton, TextField, Stack } from '@mui/material';
import { Add, AutoAwesome, Delete, Refresh } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { generateQuiz } from '@/api/QuizApi';
import { useNavigate } from "react-router-dom";

export default function GenerateQuiz() {
    const [subject, setSubject] = useState('');
    const [teachingMaterials, setTeachingMaterials] = useState([]);
    const [multiple_choice_count, setMultipleChoiceCount] = useState(5);
    const theme = useTheme();
    const navigate = useNavigate();

    function resetState() {
        setSubject('');
        setTeachingMaterials([]);
        setMultipleChoiceCount(5);
    }

    function deleteTeachingMaterial(teachingMaterial) {
        setTeachingMaterials(teachingMaterials.filter((listTeachingMaterial) => listTeachingMaterial !== teachingMaterial));
    }

    async function startQuizGeneration(ev) {
        ev.preventDefault();
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('multiple_choice_count', multiple_choice_count);
        for (let key in teachingMaterials) {
            formData.append(`files`, teachingMaterials[key]);
        }

        const generateResponse = await generateQuiz(formData);
        const quizUuid = generateResponse.quiz_uuid;
        // Redirect user to result page after generation
        navigate(`/quiz/${quizUuid}`);
    }

    return (
        <AppShell>{{
            appBarButtons: 
                <AppBarButton onClick={resetState}><Refresh />&nbsp;Begin opnieuw</AppBarButton>,
            body: 
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
                    <p>Voer het aantal meerkeuze vragen in dat u wilt genereren.</p>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            required
                            id="outlined-number"
                            label="Meerkeuze vragen"
                            type="number"
                            sx={{ width: '270px' }}
                            value={multiple_choice_count.toString()}
                            slotProps={{
                                htmlInput: { min: 1, max: 30 }
                            }}
                            onChange={(e) => setMultipleChoiceCount(e.target.value)}
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
