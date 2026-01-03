import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('coach');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: role } // This metadata is what triggers your SQL profile creation
      }
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      alert('Verification email sent! Check your inbox to activate your scout profile.');
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-white px-4">
      {/* Visual background element */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 bg-gray-900/40 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">
            Initialize <span className="text-blue-500">Scout</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-bold uppercase tracking-widest">
            Access the Intelligence Network
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-1">Identity (Email)</label>
            <input
              type="email"
              placeholder="name@organization.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-1">Security Key (Password)</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-1">Clearance Level</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white appearance-none cursor-pointer"
            >
              <option value="coach" className="bg-gray-900">Standard Coach (Free)</option>
              <option value="pro" className="bg-gray-900">Pro Coach (Collaborative)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
          Already registered?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Login Here
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">
        Pinnacle Development System v1.0
      </div>
    </div>
  );
}