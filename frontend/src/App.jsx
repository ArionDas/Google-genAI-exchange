import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom'
import { Button } from "./components/ui/button"
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import AlgorithmList from './components/AlgorithmList'
import AlgorithmEditor from './components/AlgorithmEditor'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CodeEditor from './components/CodeEditor'
import SortingVisualizer from './components/SortingVisualizer'
import AIChat from './components/AIChat'
import MCQGenerator from './components/MCQGenerator'
import ResourcesDisplay from './components/ResourcesDisplay'
import ProfilePage from './components/ProfilePage'

// Create a client
const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const handleLogout = () => {
    setUser(null)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
          <header className="p-5 bg-white shadow-md">
            <nav className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">Socrates Learning</h1>
              <div className="space-x-4">
                <Link to="/"><Button variant="ghost">Home</Button></Link>
                {user ? (
                  <>
                    <span>Welcome, {user.name}</span>
                    <Link to="/profile" > <Button variant="solid">Profile</Button></Link>
                    
                    <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login"><Button variant="ghost">Login</Button></Link>
                    <Link to="/signup"><Button variant="ghost">Signup</Button></Link>
                  </>
                )}
              </div>
            </nav>
          </header>

          <main className="container mx-auto mt-16 px-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login user={user} setUser={setUser} />} />
              <Route path="/signup" element={<Signup setUser={setUser} />} />
              <Route path="/algorithms" element={<AlgorithmList />} />
              <Route path="/algorithm/:algoName" element={<AlgorithmEditor />} />
              <Route path="/code-editor" element={<CodeEditor />} />
              <Route path="/visualizer/:algoName" element={<SortingVisualizer />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/mcq-generator" element={<MCQGenerator />} />
              <Route path="/resources" element={<ResourcesDisplay />} />
              <Route path="/profile" element={<ProfilePage></ProfilePage>} />
            </Routes>
          </main>

          <footer className="bg-gray-100 py-8 mt-16">
            <div className="container mx-auto text-center text-gray-600">
              <p>&copy; 2024 Socrates Learning. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
