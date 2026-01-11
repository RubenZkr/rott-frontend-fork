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
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Publish as PublishIcon,
    Assessment as AssessmentIcon,
    School as SchoolIcon,
    Description as DescriptionIcon,
    ArrowBack as ArrowBackIcon,
    Download as DownloadIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { subjectService, quizService, dashboardService } from '@/services/apiService';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [view, setView] = useState('dashboard'); // 'dashboard', 'subjects', 'quizzes'
    const [subjects, setSubjects] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dashboard data (real data from API)
    const [dashboardStats, setDashboardStats] = useState(null);
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');

    // Subject dialog state
    const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
    const [subjectFormData, setSubjectFormData] = useState({ name: '', description: '' });
    const [editingSubject, setEditingSubject] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    // Reload dashboard when filter changes
    useEffect(() => {
        if (!loading) {
            loadDashboardStats();
        }
    }, [selectedSubjectFilter]);

    const loadDashboardStats = async () => {
        try {
            const subjectId = selectedSubjectFilter || null;
            const stats = await dashboardService.getTeacherDashboard(subjectId);
            setDashboardStats(stats);
        } catch (err) {
            console.error('Failed to load dashboard stats:', err);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [subjectsData, quizzesData, dashboardData] = await Promise.all([
                subjectService.getAll(),
                quizService.getAll(),
                dashboardService.getTeacherDashboard(),
            ]);
            setSubjects(subjectsData);
            setQuizzes(quizzesData);
            setDashboardStats(dashboardData);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Kon data niet laden');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const subjectId = selectedSubjectFilter || null;
            const blob = await dashboardService.exportStudentsCSV(subjectId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = selectedSubjectFilter
                ? `studenten_${subjects.find(s => s.id === selectedSubjectFilter)?.name || 'export'}.csv`
                : 'studenten_overzicht.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to export:', err);
            setError('Export mislukt');
        }
    };

    const handleViewStudent = (studentId) => {
        navigate(`/teacher/student/${studentId}`);
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

    const handleDeleteQuiz = async (quizId, quizTitle) => {
        if (!window.confirm(`Weet je zeker dat je de toets "${quizTitle}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
            return;
        }
        try {
            await quizService.delete(quizId);
            loadData();
        } catch (err) {
            console.error('Failed to delete quiz:', err);
            setError('Kon toets niet verwijderen');
        }
    };

    const getGradeColor = (grade) => {
        if (!grade) return '#E5E7EB';
        if (grade >= 8.0) return '#22C55E';
        if (grade >= 6.0) return '#EAB308';
        if (grade >= 5.5) return '#F97316';
        return '#EF4444';
    };

    const getProgressColor = (progress) => {
        if (progress === 100) return '#22C55E'; // Green
        if (progress > 50) return '#EAB308'; // Yellow
        if (progress > 25) return '#F97316'; // Orange
        return '#EF4444'; // Red
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#FDF2F8">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#FDF2F8', py: 4 }}>
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #F3F4F6', py: 2, px: 4, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Ingelogd als docent
                </Typography>
                <Button variant="outlined" size="small" onClick={logout}>
                    Uitloggen
                </Button>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 8 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                        Docent Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Overzicht van alle leerlingen en hun prestaties
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

                {/* Main Action Buttons */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleGenerateQuiz}
                            sx={{
                                bgcolor: '#0F172A',
                                color: 'white',
                                py: 2,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#1E293B' }
                            }}
                        >
                            Nieuwe Toets
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper
                            component={Button}
                            fullWidth
                            onClick={() => setView(view === 'quizzes' ? 'dashboard' : 'quizzes')}
                            sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                height: '100%',
                                textTransform: 'none',
                                color: view === 'quizzes' ? '#0F172A' : '#4B5563',
                                border: view === 'quizzes' ? '2px solid #0F172A' : 'none',
                                bgcolor: 'white',
                                '&:hover': { bgcolor: '#F9FAFB' }
                            }}
                        >
                            <DescriptionIcon />
                            <Typography variant="subtitle1" fontWeight={600}>Beheer Toetsen</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper
                            component={Button}
                            fullWidth
                            onClick={() => setView(view === 'subjects' ? 'dashboard' : 'subjects')}
                            sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                height: '100%',
                                textTransform: 'none',
                                color: view === 'subjects' ? '#0F172A' : '#4B5563',
                                border: view === 'subjects' ? '2px solid #0F172A' : 'none',
                                bgcolor: 'white',
                                '&:hover': { bgcolor: '#F9FAFB' }
                            }}
                        >
                            <SchoolIcon />
                            <Typography variant="subtitle1" fontWeight={600}>Beheer Vakken</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Dashboard View (Class Average) */}
                {view === 'dashboard' && (
                    <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AssessmentIcon color="action" />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                                    Klasgemiddelde
                                </Typography>
                                {dashboardStats && (
                                    <Chip
                                        label={`${dashboardStats.total_students} studenten`}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Filter op vak</InputLabel>
                                    <Select
                                        value={selectedSubjectFilter}
                                        label="Filter op vak"
                                        onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                                    >
                                        <MenuItem value="">Alle Vakken</MenuItem>
                                        {subjects.map((subject) => (
                                            <MenuItem key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleExportCSV}
                                >
                                    Exporteer CSV
                                </Button>
                            </Box>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Leerling</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#374151', width: '35%' }}>Voortgang</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600, color: '#374151' }}>Toetsen</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>Gemiddelde</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600, color: '#374151' }}>Actie</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dashboardStats?.students?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                Geen studenten gevonden
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {dashboardStats?.students?.map((student) => (
                                        <TableRow
                                            key={student.student_id}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => handleViewStudent(student.student_id)}
                                        >
                                            <TableCell sx={{ fontWeight: 500, color: '#111827' }}>
                                                {student.student_name}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                    <Box sx={{ width: '100%', mr: 1, bgcolor: '#E5E7EB', borderRadius: 4, height: 8 }}>
                                                        <Box sx={{
                                                            width: `${student.progress_percentage}%`,
                                                            bgcolor: getProgressColor(student.progress_percentage),
                                                            height: '100%',
                                                            borderRadius: 4
                                                        }} />
                                                    </Box>
                                                    <Typography variant="caption" sx={{ minWidth: 40 }}>
                                                        {student.progress_percentage.toFixed(0)}%
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2">
                                                    {student.completed_quizzes}/{student.total_quizzes_available}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{
                                                    display: 'inline-flex',
                                                    bgcolor: getGradeColor(student.average_grade),
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    minWidth: 40,
                                                    justifyContent: 'center'
                                                }}>
                                                    {student.average_grade ? student.average_grade.toFixed(1) : '-'}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewStudent(student.student_id);
                                                    }}
                                                >
                                                    <PersonIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {dashboardStats && dashboardStats.students?.length > 0 && (
                                        <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Klasgemiddelde</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                                                {dashboardStats.published_quizzes} toetsen
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#374151' }}>
                                                <Box sx={{
                                                    display: 'inline-flex',
                                                    bgcolor: getGradeColor(dashboardStats.class_average_grade),
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    minWidth: 40,
                                                    justifyContent: 'center'
                                                }}>
                                                    {dashboardStats.class_average_grade ? dashboardStats.class_average_grade.toFixed(1) : '-'}
                                                </Box>
                                            </TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {/* Quizzes Management View */}
                {view === 'quizzes' && (
                    <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h5" fontWeight={600}>Beheer Toetsen</Typography>
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
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                                                title="Verwijderen"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        {quizzes.length === 0 && (
                            <Alert severity="info" sx={{ mt: 2 }}>Nog geen toetsen. Maak er een aan!</Alert>
                        )}
                    </Box>
                )}

                {/* Subjects Management View */}
                {view === 'subjects' && (
                    <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h5" fontWeight={600}>Beheer Vakken</Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateSubject}
                                sx={{ bgcolor: '#0F172A' }}
                            >
                                Nieuw Vak
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
                            <Alert severity="info" sx={{ mt: 2 }}>Nog geen vakken.</Alert>
                        )}
                    </Box>
                )}

                {/* Subject Dialog (Keep existing functionality) */}
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
                        <Button onClick={handleSaveSubject} variant="contained" sx={{ bgcolor: '#0F172A' }}>
                            Opslaan
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default TeacherDashboard;
