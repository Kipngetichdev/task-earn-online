import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

function TaskModal({ open, onClose, task, onComplete }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <DialogTitle>{task.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{task.description}</Typography>
        <Typography variant="body1" color="primary.main" sx={{ mt: 1 }}>
          Reward: KES {task.reward} | Duration: {task.duration} min
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Task content goes here (e.g., survey, ad video).
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={() => onComplete(task)}>
          Complete Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskModal;