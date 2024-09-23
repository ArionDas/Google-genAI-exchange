import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import axios from 'axios';

import { topics } from '@/lib/utils';

const MCQGenerator = () => {
  const [topic, setTopic] = useState('');
  const [noq, setNoq] = useState(5);
  const [level, setLevel] = useState('easy');
  const [mcqs, setMcqs] = useState([]);
  const [step, setStep] = useState(1);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const prefixUrl = `${import.meta.env.VITE_BACKEND_ML_URL}`;
      const uri = `${prefixUrl}/generate-mcqs`;
      const body = { topic, noq, level };
      const config = {
        headers: { 'Content-Type': 'application/json' }
      };

      console.log('MCQs request:', body);

      const response = await axios.post(uri, body, config);
      
      const data = response.data;
      if (data.mcqs && data.mcqs.length > 0) {
        setMcqs(data.mcqs);
        setUserAnswers({});
        setScore(null);
        setStep(4);
      } else {
        throw new Error('No MCQs were generated. Please try again or choose a different topic.');
      }
    } catch (error) {
      console.error('Error generating MCQs:', error);
      setError(error.response?.data?.detail || error.message || 'Failed to generate MCQs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  // const calculateScore = () => {
  //   let correctAnswers = 0;
  //   mcqs.forEach((mcq, index) => {
  //     if (userAnswers[index] === mcq.correct) {
  //       correctAnswers++;
  //     }
  //   });
  //   setScore(correctAnswers);
  //   setStep(5);
  // };

  const calculateScore = async () => {
    let correctAnswers = 0;
  
    // Calculate the score
    mcqs.forEach((mcq, index) => {
      if (userAnswers[index] === mcq.correct) {
        correctAnswers++;
      }
    });
  
    setScore(correctAnswers);
    setStep(5);
  
    // Fetch user details from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
  
    try {
      // Call the backend API to update the quiz count for the specific topic
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update-quizzes/${storedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }), 
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Quiz count updated:', data);
      } else {
        console.error('Error updating quiz count:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select the topic for MCQs:</h2>
            <RadioGroup value={topic} onValueChange={(value) => setTopic(value)}>
              {topics.map((topicItem, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={topicItem} id={`topic${index}`} />
            <Label htmlFor={`topic${index}`}>{topicItem}</Label>
          </div>
              ))}
            </RadioGroup>
            <Button onClick={() => setStep(2)} disabled={!topic}>
              Next
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Choose the number of questions:</h2>
            <RadioGroup defaultValue={noq.toString()} onValueChange={(value) => setNoq(Number(value))}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="r1" />
                <Label htmlFor="r1">5</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="r2" />
                <Label htmlFor="r2">10</Label>
              </div>
            </RadioGroup>
            <Button onClick={() => setStep(3)}>Next</Button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select difficulty level:</h2>
            <RadioGroup defaultValue={level} onValueChange={(value) => setLevel(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="easy" id="r3" />
                <Label htmlFor="r3">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="r4" />
                <Label htmlFor="r4">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hard" id="r5" />
                <Label htmlFor="r5">Hard</Label>
              </div>
            </RadioGroup>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Generating MCQs...' : 'Generate MCQs'}
            </Button>
            {isLoading && <p className="text-sm text-gray-500">Please wait, this may take a moment...</p>}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Answer the MCQs:</h2>
            {mcqs.map((mcq, index) => (
              <Card key={index} className="mb-4">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{`Question ${index + 1}: ${mcq.question}`}</h3>
                  <RadioGroup
                    value={userAnswers[index]?.toString()}
                    onValueChange={(value) => handleAnswerChange(index, Number(value))}
                  >
                    {mcq.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={optionIndex.toString()} id={`q${index}o${optionIndex}`} />
                        <Label htmlFor={`q${index}o${optionIndex}`}>{`${String.fromCharCode(65 + optionIndex)}. ${option}`}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
            <Button onClick={calculateScore}>Submit Answers</Button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Score:</h2>
            <p className="text-lg">{`You answered ${score} out of ${mcqs.length} questions correctly.`}</p>
            <div className="space-y-4">
            <h2 className="text-xl font-semibold">Answer the MCQs:</h2>
            {mcqs.map((mcq, index) => (
              <Card key={index} className="mb-4">
                   {/* <h1>{`hi: ${JSON.stringify(userAnswers)}`}</h1> */}
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{`Question ${index + 1}: ${mcq.question}`}</h3>
                  <RadioGroup
                    value={userAnswers[index]?.toString()}
                  >
                    {mcq.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={optionIndex.toString()} id={`q${index}o${optionIndex}`} />
                        {optionIndex === mcq.correct &&   <Label  htmlFor={`q${index}o${optionIndex}`} style={{color: 'green'}}>{`${String.fromCharCode(65 + optionIndex)}. ${option}`}</Label>
                         }
                      

{optionIndex !== mcq.correct &&  optionIndex===userAnswers[index] &&  <Label  htmlFor={`q${index}o${optionIndex}`} style={{color: 'red'}}>{`${String.fromCharCode(65 + optionIndex)}. ${option}`}</Label>
                         }

                          {optionIndex !== mcq.correct && optionIndex!==userAnswers[index] &&
                        <Label  htmlFor={`q${index}o${optionIndex}`}>{`${String.fromCharCode(65 + optionIndex)}. ${option}`}</Label>
                          }
                      
                </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>
            <Button onClick={() => setStep(1)}>Generate New MCQs</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">MCQ Generator</h1>
      {renderStep()}
    </div>
  );
};

export default MCQGenerator;