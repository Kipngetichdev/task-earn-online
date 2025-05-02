import { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Fade,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

function WithdrawalModal({ open, onClose, onWithdraw, minAmount }) {
  const theme = useTheme();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    onWithdraw({ phone, amount: parsedAmount });
    setPhone('');
    setAmount('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      aria-labelledby="withdrawal-modal-title"
      aria-describedby="withdrawal-modal-description"
    >
      <Fade in={open} timeout={500}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            width: '80%',
          }}
        >
          <Typography id="withdrawal-modal-title" variant="h2" gutterBottom>
            Withdraw Funds
          </Typography>
          <Typography id="withdrawal-modal-description" variant="body1" sx={{ mb: 2 }}>
            Minimum withdrawal: KES {minAmount}
          </Typography>
          <TextField
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="254712345678"
            aria-label="Phone number for withdrawal"
          />
          <TextField
            label="Amount (KES)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            margin="normal"
            placeholder={`Minimum ${minAmount}`}
            inputProps={{ min: minAmount }}
            aria-label="Withdrawal amount"
            error={amount && parseFloat(amount) < minAmount}
            helperText={
              amount && parseFloat(amount) < minAmount
                ? `Amount must be at least KES ${minAmount}`
                : ''
            }
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            sx={{ mt: 2, borderRadius: 2 }}
            disabled={!phone || !amount || parseFloat(amount) < minAmount}
            aria-label="Submit withdrawal"
          >
            Withdraw
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
}

export default WithdrawalModal;