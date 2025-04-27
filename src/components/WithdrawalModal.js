import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

function WithdrawalModal({ open, onClose, onWithdraw }) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleWithdraw = () => {
    onWithdraw({ phone, amount });
    setPhone('');
    setAmount('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <DialogTitle>Withdraw to M-Pesa</DialogTitle>
      <DialogContent>
        <TextField
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ style: { fontSize: '1rem' } }}
        />
        <TextField
          label="Amount (KES)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ style: { fontSize: '1rem' } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleWithdraw}
          disabled={!phone || !amount}
        >
          Withdraw
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WithdrawalModal;