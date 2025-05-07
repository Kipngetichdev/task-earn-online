import { Snackbar, Button } from '@mui/material';
import { useState, useEffect } from 'react';

function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setOpen(true);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setOpen(false);
      });
    }
  };

  const handleDownloadApk = () => {
    window.location.href = '/apk/task-pay-to-mpesa.apk';
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      message="Install Task-Pay-to-Mpesa!"
      action={
        <>
          <Button color="primary" size="large" onClick={handleInstall}>
            Install
          </Button>
          {/* <Button color="secondary" size="large" onClick={handleDownloadApk}>
            APK
          </Button> */}
        </>
      }
      sx={{ bottom: 80 }} // Above bottom navigation
    />
  );
}

export default InstallPrompt;