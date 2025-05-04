import { useState, useEffect } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// List of 20 random Kenyan names
const kenyanNames = [
  'Wanjiku Mwangi', 'Kamau Kariuki', 'Aisha Otieno', 'Juma Kipkorir',
  'Fatuma Njoroge', 'Ochieng Wambui', 'Njeri Kiptoo', 'Musa Cheruiyot',
  'Grace Wairimu', 'Kibet Omondi', 'Halima Chebet', 'Okoth Ngugi',
  'Lilian Mburu', 'Korir Achieng', 'Mercy Wafula', 'Barasa Nyambura',
  'Esther Koech', 'Maina Atieno', 'Salma Rotich', 'Kipchumba Gacheri',
];

// Generate random amount between 1500 and 6000
const getRandomAmount = () => Math.floor(Math.random() * (6000 - 1500 + 1)) + 1500;

// Generate payout messages (only once, outside the component)
const payoutMessages = kenyanNames.map((name) => ({
  name,
  amount: getRandomAmount(),
  id: `${name}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID
}));

function RecentPayoutsToast() {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    console.log('RecentPayoutsToast mounted, starting interval'); // Debug
    const VISIBLE_DURATION = 4000; // Toast visible for 4 seconds
    const HIDDEN_DURATION = 1000; // 1 second gap before next toast
    const TOTAL_CYCLE = VISIBLE_DURATION + HIDDEN_DURATION; // 5 seconds total

    const showInterval = setInterval(() => {
      console.log('Hiding toast, index:', currentIndex); // Debug
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % payoutMessages.length);
        console.log('Showing next toast, new index:', (currentIndex + 1) % payoutMessages.length); // Debug
        setIsVisible(true);
      }, HIDDEN_DURATION);
    }, TOTAL_CYCLE);

    return () => {
      console.log('Cleaning up RecentPayoutsToast interval'); // Debug
      clearInterval(showInterval);
    };
  }, [currentIndex]); // Include currentIndex for debugging

  const currentPayout = payoutMessages[currentIndex];

  return (
    <Fade in={isVisible} timeout={{ enter: 500, exit: 500 }}>
      <Box
        sx={{
          width: '90%',
          borderLeft: `5px solid #39e371`,
          color: '#39e371',
          p: 1,
          zIndex: 1300,
          backgroundColor: 'rgba(57, 227, 114, 0.49)',
          transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.5s ease-in-out',
          visibility: isVisible ? 'visible' : 'hidden',
        }}
        role="alert"
        aria-live="polite"
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            color: theme.palette.success.dark, // Text matches border color
          }}
        >
          {currentPayout.name} has received KES {currentPayout.amount}
        </Typography>
      </Box>
    </Fade>
  );
}

export default RecentPayoutsToast;