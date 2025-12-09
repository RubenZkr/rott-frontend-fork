import {fetchApi, postFormData, getBlob} from "@/api/BaseApi";
import apiConfig from '@/config/apiConfig';

export const generateQuiz = (formData) => postFormData('/quizzes/generate', formData);
export const getQuiz = (quizUuid) => fetchApi(`/quizzes/${quizUuid}`);
export const exportQuiz = (quizUuid) => getBlob(`/quizzes/${quizUuid}/export`);
export const regenerateQuestion = (quizUuid, questionId) => fetchApi(`/quizzes/${quizUuid}/regenerate_question/${questionId}`, 'POST');
export const submitQuizAnswers = (quizUuid, answers) => fetchApi(`/quizzes/${quizUuid}/submit`, 'POST', answers);

// SSE stream for quiz progress
export const subscribeToQuizProgress = (quizUuid, onProgress, onComplete, onError) => {
    const url = `${apiConfig.baseUrl}/quizzes/${quizUuid}/progress`;
    console.log('Subscribing to SSE:', url);
    
    const eventSource = new EventSource(url);
    
    eventSource.onopen = () => {
        console.log('SSE connection opened');
    };
    
    eventSource.onmessage = (event) => {
        console.log('SSE message received:', event.data);
        const progress = event.data;
        if (progress && progress.trim() !== '') {
            onProgress(progress);
            
            // Check if generation is complete
            if (progress.toLowerCase().includes('voltooid') || 
                progress.toLowerCase().includes('mislukt') || 
                progress.toLowerCase().includes('error')) {
                console.log('SSE closing - generation complete');
                eventSource.close();
                onComplete(progress);
            }
        }
    };
    
    eventSource.onerror = (error) => {
        console.error('SSE error:', error, 'readyState:', eventSource.readyState);
        eventSource.close();
        if (onError) onError(error);
    };
    
    // Return function to close the connection
    return () => eventSource.close();
};
