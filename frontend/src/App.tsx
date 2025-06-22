import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './routes/Home';
import Library from './routes/Library';
import EditCards from './routes/EditCards';
import GenerationInput from './routes/GenerationInput';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Learn from './routes/Learn';
import CreateSet from './routes/CreateSet';
import Memorize from './routes/Memorize';
import MatchingGame from './routes/MatchingGame';
import Quiz from './routes/Quiz';
import Profile from './routes/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/library" 
                element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-cards/:setId" 
                element={
                  <ProtectedRoute>
                    <EditCards />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/generate" 
                element={
                  <ProtectedRoute>
                    <GenerationInput />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/learn/:setId" 
                element={
                  <ProtectedRoute>
                    <Learn />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/learn/:setId/memorize" 
                element={
                  <ProtectedRoute>
                    <Memorize />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/learn/:setId/matching" 
                element={
                  <ProtectedRoute>
                    <MatchingGame />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/learn/:setId/quiz" 
                element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-set" 
                element={
                  <ProtectedRoute>
                    <CreateSet />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
