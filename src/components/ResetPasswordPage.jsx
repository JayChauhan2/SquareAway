import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Set New Password - Square Away';
    
    // In a real scenario, the Supabase session is automatically established
    // when clicking the link, but we should verify the user is "logged in"
    // through the recovery flow.
    if (!user) {
        // We'll give it a moment to load if session is being processed
        const timer = setTimeout(() => {
            if (!user) {
                // If still no user, maybe the link is invalid or expired
                // But let the user try anyway or show a warning
            }
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [user]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
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

      {/* Reset Password Card */}
      <div className="relative z-10 w-full max-w-md p-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/30 flex flex-col items-center">
        <div className="mb-6 p-4 bg-blue-100 rounded-full">
            <Lock className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-4xl font-light text-slate-900 mb-6 text-center">
          New Password
        </h1>
        <p className="text-slate-600 text-center mb-8 font-light">
          Set a secure new password for your account
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

        <form onSubmit={handleUpdatePassword} className="w-full">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full mb-4 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400 shadow-sm transition-all duration-300 disabled:opacity-50"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="w-full mb-6 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400 shadow-sm transition-all duration-300 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-medium hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
            <ShieldCheck className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-8 text-xs text-slate-400 text-center uppercase tracking-wider font-medium">
            Secure Encryption Enabled
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
