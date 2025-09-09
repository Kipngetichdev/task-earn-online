import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Box,
  Stack,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';
import {
  Person,
  ContentCopy,
  Info,
  Warning,
  Error,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { generateReferralCode, getReferralHistory } from '../services/firestore';

// Define the app's base URL (replace with your actual app URL)
const APP_URL = 'https://task-earn-online.vercel.app/';

// Format timestamp as "MMM YYYY"
const formatMonth = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
};

// Map alert severity to icons
const alertIcons = {
  info: <Info />,
  warning: <Warning />,
  error: <Error />,
  success: <CheckCircle />,
};

function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [referralLoading, setReferralLoading] = useState(true);

  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (alert.open) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, open: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Fetch referral code and referral history
  useEffect(() => {
    if (user?.userId) {
      const fetchReferralData = async () => {
        try {
          const [code, referralData] = await Promise.all([
            generateReferralCode(user.userId),
            getReferralHistory(user.userId),
          ]);
          // Combine the app URL with the referral code
          const fullReferralLink = `${APP_URL}/?ref=${code}`;
          setReferralLink(fullReferralLink);
          setReferrals(referralData);
        } catch (error) {
          setAlert({
            open: true,
            message: `Error loading referral data: ${error.message}`,
            severity: 'error',
          });
        }
        setReferralLoading(false);
      };
      fetchReferralData();
    } else {
      setAlert({
        open: true,
        message: 'User ID not found. Please log in again.',
        severity: 'error',
      });
      setReferralLoading(false);
    }
  }, [user]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setAlert({
        open: true,
        message: 'Referral link copied to clipboard!',
        severity: 'success',
      });
    }).catch(() => {
      setAlert({
        open: true,
        message: 'Failed to copy referral link.',
        severity: 'error',
      });
    });
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 2, pb: 8, textAlign: 'center' }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Person color="primary" />
          <Typography variant="h3" gutterBottom>
            Please log in to view your profile.
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2, pb: 8 }}>
      {alert.open && (
        <Alert
          icon={alertIcons[alert.severity]}
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ mb: 2 }}
          action={
            alert.severity === 'error' ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => window.location.reload()}
                aria-label="Retry loading referral data"
              >
                Retry
              </Button>
            ) : null
          }
        >
          {alert.message}
        </Alert>
      )}

      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
        <Person color="primary" fontSize="large" />
        <Typography variant="h3" align="center">
          Profile
        </Typography>
      </Stack>

      {authLoading || referralLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Card sx={{ mb: 2, borderRadius: 4, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Person color="primary" />
                <Typography variant="h4">
                  Personal Information
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ width: 60, height: 60, mb: 2 }} />
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {user.name || 'Not provided'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {user.phone || 'Not provided'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {user.email || 'Not provided'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2, borderRadius: 4, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <ContentCopy color="primary" />
                <Typography variant="h4">
                  Refer & Earn
                </Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Earn KES 100 for every friend who signs up with your referral link!
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  label="Your Referral Link"
                  value={referralLink}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  aria-describedby="referral-link-description"
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleCopyCode}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                  startIcon={<ContentCopy />}
                  disabled={!referralLink}
                  aria-label="Copy referral link"
                >
                  Copy
                </Button>
              </Stack>
              <Typography id="referral-link-description" color="text.secondary" sx={{ mb: 2 }}>
                Share this link with friends to earn rewards.
              </Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Referral Earnings: KES {referrals.length * 100}
              </Typography>
              {referrals.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  No referrals yet. Share your link to start earning!
                </Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small" aria-label="Referral history table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 500 }}>Referred User</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Reward</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {referrals.map((referral) => (
                        <TableRow key={referral.referredUserId}>
                          <TableCell>{referral.referredUserName || referral.referredUserId}</TableCell>
                          <TableCell>{formatMonth(referral.timestamp)}</TableCell>
                          <TableCell>KES 100</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}

export default Profile;