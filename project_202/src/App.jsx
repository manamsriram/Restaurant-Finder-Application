import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Body from './components/Body';
import Footer from './components/Footer';
import Business from './pages/Business';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col min-h-screen">
      <Header setSearchTerm={setSearchTerm} />
      <Routes>
        <Route path="/" element={<Body searchTerm={searchTerm} />} />
        <Route path="/business" element={<Business />} />
        <Route path="*" element={
          <div className="flex-grow flex items-center justify-center">
            <h1 className="text-2xl">404 - Page Not Found</h1>
          </div>
        } />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;