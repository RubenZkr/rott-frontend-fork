import { ListItem } from "@mui/material";

export default function TrueFalseAnswer({answer}) {
    
    return (
        <ListItem disablePadding={true} sx={{display: 'list-item', paddingLeft: '0.8em'}}>
            <b>{`${answer === 'TRUE' ? "Waar" : "Onwaar"}`}</b>
        </ListItem>
    )
}