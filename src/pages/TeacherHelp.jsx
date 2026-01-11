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
    Divider,
    Chip,
    Alert
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    ExpandMore as ExpandMoreIcon,
    Login as LoginIcon,
    Dashboard as DashboardIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Publish as PublishIcon,
    Assessment as AssessmentIcon,
    School as SchoolIcon,
    People as PeopleIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Help as HelpIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

const TeacherHelp = () => {
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
                        <strong>Tip:</strong> Als docent word je automatisch doorgestuurd naar het docenten dashboard.
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
                    <Typography paragraph>Na het inloggen zie je het docenten dashboard met de volgende tabs:</Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon><AssessmentIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Statistieken" secondary="Overzicht van alle studenten prestaties" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><PeopleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Leerlingen" secondary="Tabel met individuele leerling voortgang" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><EditIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Toetsen" secondary="Beheer en bekijk al je toetsen" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Vakken" secondary="Beheer vakken/onderwerpen" />
                        </ListItem>
                    </List>
                </Box>
            )
        },
        {
            id: 'generate',
            title: '3. Toets Genereren',
            icon: <AddIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stap 1: Start nieuwe toets</Typography>
                    <Typography paragraph>Klik op de knop <strong>"Nieuwe Toets"</strong> (linksboven)</Typography>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stap 2: Vul basisgegevens in</Typography>
                    <List dense>
                        <ListItem><ListItemText primary="Toetsnaam: Geef een duidelijke naam (bijv. 'Hoofdstuk 3 - Netwerken')" /></ListItem>
                        <ListItem><ListItemText primary="Vak: Selecteer het vak waarvoor de toets is" /></ListItem>
                    </List>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stap 3: Upload bronmateriaal</Typography>
                    <Typography paragraph>Upload een of meerdere bestanden waaruit de vragen gegenereerd worden:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label="PDF" size="small" />
                        <Chip label="DOCX" size="small" />
                        <Chip label="TXT" size="small" />
                    </Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <strong>Let op:</strong> De AI genereert vragen op basis van de geüploade inhoud. Zorg voor relevante en complete bronnen.
                    </Alert>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stap 4: Configureer vraagaantallen</Typography>
                    <Typography paragraph>Geef aan hoeveel meerkeuzevragen je wilt (vragen met 4 antwoordopties, 1 correct).</Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <strong>Tip:</strong> Start met 5-10 vragen voor een korte toets.
                    </Alert>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stap 5: Genereer de toets</Typography>
                    <Typography paragraph>
                        1. Klik op <strong>"Genereer Toets"</strong><br />
                        2. Wacht tot de AI de vragen heeft gegenereerd<br />
                        3. Je ziet een voortgangsindicator tijdens het genereren
                    </Typography>
                </Box>
            )
        },
        {
            id: 'manage',
            title: '4. Toetsen Beheren',
            icon: <EditIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Toetsen bekijken</Typography>
                    <Typography paragraph>
                        1. Ga naar de <strong>Toetsen</strong> tab<br />
                        2. Je ziet een overzicht met: Toetsnaam, Vak, Aantal vragen, Status
                    </Typography>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Toets openen</Typography>
                    <Typography paragraph>Klik op <strong>"Bekijk"</strong> om de toets te openen en de vragen te zien.</Typography>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Toets verwijderen</Typography>
                    <Typography paragraph>
                        1. Klik op het 🗑️ prullenbak icoon bij de toets<br />
                        2. Bevestig de verwijdering
                    </Typography>
                    <Alert severity="error">
                        <strong>Waarschuwing:</strong> Verwijderen is permanent en verwijdert ook alle studentenpogingen!
                    </Alert>
                </Box>
            )
        },
        {
            id: 'regenerate',
            title: '5. Vragen Hergenereren',
            icon: <RefreshIcon />,
            content: (
                <Box>
                    <Typography paragraph>Als een vraag niet goed is, kun je deze opnieuw laten genereren:</Typography>
                    <Typography paragraph>
                        1. Open de toets via <strong>"Bekijk"</strong><br />
                        2. Klik bij de vraag op <strong>"Hergenereren"</strong><br />
                        3. Wacht tot de nieuwe vraag is gegenereerd<br />
                        4. De vraag wordt automatisch vervangen
                    </Typography>
                    <Alert severity="info">
                        <strong>Tip:</strong> Je kunt vragen alleen hergenereren als de toets nog niet gepubliceerd is.
                    </Alert>
                </Box>
            )
        },
        {
            id: 'publish',
            title: '6. Toets Publiceren',
            icon: <PublishIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Publiceren</Typography>
                    <Typography paragraph>
                        1. Ga naar <strong>Toetsen</strong> tab<br />
                        2. Klik op <strong>"Publiceer"</strong> bij een concept-toets<br />
                        3. Optioneel: Stel een beschikbaarheidsperiode in
                    </Typography>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Depubliceren</Typography>
                    <Typography paragraph>
                        1. Open een gepubliceerde toets<br />
                        2. Klik op <strong>"Depubliceer"</strong> om de toets weer als concept te markeren
                    </Typography>
                    <Alert severity="warning">
                        <strong>Let op:</strong> Studenten kunnen alleen gepubliceerde toetsen maken.
                    </Alert>
                </Box>
            )
        },
        {
            id: 'statistics',
            title: '7. Statistieken Bekijken',
            icon: <AssessmentIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Toetsstatistieken</Typography>
                    <Typography paragraph>
                        1. Ga naar <strong>Toetsen</strong> tab<br />
                        2. Klik op <strong>"Statistieken"</strong> bij een gepubliceerde toets<br />
                        3. Je ziet: Totaal pogingen, Gemiddelde score, Moeilijke vragen, Scores per student
                    </Typography>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Klasoverzicht</Typography>
                    <Typography paragraph>
                        Ga naar <strong>Statistieken</strong> tab voor het totaaloverzicht met klasgemiddelde, top presteerders en aantal voldoendes/onvoldoendes.
                    </Typography>
                </Box>
            )
        },
        {
            id: 'subjects',
            title: '8. Vakken Beheren',
            icon: <SchoolIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Nieuw vak toevoegen</Typography>
                    <Typography paragraph>
                        1. Ga naar <strong>Vakken</strong> tab<br />
                        2. Klik op <strong>"Nieuw Vak"</strong><br />
                        3. Vul naam en beschrijving in<br />
                        4. Klik op <strong>"Opslaan"</strong>
                    </Typography>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Vak bewerken/verwijderen</Typography>
                    <Typography paragraph>
                        Gebruik de ✏️ bewerk of 🗑️ verwijder iconen bij het vak.
                    </Typography>
                    <Alert severity="warning">
                        <strong>Let op:</strong> Je kunt geen vakken verwijderen waar nog toetsen aan gekoppeld zijn.
                    </Alert>
                </Box>
            )
        },
        {
            id: 'students',
            title: '9. Studenten Volgen',
            icon: <PeopleIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Individuele student bekijken</Typography>
                    <Typography paragraph>
                        1. Ga naar <strong>Leerlingen</strong> tab<br />
                        2. Klik op een student in de tabel<br />
                        3. Je ziet: Gemaakte toetsen, Scores per toets, Gemiddeld cijfer, Voortgang
                    </Typography>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Voortgang interpreteren</Typography>
                    <List dense>
                        <ListItem><ListItemText primary="Voortgang % = Percentage van gepubliceerde toetsen dat de student heeft gemaakt" /></ListItem>
                        <ListItem><ListItemText primary="Gemiddelde = Gemiddeld cijfer over alle gemaakte toetsen" /></ListItem>
                    </List>
                </Box>
            )
        },
        {
            id: 'export',
            title: '10. Data Exporteren',
            icon: <DownloadIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>CSV Export</Typography>
                    <Typography paragraph>
                        1. Ga naar <strong>Leerlingen</strong> tab<br />
                        2. Optioneel: Filter op vak<br />
                        3. Klik op <strong>"Exporteer CSV"</strong><br />
                        4. Een CSV-bestand wordt gedownload
                    </Typography>
                    <Alert severity="info">
                        <strong>Tip:</strong> Open het CSV-bestand in Excel of Google Sheets voor verdere analyse.
                    </Alert>
                </Box>
            )
        },
        {
            id: 'faq',
            title: 'Veelgestelde Vragen',
            icon: <HelpIcon />,
            content: (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Waarom duurt het genereren zo lang?</Typography>
                    <Typography paragraph>
                        De AI analyseert de geüploade documenten en genereert unieke vragen. Dit kan 1-3 minuten duren afhankelijk van de hoeveelheid tekst.
                    </Typography>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Kan ik vragen handmatig aanpassen?</Typography>
                    <Typography paragraph>
                        Momenteel kun je vragen alleen hergenereren. Handmatig bewerken is gepland voor een toekomstige versie.
                    </Typography>
                    
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Hoeveel studenten kunnen tegelijk een toets maken?</Typography>
                    <Typography paragraph>
                        De applicatie ondersteunt meerdere studenten tegelijk. Er is geen limiet op het aantal gelijktijdige pogingen.
                    </Typography>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#FDF2F8', py: 4 }}>
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #F3F4F6', py: 2, px: 4, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teacher/dashboard')}>
                    Terug naar Dashboard
                </Button>
                <Button variant="outlined" size="small" onClick={logout}>
                    Uitloggen
                </Button>
            </Box>

            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                        📚 Handleiding voor Docenten
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Alles wat je moet weten over het gebruik van de quiz applicatie
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
                    <Typography variant="body2" color="text.secondary">
                        Problemen of vragen? Neem contact op met de technische beheerder van je school.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default TeacherHelp;
