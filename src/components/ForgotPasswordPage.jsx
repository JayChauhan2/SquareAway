import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Forgot Password - Square Away';
  }, []);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the password reset link.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
      {/* Fluid gradient blobs */}
      <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl -top-20 -left-20 animate-[blob_20s_infinite]"></div>
      <div className="absolute w-80 h-80 bg-gradient-to-br from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl bottom-10 right-10 animate-[blob_25s_infinite]"></div>
      <div className="absolute w-72 h-72 bg-gradient-to-br from-purple-300/25 to-pink-300/25 rounded-full blur-3xl top-1/2 left-1/2 animate-[blob_30s_infinite]"></div>

      {/* Forgot Password Card */}
      <div className="relative z-10 w-full max-w-md p-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/30 flex flex-col items-center">
        <button 
          onClick={() => navigate('/login')}
          className="absolute top-8 left-8 p-2 rounded-full hover:bg-slate-100 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>

        <h1 className="text-4xl font-light text-slate-900 mb-6 text-center">
          Reset Password
        </h1>
        <p className="text-slate-600 text-center mb-8 font-light">
          Enter your email address and we'll send you a link to reset your password
        </p>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="w-full bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="w-full">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full mb-6 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400 shadow-sm transition-all duration-300 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-medium hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-sm text-slate-500 text-center">
          Remembered your password? <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate('/login')}>Log In</span>
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }
      `}</style>
    </div>
  );
}
