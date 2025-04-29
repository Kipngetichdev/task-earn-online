// src/components/tasksData.js
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
    faRocket,
  } from '@fortawesome/free-solid-svg-icons';
  
  const tasksData = [
    {
      id: 'task1',
      title: 'Climate Action Quiz',
      description: 'Test your knowledge on global climate change efforts and renewable energy solutions.',
      duration: 120, // 2:00
      reward: 25,
      icon: faLeaf,
    },
    {
      id: 'task2',
      title: 'AI Revolution Trivia',
      description: 'How much do you know about artificial intelligence and its impact on jobs?',
      duration: 90, // 1:30
      reward: 22,
      icon: faMicrochip,
    },
    {
      id: 'task3',
      title: 'Global Health Awareness',
      description: 'Learn about recent advancements in global health and answer a short quiz.',
      duration: 135, // 2:15
      reward: 28,
      icon: faHeartbeat,
    },
    {
      id: 'task4',
      title: 'Social Media Trends Quiz',
      description: 'Are you up to date with 2025’s social media platforms and influencers?',
      duration: 100, // 1:40
      reward: 20,
      icon: faMobileAlt,
    },
    {
      id: 'task5',
      title: 'Sustainable Fashion Challenge',
      description: 'Quiz yourself on eco-friendly fashion brands and practices.',
      duration: 145, // 2:25
      reward: 27,
      icon: faRecycle,
    },
    {
      id: 'task6',
      title: 'Tech Innovations 2025',
      description: 'Explore cutting-edge tech like quantum computing and take a quiz.',
      duration: 110, // 1:50
      reward: 30,
      icon: faFlask,
    },
    {
      id: 'task7',
      title: 'Cultural Heritage Quiz',
      description: 'Test your knowledge of global cultural landmarks and traditions.',
      duration: 130, // 2:10
      reward: 23,
      icon: faMonument,
    },
    {
      id: 'task8',
      title: 'Renewable Energy Trivia',
      description: 'How well do you know solar, wind, and hydro power? Find out!',
      duration: 95, // 1:35
      reward: 26,
      icon: faBolt,
    },
    {
      id: 'task9',
      title: 'Digital Privacy Quiz',
      description: 'Learn about protecting your data online with this quick quiz.',
      duration: 140, // 2:20
      reward: 24,
      icon: faLock,
    },
    {
      id: 'task10',
      title: 'Space Exploration Quiz',
      description: 'Dive into the latest space missions and test your cosmic knowledge.',
      duration: 115, // 1:55
      reward: 29,
      icon: faRocket,
    },
  ];
  
  export default tasksData;