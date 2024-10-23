import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import ReadingGroup from './components/ReadingGroup';
import './styles/styles.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="reading-group" element={<ReadingGroup />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;