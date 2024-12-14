import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { ListItem, ListItemIcon } from "@mui/material";

export default function MultipleChoiceOption({option}) {
    return (
        <ListItem disablePadding={true} sx={{display: 'list-item', paddingLeft: '0.8em'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                {/* keep invisible character for proper alignment of markers */}
                 
                <ListItemIcon>
                    { option[0] === '100' ? 
                        <CheckBox             sx={{width: '50%'}}/> : 
                        <CheckBoxOutlineBlank sx={{width: '50%'}}/> }
                </ListItemIcon>
                {option[1]}
            </div>
        </ListItem>
    )
}