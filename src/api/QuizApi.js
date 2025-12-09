import {fetchApi, postFormData, getBlob} from "@/api/BaseApi";
import apiConfig from '@/config/apiConfig';

export const generateQuiz = (formData) => postFormData('/quizzes/generate', formData);
export const getQuiz = (quizUuid) => fetchApi(`/quizzes/${quizUuid}`);
export const exportQuiz = (quizUuid) => getBlob(`/quizzes/${quizUuid}/export`);
export const regenerateQuestion = (quizUuid, questionId) => fetchApi(`/quizzes/${quizUuid}/regenerate_question/${questionId}`, 'POST');
export const submitQuizAnswers = (quizUuid, answers) => fetchApi(`/quizzes/${quizUuid}/submit`, 'POST', answers);

// SSE stream for quiz progress
export const subscribeToQuizProgress = (quizUuid, onProgress, onComplete, onError) => {
    const eventSource = new EventSource(`${apiConfig.baseUrl}/quizzes/${quizUuid}/progress`);
    
    eventSource.onmessage = (event) => {
        const progress = event.data;
        if (progress) {
            onProgress(progress);
            
            // Check if generation is complete
            if (progress.toLowerCase().includes('voltooid') || 
                progress.toLowerCase().includes('mislukt') || 
                progress.toLowerCase().includes('error')) {
                eventSource.close();
                onComplete(progress);
            }
        }
    };
    
    eventSource.onerror = (error) => {
        eventSource.close();
        if (onError) onError(error);
    };
    
    // Return function to close the connection
    return () => eventSource.close();
};
