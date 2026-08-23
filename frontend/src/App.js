import './App.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/auth" element={<Authentication />} />

          <Route path='/:url' element={<VideoMeetComponent/>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

