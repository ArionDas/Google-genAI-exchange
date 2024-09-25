import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';



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

  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user data from localStorage
      const userDataString = localStorage.getItem('user');
      if (!userDataString) {
        console.log('No user data in localStorage');
        return;
      }
  
      // Parse the user data from localStorage
      const userData = JSON.parse(userDataString);
      console.log('User data from localStorage:', userData);
  
      // Fetch user data from the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user/${userData.id}`);
      const data = await response.json();
  
      // Check if data is successfully fetched
      if (!response.ok) {
        console.error('Failed to fetch user data:', data.message);
        return;
      }

      console.log("Profile data", data);
  
      // Set state with the fetched data
      setName(data.name);
      setEmail(data.email);
      setDsaTopicsCovered(data.dsaTopicsCovered || {});
      setStreakDays(data.streak.count || 0);
  
      // Set the activity log data for heatmap from loginDays
      const loginDays = data.loginDays || [];
      const formattedHeatmapData = loginDays.map((log) => ({
        date: log.date.split('T')[0], // Format date to YYYY-MM-DD
        count: log.count,
      }));
      setHeatmapData(formattedHeatmapData);
  
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

  const topicColumns = chunkTopics(dsaTopicsCovered, 5); // Divide into columns of 5 topics each

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
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Activity Heatmap</h3>
                <div className="overflow-auto">
                  <CalendarHeatmap
                    startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                    endDate={new Date()}
                    values={heatmapData}
                    classForValue={(value) => {
                      if (!value) {
                        return 'color-empty';
                      }
                      return `color-scale-${value.count}`;
                    }}
                    tooltipDataAttrs={(value) => {
                      return {
                        'data-tip': `${value.date}: ${value.count || 0} activities`,
                      };
                    }}
                    showWeekdayLabels={true}
                    gutterSize={4}
                  />
                </div>
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
                      {streakDays >= 0 && (
                        <div className="flex justify-center">
                          <img src="https://i.ibb.co/Tvwh7ks/day0.png" alt="day0" className="w-20 h-20" />
                        </div>
                      )}
                      {streakDays >= 3 && (
                        <div className="flex justify-center">
                          <img src="https://i.ibb.co/1ftkZL5/day3.png" alt="day3" className="w-20 h-20" />
                        </div>
                      )}
                      {streakDays >= 15 && (
                        <div className="flex justify-center">
                          <img src="https://i.ibb.co/P5ysHf5/day15.png" alt="day15" className="w-20 h-20" />
                        </div>
                      )}
                      {streakDays >= 30 && (
                        <div className="flex justify-center">
                          <img src="https://i.ibb.co/SdgX5MY/day30.png" alt="day30" className="w-20 h-20" />
                        </div>
                      )}
                      {streakDays >= 50 && (
                        <div className="flex justify-center">
                          <img src="https://i.ibb.co/YXxDRgS/day50.png" alt="day50" className="w-20 h-20" />
                        </div>
                      )}
                      {streakDays >= 100 && (
                        <div className="flex justify-center">
                          <img src="https://i.ibb.co/J3TXR53/day100.png" alt="day100" className="w-20 h-20" />
                        </div>
                      )}
                    </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
