import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import './App.css';
import CyberSecurityLanding from './components/CyberSecurityLanding';
import LoginPage from './components/LoginPage';
import DetailsForm from './components/DetailsForm';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FakeNewsDetector from './components/FakeNewsDetector';
import Signup from './components/SignUpPage';
import VideoPage from './components/VideoPage';
import LoadingScreen from './components/LoadingScreen.jsx';

function App() {
  const [loadingDone, setLoadingDone] = useState(() => {
    // if we've seen the loading screen this session, skip it
    return sessionStorage.getItem("truthshield_loading_played") === "true";
  });

  useEffect(() => {
    if (!loadingDone) {
      const timer = setTimeout(() => {
        sessionStorage.setItem("truthshield_loading_played", "true");
        setLoadingDone(true);
      }, 4000); // same as your animation duration
      return () => clearTimeout(timer);
    }
  }, [loadingDone]);

  return (
    <>
      {/* Only show the loading screen the first time */}
      {!loadingDone && <LoadingScreen />}

      {/* Once done, show the main site forever */}
      {loadingDone && (
        <Router>
          <Routes>
            <Route path="/" element={<CyberSecurityLanding />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/details" element={<DetailsForm />} />
            <Route
              path="/fakedetection"
              element={
                <div className='fake-news-container'>
                  <FakeNewsDetector />
                </div>
              }
            />
            <Route path="/video" element={<VideoPage />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
