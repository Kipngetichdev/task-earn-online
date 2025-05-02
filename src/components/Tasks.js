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
import { completeTask, getTaskState, setTaskState } from '../services/firestore';

function Tasks({ onActivateRequest }) {
  const { user } = useAuth();
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [taskStates, setTaskStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [taskStarted, setTaskStarted] = useState(false);
  const beginButtonRef = useRef(null);
  const timerRef = useRef(null);
  const TASK_DURATION = 2 * 60 * 60; // 2 hours in seconds
  const RESET_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const COOLDOWN_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds for cooldown

  // Define handleCloseModal first, as it's used by handleCompleteTask
  const handleCloseModal = useCallback(() => {
    if (!selectedTask || !user?.userId) return;
    if (taskStarted && timeRemaining > 0) {
      const taskState = {
        inProgress: true,
        startTime: taskStates[selectedTask.id]?.startTime || Date.now(),
        paused: true,
        pauseTime: Date.now(),
        timeRemaining,
      };
      setTaskStates((prev) => ({ ...prev, [selectedTask.id]: taskState }));
      console.log('Pausing task:', { userId: user.userId, taskId: selectedTask.id, state: taskState });
      setTaskState(user.userId, selectedTask.id, taskState).catch((error) => {
        console.error('Save task state error:', error.message, error.stack);
        setAlert({
          open: true,
          message: `Failed to save task state: ${error.message}`,
          severity: 'error',
        });
      });
    }
    setModalOpen(false);
    setSelectedTask(null);
    setTimeRemaining(0);
    setTaskStarted(false);
  }, [selectedTask, taskStarted, timeRemaining, taskStates, user]);

  // Define handleCompleteTask after handleCloseModal
  const handleCompleteTask = useCallback(async () => {
    if (!selectedTask || !user?.userId) return;
    try {
      await completeTask(user.userId, selectedTask.id, selectedTask.reward);
      setTaskStates((prev) => {
        const newStates = { ...prev };
        newStates[selectedTask.id] = { completedAt: Date.now() }; // Store completedAt timestamp
        return newStates;
      });
      await setTaskState(user.userId, selectedTask.id, { completedAt: Date.now() });
      setAlert({
        open: true,
        message: `Task "${selectedTask.title}" completed! Earned KES ${selectedTask.reward}.`,
        severity: 'success',
      });
      handleCloseModal();
    } catch (error) {
      console.error('Complete task error:', error.message, error.stack);
      setAlert({
        open: true,
        message: `Failed to complete task: ${error.message}`,
        severity: 'error',
      });
    }
  }, [selectedTask, user, handleCloseModal]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (!user?.userId) {
        if (mounted) {
          setAlert({
            open: true,
            message: 'Please log in to view tasks.',
            severity: 'warning',
          });
          setLoading(false);
        }
        return;
      }
      try {
        const [fetchedTasks, fetchedTaskStates] = await Promise.all([
          Promise.resolve(tasksData),
          getTaskState(user.userId),
        ]);
        if (mounted) {
          setTasks(fetchedTasks ?? []);
          setTaskStates(fetchedTaskStates ?? {});
          if (fetchedTasks.length === 0) {
            setAlert({
              open: true,
              message: 'No tasks available.',
              severity: 'warning',
            });
          }
        }
      } catch (error) {
        console.error('Load tasks error:', error.message, error.stack);
        if (mounted) {
          setAlert({
            open: true,
            message: `Error loading tasks: ${error.message}`,
            severity: 'error',
          });
        }
      }
      if (mounted) setLoading(false);
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user?.userId) return;
    const checkTaskCompletion = async () => {
      const now = Date.now();
      for (const [taskId, state] of Object.entries(taskStates)) {
        if (state.inProgress && state.startTime) {
          const elapsed = now - state.startTime;
          if (elapsed >= RESET_DURATION) {
            try {
              const task = tasks.find((t) => t.id === taskId);
              if (task) {
                await completeTask(user.userId, taskId, task.reward);
                setAlert({
                  open: true,
                  message: `Task "${task.title}" completed! Earned KES ${task.reward}.`,
                  severity: 'success',
                });
                setTaskStates((prev) => {
                  const newStates = { ...prev };
                  newStates[taskId] = { completedAt: Date.now() }; // Add completedAt timestamp
                  return newStates;
                });
                await setTaskState(user.userId, taskId, { completedAt: Date.now() });
              }
            } catch (error) {
              console.error('Complete task error:', error.message, error.stack);
              setAlert({
                open: true,
                message: `Failed to complete task: ${error.message}`,
                severity: 'error',
              });
            }
          }
        }
      }
    };
    const interval = setInterval(checkTaskCompletion, 60000);
    return () => clearInterval(interval);
  }, [taskStates, tasks, user]);

  useEffect(() => {
    if (modalOpen && taskStarted && timeRemaining > 0 && !taskStates[selectedTask?.id]?.paused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleCompleteTask(); // Automatically complete the task when time reaches 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [modalOpen, taskStarted, timeRemaining, selectedTask, taskStates, handleCompleteTask]);

  const handleOpenModal = useCallback(
    (task) => () => {
      if (!user?.userId) return;
      const taskState = taskStates[task.id] || {};
      setSelectedTask(task);
      setTimeRemaining(taskState.timeRemaining || task.duration || TASK_DURATION);
      setTaskStarted(!!taskState.inProgress);
      setModalOpen(true);
      setTimeout(() => beginButtonRef.current?.focus(), 100);
    },
    [taskStates, user]
  );

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBeginTask = useCallback(() => {
    if (!selectedTask || !user?.isActive) {
      setAlert({
        open: true,
        message: 'Please activate your account to start tasks.',
        severity: 'warning',
      });
      if (onActivateRequest) {
        setTimeout(() => onActivateRequest(), 1000);
      }
      handleCloseModal();
      return;
    }
    if (selectedTask.link) {
      const taskState = taskStates[selectedTask.id] || {};
      if (taskState.paused) {
        const elapsedPaused = Date.now() - taskState.pauseTime;
        const newStartTime = taskState.startTime + elapsedPaused;
        const newState = {
          inProgress: true,
          startTime: newStartTime,
          paused: false,
          pauseTime: 0,
          timeRemaining: taskState.timeRemaining || selectedTask.duration || TASK_DURATION,
          completedAt: null, // Reset completedAt when restarting
        };
        setTaskStates((prev) => ({
          ...prev,
          [selectedTask.id]: newState,
        }));
        console.log('Resuming task:', { userId: user.userId, taskId: selectedTask.id, state: newState });
        setTaskState(user.userId, selectedTask.id, newState).catch((error) => {
          console.error('Resume task state error:', error.message, error.stack);
          setAlert({
            open: true,
            message: `Failed to resume task: ${error.message}`,
            severity: 'error',
          });
        });
        setTimeRemaining(taskState.timeRemaining || selectedTask.duration || TASK_DURATION);
      } else {
        const newState = {
          inProgress: true,
          startTime: Date.now(),
          paused: false,
          pauseTime: 0,
          timeRemaining: selectedTask.duration || TASK_DURATION,
          completedAt: null, // Reset completedAt when starting
        };
        setTaskStates((prev) => ({
          ...prev,
          [selectedTask.id]: newState,
        }));
        console.log('Starting task:', { userId: user.userId, taskId: selectedTask.id, state: newState });
        setTaskState(user.userId, selectedTask.id, newState).catch((error) => {
          console.error('Start task state error:', error.message, error.stack);
          setAlert({
            open: true,
            message: `Failed to start task: ${error.message}`,
            severity: 'error',
          });
        });
      }
      window.open(selectedTask.link, '_blank');
      setTaskStarted(true);
    } else {
      setAlert({
        open: true,
        message: 'This task is not available at the moment.',
        severity: 'info',
      });
      handleCloseModal();
    }
  }, [selectedTask, user, handleCloseModal, onActivateRequest, taskStates]);

  // New function to check if a task is in cooldown
  const isTaskInCooldown = (taskId) => {
    const taskState = taskStates[taskId] || {};
    if (taskState.completedAt) {
      const timeSinceCompletion = Date.now() - taskState.completedAt;
      return timeSinceCompletion < COOLDOWN_DURATION;
    }
    return false;
  };

  // New function to format remaining cooldown time
  const formatCooldownTime = (taskId) => {
    const taskState = taskStates[taskId] || {};
    if (taskState.completedAt) {
      const timeSinceCompletion = Date.now() - taskState.completedAt;
      const timeLeft = Math.max(0, COOLDOWN_DURATION - timeSinceCompletion);
      const hours = Math.ceil(timeLeft / 1000 / 60 / 60);
      return hours;
    }
    return 0;
  };

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
        tasks.map((task) => {
          const taskState = taskStates[task.id] || {};
          const isInProgress = taskState.inProgress;
          const timeLeft = taskState.startTime
            ? Math.max(0, RESET_DURATION - (Date.now() - taskState.startTime))
            : null;
          const isInCooldown = isTaskInCooldown(task.id);
          return (
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
                  transform: isInProgress || isInCooldown ? 'none' : 'scale(1.02)',
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
                  Reward: KES {task.reward} | Duration: {formatDuration(task.duration || TASK_DURATION)}
                </Typography>
                {isInProgress && timeLeft > 0 ? (
                  <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
                    Task available after {Math.ceil(timeLeft / 1000 / 60 / 60)} hour(s).
                  </Typography>
                ) : isInCooldown ? (
                  <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
                    Task completed. Come back after {formatCooldownTime(task.id)} hour(s).
                  </Typography>
                ) : null}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenModal(task)}
                  sx={{ borderRadius: 2 }}
                  aria-label={`Start task: ${task.title}`}
                  disabled={isInProgress || isInCooldown} // Disable during progress or cooldown
                >
                  Start Task
                </Button>
              </CardContent>
            </Card>
          );
        })
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
                maxWidth: '80%',
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
                Duration: {formatDuration(timeRemaining)} /{' '}
                {formatDuration(selectedTask.duration || TASK_DURATION)}
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ mb: 2 }}>
                Reward: KES {selectedTask.reward}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  taskStarted && timeRemaining >= 0
                    ? ((selectedTask.duration || TASK_DURATION - timeRemaining) /
                        (selectedTask.duration || TASK_DURATION)) *
                      100
                    : 0
                }
                sx={{ mb: 3 }}
              />
              {timeRemaining === 0 && taskStarted ? (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="success"
                    disabled // Disable since task is auto-completed
                    sx={{ borderRadius: 2, minWidth: 120 }}
                    aria-label={`Task completed: ${selectedTask.title}`}
                  >
                    Task Completed
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
              ) : (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBeginTask}
                    sx={{ borderRadius: 2, minWidth: 120 }}
                    ref={beginButtonRef}
                    aria-label={
                      taskStates[selectedTask.id]?.inProgress
                        ? `Continue task: ${selectedTask.title}`
                        : `Begin task: ${selectedTask.title}`
                    }
                  >
                    {taskStates[selectedTask.id]?.inProgress ? 'Continue' : 'Begin Task'}
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