import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './components/Home';
import AboutPage from './components/AboutPage';
import JobPostings from './components/JobPostings';
import Research from './components/Research';
import ScrollToTop from './components/ScrollToTop';
// import BlogLayout from './components/Blog/BlogLayout';
// import BlogPost from './components/Blog/BlogPost';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="manifesto" element={<AboutPage />} />
            <Route path="careers" element={<JobPostings />} />
            <Route path="research" element={<Research />} />
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