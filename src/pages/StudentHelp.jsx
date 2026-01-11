import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    ExpandMore as ExpandMoreIcon,
    Login as LoginIcon,
    Dashboard as DashboardIcon,
    Quiz as QuizIcon,
    PlayArrow as PlayArrowIcon,
    Assessment as AssessmentIcon,
    Lightbulb as LightbulbIcon,
    Help as HelpIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

const StudentHelp = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const sections = [
        {
            id: 'login',
            title: '1. Inloggen',
            icon: <LoginIcon />,
            content: (
                <Box>
                    <Typography paragraph>
                        1. Ga naar de applicatie in je browser<br />
                        2. Voer je <strong>gebruikersnaam</strong> en <strong>wachtwoord</strong> in<br />
                        3. Klik op <strong>Inloggen</strong>
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Tip:</strong> Heb je nog geen account? Vraag je docent om inloggegevens.
                    </Alert>
                </Box>
            )
        },
        {
            id: 'dashboard',
            title: '2. Dashboard Overzicht',
            icon: <DashboardIcon />,
            content: (
                <Box>
                    <Typography paragraph>Na het inloggen zie je jouw persoonlijke dashboard met:</Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Statistieken</Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                            <ListItemText primary="Gemaakte toetsen" secondary="Aantal toetsen die je hebt afgerond" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><AssessmentIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Gemiddeld cijfer" secondary="Jouw gemiddelde over alle toetsen" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><AssessmentIcon color="secondary" /></ListItemIcon>
                            <ListItemText primary="Gemiddelde score" secondary="Percentage goede antwoorden" />
                        </ListItem>
                    </List>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>Beschikbare Toetsen</Typography>
                    <Typography paragraph>Een lijst met toetsen die je nog kunt maken.</Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recente Resultaten</Typography>
                    <Typography paragraph>Je laatste toetsresultaten met scores en cijfers.</Typography>
                </Box>
            )
        },
        {
            id: 'available',
            title: '3. Beschikbare Toetsen',
            icon: <QuizIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Toetsen vinden</Typography>
                    <Typography paragraph>
                        1. Op je dashboard zie je een lijst met <strong>"Beschikbare Toetsen"</strong><br />
                        2. Elke toets toont: Naam, Vak, Aantal vragen
                    </Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Toets starten</Typography>
                    <Typography paragraph>Klik op <strong>"Start Toets"</strong> om te beginnen.</Typography>

                    <Alert severity="warning">
                        <strong>Let op:</strong> Sommige toetsen hebben een tijdslimiet. Check dit voordat je begint!
                    </Alert>
                </Box>
            )
        },
        {
            id: 'taking',
            title: '4. Toets Maken',
            icon: <PlayArrowIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stap 1: Start de toets</Typography>
                    <Typography paragraph>
                        1. Klik op <strong>"Start Toets"</strong> bij de gewenste toets<br />
                        2. Je ziet de eerste vraag
                    </Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stap 2: Beantwoord vragen</Typography>
                    <Typography paragraph>
                        Voor <strong>meerkeuzevragen</strong>:<br />
                        • Lees de vraag goed<br />
                        • Klik op het antwoord dat je denkt dat correct is<br />
                        • Het geselecteerde antwoord wordt gemarkeerd
                    </Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stap 3: Navigeren</Typography>
                    <List dense>
                        <ListItem><ListItemText primary='Klik op "Volgende" om naar de volgende vraag te gaan' /></ListItem>
                        <ListItem><ListItemText primary='Klik op "Vorige" om terug te gaan' /></ListItem>
                        <ListItem><ListItemText primary="Je ziet een voortgangsbalk bovenaan" /></ListItem>
                    </List>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stap 4: Indienen</Typography>
                    <Typography paragraph>
                        1. Na de laatste vraag klik je op <strong>"Toets Indienen"</strong><br />
                        2. Bevestig dat je klaar bent<br />
                        3. Je wordt doorgestuurd naar je resultaten
                    </Typography>

                    <Alert severity="error">
                        <strong>Belangrijk:</strong> Controleer al je antwoorden voordat je indient! Na indienen kun je niets meer wijzigen.
                    </Alert>
                </Box>
            )
        },
        {
            id: 'results',
            title: '5. Resultaten Bekijken',
            icon: <AssessmentIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Direct na indienen</Typography>
                    <Typography paragraph>
                        Na het indienen zie je meteen:<br />
                        • <strong>Score</strong> - Percentage goede antwoorden<br />
                        • <strong>Cijfer</strong> - Jouw cijfer (1-10)<br />
                        • <strong>Per vraag</strong> - Of je antwoord goed of fout was
                    </Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Eerdere resultaten</Typography>
                    <Typography paragraph>
                        1. Ga naar je dashboard<br />
                        2. Bekijk <strong>"Recente Resultaten"</strong><br />
                        3. Klik op een toets voor details
                    </Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Wat betekenen de kleuren?</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Kleur</TableCell>
                                    <TableCell>Betekenis</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell><Chip label="Groen" size="small" sx={{ bgcolor: '#22C55E', color: 'white' }} /></TableCell>
                                    <TableCell>Goed antwoord</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Chip label="Rood" size="small" sx={{ bgcolor: '#EF4444', color: 'white' }} /></TableCell>
                                    <TableCell>Fout antwoord</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Chip label="Oranje" size="small" sx={{ bgcolor: '#F59E0B', color: 'white' }} /></TableCell>
                                    <TableCell>Voldoende (cijfer 5.5-6.5)</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Chip label="Blauw" size="small" sx={{ bgcolor: '#3B82F6', color: 'white' }} /></TableCell>
                                    <TableCell>Goed (cijfer 7+)</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )
        },
        {
            id: 'tips',
            title: '6. Tips voor Succes',
            icon: <LightbulbIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Voorbereiding</Typography>
                    <List dense>
                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Lees de lesstof door voordat je de toets maakt" /></ListItem>
                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Zorg voor een rustige omgeving" /></ListItem>
                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Controleer je internetverbinding" /></ListItem>
                    </List>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>Tijdens de toets</Typography>
                    <List dense>
                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Lees elke vraag zorgvuldig door" /></ListItem>
                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary='Let op woorden als "niet", "altijd", "nooit"' /></ListItem>
                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Bij twijfel: elimineer eerst de duidelijk foute antwoorden" /></ListItem>
                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Ga niet te snel - je hebt meestal genoeg tijd" /></ListItem>
                    </List>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>Na de toets</Typography>
                    <List dense>
                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Bekijk welke vragen je fout had" /></ListItem>
                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Probeer te begrijpen waarom het goede antwoord correct is" /></ListItem>
                        <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Maak notities voor de volgende keer" /></ListItem>
                    </List>
                </Box>
            )
        },
        {
            id: 'faq',
            title: 'Veelgestelde Vragen',
            icon: <HelpIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Kan ik een toets opnieuw maken?</Typography>
                    <Typography paragraph>
                        Dat hangt af van de instellingen van je docent. Sommige toetsen kun je meerdere keren maken.
                    </Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Wat als mijn browser crasht tijdens de toets?</Typography>
                    <Typography paragraph>
                        Log opnieuw in en ga naar de toets. Je voortgang is mogelijk opgeslagen.
                    </Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Zie ik de goede antwoorden na afloop?</Typography>
                    <Typography paragraph>
                        Ja, na het indienen zie je welke antwoorden goed en fout waren, samen met het correcte antwoord.
                    </Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Hoe wordt mijn cijfer berekend?</Typography>
                    <Typography paragraph>
                        Het cijfer wordt berekend op basis van het percentage goede antwoorden:
                    </Typography>
                    <List dense>
                        <ListItem><ListItemText primary="100% = 10" /></ListItem>
                        <ListItem><ListItemText primary="90% = 9" /></ListItem>
                        <ListItem><ListItemText primary="55% = 5.5 (net voldoende)" /></ListItem>
                    </List>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>Kan ik terug naar een vorige vraag?</Typography>
                    <Typography paragraph>
                        Ja, je kunt vrij navigeren tussen vragen zolang je de toets niet hebt ingediend.
                    </Typography>
                </Box>
            )
        },
        {
            id: 'problems',
            title: 'Problemen Oplossen',
            icon: <WarningIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Toets laadt niet</Typography>
                    <List dense>
                        <ListItem><ListItemText primary="1. Ververs de pagina (F5)" /></ListItem>
                        <ListItem><ListItemText primary="2. Controleer je internetverbinding" /></ListItem>
                        <ListItem><ListItemText primary="3. Probeer een andere browser" /></ListItem>
                    </List>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>Kan niet inloggen</Typography>
                    <List dense>
                        <ListItem><ListItemText primary="1. Controleer je gebruikersnaam en wachtwoord" /></ListItem>
                        <ListItem><ListItemText primary="2. Let op hoofdletters" /></ListItem>
                        <ListItem><ListItemText primary="3. Vraag je docent om hulp" /></ListItem>
                    </List>

                    <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Andere problemen?</strong> Neem contact op met je docent of de technische beheerder.
                    </Alert>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F0F9FF', py: 4 }}>
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E0F2FE', py: 2, px: 4, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student/dashboard')}>
                    Terug naar Dashboard
                </Button>
                <Button variant="outlined" size="small" onClick={logout}>
                    Uitloggen
                </Button>
            </Box>

            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                        📖 Handleiding voor Studenten
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Alles wat je moet weten over het maken van toetsen
                    </Typography>
                </Box>

                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    {sections.map((section, index) => (
                        <Accordion key={section.id} defaultExpanded={index === 0}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {section.icon}
                                    <Typography fontWeight={600}>{section.title}</Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {section.content}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Paper>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        🎓 Veel succes met je toetsen!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Problemen of vragen? Neem contact op met je docent.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default StudentHelp;
