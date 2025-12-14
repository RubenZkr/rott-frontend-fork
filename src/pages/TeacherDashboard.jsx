import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Publish as PublishIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { subjectService, quizService } from '@/services/apiService';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [currentTab, setCurrentTab] = useState(0);
    const [subjects, setSubjects] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Subject dialog state
    const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
    const [subjectFormData, setSubjectFormData] = useState({ name: '', description: '' });
    const [editingSubject, setEditingSubject] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [subjectsData, quizzesData] = await Promise.all([
                subjectService.getAll(),
                quizService.getAll(),
            ]);
            setSubjects(subjectsData);
            setQuizzes(quizzesData);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Kon data niet laden');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubject = () => {
        setEditingSubject(null);
        setSubjectFormData({ name: '', description: '' });
        setSubjectDialogOpen(true);
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setSubjectFormData({ name: subject.name, description: subject.description || '' });
        setSubjectDialogOpen(true);
    };

    const handleSaveSubject = async () => {
        try {
            if (editingSubject) {
                await subjectService.update(editingSubject.id, subjectFormData);
            } else {
                await subjectService.create(subjectFormData);
            }
            setSubjectDialogOpen(false);
            loadData();
        } catch (err) {
            console.error('Failed to save subject:', err);
            setError('Kon onderwerp niet opslaan');
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        if (window.confirm('Weet je zeker dat je dit onderwerp wilt verwijderen?')) {
            try {
                await subjectService.delete(subjectId);
                loadData();
            } catch (err) {
                console.error('Failed to delete subject:', err);
                setError('Kon onderwerp niet verwijderen');
            }
        }
    };

    const handleGenerateQuiz = () => {
        navigate('/teacher/generate-quiz');
    };

    const handleViewQuiz = (quizId) => {
        navigate(`/teacher/quiz/${quizId}`);
    };

    const handlePublishQuiz = async (quizId) => {
        try {
            await quizService.publish(quizId);
            loadData();
        } catch (err) {
            console.error('Failed to publish quiz:', err);
            setError('Kon toets niet publiceren');
        }
    };

    const handleViewStats = (quizId) => {
        navigate(`/teacher/quiz/${quizId}/stats`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4">
                    Docent Dashboard
                </Typography>
                <Button variant="outlined" onClick={logout}>
                    Uitloggen
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
                    <Tab label="Onderwerpen" />
                    <Tab label="Toetsen" />
                </Tabs>
            </Paper>

            {/* Subjects Tab */}
            {currentTab === 0 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5">Onderwerpen</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateSubject}
                        >
                            Nieuw Onderwerp
                        </Button>
                    </Box>

                    <Grid container spacing={2}>
                        {subjects.map((subject) => (
                            <Grid item xs={12} md={6} key={subject.id}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="start">
                                            <Box>
                                                <Typography variant="h6" gutterBottom>
                                                    {subject.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {subject.description || 'Geen beschrijving'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <IconButton size="small" onClick={() => handleEditSubject(subject)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDeleteSubject(subject.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {subjects.length === 0 && (
                        <Alert severity="info">
                            Nog geen onderwerpen. Maak je eerste onderwerp aan om te beginnen!
                        </Alert>
                    )}
                </Box>
            )}

            {/* Quizzes Tab */}
            {currentTab === 1 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5">Toetsen</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleGenerateQuiz}
                        >
                            Genereer Toets
                        </Button>
                    </Box>

                    <Grid container spacing={2}>
                        {quizzes.map((quiz) => (
                            <Grid item xs={12} md={6} key={quiz.id}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                            <Typography variant="h6">
                                                {quiz.title}
                                            </Typography>
                                            <Chip
                                                label={quiz.status}
                                                size="small"
                                                color={quiz.status === 'published' ? 'success' : 'default'}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {quiz.subject_name || 'Geen onderwerp'}
                                        </Typography>
                                        <Typography variant="body2">
                                            {quiz.question_count || 0} vragen
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" onClick={() => handleViewQuiz(quiz.id)}>
                                            Bekijk
                                        </Button>
                                        {quiz.status === 'draft' && (
                                            <Button
                                                size="small"
                                                startIcon={<PublishIcon />}
                                                onClick={() => handlePublishQuiz(quiz.id)}
                                            >
                                                Publiceer
                                            </Button>
                                        )}
                                        {quiz.status === 'published' && (
                                            <Button
                                                size="small"
                                                startIcon={<AssessmentIcon />}
                                                onClick={() => handleViewStats(quiz.id)}
                                            >
                                                Statistieken
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {quizzes.length === 0 && (
                        <Alert severity="info">
                            Nog geen toetsen. Genereer je eerste toets met AI!
                        </Alert>
                    )}
                </Box>
            )}

            {/* Subject Dialog */}
            <Dialog open={subjectDialogOpen} onClose={() => setSubjectDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingSubject ? 'Onderwerp Bewerken' : 'Nieuw Onderwerp'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Naam"
                        value={subjectFormData.name}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Beschrijving"
                        value={subjectFormData.description}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSubjectDialogOpen(false)}>Annuleren</Button>
                    <Button onClick={handleSaveSubject} variant="contained">
                        Opslaan
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherDashboard;
