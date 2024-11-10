import React, { useState } from 'react';
import AppBarButton from '@/components/AppBar/AppBarButton';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Box, Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import { Add, AutoAwesome, Delete, Refresh } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

export default function GenerateQuiz() {
    const [subject, setSubject] = useState('');
    const [teachingMaterials, setTeachingMaterials] = useState([]);
    const [questionCount, setQuestionCount] = useState(5);
    const theme = useTheme();
    const [waitingForGenerationStart, setWaitingForGenerationStart] = useState(false)

    function resetState() {
        setSubject('');
        setTeachingMaterials([]);
        setQuestionCount(5);
    }

    function deleteTeachingMaterial(teachingMaterial) {
        setTeachingMaterials(teachingMaterials.filter((listTeachingMaterial) => listTeachingMaterial !== teachingMaterial));
    }

    function startQuizGeneration() {
        setWaitingForGenerationStart(true);
    }

    return (
        <AppShell>{{
            appBarButtons: [
                !waitingForGenerationStart && <AppBarButton onClick={resetState}><Refresh />&nbsp;Begin opnieuw</AppBarButton>,
            ],
            body: waitingForGenerationStart ? <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress />
                <Box sx={{ p: 2 }}>
                    <Typography>Moment, het genereren wordt gestart...</Typography>
                </Box>
            </Box> : 
            <>
                <h2>Nieuwe quiz</h2>
                <p>Genereer in stappen een quiz.</p>
                
                <h3>Stap 1. Een of meerdere onderwerpen (kommagescheiden):</h3>
                <TextField id="outlined-basic" label="Onderwerpen" helperText="Bijvoorbeeld: SQL, Data warehouse" variant="outlined"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)} />

                <br /><br />

                <h3>Stap 2. Voeg lesmateriaal toe:</h3>
                <p>Hier voegt u bestanden toe als bronmateriaal voor de vragen.</p>
                <p>Minimaal 1 document is vereist. U kunt Word-, PowerPoint- en PDF-bestanden toevoegen (.docx, .pptx en .pdf).</p>
                <ul>
                    {teachingMaterials.map((object, i) =>
                    <li>
                        <IconButton onClick={() => deleteTeachingMaterial(object)}><Delete htmlColor={theme.palette.error.main} /></IconButton>
                        &nbsp;{object.name}
                    </li>)}
                </ul>
                <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<Add />}>
                    Voeg {teachingMaterials.length > 0 ? 'meer ' : ''}bestanden toe
                    <VisuallyHiddenInput
                        type="file"
                        onChange={(event) => {setTeachingMaterials([
                            ...teachingMaterials,
                            ...event.target.files,
                        ])}}
                        multiple
                    />
                </Button>

                <br /><br />

                <h3>Stap 3. Aantal vragen:</h3>
                <p>Hier voert u een totaal aantal vragen in. De mix van vraagsoorten wordt op dit moment automatisch bepaald.</p>
                <TextField
                    id="outlined-number"
                    label="Aantal vragen"
                    type="number"
                    value={questionCount.toString()}
                    onChange={(e) => setQuestionCount(e.target.value)}
                />

                <br /><br />

                <h3>Stap 4. Genereer quiz:</h3>
                <p>Let op dat het genereren enige tijd kan duren. Na het genereren kunt u de quiz bewerken en/of exporteren voor Brightspace.</p>
                <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<AutoAwesome />} onClick={startQuizGeneration}>
                    Genereer quiz
                </Button>
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
