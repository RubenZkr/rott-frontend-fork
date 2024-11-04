import { Form } from 'react-router-dom';
import React, { useState } from 'react';
import AppBarButton from '@/components/AppBar/AppBarButton';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";
import { Button, TextField } from '@mui/material';
import { Upload } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

export default function GenerateQuiz() {
    const [count, setCount] = useState(0);

    return (  
        <AppShell>{{
            appBarButtons: [
                <AppBarButton onClick={() => alert("test!")}>Begin opnieuw</AppBarButton>,
            ],
            body: <>
                <h2>Nieuwe quiz</h2>
                <Form>
                    <h3>Stap 1. Een of meerdere onderwerpen (kommagescheiden):</h3>
                    <TextField id="outlined-basic" label="Onderwerpen" helperText="Bijvoorbeeld: SQL, Data warehouse" variant="outlined" />
                    <h3>Stap 2. Lesmateriaal:</h3>
                    <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<Upload />}>
                        Upload files
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => console.log(event.target.files)}
                            multiple
                        />
                    </Button>
                </Form>
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
