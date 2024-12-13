import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { ListItem, ListItemIcon } from "@mui/material";

export default function MultipleChoiceAnswers({option}) {
    return (
        <ListItem disablePadding={true} sx={{display: 'list-item'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                 
                <ListItemIcon sx={{paddingLeft: '0.8em'}}>
                    { option[0] === '100' ? 
                        <CheckBox             sx={{width: '50%'}}/> : 
                        <CheckBoxOutlineBlank sx={{width: '50%'}}/> }
                </ListItemIcon>
                {option[1]}
            </div>
        </ListItem>
    )
}