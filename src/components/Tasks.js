// src/components/Tasks.js
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Modal,
  Fade,
  LinearProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import tasksData from './tasksData';
import { updateTaskStatus, getUserBalance, updateUserProfile } from '../services/firestore';

function Tasks({ onActivateRequest }) {
  const { user } = useAuth();
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const beginButtonRef = useRef(null);

  // Load tasks from tasksData
  useEffect(() => {
    if (!user) {
      setAlert({
        open: true,
        message: 'Please log in to view tasks.',
        severity: 'warning',
      });
      setLoading(false);
      return;
    }
    try {
      setTasks(tasksData);
      if (tasksData.length === 0) {
        setAlert({
          open: true,
          message: 'No tasks available.',
          severity: 'warning',
        });
      }
    } catch (error) {
      setAlert({
        open: true,
        message: `Error loading tasks: ${error.message}`,
        severity: 'error',
      });
    }
    setLoading(false);
  }, [user]);

  // Timer for progress bar
  useEffect(() => {
    let timer;
    if (modalOpen && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [modalOpen, timeRemaining]);

  const handleOpenModal = useCallback(
    (task) => () => {
      if (!user?.isActive) {
        setAlert({
          open: true,
          message: 'Please activate your account to start tasks.',
          severity: 'warning',
        });
        if (onActivateRequest) {
          setTimeout(() => {
            onActivateRequest(); // Trigger Home.js activation modal
          }, 1000);
        }
        return;
      }
      setSelectedTask(task);
      setTimeRemaining(task.duration);
      setModalOpen(true);
      setTimeout(() => beginButtonRef.current?.focus(), 100);
    },
    [user, onActivateRequest]
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedTask(null);
    setTimeRemaining(0);
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBeginTask = useCallback(async () => {
    if (!selectedTask || !user) return;
    if (!user?.isActive) {
      setAlert({
        open: true,
        message: 'Please activate your account to start tasks.',
        severity: 'warning',
      });
      if (onActivateRequest) {
        setTimeout(() => {
          onActivateRequest(); // Trigger Home.js activation modal
        }, 1000);
      }
      handleCloseModal();
      return;
    }
    try {
      // Update task status in Firestore
      await updateTaskStatus(user.userId, selectedTask.id, 'completed');
      
      // Update user balance
      const currentBalance = await getUserBalance(user.userId);
      const newBalance = currentBalance + selectedTask.reward;
      await updateUserProfile(user.userId, { balance: newBalance });

      // Remove completed task from UI
      setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id));
      
      setAlert({
        open: true,
        message: `Task "${selectedTask.title}" completed! Earned KES ${selectedTask.reward}.`,
        severity: 'success',
      });
    } catch (error) {
      setAlert({
        open: true,
        message: `Failed to complete task: ${error.message}`,
        severity: 'error',
      });
    }
    handleCloseModal();
  }, [selectedTask, user, handleCloseModal, onActivateRequest]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {alert.open && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <Typography variant="h3" gutterBottom>
        Available Tasks
      </Typography>
      {!user?.isActive && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your account is inactive. Please activate your account to start tasks.
        </Alert>
      )}
      {tasks.length === 0 ? (
        <Typography color="text.secondary">No tasks available.</Typography>
      ) : (
        tasks.map((task) => (
          <Card
            key={task.id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              backgroundColor: theme.palette.background.paper,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FontAwesomeIcon
                  icon={task.icon}
                  style={{ fontSize: 24, color: theme.palette.primary.main, marginRight: 8 }}
                />
                <Typography variant="body1" fontWeight="500">
                  {task.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {task.description}
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ mb: 2 }}>
                Reward: KES {task.reward} | Duration: {formatDuration(task.duration)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal(task)}
                sx={{ borderRadius: 2 }}
                aria-label={`Start task: ${task.title}`}
                disabled={!user?.isActive}
              >
                Start Task
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      {selectedTask && (
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          closeAfterTransition
          aria-labelledby="task-instruction-modal-title"
          aria-describedby="task-instruction-modal-description"
        >
          <Fade in={modalOpen} timeout={500}>
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
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <FontAwesomeIcon
                  icon={selectedTask.icon}
                  style={{ fontSize: 40, color: theme.palette.primary.main, marginRight: 8 }}
                />
                <Typography id="task-instruction-modal-title" variant="h2" gutterBottom>
                  {selectedTask.title}
                </Typography>
              </Box>
              <Typography id="task-instruction-modal-description" variant="body1" sx={{ mb: 2 }}>
                {selectedTask.description}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Duration: {formatDuration(timeRemaining)} / {formatDuration(selectedTask.duration)}
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ mb: 2 }}>
                Reward: KES {selectedTask.reward}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(timeRemaining / selectedTask.duration) * 100}
                sx={{ mb: 3 }}
              />
              {timeRemaining === 0 ? (
                <Typography variant="body2" color="error.main" sx={{ mb: 3 }}>
                  Time’s up! Please try again.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBeginTask}
                    sx={{ borderRadius: 2, minWidth: 120 }}
                    ref={beginButtonRef}
                    aria-label={`Begin task: ${selectedTask.title}`}
                    disabled={timeRemaining === 0}
                  >
                    Begin Task
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCloseModal}
                    sx={{ borderRadius: 2, minWidth: 120 }}
                    aria-label="Close task modal"
                  >
                    Close
                  </Button>
                </Box>
              )}
            </Box>
          </Fade>
        </Modal>
      )}
    </Box>
  );
}

export default Tasks;