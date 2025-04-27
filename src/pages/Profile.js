import { Container, Typography, TextField, Button, Avatar, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { updateUserProfile, getUserProfile } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user]);

  const handleUpdate = async () => {
    await updateUserProfile(user.uid, profile);
    alert('Profile updated!');
  };

  if (!user) return <Typography align="center">Please log in to view your profile.</Typography>;

  return (
    <Container maxWidth="sm" sx={{ py: 2, pb: 8 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Profile
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ width: 60, height: 60, mb: 2 }} />
        <TextField
          label="Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Phone"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleUpdate}
          sx={{ mt: 2 }}
        >
          Save
        </Button>
      </Box>
    </Container>
  );
}

export default Profile;