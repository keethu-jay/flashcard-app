import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './routes/Home';
import Library from './routes/Library';
import EditCards from './routes/EditCards';
import GenerationInput from './routes/GenerationInput';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Library />} />
            <Route path="/edit-cards" element={<EditCards />} />
            <Route path="/generate" element={<GenerationInput />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
