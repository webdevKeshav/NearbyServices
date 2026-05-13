import { Link } from 'react-router-dom';

export default function ServiceCard({ service, delay = 0, onBook }) {
  const provider = service.provider;
  const providerName = provider?.businessName || provider?.user?.name || 'Provider';
  const isVerified = provider?.isVerified;
  const rating = service.rating?.average || 0;
  const reviewCount = service.rating?.count || 0;
  const imageUrl = service.images?.[0]?.url;

  return (
    <div
      className="bg-[#14141f] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/15 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image / Icon */}
      <div className="h-40 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02]">
        {imageUrl ? (
          <img src={imageUrl} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-5xl">
            {{ plumbing: '🔧', electrical: '⚡', cleaning: '🧹', carpentry: '🪚', painting: '🎨', ac: '❄️', gardening: '🌿', pest: '🐛' }[service.category] || '🔨'}
          </span>
        )}
        {service.isPopular && (
          <span className="absolute top-3 left-3 bg-brand/20 border border-brand/30 text-brand text-xs font-semibold px-2.5 py-1 rounded-full">
            🔥 Popular
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-bold tracking-widest uppercase text-brand/70 mb-1.5">{service.category}</p>
        <Link to={`/services/${service._id}`}>
          <h3 className="font-display font-bold text-base leading-tight mb-1.5 hover:text-brand transition line-clamp-2">
            {service.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-white/40 mb-3">
          <span>👤 {providerName}</span>
          {isVerified && (
            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
              ✓ Verified
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display font-bold text-lg">₹{service.price}</span>
            <span className="text-white/30 text-xs ml-1">/ visit</span>
          </div>
          <div className="flex items-center gap-1 text-brand text-xs">
            <span>★ {rating > 0 ? rating.toFixed(1) : 'New'}</span>
            {reviewCount > 0 && <span className="text-white/30">({reviewCount})</span>}
          </div>
        </div>
        <button
          onClick={() => onBook(service)}
          className="mt-3 w-full bg-brand/10 hover:bg-brand text-brand hover:text-[#0a0a0f] border border-brand/20 hover:border-brand font-semibold text-sm py-2 rounded-xl transition-all duration-200"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
