import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#86EE60',
      light: '#A6F587',
      dark: '#66B847',
      contrastText: '#2B3752',
    },
    secondary: {
      main: '#2E6E65',
      light: '#4F938B',
      dark: '#204A44',
      contrastText: '#F4F7ED',
    },
    background: {
      default: '#F4F7ED',
      paper: '#F4F7ED',
    },
    text: {
      primary: '#2B3752',
      secondary: '#2B3752',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontWeight: 700, fontSize: '1.8rem' }, // Smaller for mobile
    h2: { fontWeight: 700, fontSize: '1.5rem' },
    h3: { fontWeight: 500, fontSize: '1.2rem' },
    body1: { fontWeight: 400, fontSize: '0.9rem' },
    button: { fontWeight: 500, fontSize: '0.9rem', textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 20px', // Larger for touch
          minWidth: '120px', // Prevent tiny buttons
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          margin: '8px', // Space for mobile
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '16px', // More spacing for touch
        },
      },
    },
  },
});

export default theme;