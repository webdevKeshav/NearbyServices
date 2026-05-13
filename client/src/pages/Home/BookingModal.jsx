import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingsAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

export default function BookingModal({ service, onClose }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [address, setAddress] = useState({ street: '', city: user?.address?.city || '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [bookingResult, setBookingResult] = useState(null);

  const providerId = service.provider?._id;
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  // Fetch booked slots for selected date
  const { data: slotsData } = useQuery({
    queryKey: ['slots', providerId, date],
    queryFn: () => bookingsAPI.getBookedSlots(providerId, date).then((r) => r.data.bookedSlots),
    enabled: !!date && !!providerId,
  });

  const bookedSlots = slotsData || [];

  const { mutate: createBooking, isLoading } = useMutation({
    mutationFn: (data) => bookingsAPI.create(data),
    onSuccess: (res) => {
      setBookingResult(res.data.booking);
      setStep(3);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    },
  });

  const handleBook = () => {
    if (!address.street || !address.city) {
      toast.error('Please fill in your address');
      return;
    }
    createBooking({
      serviceId: service._id,
      bookingDate: date,
      timeSlot: time,
      address,
      specialInstructions: note,
      paymentMethod,
    });
  };

  if (step === 3) return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#12121a] border border-white/10 rounded-2xl max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display font-bold text-2xl mb-2">Booking Confirmed!</h2>
        <p className="text-white/50 text-sm mb-6">
          Your booking for <strong>{service.title}</strong> on {date} at {time} is confirmed.
        </p>
        <div className="bg-[#1a1a26] rounded-xl p-4 text-sm text-left space-y-2 mb-6">
          <div className="flex justify-between"><span className="text-white/40">Booking ID</span><span className="font-semibold">#{bookingResult?._id?.slice(-8).toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-white/40">Service</span><span className="font-semibold">{service.title}</span></div>
          <div className="flex justify-between"><span className="text-white/40">Date & Time</span><span className="font-semibold">{date} · {time}</span></div>
          <div className="flex justify-between border-t border-white/10 pt-2"><span className="text-white/40">Total</span><span className="font-bold text-brand text-lg">₹{service.price}</span></div>
        </div>
        <button className="w-full bg-brand text-[#0a0a0f] font-bold py-3 rounded-xl" onClick={onClose}>Done</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#12121a] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <p className="text-xs text-brand font-semibold mb-1">Step {step} of 2</p>
            <h2 className="font-display font-bold text-xl">{step === 1 ? 'Select Date & Time' : 'Confirm Booking'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 flex items-center justify-center text-lg transition">×</button>
        </div>

        <div className="p-6">
          {/* Service Info */}
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
              {{ plumbing: '🔧', electrical: '⚡', cleaning: '🧹', carpentry: '🪚', painting: '🎨', ac: '❄️', gardening: '🌿', pest: '🐛' }[service.category] || '🔨'}
            </div>
            <div>
              <p className="font-semibold text-sm font-display">{service.title}</p>
              <p className="text-white/40 text-xs mt-0.5">👤 {service.provider?.businessName} · ⏱ {service.duration}</p>
            </div>
          </div>

          {step === 1 ? (
            <>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">Select Date</label>
                <input type="date" min={minDateStr} value={date} onChange={(e) => { setDate(e.target.value); setTime(''); }}
                  className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition text-white" />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
                  Choose Time Slot {date && <span className="text-brand/60 normal-case tracking-normal font-normal">({bookedSlots.length} booked)</span>}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((t) => {
                    const isBooked = bookedSlots.includes(t);
                    return (
                      <button
                        key={t}
                        disabled={isBooked || !date}
                        onClick={() => setTime(t)}
                        className={`py-2 rounded-lg border text-xs font-medium transition ${
                          isBooked ? 'opacity-30 cursor-not-allowed line-through border-white/5 text-white/30' :
                          !date ? 'opacity-40 cursor-not-allowed border-white/5 text-white/30' :
                          time === t ? 'bg-brand text-[#0a0a0f] border-brand font-bold' :
                          'border-white/10 text-white/60 hover:border-brand/50 hover:text-brand'
                        }`}
                      >{t}</button>
                    );
                  })}
                </div>
                {!date && <p className="text-white/30 text-xs mt-2">Select a date first to see available slots</p>}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">Special Instructions (Optional)</label>
                <textarea rows={2} placeholder="Anything the provider should know..." value={note} onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition text-white resize-none placeholder:text-white/20" />
              </div>

              <button
                onClick={() => date && time ? setStep(2) : toast.error('Please select date and time')}
                className="w-full bg-brand hover:bg-brand-light text-[#0a0a0f] font-bold py-3 rounded-xl transition"
              >
                {date && time ? 'Continue →' : 'Select Date & Time'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">Service Address</label>
                <input placeholder="Street address" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition text-white mb-2 placeholder:text-white/20" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition text-white placeholder:text-white/20" />
                  <input placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition text-white placeholder:text-white/20" />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#1a1a26] rounded-xl p-4 text-sm space-y-2 mb-4">
                {[
                  ['Service', service.title],
                  ['Provider', service.provider?.businessName],
                  ['Date', date], ['Time', time],
                  ['Duration', service.duration],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between"><span className="text-white/40">{l}</span><span className="font-medium">{v}</span></div>
                ))}
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-white/40">Total</span>
                  <span className="font-bold text-brand text-lg">₹{service.price}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition text-white cursor-pointer">
                  <option value="cash">💵 Cash on Service</option>
                  <option value="upi">📱 UPI / GPay / PhonePe</option>
                  <option value="card">💳 Credit / Debit Card</option>
                  <option value="netbanking">🏦 Net Banking</option>
                </select>
              </div>

              <button onClick={handleBook} disabled={isLoading}
                className="w-full bg-brand hover:bg-brand-light text-[#0a0a0f] font-bold py-3 rounded-xl transition disabled:opacity-50">
                {isLoading ? 'Processing...' : `✓ Confirm & Pay ₹${service.price}`}
              </button>
              <button onClick={() => setStep(1)} className="w-full mt-2 bg-white/5 hover:bg-white/10 text-white/60 font-medium py-3 rounded-xl transition text-sm">
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
