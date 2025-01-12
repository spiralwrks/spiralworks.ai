import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './components/Home';
import ReadingGroup from './components/ReadingGroup';
import ThemeToggle from './components/ThemeToggle';
import BlogLayout from './components/Blog/BlogLayout';
import BlogPost from './components/Blog/BlogPost';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="reading-group" element={<ReadingGroup />} />
          </Route>
          <Route path="/blog" element={<BlogLayout />}>
            <Route index element={null} />
            <Route path=":slug/*" element={<BlogPost />} />
          </Route>
        </Routes>
        <ThemeToggle />
      </Router>
    </ThemeProvider>
  );
}

export default App;