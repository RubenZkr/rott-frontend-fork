import { ListItem } from "@mui/material";

export default function TrueFalseAnswer({option}) {
    return option[1] === '100' ? (
        <ListItem disablePadding={true} sx={{display: 'list-item', paddingLeft: '0.8em'}}>
            <b>{`${option[0] === 'TRUE' ? "Waar" : "Onwaar"}`}</b>
        </ListItem>
    ) : null
}