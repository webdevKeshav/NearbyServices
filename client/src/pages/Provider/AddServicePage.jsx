import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { servicesAPI } from '../../services/api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'plumbing',   label: 'Plumbing',      icon: '🔧' },
  { id: 'electrical', label: 'Electrical',     icon: '⚡' },
  { id: 'cleaning',   label: 'Cleaning',       icon: '🧹' },
  { id: 'carpentry',  label: 'Carpentry',      icon: '🪚' },
  { id: 'painting',   label: 'Painting',       icon: '🎨' },
  { id: 'ac',         label: 'AC Repair',      icon: '❄️' },
  { id: 'gardening',  label: 'Gardening',      icon: '🌿' },
  { id: 'pest',       label: 'Pest Control',   icon: '🐛' },
  { id: 'other',      label: 'Other',          icon: '🔨' },
]

const PRICE_TYPES = [
  { value: 'fixed',          label: 'Fixed Price' },
  { value: 'hourly',         label: 'Per Hour' },
  { value: 'starting_from',  label: 'Starting From' },
]

const DURATIONS = [
  '30 mins', '1 hr', '1-2 hrs', '2-3 hrs', '3-4 hrs',
  '4-6 hrs', 'Half day', '1 day', '2-3 days', 'Custom',
]

export default function AddServicePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    '',
    price:       '',
    priceType:   'fixed',
    duration:    '',
    tags:        '',
  })
  const [images, setImages]     = useState([])           
  const [previews, setPreviews] = useState([])
  const [errors, setErrors]     = useState({})

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }


  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setImages(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.category)           e.category    = 'Category is required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
                                  e.price       = 'Enter a valid price'
    if (!form.duration)           e.duration    = 'Duration is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }


  const { mutate, isLoading } = useMutation({
    mutationFn: (fd) => servicesAPI.create(fd),
    onSuccess: () => {
      toast.success('Service created successfully! 🎉')
      qc.invalidateQueries(['my-services'])
      navigate('/provider/dashboard')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create service')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    images.forEach(img => fd.append('images', img))
    mutate(fd)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition"
      >
        ← Back to Dashboard
      </button>

      <h1 className="font-display font-bold text-3xl mb-1">Add New Service</h1>
      <p className="text-white/40 text-sm mb-8">Fill in the details below to list your service</p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Service Title */}
        <Field label="Service Title" error={errors.title}>
          <input
            type="text"
            placeholder="e.g. Full Home Plumbing Repair"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            className={inputCls(errors.title)}
          />
        </Field>

        {/* Category */}
        <div>
          <label className={labelCls}>Category <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => set('category', c.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                  form.category === c.id
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white'
                }`}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
        </div>

        {/* Description */}
        <Field label="Description" error={errors.description}>
          <textarea
            rows={4}
            placeholder="Describe your service in detail — what's included, what tools you use, etc."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className={inputCls(errors.description) + ' resize-none'}
          />
          <p className="text-white/20 text-xs mt-1 text-right">{form.description.length}/1000</p>
        </Field>

        {/* Price & Type */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹)" error={errors.price}>
            <input
              type="number"
              min="0"
              placeholder="e.g. 599"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              className={inputCls(errors.price)}
            />
          </Field>
          <Field label="Price Type">
            <select
              value={form.priceType}
              onChange={e => set('priceType', e.target.value)}
              className={inputCls()}
            >
              {PRICE_TYPES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Duration */}
        <Field label="Estimated Duration" error={errors.duration}>
          <select
            value={form.duration}
            onChange={e => set('duration', e.target.value)}
            className={inputCls(errors.duration)}
          >
            <option value="">Select duration</option>
            {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>

        {/* Tags */}
        <Field label="Tags (optional)" hint="Comma separated — helps users find your service">
          <input
            type="text"
            placeholder="e.g. leak fix, pipe repair, emergency"
            value={form.tags}
            onChange={e => set('tags', e.target.value)}
            className={inputCls()}
          />
        </Field>

        {/* Images */}
        <div>
          <label className={labelCls}>
            Service Images <span className="text-white/30 font-normal text-xs">(up to 5)</span>
          </label>
          <div className="mt-2 grid grid-cols-5 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xl transition"
                >×</button>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-brand/50 flex flex-col items-center justify-center cursor-pointer transition group">
                <span className="text-2xl text-white/20 group-hover:text-brand/50 transition">+</span>
                <span className="text-xs text-white/20 mt-1">Add photo</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              </label>
            )}
          </div>
          <p className="text-white/20 text-xs mt-2">
            Supported: JPG, PNG, WEBP · Max 5MB each
          </p>
        </div>

        {/* Submit */}
        <div className="pt-2 flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-brand hover:bg-yellow-400 text-[#0a0a0f] font-bold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Publishing…' : '🚀 Publish Service'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-xl transition text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// Small helper components
function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className={labelCls}>
        {label} {label && !label.includes('optional') && <span className="text-red-400">*</span>}
      </label>
      {hint && <p className="text-white/25 text-xs mb-1.5">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

const labelCls = 'block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5'

const inputCls = (err = '') =>
  `w-full bg-[#1a1a26] border rounded-xl px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 ${
    err ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-brand'
  }`
