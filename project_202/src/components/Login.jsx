import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';

const Login = ({ setShowLogin, setUser }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let loginData = null;
    
    try {
      // Convert the data to URLSearchParams
      const formData = new URLSearchParams();
      formData.append('username', userData.email); // FastAPI expects 'username'
      formData.append('password', userData.password);

      const response = await fetch(apiUrl('/auth/login'), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        loginData = data;
      } else {
        setError(data.detail || 'Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    }

    // Handle successful login outside try/catch to avoid unmount issues
    if (loginData) {
      localStorage.setItem('access_token', loginData.login_access_token);
      localStorage.setItem('user', JSON.stringify(loginData.user_info));
      
      setUser(loginData.user_info);
      setShowLogin(false);
      
      if (loginData.user_info.user_type === 'owner') {
        navigate('/business');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <form 
        className='rf-card text-[#1f2421] p-6 rounded-2xl flex flex-col items-stretch gap-5 border border-black/5' 
        onSubmit={handleSubmit}
      >
        <h1 className='text-3xl'>Welcome Back</h1>
        <p className="text-sm text-[#5b6761] -mt-2">Sign in to review, save, and manage restaurant listings.</p>
        
        {error && (
          <div className="mb-2 w-full p-2 bg-[#ffe9ed] border border-[#f3b2be] text-[#9c2339] rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-[#3f4a45]">Email</label>
          <input
            className='bg-[#f8f4ec] appearance-none border border-[#e1d8ca] rounded-xl w-full py-2 px-4 text-[#1f2421] leading-tight focus:outline-none focus:border-[#167a72]'
            placeholder='Email'
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4 flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-[#3f4a45]">Password</label>
          <input
            className='bg-[#f8f4ec] appearance-none border border-[#e1d8ca] rounded-xl w-full py-2 px-4 text-[#1f2421] leading-tight focus:outline-none focus:border-[#167a72]'
            placeholder='Password'
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
          />
        </div>

        <label className="w-full flex items-center gap-2 mb-4 text-sm text-[#5b6761] cursor-pointer">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="accent-[#167a72]"
          />
          Show Password
        </label>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className='rf-btn rf-btn-primary'
          >
            Log In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;