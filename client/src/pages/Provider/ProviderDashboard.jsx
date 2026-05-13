import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { bookingsAPI, servicesAPI, reviewsAPI, providersAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const CAT_ICONS = {
  plumbing:'🔧', electrical:'⚡', cleaning:'🧹', carpentry:'🪚',
  painting:'🎨', ac:'❄️', gardening:'🌿', pest:'🐛', other:'🔨',
};

export default function ProviderDashboard() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('');
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');

  // ── Stats
  const { data: statsData } = useQuery({
    queryKey: ['provider-stats'],
    queryFn: () => bookingsAPI.getProviderStats().then(r => r.data.stats),
  });

  // ── Bookings
  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ['provider-bookings', statusFilter],
    queryFn: () => bookingsAPI.getProviderBookings({ status: statusFilter || undefined }).then(r => r.data),
    enabled: tab === 'overview' || tab === 'bookings',
  });


  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ['my-services'],
    queryFn: () => servicesAPI.getMyServices().then(r => r.data),
    enabled: tab === 'services',
  });


  const { data: profileData } = useQuery({
    queryKey: ['my-provider-profile'],
    queryFn: () => providersAPI.getMyProfile().then(r => r.data),
  });

  const providerId = profileData?.provider?._id;

  const { data: reviewsData, isLoading: loadingReviews } = useQuery({
    queryKey: ['provider-reviews', providerId],
    queryFn: () => reviewsAPI.getProviderReviews(providerId).then(r => r.data),
    enabled: !!providerId && tab === 'reviews',
  });


  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => bookingsAPI.updateStatus(id, status),
    onSuccess: () => { toast.success('Booking updated'); qc.invalidateQueries(['provider-bookings']); qc.invalidateQueries(['provider-stats']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const { mutate: deleteService } = useMutation({
    mutationFn: (id) => servicesAPI.delete(id),
    onSuccess: () => { toast.success('Service deleted'); qc.invalidateQueries(['my-services']); },
    onError: () => toast.error('Failed to delete service'),
  });

  const { mutate: toggleAvailability } = useMutation({
    mutationFn: () => providersAPI.toggleAvailability(),
    onSuccess: (res) => { toast.success(res.data.message); qc.invalidateQueries(['my-provider-profile']); },
  });

  const { mutate: submitReply, isLoading: replyLoading } = useMutation({
    mutationFn: ({ id, reply }) => reviewsAPI.reply(id, reply),
    onSuccess: () => {
      toast.success('Reply posted');
      setReplyModal(null);
      setReplyText('');
      qc.invalidateQueries(['provider-reviews']);
    },
    onError: () => toast.error('Failed to post reply'),
  });

  const bookings = bookingsData?.bookings || [];
  const services = servicesData?.services || [];
  const reviews = reviewsData?.reviews || [];
  const stats = statsData || {};
  const isAvailable = profileData?.provider?.isAvailable;

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-display font-bold text-3xl mb-1">Provider Dashboard 🔧</h2>
          <p className="text-white/40 text-sm">{user?.name} · Service Provider</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleAvailability()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
              isAvailable
                ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-red-400'}`} />
            {isAvailable ? 'Available' : 'Unavailable'}
          </button>
          <Link
            to="/provider/add-service"
            className="bg-brand hover:bg-brand-light text-[#0a0a0f] font-bold text-sm px-5 py-2 rounded-xl transition"
          >
            + Add Service
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Earnings', val: `₹${stats.totalEarnings || 0}`, icon: '💰', change: 'Lifetime' },
          { label: 'Total Bookings', val: stats.total || 0, icon: '📋', change: `${stats.pending || 0} pending` },
          { label: 'Completed Jobs', val: stats.completedJobs || 0, icon: '✅', change: 'All time' },
          { label: 'Rating', val: stats.rating?.average ? `${stats.rating.average} ★` : 'No ratings', icon: '⭐', change: `${stats.rating?.count || 0} reviews` },
        ].map(s => (
          <div key={s.label} className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">{s.label}</p>
            <p className="font-display font-bold text-2xl mb-1">{s.val}</p>
            <p className="text-xs text-green-400">{s.change}</p>
            <span className="absolute right-4 top-4 text-3xl opacity-10">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Booking mini-stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Pending', val: stats.pending || 0, color: 'text-yellow-400' },
          { label: 'Confirmed', val: stats.confirmed || 0, color: 'text-green-400' },
          { label: 'Completed', val: stats.completed || 0, color: 'text-blue-400' },
          { label: 'Cancelled', val: stats.cancelled || 0, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#14141f] border border-white/[0.05] rounded-xl p-3 text-center">
            <p className={`font-display font-bold text-xl ${s.color}`}>{s.val}</p>
            <p className="text-xs text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1a1a26] rounded-xl p-1 w-fit mb-6 flex-wrap">
        {[
          { id: 'overview', label: '📋 Bookings' },
          { id: 'services', label: '🔧 My Services' },
          { id: 'reviews', label: '⭐ Reviews' },
          { id: 'profile', label: '👤 Profile' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-[#1e1e2e] text-white shadow' : 'text-white/40 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BOOKINGS TAB ── */}
      {tab === 'overview' && (
        <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.07] flex-wrap gap-3">
            <h3 className="font-display font-bold text-lg">Incoming Bookings</h3>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#1a1a26] border border-white/10 rounded-lg text-white/50 text-xs px-3 py-1.5 outline-none cursor-pointer">
              <option value="">All Status</option>
              {['pending','confirmed','in_progress','completed','cancelled'].map(s => (
                <option key={s} value={s}>{s.replace('_',' ')}</option>
              ))}
            </select>
          </div>

          {loadingBookings ? (
            <div className="p-8 text-center text-white/30 animate-pulse">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-4xl mb-3 opacity-30">📭</p>
              <p className="text-white/30 font-display font-bold">No bookings yet</p>
              <p className="text-white/20 text-sm mt-1">Add services to start receiving bookings</p>
            </div>
          ) : (
            bookings.map(b => (
              <div key={b._id} className="flex items-center gap-4 p-5 border-b border-white/[0.05] hover:bg-white/[0.02] transition last:border-b-0 flex-wrap">
                {/* User avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-[#0a0a0f] text-sm font-bold flex-shrink-0">
                  {b.user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{b.user?.name}</p>
                  <p className="text-xs text-white/30 mt-0.5 truncate">
                    {b.service?.title} · 📅 {new Date(b.bookingDate).toLocaleDateString('en-IN')} · ⏰ {b.timeSlot}
                  </p>
                  <p className="text-xs text-white/20 mt-0.5">📍 {b.address?.city}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <span className="font-bold text-sm">₹{b.payment?.amount}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[b.status]}`}>
                    {b.status.replace('_',' ')}
                  </span>
                  {/* Action buttons based on status */}
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus({ id: b._id, status: 'confirmed' })}
                        className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-1 rounded-lg hover:bg-green-500/20 transition font-semibold">
                        Accept
                      </button>
                      <button onClick={() => updateStatus({ id: b._id, status: 'cancelled' })}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/20 transition font-semibold">
                        Decline
                      </button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus({ id: b._id, status: 'in_progress' })}
                      className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-lg hover:bg-blue-500/20 transition font-semibold">
                      Start Job
                    </button>
                  )}
                  {b.status === 'in_progress' && (
                    <button onClick={() => updateStatus({ id: b._id, status: 'completed' })}
                      className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-3 py-1 rounded-lg hover:bg-indigo-500/20 transition font-semibold">
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/*  SERVICES TAB */}
      {tab === 'services' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/40 text-sm">{services.length} service{services.length !== 1 ? 's' : ''} listed</p>
            <Link to="/provider/add-service"
              className="bg-brand hover:bg-brand-light text-[#0a0a0f] font-bold text-sm px-5 py-2 rounded-xl transition">
              + Add New Service
            </Link>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2].map(i => <div key={i} className="h-32 bg-[#14141f] rounded-2xl animate-pulse border border-white/[0.05]" />)}
            </div>
          ) : services.length === 0 ? (
            <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-16 text-center">
              <p className="text-4xl mb-3 opacity-30">🔧</p>
              <p className="text-white/40 font-display font-bold text-lg">No services yet</p>
              <p className="text-white/25 text-sm mt-1 mb-4">Add your first service to start getting bookings</p>
              <Link to="/provider/add-service" className="bg-brand text-[#0a0a0f] font-bold text-sm px-6 py-2.5 rounded-xl inline-block hover:bg-brand-light transition">
                Add Service
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(s => (
                <div key={s._id} className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-5 hover:border-white/15 transition">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                      {s.images?.[0]?.url
                        ? <img src={s.images[0].url} className="w-full h-full object-cover rounded-xl" alt="" />
                        : CAT_ICONS[s.category] || '🔨'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-sm truncate">{s.title}</h4>
                      <p className="text-xs text-brand/70 uppercase tracking-wider mt-0.5">{s.category}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${s.isAvailable ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {s.isAvailable ? 'Live' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs line-clamp-2 mb-3">{s.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold">₹{s.price}</span>
                      <span className="text-white/30 text-xs">·</span>
                      <span className="text-white/40 text-xs">{s.duration}</span>
                      {s.rating?.count > 0 && (
                        <>
                          <span className="text-white/30 text-xs">·</span>
                          <span className="text-brand text-xs">★ {s.rating.average} ({s.rating.count})</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => { if (confirm('Delete this service?')) deleteService(s._id); }}
                      className="text-xs text-red-400/50 hover:text-red-400 transition"
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVIEWS TAB */}
      {tab === 'reviews' && (
        <div className="space-y-4">
          {loadingReviews ? (
            <div className="text-white/30 text-center py-8 animate-pulse">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-16 text-center">
              <p className="text-4xl mb-3 opacity-30">⭐</p>
              <p className="text-white/40 font-display font-bold">No reviews yet</p>
              <p className="text-white/25 text-sm mt-1">Complete bookings to receive reviews</p>
            </div>
          ) : (
            reviews.map(r => (
              <div key={r._id} className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1a1a26] flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {r.user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.user?.name}</p>
                      <p className="text-xs text-white/30">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-brand text-sm flex-shrink-0">
                    {'★'.repeat(r.rating)}<span className="text-white/20">{'★'.repeat(5-r.rating)}</span>
                  </div>
                </div>
                {r.service?.title && (
                  <p className="text-xs text-brand/60 mb-2">For: {r.service.title}</p>
                )}
                <p className="text-white/60 text-sm leading-relaxed mb-3">{r.comment}</p>

                {r.providerReply ? (
                  <div className="bg-white/5 border border-white/[0.07] rounded-xl p-3">
                    <p className="text-xs text-brand font-semibold mb-1">Your Reply</p>
                    <p className="text-white/50 text-sm">{r.providerReply.text}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => { setReplyModal(r._id); setReplyText(''); }}
                    className="text-xs text-brand/60 hover:text-brand transition font-medium"
                  >
                    + Reply to this review
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-6 flex items-center gap-6 flex-wrap">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-[#0a0a0f] font-display font-bold text-2xl border-2 border-brand flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-xl mb-1">{user?.name}</h3>
              <p className="text-brand text-xs font-bold uppercase tracking-wider mb-2">
                Service Provider · {profileData?.provider?.category}
              </p>
              <p className="text-white/40 text-sm mb-1">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  profileData?.provider?.isVerified && '✅ Verified',
                  profileData?.provider?.rating?.count > 0 && `⭐ ${profileData.provider.rating.average} Rating`,
                  profileData?.provider?.location?.city && `📍 ${profileData.provider.location.city}`,
                  profileData?.provider?.experience && `${profileData.provider.experience} yrs exp`,
                  profileData?.provider?.completedJobs && `${profileData.provider.completedJobs} jobs done`,
                ].filter(Boolean).map(chip => (
                  <span key={chip} className="bg-[#1a1a26] border border-white/10 text-white/40 text-xs px-3 py-1 rounded-full">{chip}</span>
                ))}
              </div>
            </div>
          </div>

          {profileData?.provider?.bio && (
            <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-white/30 mb-2">About</p>
              <p className="text-white/60 text-sm leading-relaxed">{profileData.provider.bio}</p>
            </div>
          )}

          <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-white/30 mb-3">Quick Stats</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Jobs Done', val: profileData?.provider?.completedJobs || 0 },
                { label: 'Rating', val: profileData?.provider?.rating?.average || '–' },
                { label: 'Reviews', val: profileData?.provider?.rating?.count || 0 },
              ].map(s => (
                <div key={s.label}>
                  <p className="font-display font-bold text-2xl text-brand">{s.val}</p>
                  <p className="text-xs text-white/30 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setReplyModal(null)}>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg mb-4">Reply to Review</h3>
            <textarea
              rows={4}
              placeholder="Write your professional reply..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand transition resize-none placeholder:text-white/20 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => submitReply({ id: replyModal, reply: replyText })}
                disabled={!replyText.trim() || replyLoading}
                className="flex-1 bg-brand hover:bg-brand-light text-[#0a0a0f] font-bold py-2.5 rounded-xl transition disabled:opacity-40"
              >
                {replyLoading ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                onClick={() => setReplyModal(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 font-medium py-2.5 rounded-xl transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
