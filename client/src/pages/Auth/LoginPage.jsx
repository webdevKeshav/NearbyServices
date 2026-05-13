import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result.success) {
      toast.success('Welcome back!');
      const user = useAuthStore.getState().user;
      navigate(user?.role === 'provider' ? '/provider/dashboard' : '/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="bg-[#14141f] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-4xl mb-4">👋</div>
        <h2 className="font-display font-bold text-2xl mb-1">Welcome Back</h2>
        <p className="text-white/40 text-sm mb-6">Sign in to your ServeNear account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">Email</label>
            <input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition placeholder:text-white/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">Password</label>
            <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition placeholder:text-white/20" />
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full bg-brand hover:bg-brand-light text-[#0a0a0f] font-bold py-3 rounded-xl mt-2 transition disabled:opacity-50">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand hover:underline font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', category: '', city: '', businessName: '' });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const result = await register({ ...form, role });
    if (result.success) {
      toast.success(`Welcome, ${form.name}!`);
      navigate(role === 'provider' ? '/provider/dashboard' : '/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="bg-[#14141f] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <h2 className="font-display font-bold text-2xl mb-1">Create Account</h2>
        <p className="text-white/40 text-sm mb-6">Join ServeNear today</p>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[{ v: 'user', label: '👤 I need services' }, { v: 'provider', label: '🔧 I provide services' }].map((r) => (
            <button key={r.v} type="button" onClick={() => setRole(r.v)}
              className={`py-3 rounded-xl border text-sm font-medium transition ${role === r.v ? 'border-brand bg-brand/10 text-brand' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { key: 'name', label: 'Full Name', placeholder: 'Your Name', type: 'text' },
            { key: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email' },
            { key: 'password', label: 'Password', placeholder: 'Min. 6 characters', type: 'password' },
            { key: 'phone', label: 'Phone (optional)', placeholder: '10-digit number', type: 'tel' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]} onChange={(e) => set(key, e.target.value)} required={key !== 'phone'}
                className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition placeholder:text-white/20" />
            </div>
          ))}

          {role === 'provider' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">Business Name</label>
                <input placeholder="Your business name" value={form.businessName} onChange={(e) => set('businessName', e.target.value)}
                  className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition placeholder:text-white/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">Service Category</label>
                <select required value={form.category} onChange={(e) => set('category', e.target.value)}
                  className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition cursor-pointer text-white">
                  <option value="">Select category</option>
                  {['plumbing','electrical','cleaning','carpentry','painting','ac','gardening','pest'].map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">City</label>
                <input placeholder="e.g. Bhopal, MP" value={form.city} onChange={(e) => set('city', e.target.value)}
                  className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition placeholder:text-white/20" />
              </div>
            </>
          )}

          <button type="submit" disabled={isLoading}
            className="w-full bg-brand hover:bg-brand-light text-[#0a0a0f] font-bold py-3 rounded-xl mt-2 transition disabled:opacity-50">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
