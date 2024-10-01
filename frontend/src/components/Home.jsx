import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Link, useNavigate } from "react-router-dom"

function Home() {
  const [topic, setTopic] = useState('');
  const navigate = useNavigate();

  const handleTopicSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      navigate(`/resources?topic=${encodeURIComponent(topic)}`);
    }
  };

  return (
    <>
      <section className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Welcome to Socratic Learning</h2>
        <p className="text-xl text-gray-600 mb-8">Discover the power of innovative education in Sorting Algorithms</p>
        <div className="space-x-4">
          <Link to="/code-editor">
            <Button variant="outline" size="lg">Try Our Code Editor</Button>
          </Link>
          <Link to="/algorithms">
            <Button variant="outline" size="lg">Explore Algorithms</Button>
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16">


        {/* <Card>
          <CardHeader>
            <CardTitle>Personalized Learning</CardTitle>
            <CardDescription>Master sorting algorithms at your own pace</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Explore a variety of sorting algorithms, from basic to advanced. Our platform adapts to your learning style and progress.</p>
          </CardContent>
        </Card> */}


        <Link to="/visualizer/bubble-sort" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Interactive Lessons</CardTitle>
              <CardDescription>Visualize the sorting process</CardDescription>
            </CardHeader>
            <CardContent>
              <p> Visualize the sorting process and understand the mechanics behind each algorithm.</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/chat" className="block">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Chat with Socratic Assistant</CardTitle>
            <CardDescription>Ask questions and get answers from our AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Get help with your coding questions, and get answers from our Socratic Assistant.</p>
          </CardContent>
        </Card>
        </Link>

        <Link to="/mcq-generator" className="block">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Evaluate Yourself</CardTitle>
            <CardDescription>Generate custom multiple-choice questions</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create personalized multiple-choice questions on various topics to test your knowledge and enhance your learning.</p>
          </CardContent>
        </Card>
        </Link>

        <Link to="/multimodal-chat" className="block">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Multimodal Chat</CardTitle>
            <CardDescription>Chat with Image, Audio and Video</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Experience seamless communication with our Multimodal Chat, interacting through text, images, audio, and video.</p>
          </CardContent>
        </Card>
        </Link>

      </section>

      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Want to learn something new?</h2>
        <form onSubmit={handleTopicSubmit} className="flex justify-center items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter a topic you want to learn"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit">Search Resources</Button>
        </form>
      </section>
    </>
  )
}

export default Home