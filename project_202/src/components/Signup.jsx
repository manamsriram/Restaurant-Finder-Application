import { useState } from 'react';
import PropTypes from 'prop-types';

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
        ? "http://127.0.0.1:8000/users/create_owner"
        : "http://127.0.0.1:8000/users/create_users";

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
      <form className='border border-black text-black p-4 rounded-md flex flex-col items-center gap-5' 
        onSubmit={handleSubmit}>
        <h1 className='text-xl font-bold'>Create Account</h1>
        
        {errors.submit && (
          <div className="w-full p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <div className="w-full">
          <input 
            className={`bg-gray-200 appearance-none border-2 ${
              errors.username ? 'border-red-500' : 'border-gray-200'
            } rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500`}
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

        <div className="w-full">
          <input 
            className={`bg-gray-200 appearance-none border-2 ${
              errors.email ? 'border-red-500' : 'border-gray-200'
            } rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500`}
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

        <div className="w-full">
          <input 
            className={`bg-gray-200 appearance-none border-2 ${
              errors.password ? 'border-red-500' : 'border-gray-200'
            } rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500`}
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

        <div className="w-full">
          <input 
            className={`bg-gray-200 appearance-none border-2 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
            } rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500`}
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

        <label className="w-full flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="accent-green-500"
          />
          Show Password
        </label>

        <select 
          className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
          name="user_type"
          value={userData.user_type}
          onChange={handleChange}
        >
          <option value="user">Customer</option>
          <option value="owner">Restaurant Owner</option>
        </select>

        <button 
          type="submit"
          className='shadow bg-green-500 hover:bg-green-600 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded w-full'
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