import { Card, CardContent, Typography, Button } from '@mui/material';

function TaskCard({ task, onStart }) {
  return (
    <Card sx={{ mb: 2, mx: 1 }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h3" color="text.primary">
          {task.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          {task.description}
        </Typography>
        <Typography variant="body1" color="primary.main">
          Reward: KES {task.reward} | {task.duration} min
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => onStart(task)}
        >
          {task.status === 'active' ? 'Resume Task' : 'Start Task'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default TaskCard;