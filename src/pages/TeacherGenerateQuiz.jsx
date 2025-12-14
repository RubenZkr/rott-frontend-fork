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
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
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
                `${apiConfig.baseUrl}/api/quizzes/generate/${quizUuid}/progress`,
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
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box mb={3}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/teacher/dashboard')}
                >
                    Terug naar Dashboard
                </Button>
            </Box>

            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Genereer Nieuwe Toets met AI
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Upload lesmateriaal en laat AI automatisch vragen genereren
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Subject Selection */}
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Onderwerp</InputLabel>
                        <Select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={isGenerating}
                        >
                            {subjects.map((subject) => (
                                <MenuItem key={subject.id} value={subject.id}>
                                    {subject.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Quiz Title */}
                    <TextField
                        fullWidth
                        label="Toets Titel"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        margin="normal"
                        required
                        disabled={isGenerating}
                        helperText="Bijvoorbeeld: Hoofdstuk 3 - Databases"
                    />

                    {/* Question Counts */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                        Aantal Vragen
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Multiple Choice"
                            type="number"
                            value={questionCounts.multiple_choice}
                            onChange={(e) => setQuestionCounts({ ...questionCounts, multiple_choice: parseInt(e.target.value) || 0 })}
                            disabled={isGenerating}
                            inputProps={{ min: 0, max: 20 }}
                        />
                        <TextField
                            label="Waar/Niet Waar"
                            type="number"
                            value={questionCounts.true_false}
                            onChange={(e) => setQuestionCounts({ ...questionCounts, true_false: parseInt(e.target.value) || 0 })}
                            disabled={isGenerating}
                            inputProps={{ min: 0, max: 10 }}
                        />
                        <TextField
                            label="Open Vragen"
                            type="number"
                            value={questionCounts.short_answer}
                            onChange={(e) => setQuestionCounts({ ...questionCounts, short_answer: parseInt(e.target.value) || 0 })}
                            disabled={isGenerating}
                            inputProps={{ min: 0, max: 10 }}
                        />
                    </Stack>

                    {/* File Upload */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                        Lesmateriaal
                    </Typography>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        disabled={isGenerating}
                        fullWidth
                    >
                        Upload Bestanden (PDF, DOC, DOCX, PPT)
                        <input
                            type="file"
                            hidden
                            multiple
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            onChange={handleFileChange}
                        />
                    </Button>

                    {/* Uploaded Files List */}
                    {files.length > 0 && (
                        <Box mt={2}>
                            <Stack spacing={1}>
                                {files.map((file, index) => (
                                    <Chip
                                        key={index}
                                        label={file.name}
                                        onDelete={() => handleRemoveFile(index)}
                                        deleteIcon={<DeleteIcon />}
                                        disabled={isGenerating}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* Progress */}
                    {isGenerating && (
                        <Box mt={3}>
                            <LinearProgress />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {progress}
                            </Typography>
                        </Box>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={isGenerating || files.length === 0}
                    >
                        {isGenerating ? 'Bezig met genereren...' : 'Genereer Toets'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default TeacherGenerateQuiz;
