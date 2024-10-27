import React, { useState, useEffect } from 'react';
import { generateQuiz, getQuiz } from '@/api/QuizApi';
import apiConfig from '@/config/apiConfig';

const QuizComponent = () => {
    const [quizUuid, setQuizUuid] = useState(null);
    const [quizData, setQuizData] = useState(null);

    useEffect(() => {
        const savedQuizUuid = localStorage.getItem('quizUuid');
        if (savedQuizUuid) {
            setQuizUuid(savedQuizUuid);
            fetchQuiz(savedQuizUuid);
        }
    }, []);

    useEffect(() => {
        if (quizUuid) {
            localStorage.setItem('quizUuid', quizUuid);
        }
    }, [quizUuid]);

    const handleGenerateQuiz = async () => {
        try {
            const { quiz_uuid, quiz } = await generateQuiz();
            setQuizUuid(quiz_uuid);
            setQuizData(quiz);
        } catch (error) {
            console.error("Error generating quiz:", error);
        }
    };

    const fetchQuiz = async (uuid) => {
        try {
            const data = await getQuiz(uuid);
            setQuizData(data.quiz);
        } catch (error) {
            console.error("Error fetching quiz:", error);
        }
    };

    const exportUrl = quizUuid ? `${apiConfig.baseUrl}/quizzes/${quizUuid}/export` : null;

    return (
        <div>
            <button onClick={handleGenerateQuiz}>Generate Quiz</button>
            {quizUuid && (
                <div>
                    {exportUrl && (
                        <a href={exportUrl} download="quiz_questions.csv">
                            Export Quiz to CSV
                        </a>
                    )}
                    <h3>Quiz UUID: {quizUuid}</h3>
                    {quizData ? (
                        <pre>{JSON.stringify(quizData, null, 2)}</pre>
                    ) : (
                        <p>Loading quiz data...</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizComponent;
