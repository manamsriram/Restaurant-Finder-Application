// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto text-[#f8f7f2] bg-[#1f2421] border-t border-white/10">
      <div className="rf-page grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
        
        {/* Restaurant Finder Description */}
        <div>
          <h2 className="text-2xl mb-4">Restaurant Finder</h2>
          <p className="text-[#b8c6bf] leading-relaxed">
            Discover independent gems and local favorites with a smarter, faster city dining search.
          </p>
        </div>
        
        {/* Quick Links */}
        <div>
          <h2 className="text-2xl mb-4">Quick Links</h2>
          <ul className="space-y-2 text-[#dce6e0]">
            <li><a href="#" className="hover:text-[#f4a300]">About Us</a></li>
            <li><a href="#" className="hover:text-[#f4a300]">Contact</a></li>
            <li><a href="#" className="hover:text-[#f4a300]">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-[#f4a300]">Terms of Service</a></li>
          </ul>
        </div>
        
        {/* Newsletter Subscribe */}
        <div>
        <h2 className="text-2xl mb-4">Weekly Food Drop</h2>
        <form className="flex">
            <label htmlFor="newsletter-email" className="sr-only">Email</label>
            <input 
            id="newsletter-email"
            type="email" 
            placeholder="Your email" 
            className="flex-grow p-2 text-[#1f2421] rounded-l-md border border-white/20 bg-[#fdf8ee] focus:outline-none"
            required
            />
            <button 
            type="submit" 
            className="bg-[#c7522a] text-white p-2 rounded-r-md border-t border-b border-r border-[#c7522a] hover:bg-[#de6f32] transition-colors"
            >
            Subscribe
            </button>
        </form>
        </div>
      </div>

      <div className="py-5 border-t border-white/10 text-center text-[#94a49d]">
        &copy; {new Date().getFullYear()} Restaurant Finder. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
