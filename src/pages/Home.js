import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', pt: 2, pb: 8 }}>
      <Container maxWidth="sm">
        <Typography variant="h1" align="center" gutterBottom>
          Task-Pay-to-Mpesa
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Earn KES by completing tasks like surveys, ads, and app ratings. Withdraw to M-Pesa!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => navigate('/rewards')}
        >
          Start Earning
        </Button>
      </Container>
    </Box>
  );
}

export default Home;