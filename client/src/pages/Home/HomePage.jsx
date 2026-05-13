import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { servicesAPI } from '../../services/api';
import ServiceCard from './ServiceCard';
import BookingModal from './BookingModal';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'carpentry', name: 'Carpentry', icon: '🪚' },
  { id: 'painting', name: 'Painting', icon: '🎨' },
  { id: 'ac', name: 'AC Repair', icon: '❄️' },
  { id: 'gardening', name: 'Gardening', icon: '🌿' },
  { id: 'pest', name: 'Pest Control', icon: '🐛' },
];

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'popular', label: '🔥 Popular' },
  { key: 'verified', label: '✓ Verified' },
  { key: 'toprated', label: '⭐ Top Rated' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Latest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Booked' },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [selectedService, setSelectedService] = useState(null);


  const params = {
    search: search || undefined,
    category: category || undefined,
    popular: filter === 'popular' ? 'true' : undefined,
    verified: filter === 'verified' ? 'true' : undefined,
    rating: filter === 'toprated' ? 4.8 : undefined,
    sortBy: sortBy || undefined,
    page,
    limit: 9,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['services', params],
    queryFn: () => servicesAPI.getAll(params).then((r) => r.data),
    keepPreviousData: true,
  });

  const handleBookClick = (service) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book a service');
      navigate('/login');
      return;
    }
    if (user?.role === 'provider') {
      toast.error('Providers cannot book services');
      return;
    }
    setSelectedService(service);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full bg-brand blur-[100px] opacity-10 -top-24 left-1/2" />
          <div className="absolute w-72 h-72 rounded-full bg-accent blur-[80px] opacity-10 top-32 left-1/4" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 text-sm text-brand mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse inline-block" />
            Trusted by 10,000+ customers
          </div>
          <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight tracking-tight mb-5">
            Book Local Services<br />
            in <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">Minutes</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10 font-light">
            Find trusted professionals near you for plumbing, electrical, cleaning, and 100+ more services.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 bg-[#1e1e2e] border border-white/10 rounded-xl p-2 max-w-xl mx-auto shadow-2xl">
            <span className="text-lg flex items-center pl-2">🔍</span>
            <input
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
              placeholder="Search services or providers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <select
              className="bg-[#1a1a26] border border-white/10 rounded-lg text-white/60 text-sm px-3 py-2 outline-none cursor-pointer"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-brand hover:bg-brand-light text-[#0a0a0f] font-semibold text-sm px-5 py-2 rounded-lg transition">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">Browse by Category</p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCategory(category === c.id ? '' : c.id); setPage(1); }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition cursor-pointer ${
                category === c.id
                  ? 'border-brand/60 bg-brand/10 text-brand'
                  : 'border-white/[0.07] bg-[#14141f] text-white/50 hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-xs font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-1">Available Services</p>
            <p className="text-white/50 text-sm">{data?.total ?? 0} services found</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  filter === f.key
                    ? 'bg-brand text-[#0a0a0f] border-brand'
                    : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
            <select
              className="bg-[#1a1a26] border border-white/10 rounded-lg text-white/50 text-xs px-3 py-1.5 outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#14141f] rounded-2xl h-72 animate-pulse border border-white/[0.05]" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-white/30">Failed to load services. Please try again.</div>
        ) : data?.services?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-white/40 font-display font-bold text-lg">No services found</p>
            <p className="text-white/25 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {data?.services?.map((service, i) => (
                <ServiceCard key={service._id} service={service} delay={i * 50} onBook={handleBookClick} />
              ))}
            </div>

            {/* Pagination */}
            {data?.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(data.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm transition ${
                      page === i + 1
                        ? 'bg-brand text-[#0a0a0f] font-bold'
                        : 'bg-[#1a1a26] text-white/50 hover:text-white border border-white/10'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
