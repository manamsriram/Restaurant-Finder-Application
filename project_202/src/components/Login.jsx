import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

      const response = await fetch("http://127.0.0.1:8000/auth/login", {
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
        className='border border-black text-black p-4 rounded-md flex flex-col items-center gap-5' 
        onSubmit={handleSubmit}
      >
        <h1 className='text-xl font-bold'>LOG IN</h1>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
            placeholder='Email'
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <input
            className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
            placeholder='Password'
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
          />
        </div>

        <label className="w-full flex items-center gap-2 mb-4 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="accent-green-500"
          />
          Show Password
        </label>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className='shadow bg-green-500 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded'
          >
            Log In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;