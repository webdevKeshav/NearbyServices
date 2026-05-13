import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { servicesAPI, reviewsAPI } from '../../services/api'
import useAuthStore from '../../context/authStore'
import BookingModal from './BookingModal'
import toast from 'react-hot-toast'

const CAT_ICONS = {
  plumbing:'🔧', electrical:'⚡', cleaning:'🧹', carpentry:'🪚',
  painting:'🎨', ac:'❄️', gardening:'🌿', pest:'🐛', other:'🔨',
}

export default function ServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [showBooking, setShowBooking] = useState(false)
  const [activeImg, setActiveImg]     = useState(0)


  const { data: svcData, isLoading, isError } = useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesAPI.getOne(id).then(r => r.data.service),
  })


  const { data: rvData } = useQuery({
    queryKey: ['service-reviews', id],
    queryFn: () => reviewsAPI.getServiceReviews(id).then(r => r.data),
    enabled: !!id,
  })

  const service   = svcData
  const reviews   = rvData?.reviews  || []
  const provider  = service?.provider

  const handleBook = () => {
    if (!isAuthenticated) { toast.error('Please sign in to book'); navigate('/login'); return }
    if (user?.role === 'provider') { toast.error('Providers cannot book services'); return }
    setShowBooking(true)
  }

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-72 bg-[#14141f] rounded-2xl" />
        <div className="h-8 bg-[#14141f] rounded-xl w-2/3" />
        <div className="h-4 bg-[#14141f] rounded w-1/3" />
      </div>
    </div>
  )

  if (isError || !service) return (
    <div className="max-w-5xl mx-auto px-6 py-24 text-center">
      <p className="text-5xl mb-4">😕</p>
      <p className="font-display font-bold text-2xl text-white/60 mb-2">Service not found</p>
      <Link to="/" className="text-brand hover:underline text-sm">← Back to Home</Link>
    </div>
  )

  const images = service.images?.length ? service.images : null
  const rating = service.rating?.average || 0
  const reviewCount = service.rating?.count || 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/30 mb-6">
        <Link to="/" className="hover:text-white transition">Home</Link>
        <span>›</span>
        <span className="capitalize">{service.category}</span>
        <span>›</span>
        <span className="text-white/60 truncate max-w-xs">{service.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COL */}
        <div className="lg:col-span-2 space-y-6">

          {/* Images */}
          <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="h-72 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02]">
              {images ? (
                <img
                  src={images[activeImg]?.url}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl">{CAT_ICONS[service.category]}</span>
              )}
              {service.isPopular && (
                <span className="absolute top-4 left-4 bg-brand/20 border border-brand/30 text-brand text-xs font-bold px-3 py-1 rounded-full">
                  🔥 Popular
                </span>
              )}
            </div>
            {images?.length > 1 && (
              <div className="flex gap-2 p-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${
                      activeImg === i ? 'border-brand' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + Meta */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand/70 mb-2">{service.category}</p>
            <h1 className="font-display font-bold text-3xl leading-tight mb-3">{service.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
              {rating > 0 && (
                <span className="flex items-center gap-1 text-brand font-semibold">
                  ★ {rating.toFixed(1)}
                  <span className="text-white/30 font-normal">({reviewCount} reviews)</span>
                </span>
              )}
              <span>⏱ {service.duration}</span>
              <span>📦 {service.totalBookings || 0} bookings</span>
              {service.priceType !== 'fixed' && (
                <span className="capitalize text-white/30">{service.priceType.replace('_', ' ')}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg mb-3">About this Service</h2>
            <p className="text-white/60 leading-relaxed text-sm">{service.description}</p>
            {service.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {service.tags.map(tag => (
                  <span key={tag} className="bg-white/5 border border-white/10 text-white/40 text-xs px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Provider info */}
          {provider && (
            <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="font-display font-bold text-lg mb-4">Service Provider</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-[#0a0a0f] font-display font-bold text-xl flex-shrink-0">
                  {provider.user?.avatar
                    ? <img src={provider.user.avatar} className="w-full h-full object-cover rounded-full" alt="" />
                    : provider.user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-bold text-base">{provider.businessName || provider.user?.name}</p>
                    {provider.isVerified && (
                      <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-sm mt-0.5 capitalize">{provider.category} specialist</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30 flex-wrap">
                    {provider.rating?.average > 0 && (
                      <span className="text-brand">★ {provider.rating.average} ({provider.rating.count} reviews)</span>
                    )}
                    {provider.completedJobs > 0 && <span>{provider.completedJobs} jobs done</span>}
                    {provider.experience > 0 && <span>{provider.experience} yrs exp</span>}
                    {provider.location?.city && <span>📍 {provider.location.city}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">
                Reviews {reviewCount > 0 && <span className="text-white/30 font-normal text-base">({reviewCount})</span>}
              </h2>
              {rating > 0 && (
                <div className="flex items-center gap-1 text-brand text-lg font-bold">
                  ★ {rating.toFixed(1)}
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-10 text-center">
                <p className="text-3xl mb-2 opacity-30">💬</p>
                <p className="text-white/30 text-sm">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r._id} className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#22223a] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {r.user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{r.user?.name}</p>
                          <p className="text-xs text-white/25">{new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-brand text-sm flex-shrink-0">
                        {'★'.repeat(r.rating)}<span className="text-white/15">{'★'.repeat(5-r.rating)}</span>
                      </div>
                    </div>
                    <p className="text-white/55 text-sm leading-relaxed">{r.comment}</p>
                    {r.providerReply && (
                      <div className="mt-3 bg-white/5 border border-white/[0.07] rounded-xl p-3">
                        <p className="text-xs text-brand font-semibold mb-1">Provider's Reply</p>
                        <p className="text-white/45 text-sm">{r.providerReply.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COL ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-[#14141f] border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Price</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-4xl">₹{service.price}</span>
                <span className="text-white/30 text-sm">
                  {service.priceType === 'hourly' ? '/ hr' : service.priceType === 'starting_from' ? ' onwards' : '/ visit'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {[
                ['⏱ Duration',  service.duration],
                ['📂 Category',  service.category],
                ['📦 Bookings',  `${service.totalBookings || 0} completed`],
                rating > 0 && ['⭐ Rating', `${rating.toFixed(1)} / 5 (${reviewCount} reviews)`],
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-white/[0.05]">
                  <span className="text-white/40">{label}</span>
                  <span className="font-medium capitalize text-right">{val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleBook}
              className="w-full bg-brand hover:bg-yellow-400 text-[#0a0a0f] font-bold py-3.5 rounded-xl transition text-sm"
            >
              Book Now
            </button>

            {!isAuthenticated && (
              <p className="text-center text-xs text-white/25">
                <Link to="/login" className="text-brand hover:underline">Sign in</Link> to book this service
              </p>
            )}

            <div className="bg-white/5 rounded-xl p-3 text-xs text-white/30 text-center leading-relaxed">
              ✓ Verified professionals &nbsp;·&nbsp; ✓ Secure payments &nbsp;·&nbsp; ✓ Easy cancellation
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal service={service} onClose={() => setShowBooking(false)} />
      )}
    </div>
  )
}
