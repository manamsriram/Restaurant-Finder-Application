import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Body from './components/Body';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Business from './pages/Business.jsx';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute.jsx';
import AddNewResturant from './pages/AddNewRestaurant.jsx';
import EditResturantDetail from './pages/EditRestaurantDetail';
import RestaurantDetails from './pages/RestaurantDetails.jsx';
import Admin from './pages/Admin.jsx';

const App = () => {
  return (
    <div className="rf-shell">
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<Body />} />
        <Route path="/business" element={
          <ProtectedRoute><Business /></ProtectedRoute>
        } />
        <Route path="/business/addNew" element={
          <ProtectedRoute><AddNewResturant /></ProtectedRoute>
        } />
        <Route path="/edit/:rid" element={
          <ProtectedRoute><EditResturantDetail /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><Admin /></AdminRoute>
        } />
        <Route path="/restaurant/:rid" element={<RestaurantDetails />} />
        <Route path="*" element={
          <div className="rf-page flex-grow flex items-center justify-center">
            <h1 className="text-2xl">404 - Page Not Found</h1>
          </div>
        } />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
