import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './components/Home';
import AboutPage from './components/AboutPage';
import WaitlistPage from './components/WaitlistPage';
// import BlogLayout from './components/Blog/BlogLayout';
// import BlogPost from './components/Blog/BlogPost';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="waitlist" element={<WaitlistPage />} />
            {/* Blog routes temporarily disabled
            <Route path="blog" element={<BlogLayout />}>
              <Route index element={null} />
              <Route path=":slug/*" element={<BlogPost />} />
            </Route> */}
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;