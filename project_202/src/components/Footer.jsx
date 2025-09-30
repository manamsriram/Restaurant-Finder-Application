// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-200 p-8 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Restaurant Finder Description */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Restaurant Finder</h2>
          <p className="text-gray-400">
            Discover the best restaurants around you.
          </p>
        </div>
        
        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <ul>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline">Term of Service</a></li>
          </ul>
        </div>
        
        {/* Newsletter Subscribe */}
        <div>
        <h2 className="text-xl font-semibold mb-4">Subscribe to our Newsletter</h2>
        <form className="flex">
            <label htmlFor="newsletter-email" className="sr-only">Email</label>
            <input 
            id="newsletter-email"
            type="email" 
            placeholder="Your email" 
            className="flex-grow p-2 text-gray-800 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            />
            <button 
            type="submit" 
            className="bg-blue-600 text-white p-2 rounded-r-md border-t border-b border-r border-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
            Subscribe
            </button>
        </form>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500">
        &copy; {new Date().getFullYear()} Restaurant Finder. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
