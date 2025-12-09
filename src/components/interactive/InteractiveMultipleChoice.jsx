import { Checkbox, FormControlLabel, FormGroup, ListItem } from "@mui/material";

export default function InteractiveMultipleChoice({ option, index, selectedAnswers, onAnswerChange }) {
    const isSelected = selectedAnswers.includes(index);

    const handleChange = (event) => {
        if (event.target.checked) {
            onAnswerChange([...selectedAnswers, index]);
        } else {
            onAnswerChange(selectedAnswers.filter(i => i !== index));
        }
    };

    return (
        <ListItem disablePadding={true} sx={{ display: 'list-item', paddingLeft: '0.8em' }}>
            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isSelected}
                            onChange={handleChange}
                        />
                    }
                    label={option[1]}
                />
            </FormGroup>
        </ListItem>
    );
}
