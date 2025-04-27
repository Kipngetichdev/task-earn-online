import { Container, Typography, Grid, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { getTasks, updateTaskStatus } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

function Rewards() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getTasks(user.uid).then((data) => {
        setTasks(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleStartTask = (task) => {
    setSelectedTask(task);
  };

  const handleCompleteTask = async (task) => {
    await updateTaskStatus(user.uid, task.id, 'completed');
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: 'completed' } : t));
    setSelectedTask(null);
  };

  if (!user) return <Typography align="center">Please log in to view rewards.</Typography>;

  return (
    <Container maxWidth="sm" sx={{ py: 2, pb: 8 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Tasks
      </Typography>
      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
      ) : (
        <Grid container spacing={1}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <TaskCard task={task} onStart={handleStartTask} />
            </Grid>
          ))}
        </Grid>
      )}
      <TaskModal
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onComplete={handleCompleteTask}
      />
    </Container>
  );
}

export default Rewards;