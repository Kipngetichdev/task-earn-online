import { Container, Typography, Button, Box, Fade, Grid, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskIcon from '@mui/icons-material/Task';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StarIcon from '@mui/icons-material/Star';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const imageUrl = 'https://static.vecteezy.com/system/resources/previews/046/013/478/non_2x/illustration-businessman-working-on-transparent-background-free-png.png';

  // Mock task for highlight (replace with real data from Firestore)
  const highlightedTask = {
    title: 'Survey: Favorite App',
    description: 'Share your favorite app and earn KES 3!',
    reward: 3,
    duration: 1,
  };

  if (!user) {
    navigate('/landing'); // Redirect unauthenticated users
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', pt: 2, pb: 8 }}>
      {/* Image Header */}
      <Box
        sx={{
          width: '100%',
          height: { xs: '180px', sm: '220px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          position: 'relative',
          background: 'linear-gradient(180deg, #F4F7ED 0%, rgba(134, 238, 96, 0.2) 100%)',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Fade in timeout={1200}>
          <img
            src={imageUrl}
            alt="Businessman working"
            style={{
              maxWidth: '75%',
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
          variant="h2"
          align="center"
          gutterBottom
          sx={{ fontSize: { xs: '1.8rem', sm: '2rem' } }}
        >
          Welcome, {user.displayName || 'User'}!
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ px: 2, mb: 3 }}
        >
          Ready to earn more KES? Complete tasks, check your wallet, or update your profile to keep the rewards coming!
        </Typography>

        {/* Quick Actions */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<TaskIcon />}
              onClick={() => navigate('/rewards')}
              sx={{ py: 1.5 }}
            >
              Tasks
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<AccountBalanceWalletIcon />}
              onClick={() => navigate('/wallet')}
              sx={{ py: 1.5 }}
            >
              Wallet
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<AccountCircleIcon />}
              onClick={() => navigate('/profile')}
              sx={{ py: 1.5 }}
            >
              Profile
            </Button>
          </Grid>
        </Grid>

        {/* Highlighted Task */}
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontSize: { xs: '1.4rem', sm: '1.6rem' } }}
        >
          Featured Task
        </Typography>
        <Fade in timeout={1000}>
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Typography variant="h3" color="text.primary" gutterBottom>
                {highlightedTask.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {highlightedTask.description}
              </Typography>
              <Typography variant="body1" color="primary.main">
                Reward: KES {highlightedTask.reward} | {highlightedTask.duration} min
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<StarIcon />}
                onClick={() => navigate('/rewards')}
              >
                Start Task
              </Button>
            </CardActions>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}

export default Home;