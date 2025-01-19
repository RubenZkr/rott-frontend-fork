import Button from '@mui/material/Button';

export default function AppBarButton({ onClick, children }) {
    return (
        <Button color="inherit" sx={{ textTransform: "inherit" }} onClick={onClick}>{children}</Button>
    );
};
