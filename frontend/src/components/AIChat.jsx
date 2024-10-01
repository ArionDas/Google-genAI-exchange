import React, { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Mic, Image, Compass, Camera, HelpCircle, Code } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Input } from './ui/input';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const prefixUrl = `${import.meta.env.VITE_BACKEND_ML_URL}`;
      console.log("prefixUrl", prefixUrl);
      const response = await fetch(`${prefixUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Connection': 'keep-alive',
          'User-Agent': 'AIChat/1.0',
        },
        body: JSON.stringify({
          query: input,
          history: messages.map(msg => ({
            student: msg.role === 'user' ? msg.content : '',
            assistant: msg.role === 'assistant' ? msg.content : ''
          }))
        }),
      });

      console.log("response", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Ai response", data);
      if(data.response.includes("Socratic Assistant")){
        const aiResponse = { role: 'assistant', content: data.response.substring(19) };
        setMessages(prevMessages => [...prevMessages, aiResponse]);
      }
      else{
        const aiResponse = { role: 'assistant', content: data.response };
        setMessages(prevMessages => [...prevMessages, aiResponse]);
      }

    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (input.trim() === '') return;

    setIsLoading(true);
    const prefixUrl = `${import.meta.env.VITE_BACKEND_ML_URL}`;
    const uri= `${prefixUrl}/search`;

    try {
      const response = await fetch(uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Connection': 'keep-alive',
          'User-Agent': 'AIChat/1.0',
        },
        body: JSON.stringify({
          query: input,
          history: []
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
    
      const searchResult = { role: 'assistant', content: data.response };
      setMessages(prevMessages => [...prevMessages, { role: 'user', content: `Search: ${input}` }, searchResult]);
      setInput('');
    } catch (error) {
      console.error('Error fetching search results:', error);
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error while searching. Please try again.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionCards = [
    { text: "Suggest beaches to visit in a city, including details", icon: <Compass className="w-6 h-6" /> },
    { text: "Evaluate and rank common camera categories", icon: <Camera className="w-6 h-6" /> },
    { text: "Create trivia questions about a specific topic", icon: <HelpCircle className="w-6 h-6" /> },
    { text: "Help design a database schema for a business", icon: <Code className="w-6 h-6" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#202124] text-white">
      {/* Header */}
      {messages.length === 0 && (
        <div className="p-4">
          <h1 className="text-6xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Hello, User
            </span>
          </h1>
          <p className="text-2xl text-gray-400 mt-2">How can I help you today?</p>
        </div>
      )}

      {/* Suggestion Cards */}
      {messages.length === 0 && (
        <div className="flex justify-center p-2">
          <div className="grid grid-cols-2 gap-4 md:w-1/2">
            {suggestionCards.map((card, index) => (
              <div key={index} className="bg-[#303134] p-4 rounded-lg flex flex-col h-full">
                <p className="text-sm mb-4">{card.text}</p>
                <div className="self-end bg-[#3c4043] rounded-full p-2">
                  {card.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat messages */}
     {
        messages.length!==0? 
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-lg ${
                message.role === 'user' ? 'bg-blue-600' : 'bg-gray-800'
              }`}>
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>  
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-4 rounded-lg bg-gray-800">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        : <div className="flex  mt-28"></div>
        
     }

      {/* Input area */}
      <div className="p-2 mb-4 flex justify-center item">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2 w-full max-w-2xl">
          <div className="flex-grow relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a prompt here"
              className="w-full bg-[#303134] border-none text-white placeholder-gray-400 rounded-full px-4 py-3 pr-20 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white p-3 ml-8"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;