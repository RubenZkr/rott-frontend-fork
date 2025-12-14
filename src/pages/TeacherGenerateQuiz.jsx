import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    LinearProgress,
    Alert,
    Stack,
    Chip,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
    AutoAwesome as AutoAwesomeIcon,
    Description as DescriptionIcon,
    Numbers as NumbersIcon
} from '@mui/icons-material';
import { subjectService } from '@/services/apiService';
import apiConfig from '@/config/apiConfig';

const TeacherGenerateQuiz = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [title, setTitle] = useState('');
    const [files, setFiles] = useState([]);
    const [questionCounts, setQuestionCounts] = useState({
        multiple_choice: 5,
        true_false: 3,
        short_answer: 2,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await subjectService.getAll();
            setSubjects(data);
        } catch (err) {
            console.error('Failed to load subjects:', err);
            setError('Kon onderwerpen niet laden');
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles([...files, ...newFiles]);
    };

    const handleRemoveFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSubject) {
            setError('Selecteer een onderwerp');
            return;
        }

        if (files.length === 0) {
            setError('Upload minimaal één document');
            return;
        }

        setIsGenerating(true);
        setProgress('Quiz generatie wordt gestart...');
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('subject_id', selectedSubject);
        formData.append('multiple_choice_count', questionCounts.multiple_choice);
        formData.append('true_false_count', questionCounts.true_false);
        formData.append('short_answer_count', questionCounts.short_answer);

        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            // Start generation
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${apiConfig.baseUrl}/api/quizzes/generate?subject_id=${selectedSubject}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Quiz generatie mislukt');
            }

            const data = await response.json();
            const quizUuid = data.quiz_uuid;

            // Subscribe to SSE progress
            const eventSource = new EventSource(
                `${apiConfig.baseUrl}/api/quizzes/${quizUuid}/progress`,
                {
                    withCredentials: false,
                }
            );

            eventSource.onmessage = (event) => {
                const message = event.data;
                setProgress(message);

                if (message.includes('voltooid') || message.includes('Quiz generatie compleet')) {
                    eventSource.close();
                    setIsGenerating(false);
                    // Navigate to quiz view
                    setTimeout(() => {
                        navigate(`/teacher/quiz/${quizUuid}`);
                    }, 1000);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE Error:', error);
                eventSource.close();
                setError('Er is een fout opgetreden bij het volgen van de voortgang');
                setIsGenerating(false);
            };

        } catch (err) {
            console.error('Generation error:', err);
            setError('Er is een fout opgetreden bij het genereren van de quiz');
            setIsGenerating(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#FDF2F8', py: 4 }}>
            <Container maxWidth="md">
                <Box mb={4} display="flex" alignItems="center">
                    <Button
                        startIcon={<ArrowBackIcon fontSize="small" />}
                        onClick={() => navigate('/teacher/dashboard')}
                        sx={{
                            color: '#4B5563',
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': { bgcolor: 'transparent', color: '#111827' }
                        }}
                    >
                        Terug naar Dashboard
                    </Button>
                </Box>

                <Paper sx={{
                    p: 6,
                    borderRadius: 4,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Box sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: '#F5F3FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                        }}>
                            <AutoAwesomeIcon sx={{ fontSize: 32, color: '#0F172A' }} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                            Nieuwe Toets Genereren
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Upload je lesmateriaal en laat AI automatisch vragen genereren
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={4}>
                            {/* General Info Section */}
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                    Algemene Informatie
                                </Typography>
                                <Stack spacing={3}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>Onderwerp</InputLabel>
                                        <Select
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                            disabled={isGenerating}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            {subjects.map((subject) => (
                                                <MenuItem key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        fullWidth
                                        label="Toets Titel"
                                        placeholder="Bijv. Hoofdstuk 3 - De Romeinse Tijd"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={isGenerating}
                                        InputProps={{
                                            sx: { borderRadius: 2 }
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Stack>
                            </Box>

                            {/* Question Counts Section */}
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <NumbersIcon fontSize="small" color="action" />
                                    Aantal Vragen
                                </Typography>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                    <TextField
                                        label="Multiple Choice"
                                        type="number"
                                        fullWidth
                                        value={questionCounts.multiple_choice}
                                        onChange={(e) => setQuestionCounts({ ...questionCounts, multiple_choice: parseInt(e.target.value) || 0 })}
                                        disabled={isGenerating}
                                        inputProps={{ min: 0, max: 20 }}
                                        InputProps={{ sx: { borderRadius: 2 } }}
                                    />
                                    <TextField
                                        label="Waar/Niet Waar"
                                        type="number"
                                        fullWidth
                                        value={questionCounts.true_false}
                                        onChange={(e) => setQuestionCounts({ ...questionCounts, true_false: parseInt(e.target.value) || 0 })}
                                        disabled={isGenerating}
                                        inputProps={{ min: 0, max: 10 }}
                                        InputProps={{ sx: { borderRadius: 2 } }}
                                    />
                                    <TextField
                                        label="Open Vragen"
                                        type="number"
                                        fullWidth
                                        value={questionCounts.short_answer}
                                        onChange={(e) => setQuestionCounts({ ...questionCounts, short_answer: parseInt(e.target.value) || 0 })}
                                        disabled={isGenerating}
                                        inputProps={{ min: 0, max: 10 }}
                                        InputProps={{ sx: { borderRadius: 2 } }}
                                    />
                                </Stack>
                            </Box>

                            {/* File Upload Section */}
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DescriptionIcon fontSize="small" color="action" />
                                    Lesmateriaal
                                </Typography>
                                <Button
                                    component="label"
                                    fullWidth
                                    disabled={isGenerating}
                                    sx={{
                                        border: '2px dashed #CBD5E1',
                                        borderRadius: 3,
                                        p: 4,
                                        bgcolor: '#F8FAFC',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 1,
                                        textTransform: 'none',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: '#F1F5F9',
                                            borderColor: '#94A3B8'
                                        }
                                    }}
                                >
                                    <CloudUploadIcon sx={{ fontSize: 40, color: '#64748B' }} />
                                    <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>
                                        Klik om bestanden te uploaden
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                        Ondersteund: PDF, DOCX, PPTX
                                    </Typography>
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                                        onChange={handleFileChange}
                                    />
                                </Button>

                                {/* File List */}
                                {files.length > 0 && (
                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        {files.map((file, index) => (
                                            <Paper
                                                key={index}
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    borderRadius: 2,
                                                    bgcolor: 'white'
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <DescriptionIcon color="primary" fontSize="small" />
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {file.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </Typography>
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveFile(index)}
                                                    disabled={isGenerating}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Box>

                            {/* Progress Bar */}
                            {isGenerating && (
                                <Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                                            Genereren...
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {progress}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: '#E2E8F0',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: '#0F172A',
                                                borderRadius: 4
                                            }
                                        }}
                                    />
                                </Box>
                            )}

                            {/* Action Buttons */}
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={isGenerating || files.length === 0}
                                sx={{
                                    py: 2,
                                    bgcolor: '#0F172A',
                                    color: 'white',
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    '&:hover': {
                                        bgcolor: '#1E293B',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }
                                }}
                            >
                                {isGenerating ? 'Even geduld...' : 'Genereer Toets'}
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default TeacherGenerateQuiz;
