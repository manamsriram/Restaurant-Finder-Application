import { useState } from 'react';
import PropTypes from 'prop-types';
import { apiUrl } from '../lib/api';

const Signup = ({ setShowLogin, setShowSignup }) => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    user_type: 'user'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (userData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (userData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (userData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    setErrors('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    let success = false;
    
    try {
      // Choose endpoint based on user type
      const endpoint = userData.user_type === 'owner'
        ? apiUrl('/users/create_owner')
        : apiUrl('/users/create_users');

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
        }),
      });

      if (response.ok) {
        success = true;
      } else {
        const data = await response.json();
        setErrors({ submit: data.detail || "Registration failed" });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: "Registration failed. Please try again." });
    }

    if (success) {
      alert("Registration successful! Please login.");
      setShowSignup(false);
      setShowLogin(true);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form className='rf-card text-[#1f2421] p-6 rounded-2xl flex flex-col items-stretch gap-5 border border-black/5' 
        onSubmit={handleSubmit}>
        <h1 className='text-3xl'>Create Your Account</h1>
        <p className="text-sm text-[#5b6761] -mt-2">Join to track favorites or publish your own listings.</p>
        
        {errors.submit && (
          <div className="w-full p-2 bg-[#ffe9ed] border border-[#f3b2be] text-[#9c2339] rounded-lg">
            {errors.submit}
          </div>
        )}

        <div className="w-full flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#3f4a45]">Username</label>
          <input 
            className={`bg-[#f8f4ec] appearance-none border ${
              errors.username ? 'border-red-500' : 'border-[#e1d8ca]'
            } rounded-xl w-full py-2 px-4 text-[#1f2421] leading-tight focus:outline-none focus:border-[#167a72]`}
            placeholder='Username'
            type="text"
            name="username"
            value={userData.username}
            onChange={handleChange}
            required
          />
          {errors.username && (
            <p className="text-red-500 text-xs italic">{errors.username}</p>
          )}
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#3f4a45]">Email</label>
          <input 
            className={`bg-[#f8f4ec] appearance-none border ${
              errors.email ? 'border-red-500' : 'border-[#e1d8ca]'
            } rounded-xl w-full py-2 px-4 text-[#1f2421] leading-tight focus:outline-none focus:border-[#167a72]`}
            placeholder='Email'
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs italic">{errors.email}</p>
          )}
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#3f4a45]">Password</label>
          <input 
            className={`bg-[#f8f4ec] appearance-none border ${
              errors.password ? 'border-red-500' : 'border-[#e1d8ca]'
            } rounded-xl w-full py-2 px-4 text-[#1f2421] leading-tight focus:outline-none focus:border-[#167a72]`}
            placeholder='Password'
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <p className="text-red-500 text-xs italic">{errors.password}</p>
          )}
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#3f4a45]">Confirm Password</label>
          <input 
            className={`bg-[#f8f4ec] appearance-none border ${
              errors.confirmPassword ? 'border-red-500' : 'border-[#e1d8ca]'
            } rounded-xl w-full py-2 px-4 text-[#1f2421] leading-tight focus:outline-none focus:border-[#167a72]`}
            placeholder='Confirm Password'
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs italic">{errors.confirmPassword}</p>
          )}
        </div>

        <label className="w-full flex items-center gap-2 text-sm text-[#5b6761] cursor-pointer">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="accent-[#167a72]"
          />
          Show Password
        </label>

        <select 
          className='bg-[#f8f4ec] appearance-none border border-[#e1d8ca] rounded-xl w-full py-2 px-4 text-[#1f2421] leading-tight focus:outline-none focus:border-[#167a72]'
          name="user_type"
          value={userData.user_type}
          onChange={handleChange}
        >
          <option value="user">Customer</option>
          <option value="owner">Restaurant Owner</option>
        </select>

        <button 
          type="submit"
          className='rf-btn rf-btn-primary w-full'
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

Signup.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
  setShowSignup: PropTypes.func.isRequired
};

export default Signup;