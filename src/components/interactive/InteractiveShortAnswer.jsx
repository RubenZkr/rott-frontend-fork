import { ListItem, TextField } from "@mui/material";

export default function InteractiveShortAnswer({ answer, onAnswerChange }) {
    const handleChange = (event) => {
        onAnswerChange(event.target.value);
    };

    return (
        <ListItem disablePadding={true} sx={{ paddingLeft: '0.8em', paddingTop: '1em' }}>
            <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                label="Uw antwoord"
                value={answer || ''}
                onChange={handleChange}
            />
        </ListItem>
    );
}
