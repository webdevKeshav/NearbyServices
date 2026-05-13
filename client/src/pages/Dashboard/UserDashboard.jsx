import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function UserDashboard() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState('bookings');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', statusFilter],
    queryFn: () => bookingsAPI.getMyBookings({ status: statusFilter || undefined }).then((r) => r.data),
  });

  const { mutate: cancelBooking } = useMutation({
    mutationFn: (id) => bookingsAPI.cancel(id),
    onSuccess: () => {
      toast.success('Booking cancelled');
      qc.invalidateQueries(['my-bookings']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cancel failed'),
  });

  const bookings = data?.bookings || [];
  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    upcoming: bookings.filter((b) => ['pending', 'confirmed'].includes(b.status)).length,
    spent: bookings.filter((b) => b.status === 'completed').reduce((a, b) => a + (b.payment?.amount || 0), 0),
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="font-display font-bold text-3xl mb-1">Hello, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-white/40">Manage your bookings and profile</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', val: stats.total, icon: '📋' },
          { label: 'Completed', val: stats.completed, icon: '✅' },
          { label: 'Upcoming', val: stats.upcoming, icon: '📅' },
          { label: 'Total Spent', val: `₹${stats.spent}`, icon: '💰' },
        ].map((s) => (
          <div key={s.label} className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">{s.label}</p>
            <p className="font-display font-bold text-2xl">{s.val}</p>
            <span className="absolute right-4 top-4 text-2xl opacity-10">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1a1a26] rounded-xl p-1 w-fit mb-6">
        {['bookings', 'profile'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-[#1e1e2e] text-white shadow' : 'text-white/40 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'bookings' && (
        <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.07]">
            <h3 className="font-display font-bold">My Bookings</h3>
            <div className="flex gap-2">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1a1a26] border border-white/10 rounded-lg text-white/50 text-xs px-3 py-1.5 outline-none cursor-pointer">
                <option value="">All Status</option>
                {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <Link to="/" className="bg-brand text-[#0a0a0f] font-semibold text-xs px-4 py-1.5 rounded-lg hover:bg-brand-light transition">
                + Book New
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-white/30">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3 opacity-40">📋</p>
              <p className="text-white/40 font-display font-bold">No bookings yet</p>
              <Link to="/" className="text-brand text-sm mt-2 inline-block hover:underline">Browse Services →</Link>
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b._id} className="flex items-center gap-4 p-5 border-b border-white/[0.05] hover:bg-white/[0.02] transition last:border-b-0 flex-wrap">
                <div className="w-11 h-11 rounded-xl bg-[#1a1a26] flex items-center justify-center text-xl flex-shrink-0">
                  {{ plumbing: '🔧', electrical: '⚡', cleaning: '🧹', carpentry: '🪚', painting: '🎨', ac: '❄️', gardening: '🌿', pest: '🐛' }[b.service?.category] || '🔨'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{b.service?.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    👤 {b.provider?.user?.name} · 📅 {new Date(b.bookingDate).toLocaleDateString('en-IN')} · ⏰ {b.timeSlot}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-bold text-sm">₹{b.payment?.amount}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[b.status]}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  {['pending', 'confirmed'].includes(b.status) && (
                    <button
                      onClick={() => { if (confirm('Cancel this booking?')) cancelBooking(b._id); }}
                      className="text-xs text-red-400/60 hover:text-red-400 transition"
                    >Cancel</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'profile' && (
        <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-[#0a0a0f] font-display font-bold text-2xl border-2 border-brand flex-shrink-0">
            {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display font-bold text-xl mb-1">{user?.name}</h3>
            <p className="text-brand text-xs font-bold uppercase tracking-wider mb-2">Customer</p>
            <p className="text-white/40 text-sm mb-3">{user?.email}</p>
            <div className="flex flex-wrap gap-2">
              {[user?.phone && `📱 ${user.phone}`, user?.address?.city && `📍 ${user.address.city}`, 'Member since 2025'].filter(Boolean).map((chip) => (
                <span key={chip} className="bg-[#1a1a26] border border-white/10 text-white/40 text-xs px-3 py-1 rounded-full">{chip}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
