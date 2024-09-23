import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy } from 'lucide-react';

const TopicProgress = ({ topic, quizzesTaken }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium">{topic}</span>
      <Badge variant="secondary" className="text-xs">{quizzesTaken}</Badge>
    </div>
    <Progress value={(quizzesTaken / 20) * 100} className="h-2" />
  </div>
);

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dsaTopicsCovered, setDsaTopicsCovered] = useState({});
  const [streakDays, setStreakDays] = useState(0);
  const [badges, setBadges] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userDataString = localStorage.getItem('user');
      if (!userDataString) {
        console.log('No user data in localStorage');
        return;
      }
  
      const userData = JSON.parse(userDataString);
      console.log('User data from localStorage:', userData);
  
      setUser(userData); // Set user state, but don't rely on it immediately
  
      if (!userData.id) {
        console.log('User ID not found in localStorage data');
        return;
      }
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user/${userData.id}`);
      const data = await response.json();
  
      setName(data.name);
      setEmail(data.email);
      setDsaTopicsCovered(data.dsaTopicsCovered);
      setStreakDays(data.streakDays);
      setBadges(data.badges);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  // Helper function to chunk the topics into columns
  const chunkTopics = (obj, size) => {
    const chunks = [];
    const entries = Object.entries(obj);
    for (let i = 0; i < entries.length; i += size) {
      chunks.push(Object.fromEntries(entries.slice(i, i + size)));
    }
    return chunks;
  };

  const topicColumns = chunkTopics(dsaTopicsCovered, 5); // Divide into 3 columns of 5 topics each

  return (
    <div className="container mx-auto p-4 sm:p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center space-x-4">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`}
              alt={name}
              className="w-20 h-20 border-4 border-white shadow-lg"
            />
            <div>
              <CardTitle className="text-3xl font-bold">{name}</CardTitle>
              <p className="text-sm opacity-75">{email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Trophy className="mr-2 text-yellow-500" /> DSA Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topicColumns.map((column, idx) => (
                  <div key={idx}>
                    {Object.entries(column).map(([topic, { quizzesTaken }]) => (
                      <TopicProgress key={topic} topic={topic} quizzesTaken={quizzesTaken} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Flame className="mr-2 text-orange-500" /> Streak
              </h3>
              <div className="text-center bg-gradient-to-br from-orange-100 to-red-100 p-6 rounded-lg shadow-inner mb-8">
                <h4 className="text-4xl font-bold text-orange-500">{streakDays} days</h4>
                <p className="text-gray-600 text-sm mt-2">Consecutive Active Days</p>
              </div>

              <h3 className="text-xl font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {badges.map((badge, index) => (
                  <Tooltip key={index} content={badge.name}>
                    <div className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                      <img src={badge.imageUrl} alt={badge.name} className="w-12 h-12" />
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;