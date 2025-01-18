import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import { Box } from '@mui/material';
import AppBarButton from './AppBar/AppBarButton';
import { HelpCenter } from '@mui/icons-material';

export default function AppShell({ children: {appBarButtons, body} }) {
    return (
        <>
            <Divider aria-hidden="true" sx={{height: "3px", backgroundColor: "primary.main"}}></Divider>
            <Container sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{ display: 'flex', alignItems: 'center'}}>
                    <h1>H-AI</h1>
                    <img alt="Logo van De Haagse Hogeschool" src='/hhs-logo-groen.png' style={{ height: '64px', margin: '0 24px' }}></img>
                </div>
                <p>Welkom bij H-AI, de applicatie die assisteert met het maken van korte quizzes</p>
            </Container>
            <AppBar position="static">
                <Container>
                    <Toolbar disableGutters={true}>
                        { appBarButtons }
                        <div style={{ marginLeft: 'auto' }}>
                            <AppBarButton onClick={() => window.open("/H-AI-Gebruikershandleiding.pdf", '_blank').focus()}>
                                <HelpCenter />&nbsp;Handleiding
                            </AppBarButton>
                        </div>
                    </Toolbar>
                </Container>
            </AppBar>
            <Box sx={{ p: 4 }}>
                <Container>
                    { body }
                </Container>
            </Box>
        </>
    );
};
