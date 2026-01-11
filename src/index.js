import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Auth paginas
import Login from '@/pages/Login';

// Student paginas
import StudentDashboard from '@/pages/StudentDashboard';
import StudentQuizTaking from '@/pages/StudentQuizTaking';
import StudentResults from '@/pages/StudentResults';

// Docent paginas
import TeacherDashboard from '@/pages/TeacherDashboard';
import TeacherGenerateQuiz from '@/pages/TeacherGenerateQuiz';
import TeacherQuizView from '@/pages/TeacherQuizView';
import TeacherQuizStats from '@/pages/TeacherQuizStats';
import TeacherStudentView from '@/pages/TeacherStudentView';

// Legacy pages  oude paginas
import GenerateQuiz from '@/pages/GenerateQuiz';
import ViewQuiz from '@/pages/ViewQuiz';
import TakeQuiz from '@/pages/TakeQuiz';
import QuizResults from '@/pages/QuizResults';

const theme = createTheme({
  typography: {
    fontFamily: 'Lato',
    fontSize: 18,
    button: {
      textTransform: 'none'
    }
  },
  palette: {
    primary: {
      main: '#223343',
    },
    secondary: {
      main: '#9ea601',
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },

  // Student routes
  {
    path: "/student/dashboard",
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/quiz/:quizId",
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentQuizTaking />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/results/:attemptId",
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentResults />
      </ProtectedRoute>
    ),
  },

  // Teacher routes
  {
    path: "/teacher/dashboard",
    element: (
      <ProtectedRoute requiredRole="docent">
        <TeacherDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teacher/generate-quiz",
    element: (
      <ProtectedRoute requiredRole="docent">
        <TeacherGenerateQuiz />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teacher/quiz/:quizId",
    element: (
      <ProtectedRoute requiredRole="docent">
        <TeacherQuizView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teacher/quiz/:quizId/stats",
    element: (
      <ProtectedRoute requiredRole="docent">
        <TeacherQuizStats />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teacher/student/:studentId",
    element: (
      <ProtectedRoute requiredRole="docent">
        <TeacherStudentView />
      </ProtectedRoute>
    ),
  },

  // Legacy routes (backwards compatibility)
  {
    path: "/quiz/:quizUuid",
    element: <ViewQuiz />,
  },
  {
    path: "/take-quiz/:quizUuid",
    element: <TakeQuiz />,
  },
  {
    path: "/quiz-results/:quizUuid",
    element: <QuizResults />,
  },
  {
    path: "/generate",
    element: <GenerateQuiz />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
