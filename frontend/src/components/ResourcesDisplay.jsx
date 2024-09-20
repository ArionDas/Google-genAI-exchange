import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ResourcesDisplay = () => {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const topic = searchParams.get('topic');
    if (topic) {
      fetchResources(topic);
    }
  }, [location]);

  const fetchResources = async (topic) => {
    try {
      const prefixUrl=`${import.meta.env.VITE_BACKEND_ML_URL}`
      const response = await fetch(`${prefixUrl}/resources/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: topic }),
      });

      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading resources...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!resources) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Resources for: {new URLSearchParams(location.search).get('topic')}</h2>
      <Tabs defaultValue="wikipedia">
        <TabsList>
          <TabsTrigger value="wikipedia">Wikipedia</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="web">Web</TabsTrigger>
        </TabsList>
        <TabsContent value="wikipedia">
          {resources.results.wikipedia.map((item, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{item.snippet}</p>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Read more</a>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="youtube">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.results.youtube.map((item, index) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.youtube.com/embed/${getYouTubeId(item.link)}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <p className="mt-2">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="web">
          {resources.results.web.map((item, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{item.snippet}</p>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Read more</a>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{resources.summary}</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to extract YouTube video ID from URL
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default ResourcesDisplay;