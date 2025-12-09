import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import GenerateQuiz from '@/pages/GenerateQuiz';
import ViewQuiz from '@/pages/ViewQuiz';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

// Suppress benign ResizeObserver warning in development
const resizeObserverErr = window.onerror;
window.onerror = (message, ...args) => {
  if (message?.includes?.('ResizeObserver loop')) return true;
  return resizeObserverErr?.(message, ...args);
};

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
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
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
