import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
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
    element: <GenerateQuiz />,
  },
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
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
