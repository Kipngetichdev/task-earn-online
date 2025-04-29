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
  LinearProgress
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf,
  faMicrochip,
  faHeartbeat,
  faMobileAlt,
  faRecycle,
  faFlask,
  faMonument,
  faBolt,
  faLock,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

// Hardcoded task data with duration, reward, and Font Awesome icon
const tasksData = [
  {
    id: 'task1',
    title: 'Climate Action Quiz',
    description: 'Test your knowledge on global climate change efforts and renewable energy solutions.',
    duration: 120, // 2:00
    reward: 25,
    icon: faLeaf
  },
  {
    id: 'task2',
    title: 'AI Revolution Trivia',
    description: 'How much do you know about artificial intelligence and its impact on jobs?',
    duration: 90, // 1:30
    reward: 22,
    icon: faMicrochip
  },
  {
    id: 'task3',
    title: 'Global Health Awareness',
    description: 'Learn about recent advancements in global health and answer a short quiz.',
    duration: 135, // 2:15
    reward: 28,
    icon: faHeartbeat
  },
  {
    id: 'task4',
    title: 'Social Media Trends Quiz',
    description: 'Are you up to date with 2025’s social media platforms and influencers?',
    duration: 100, // 1:40
    reward: 20,
    icon: faMobileAlt
  },
  {
    id: 'task5',
    title: 'Sustainable Fashion Challenge',
    description: 'Quiz yourself on eco-friendly fashion brands and practices.',
    duration: 145, // 2:25
    reward: 27,
    icon: faRecycle
  },
  {
    id: 'task6',
    title: 'Tech Innovations 2025',
    description: 'Explore cutting-edge tech like quantum computing and take a quiz.',
    duration: 110, // 1:50
    reward: 30,
    icon: faFlask
  },
  {
    id: 'task7',
    title: 'Cultural Heritage Quiz',
    description: 'Test your knowledge of global cultural landmarks and traditions.',
    duration: 130, // 2:10
    reward: 23,
    icon: faMonument
  },
  {
    id: 'task8',
    title: 'Renewable Energy Trivia',
    description: 'How well do you know solar, wind, and hydro power? Find out!',
    duration: 95, // 1:35
    reward: 26,
    icon: faBolt
  },
  {
    id: 'task9',
    title: 'Digital Privacy Quiz',
    description: 'Learn about protecting your data online with this quick quiz.',
    duration: 140, // 2:20
    reward: 24,
    icon: faLock
  },
  {
    id: 'task10',
    title: 'Space Exploration Quiz',
    description: 'Dive into the latest space missions and test your cosmic knowledge.',
    duration: 115, // 1:55
    reward: 29,
    icon: faRocket
  }
];

function Tasks() {
  const { user } = useAuth();
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const beginButtonRef = useRef(null);

  // Set tasks directly
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log('User ID:', user?.userId || 'No user');
        setTasks(tasksData);
        console.log('Tasks set:', tasksData);
        if (tasksData.length === 0) {
          setAlert({
            open: true,
            message: 'No tasks available.',
            severity: 'warning'
          });
        }
      } catch (error) {
        console.error('Error setting tasks:', error);
        setAlert({
          open: true,
          message: `Error setting tasks: ${error.message}`,
          severity: 'error'
        });
      }
      setLoading(false);
    };
    fetchTasks();
  }, [user]);

  // Handle modal open and start timer
  const handleOpenModal = useCallback(
    (task) => () => {
      console.log('Opening modal for task:', task);
      setSelectedTask(task);
      setTimeRemaining(task.duration);
      setModalOpen(true);
      setTimeout(() => beginButtonRef.current?.focus(), 100);
    },
    []
  );

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

  // Format duration as mm:ss
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Close modal and start task
  const handleBeginTask = useCallback(() => {
    if (selectedTask) {
      console.log(`Starting task: ${selectedTask.id}`);
      // TODO: Implement task start logic
    }
    setModalOpen(false);
    setSelectedTask(null);
    setTimeRemaining(0);
  }, [selectedTask]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Error Alert */}
      {alert.open && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Task List */}
      <Typography variant="h3" gutterBottom>
        Available Tasks
      </Typography>
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
              backgroundColor: theme.palette.background.paper
            }}
          >
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Typography variant="body1" fontWeight="500">
                {task.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {task.description}
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ mb: 2 }}>
                Reward: KES {task.reward}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal(task)}
                sx={{ borderRadius: 2 }}
                aria-label={`Start task: ${task.title}`}
              >
                Start Task
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      {/* Instruction Modal */}
      {selectedTask && (
        <Modal
          open={modalOpen}
          closeAfterTransition
          disableEscapeKeyDown
          disableBackdropClick
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
                width: '80%'
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
                  Time’s up!
                </Typography>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBeginTask}
                  sx={{ borderRadius: 2, minWidth: 200 }}
                  ref={beginButtonRef}
                  aria-label={`Begin task: ${selectedTask.title}`}
                  disabled={timeRemaining === 0}
                >
                  Begin Task
                </Button>
              )}
            </Box>
          </Fade>
        </Modal>
      )}
    </Box>
  );
}

export default Tasks;