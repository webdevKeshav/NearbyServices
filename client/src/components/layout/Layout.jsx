import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const dashLink = user?.role === 'provider' ? '/provider/dashboard' : '/dashboard';
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.07] px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-xl bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
          NearbyServices
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={dashLink} className="text-white/60 hover:text-white text-sm font-medium transition-colors">
                Dashboard
              </Link>
              {user?.role === 'provider' && (
                <Link
                  to="/provider/add-service"
                  className="bg-white/10 border border-white/10 text-sm px-4 py-1.5 rounded-lg hover:bg-white/15 transition"
                >
                  + Add Service
                </Link>
              )}
              <Link
                to={dashLink}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-[#0a0a0f] text-sm font-bold hover:ring-2 ring-brand transition"
                title={user?.name}
              >
                {initials}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-white/50 hover:text-white transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/60 hover:text-white px-4 py-2 transition">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-brand hover:bg-brand-light text-[#0a0a0f] font-semibold text-sm px-5 py-2 rounded-lg transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] py-8 px-6 text-center text-white/30 text-sm">
        © {new Date().getFullYear()} ServeNear · Book local services with confidence
      </footer>
    </div>
  );
}
