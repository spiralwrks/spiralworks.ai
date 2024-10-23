import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import ReadingGroup from './components/ReadingGroup';

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