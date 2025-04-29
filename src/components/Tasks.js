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
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

// Hardcoded task data
const tasksData = [
  {
    id: 'task1',
    title: 'Climate Action Quiz',
    description: 'Test your knowledge on global climate change efforts and renewable energy solutions.',
    reward: 50,
    instructions: '1. Answer 5 multiple-choice questions about climate change.\n2. Submit your answers within 10 minutes.\n3. Score at least 80% to earn KES 50.'
  },
  {
    id: 'task2',
    title: 'AI Revolution Trivia',
    description: 'How much do you know about artificial intelligence and its impact on jobs?',
    reward: 40,
    instructions: '1. Complete a 10-question trivia quiz on AI trends.\n2. Use the provided link to access the quiz.\n3. Submit your score to earn KES 40.'
  },
  {
    id: 'task3',
    title: 'Global Health Awareness',
    description: 'Learn about recent advancements in global health and answer a short quiz.',
    reward: 60,
    instructions: '1. Watch a 3-minute video on global health initiatives.\n2. Answer 5 questions based on the video.\n3. Submit to earn KES 60.'
  },
  {
    id: 'task4',
    title: 'Social Media Trends Quiz',
    description: 'Are you up to date with 2025’s social media platforms and influencers?',
    reward: 30,
    instructions: '1. Take a 7-question quiz on social media trends.\n2. Submit your answers via the provided form.\n3. Earn KES 30 for completing the quiz.'
  },
  {
    id: 'task5',
    title: 'Sustainable Fashion Challenge',
    description: 'Quiz yourself on eco-friendly fashion brands and practices.',
    reward: 45,
    instructions: '1. Answer 6 questions about sustainable fashion.\n2. Provide one tip for eco-friendly clothing in the form.\n3. Submit to earn KES 45.'
  },
  {
    id: 'task6',
    title: 'Tech Innovations 2025',
    description: 'Explore cutting-edge tech like quantum computing and take a quiz.',
    reward: 70,
    instructions: '1. Read a short article on 2025 tech innovations.\n2. Answer 8 quiz questions.\n3. Submit to earn KES 70.'
  },
  {
    id: 'task7',
    title: 'Cultural Heritage Quiz',
    description: 'Test your knowledge of global cultural landmarks and traditions.',
    reward: 35,
    instructions: '1. Complete a 5-question quiz on cultural heritage.\n2. Submit your answers within 8 minutes.\n3. Earn KES 35 for a passing score.'
  },
  {
    id: 'task8',
    title: 'Renewable Energy Trivia',
    description: 'How well do you know solar, wind, and hydro power? Find out!',
    reward: 55,
    instructions: '1. Take a 6-question trivia quiz on renewable energy.\n2. Submit your answers via the provided link.\n3. Earn KES 55 for completion.'
  },
  {
    id: 'task9',
    title: 'Digital Privacy Quiz',
    description: 'Learn about protecting your data online with this quick quiz.',
    reward: 25,
    instructions: '1. Answer 5 questions on digital privacy best practices.\n2. Submit your answers.\n3. Earn KES 25 upon completion.'
  },
  {
    id: 'task10',
    title: 'Space Exploration Quiz',
    description: 'Dive into the latest space missions and test your cosmic knowledge.',
    reward: 80,
    instructions: '1. Watch a 2-minute video on recent space missions.\n2. Answer 7 quiz questions.\n3. Submit to earn KES 80.'
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

  // Open instruction modal
  const handleOpenModal = useCallback(
    (task) => () => {
      console.log('Opening modal for task:', task);
      setSelectedTask(task);
      setModalOpen(true);
      setTimeout(() => beginButtonRef.current?.focus(), 100);
    },
    []
  );

  // Close modal and start task
  const handleBeginTask = useCallback(() => {
    if (selectedTask) {
      console.log(`Starting task: ${selectedTask.id}`);
      // TODO: Implement task start logic
    }
    setModalOpen(false);
    setSelectedTask(null);
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
              <Typography id="task-instruction-modal-title" variant="h2" gutterBottom>
                {selectedTask.title}
              </Typography>
              {selectedTask.instructions ? (
                <List sx={{ textAlign: 'left', mb: 3 }}>
                  {selectedTask.instructions.split('\n').map((step, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemText primary={step} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography id="task-instruction-modal-description" variant="body1" sx={{ mb: 3 }}>
                  Follow the steps provided to complete this task. Ensure you meet all requirements to earn the reward.
                </Typography>
              )}
              <Typography variant="body2" color="primary.main" sx={{ mb: 3 }}>
                Reward: KES {selectedTask.reward}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleBeginTask}
                sx={{ borderRadius: 2, minWidth: 200 }}
                ref={beginButtonRef}
                aria-label={`Begin task: ${selectedTask.title}`}
              >
                Begin Task
              </Button>
            </Box>
          </Fade>
        </Modal>
      )}
    </Box>
  );
}

export default Tasks;