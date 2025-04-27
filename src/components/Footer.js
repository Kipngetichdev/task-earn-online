import { Box, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

function Footer() {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));

  if (isMobile) return null;

  return (
    <Box sx={{ py: 2, textAlign: 'center', bgcolor: 'background.paper', mt: 'auto' }}>
      <Typography variant="body2" color="text.secondary">
        © 2025 Task-Pay-to-Mpesa. All rights reserved.
      </Typography>
    </Box>
  );
}

export default Footer;