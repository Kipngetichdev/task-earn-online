import { Container, Typography, Button, Box, Fade, Grid, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  const imageUrl = 'https://static.vecteezy.com/system/resources/previews/046/013/478/non_2x/illustration-businessman-working-on-transparent-background-free-png.png';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', pt: 2, pb: 8 }}>
      {/* Image Header */}
      <Box
        sx={{
          width: '100%',
          height: { xs: '200px', sm: '250px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          position: 'relative',
          background: 'linear-gradient(180deg, #F4F7ED 0%, rgba(134, 238, 96, 0.3) 100%)',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Fade in timeout={1200}>
          <img
            src={imageUrl}
            alt="Businessman working"
            style={{
              maxWidth: '80%',
              maxHeight: '90%',
              objectFit: 'contain',
              zIndex: 2,
              animation: 'scaleIn 1s ease-in-out',
            }}
            onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
          />
        </Fade>
      </Box>

      {/* Content Section */}
      <Container maxWidth="sm">
        <Typography
          variant="h1"
          align="center"
          gutterBottom
          sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, fontWeight: 700 }}
        >
          Earn KES with Task-Pay-to-Mpesa
        </Typography>
        <Typography
          variant="h3"
          align="center"
          color="primary.main"
          gutterBottom
          sx={{ fontSize: { xs: '1.4rem', sm: '1.6rem' } }}
        >
          Money on the Go!
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ px: 2, mb: 3 }}
        >
          Complete simple tasks like surveys, ads, or app ratings and cash out instantly to M-Pesa. Join thousands of Kenyans turning spare time into cash!
        </Typography>
        <Fade in timeout={1000}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={() => navigate('/register')}
            sx={{ mb: 2, py: 1.5 }}
          >
            Get Started
          </Button>
        </Fade>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          size="large"
          onClick={() => navigate('/login')}
          sx={{ py: 1.5 }}
        >
          Log In
        </Button>

        {/* Stats Section */}
        <Grid container spacing={2} sx={{ mt: 4, textAlign: 'center' }}>
          <Grid item xs={6}>
            <Typography variant="h3" color="primary.main">10,000+</Typography>
            <Typography variant="body2" color="text.secondary">Users</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h3" color="primary.main">KES 200K+</Typography>
            <Typography variant="body2" color="text.secondary">Paid Out</Typography>
          </Grid>
        </Grid>

        {/* Testimonial Section */}
        <Box sx={{ mt: 4, textAlign: 'center', px: 2 }}>
          <Avatar sx={{ width: 50, height: 50, mx: 'auto', mb: 1 }} />
          <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 1 }}>
            “Earned KES 500 in a week during my commute!”
          </Typography>
          <Typography variant="body2" color="text.secondary">- Jane, Nairobi</Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Landing;