import {fetchApi, postFormData} from "@/api/BaseApi";

export const generateQuiz = (formData) => postFormData('/quizzes/generate', formData);
export const getQuiz = (quizUuid) => fetchApi(`/quizzes/${quizUuid}`);
export const exportQuiz = (quizUuid) => fetchApi(`/quizzes/${quizUuid}/export`);
export const regenerateQuestion = (quizUuid, questionId) => fetchApi(`/quizzes/${quizUuid}/regenerate_question/${questionId}`, 'POST');
export const getQuizProgress = (quizUuid) => fetchApi(`/quizzes/${quizUuid}/progress/generate`);
