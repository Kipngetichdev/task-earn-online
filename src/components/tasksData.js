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
  faGlobe,
  faBrain,
  faUsers,
  faWater,
  faLaptopCode,
  faTree,
  faShieldAlt,
  faBook,
  faSolarPanel,
  faSatellite,
  faHandHoldingHeart,
  faCity,
} from '@fortawesome/free-solid-svg-icons';

const tasksData = [
  {
    id: 'task1',
    title: 'Climate Action Quiz',
    description: 'Test your knowledge on global climate change efforts and renewable energy solutions.',
    duration: 120, // 2:00
    reward: 25,
    icon: faLeaf,
    link: 'https://sawutser.top/4/9273543',
  },
  {
    id: 'task2',
    title: 'AI Revolution Trivia',
    description: 'How much do you know about artificial intelligence and its impact on jobs?',
    duration: 90, // 1:30
    reward: 22,
    icon: faMicrochip,
    link: 'https://sawutser.top/4/9273544',
  },
  {
    id: 'task3',
    title: 'Global Health Awareness',
    description: 'Learn about recent advancements in global health and answer a short quiz.',
    duration: 135, // 2:15
    reward: 28,
    icon: faHeartbeat,
    link: 'https://sawutser.top/4/9280245',
  },
  {
    id: 'task4',
    title: 'Social Media Trends Quiz',
    description: 'Are you up to date with 2025’s social media platforms and influencers?',
    duration: 100, // 1:40
    reward: 20,
    icon: faMobileAlt,
    link: 'https://sawutser.top/4/9273543',
  },
  {
    id: 'task5',
    title: 'Sustainable Fashion Challenge',
    description: 'Quiz yourself on eco-friendly fashion brands and practices.',
    duration: 145, // 2:25
    reward: 27,
    icon: faRecycle,
    link: 'https://sawutser.top/4/9273544',
  },
  {
    id: 'task6',
    title: 'Tech Innovations 2025',
    description: 'Explore cutting-edge tech like quantum computing and take a quiz.',
    duration: 110, // 1:50
    reward: 30,
    icon: faFlask,
    link: 'https://sawutser.top/4/9280245',
  },
  {
    id: 'task7',
    title: 'Cultural Heritage Quiz',
    description: 'Test your knowledge of global cultural landmarks and traditions.',
    duration: 130, // 2:10
    reward: 23,
    icon: faMonument,
    link: 'https://sawutser.top/4/9273543',
  },
  {
    id: 'task8',
    title: 'Renewable Energy Trivia',
    description: 'How well do you know solar, wind, and hydro power? Find out!',
    duration: 95, // 1:35
    reward: 26,
    icon: faBolt,
    link: 'https://sawutser.top/4/9273544',
  },
  {
    id: 'task9',
    title: 'Digital Privacy Quiz',
    description: 'Learn about protecting your data online with this quick quiz.',
    duration: 140, // 2:20
    reward: 24,
    icon: faLock,
    link: 'https://sawutser.top/4/9280245',
  },
  {
    id: 'task10',
    title: 'Space Exploration Quiz',
    description: 'Dive into the latest space missions and test your cosmic knowledge.',
    duration: 115, // 1:55
    reward: 29,
    icon: faRocket,
    link: 'https://sawutser.top/4/9273543',
  },
  {
    id: 'task11',
    title: 'Global Geography Trivia',
    description: 'Challenge your knowledge of world capitals, rivers, and landmarks.',
    duration: 125, // 2:05
    reward: 21,
    icon: faGlobe,
    link: 'https://sawutser.top/4/9273544',
  },
  {
    id: 'task12',
    title: 'Neuroscience Basics Quiz',
    description: 'Explore the human brain and test your understanding of its functions.',
    duration: 105, // 1:45
    reward: 25,
    icon: faBrain,
    link: 'https://sawutser.top/4/9280245',
  },
  {
    id: 'task13',
    title: 'Community Impact Quiz',
    description: 'Test your knowledge of volunteering and social impact initiatives worldwide.',
    duration: 115, // 1:55
    reward: 22,
    icon: faUsers,
    link: 'https://sawutser.top/4/9273543',
  },
  {
    id: 'task14',
    title: 'Ocean Conservation Trivia',
    description: 'Learn about marine ecosystems and efforts to protect our oceans.',
    duration: 130, // 2:10
    reward: 26,
    icon: faWater,
    link: 'https://sawutser.top/4/9273544',
  },
  {
    id: 'task15',
    title: 'Coding Skills Challenge',
    description: 'Test your understanding of programming concepts and languages.',
    duration: 120, // 2:00
    reward: 28,
    icon: faLaptopCode,
    link: 'https://sawutser.top/4/9280245',
  },
  {
    id: 'task16',
    title: 'Forestry and Wildlife Quiz',
    description: 'Explore global efforts to protect forests and endangered species.',
    duration: 140, // 2:20
    reward: 24,
    icon: faTree,
    link: 'https://sawutser.top/4/9273543',
  },
  {
    id: 'task17',
    title: 'Cybersecurity Basics Quiz',
    description: 'Learn about online safety and test your cybersecurity knowledge.',
    duration: 100, // 1:40
    reward: 23,
    icon: faShieldAlt,
    link: 'https://sawutser.top/4/9273544',
  },
  {
    id: 'task18',
    title: 'Literary Classics Trivia',
    description: 'Challenge yourself with questions on timeless books and authors.',
    duration: 125, // 2:05
    reward: 27,
    icon: faBook,
    link: 'https://sawutser.top/4/9280245',
  },
  {
    id: 'task19',
    title: 'Solar Energy Quiz',
    description: 'Test your knowledge of solar power innovations and applications.',
    duration: 95, // 1:35
    reward: 25,
    icon: faSolarPanel,
    link: 'https://sawutser.top/4/9273543',
  },
  {
    id: 'task20',
    title: 'Satellite Technology Trivia',
    description: 'Explore the role of satellites in communication and science.',
    duration: 110, // 1:50
    reward: 29,
    icon: faSatellite,
    link: 'https://sawutser.top/4/9273544',
  },
  {
    id: 'task21',
    title: 'Mental Health Awareness Quiz',
    description: 'Learn about mental health practices and answer a short quiz.',
    duration: 135, // 2:15
    reward: 21,
    icon: faHandHoldingHeart,
    link: 'https://sawutser.top/4/9280245',
  },
  {
    id: 'task22',
    title: 'Urban Sustainability Quiz',
    description: 'Test your knowledge of smart cities and sustainable urban planning.',
    duration: 105, // 1:45
    reward: 26,
    icon: faCity,
    link: 'https://sawutser.top/4/9273543',
  },
];

export default tasksData;