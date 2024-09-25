import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function MultiModalChat() {
  const [imageQuery, setImageQuery] = useState('');
  const [videoQuery, setVideoQuery] = useState('');
  const [response, setResponse] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const prefixUrl = `${import.meta.env.VITE_BACKEND_ML_URL}`;

  const handleSubmit = async (type) => {
    setIsLoading(true);
    setResponse('');
    setAudioUrl('');

    const formData = new FormData();
    let endpoint = '';

    if (type === 'image') {
      formData.append('query_text', imageQuery);
      endpoint = `${prefixUrl}/image-query`;
    } else if (type === 'video') {
      formData.append('query_text', videoQuery);
      endpoint = `${prefixUrl}/video-query`;
    }

    const file = fileInputRef.current.files[0];
    if (!file) {
      alert('Please select a file');
      setIsLoading(false);
      return;
    }
    formData.append(type, file);

    try {
      console.log(`Sending request to ${endpoint}`);
      const { data } = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Response received:', data);
      setResponse(data.text_response);
      
      // Fetch the audio file
      const audioResponse = await axios.get(`${prefixUrl}/download-audio`, { responseType: 'blob' });
      const responseAudioBlob = new Blob([audioResponse.data], { type: 'audio/mp3' });
      setAudioUrl(URL.createObjectURL(responseAudioBlob));
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Multi-Modal Chat</CardTitle>
          <CardDescription>Interact using image or video</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
            </TabsList>
            <TabsContent value="image">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Upload Image</Label>
                  <Input id="image-upload" type="file" accept="image/*" ref={fileInputRef} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-query">Your Image Query</Label>
                  <Input
                    id="image-query"
                    placeholder="Enter your query about the image"
                    value={imageQuery}
                    onChange={(e) => setImageQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleSubmit('image')} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Image Query
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="video">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-upload">Upload Video</Label>
                  <Input id="video-upload" type="file" accept="video/*" ref={fileInputRef} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-query">Your Video Query</Label>
                  <Input
                    id="video-query"
                    placeholder="Enter your query about the video"
                    value={videoQuery}
                    onChange={(e) => setVideoQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleSubmit('video')} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Video Query
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="voice">
              <div className="space-y-4 text-center">
                <p className="text-lg font-semibold">Feature Coming Soon!</p>
                <p>Voice chat functionality will be available in a future update.</p>
              </div>
            </TabsContent>
          </Tabs>
          
          {response && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Response:</h3>
              <p className="text-sm">{response}</p>
              {audioUrl && (
                <audio controls src={audioUrl} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MultiModalChat;
