import React from 'react';
import AppBarButton from '@/components/AppBar/AppBarButton';
import AppShell from './components/AppShell';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import "@fontsource/lato";

const theme = createTheme({
  typography: {
    fontFamily: 'Lato',
    fontSize: 18,
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


const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppShell>{{
        appBarButtons: [
          <AppBarButton onClick={() => alert("test!")}>Begin opnieuw</AppBarButton>,
        ],
        body: <>
          <h2>Nieuwe quiz</h2>
        </>
      }}</AppShell>
    </ThemeProvider>
  )
};

export default App;
