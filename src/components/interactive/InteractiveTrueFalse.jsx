import { FormControlLabel, ListItem, Radio, RadioGroup } from "@mui/material";

export default function InteractiveTrueFalse({ selectedAnswer, onAnswerChange }) {
    const handleChange = (event) => {
        onAnswerChange(event.target.value);
    };

    return (
        <ListItem disablePadding={true} sx={{ paddingLeft: '0.8em' }}>
            <RadioGroup value={selectedAnswer || ''} onChange={handleChange}>
                <FormControlLabel value="TRUE" control={<Radio />} label="Waar" />
                <FormControlLabel value="FALSE" control={<Radio />} label="Onwaar" />
            </RadioGroup>
        </ListItem>
    );
}
