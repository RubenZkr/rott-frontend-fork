import { ListItem } from "@mui/material";

export default function ShortAnswerAnswer({option}) {
    return (
        <ListItem disablePadding={true} sx={{display: 'list-item', paddingLeft: '0.8em'}}>
            {option[1]}
        </ListItem>
    )
}