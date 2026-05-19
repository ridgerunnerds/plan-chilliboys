'use client'

import { useState } from 'react'
import Link from 'next/link'
import { categories, textures, concepts } from '@/lib/data'
import { saveProject, Project } from '@/lib/storage'

/* ─── Step definitions ─── */
type Step = 'category' | 'material' | 'style' | 'size' | 'details' | 'review' | 'success'

interface WizardData {
  category: string
  categorySlug: string
  material: string
  style: string
  size: string
  details: string
  name: string
  email: string
  phone: string
}

const EMPTY: WizardData = {
  category: '',
  categorySlug: '',
  material: '',
  style: '',
  size: '',
  details: '',
  name: '',
  email: '',
  phone: '',
}

const sizes = [
  { label: 'Small', desc: 'Under 1 meter', value: 'small' },
  { label: 'Medium', desc: '1 – 3 meters', value: 'medium' },
  { label: 'Large', desc: 'Over 3 meters', value: 'large' },
  { label: 'Not sure', desc: 'Need guidance', value: 'unknown' },
]

/* ─── Progress bar ─── */
function ProgressBar({ step }: { step: Step }) {
  const order: Step[] = ['category', 'material', 'style', 'size', 'details', 'review']
  const idx = order.indexOf(step)
  const pct = step === 'success' ? 100 : ((idx + 1) / order.length) * 100
  return (
    <div className="w-full bg-steel-800 h-2 rounded-full overflow-hidden mb-8">
      <div
        className="h-full bg-chilliblue-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ─── Step wrapper ─── */
function StepLayout({
  title,
  subtitle,
  step,
  onBack,
  children,
}: {
  title: string
  subtitle: string
  step: Step
  onBack?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <ProgressBar step={step} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          <p className="text-steel-400 text-sm mt-1">{subtitle}</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-chilliblue-300 hover:text-white transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

/* ─── Card option ─── */
function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all min-h-[72px] ${
        selected
          ? 'border-chilliblue-500 bg-chilliblue-900/30'
          : 'border-steel-700 bg-steel-800/40 hover:border-steel-500 hover:bg-steel-800/60'
      }`}
    >
      {children}
    </button>
  )
}

/* ─── Main page ─── */
export default function PlanWizardPage() {
  const [step, setStep] = useState<Step>('category')
  const [data, setData] = useState<WizardData>(EMPTY)

  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((d) => ({ ...d, [key]: value }))
  }

  const next = (s: Step) => setStep(s)
  const back = (s: Step) => setStep(s)

  const submit = async () => {
    const project: Project = {
      id: `proj-${Date.now()}`,
      userId: `guest-${Date.now()}`,
      userName: data.name,
      userEmail: data.email,
      title: `${data.category} — ${data.style}`,
      description: `Category: ${data.category}\nMaterial: ${data.material}\nStyle: ${data.style}\nSize: ${data.size}\nDetails: ${data.details}`,
      phone: data.phone || undefined,
      status: 'pending',
      feedback: [],
      createdAt: new Date().toISOString(),
    }
    await saveProject(project)
    setStep('success')
  }

  /* ─── Step: Category ─── */
  if (step === 'category') {
    return (
      <StepLayout title="What do you want to build?" subtitle="Select the type of project." step="category">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {categories.map((cat) => (
            <OptionCard
              key={cat.slug}
              selected={data.categorySlug === cat.slug}
              onClick={() => {
                update('category', cat.name)
                update('categorySlug', cat.slug)
                next('material')
              }}
            >
              <h3 className="font-bold text-white text-base md:text-lg">{cat.name}</h3>
              <p className="text-steel-400 text-sm mt-1">{cat.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {cat.materials.slice(0, 2).map((m) => (
                  <span key={m} className="text-[10px] bg-steel-700 text-steel-300 px-2 py-0.5 rounded">
                    {m}
                  </span>
                ))}
              </div>
            </OptionCard>
          ))}
        </div>
      </StepLayout>
    )
  }

  /* ─── Step: Material ─── */
  if (step === 'material') {
    return (
      <StepLayout
        title="Choose a finish"
        subtitle="Pick the material or texture you prefer."
        step="material"
        onBack={() => back('category')}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {textures.map((t) => (
            <OptionCard
              key={t.name}
              selected={data.material === t.name}
              onClick={() => {
                update('material', t.name)
                next('style')
              }}
            >
              <div
                className="w-full h-16 md:h-20 rounded-lg mb-2 border border-steel-600"
                style={{
                  backgroundColor: t.color,
                  backgroundImage: `url(${t.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <p className="text-sm font-medium text-white text-center">{t.name}</p>
            </OptionCard>
          ))}
          <OptionCard
            selected={data.material === 'Other / Not sure'}
            onClick={() => {
              update('material', 'Other / Not sure')
              next('style')
            }}
          >
            <div className="w-full h-16 md:h-20 rounded-lg mb-2 border border-steel-600 bg-steel-700 flex items-center justify-center">
              <span className="text-steel-400 text-2xl">?</span>
            </div>
            <p className="text-sm font-medium text-white text-center">Other / Not sure</p>
          </OptionCard>
        </div>
      </StepLayout>
    )
  }

  /* ─── Step: Style ─── */
  if (step === 'style') {
    return (
      <StepLayout
        title="Pick a style"
        subtitle="Which design direction fits your vision?"
        step="style"
        onBack={() => back('material')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {concepts.map((c) => (
            <OptionCard
              key={c.title}
              selected={data.style === c.title}
              onClick={() => {
                update('style', c.title)
                next('size')
              }}
            >
              <h3 className="font-bold text-white text-base md:text-lg">{c.title}</h3>
              <p className="text-steel-400 text-sm mt-1">{c.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {c.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-chilliblue-900 text-chilliblue-300 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </OptionCard>
          ))}
          <OptionCard
            selected={data.style === 'Custom / Other'}
            onClick={() => {
              update('style', 'Custom / Other')
              next('size')
            }}
          >
            <h3 className="font-bold text-white text-base md:text-lg">Custom / Other</h3>
            <p className="text-steel-400 text-sm mt-1">Have something else in mind? We can design it together.</p>
          </OptionCard>
        </div>
      </StepLayout>
    )
  }

  /* ─── Step: Size ─── */
  if (step === 'size') {
    return (
      <StepLayout
        title="Approximate size"
        subtitle="Help us understand the scope."
        step="size"
        onBack={() => back('style')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
          {sizes.map((s) => (
            <OptionCard
              key={s.value}
              selected={data.size === s.label}
              onClick={() => {
                update('size', s.label)
                next('details')
              }}
            >
              <h3 className="font-bold text-white text-lg">{s.label}</h3>
              <p className="text-steel-400 text-sm">{s.desc}</p>
            </OptionCard>
          ))}
        </div>
      </StepLayout>
    )
  }

  /* ─── Step: Details ─── */
  if (step === 'details') {
    return (
      <StepLayout
        title="Project details"
        subtitle="Any extra info that helps us quote accurately."
        step="details"
        onBack={() => back('size')}
      >
        <div className="max-w-2xl mx-auto">
          <textarea
            className="input w-full h-40 resize-none"
            placeholder="Describe dimensions, location, budget range, timeline, reference images, or anything else..."
            value={data.details}
            onChange={(e) => update('details', e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={() => next('review')}
              className="btn-primary px-8 py-3"
            >
              Continue →
            </button>
          </div>
        </div>
      </StepLayout>
    )
  }

  /* ─── Step: Review ─── */
  if (step === 'review') {
    return (
      <StepLayout
        title="Review & contact"
        subtitle="Confirm your choices and send us your info."
        step="review"
        onBack={() => back('details')}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Summary */}
          <div className="card bg-steel-800/40">
            <h3 className="text-sm font-semibold text-chilliblue-300 uppercase tracking-wider mb-3">Your choices</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-steel-700 pb-2">
                <span className="text-steel-400">Category</span>
                <span className="text-white font-medium">{data.category}</span>
              </div>
              <div className="flex justify-between border-b border-steel-700 pb-2">
                <span className="text-steel-400">Material</span>
                <span className="text-white font-medium">{data.material}</span>
              </div>
              <div className="flex justify-between border-b border-steel-700 pb-2">
                <span className="text-steel-400">Style</span>
                <span className="text-white font-medium">{data.style}</span>
              </div>
              <div className="flex justify-between border-b border-steel-700 pb-2">
                <span className="text-steel-400">Size</span>
                <span className="text-white font-medium">{data.size}</span>
              </div>
              {data.details && (
                <div className="pt-1">
                  <span className="text-steel-400 block mb-1">Details</span>
                  <p className="text-steel-300 whitespace-pre-wrap">{data.details}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact form */}
          <div className="card">
            <h3 className="text-sm font-semibold text-chilliblue-300 uppercase tracking-wider mb-4">Your contact info</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-chilliblue-200 mb-1">Full name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="John Doe"
                  value={data.name}
                  onChange={(e) => update('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-chilliblue-200 mb-1">Email *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="john@example.com"
                  value={data.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-chilliblue-200 mb-1">Phone</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+52 624 123 4567"
                  value={data.phone}
                  onChange={(e) => update('phone', e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={submit}
              disabled={!data.name || !data.email}
              className="btn-primary w-full mt-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Project Request
            </button>
            <p className="text-center text-steel-500 text-xs mt-3">
              We will reply within 48 hours with a quote or follow-up questions.
            </p>
          </div>
        </div>
      </StepLayout>
    )
  }

  /* ─── Step: Success ─── */
  return (
    <div className="max-w-xl mx-auto px-4 py-16 md:py-24 text-center">
      <div className="mb-6 flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-900/50 border border-green-700 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Request sent!</h2>
      <p className="text-steel-300 mb-8">
        Thanks, {data.name}. Our team will review your project and get back to you at{' '}
        <span className="text-chilliblue-300">{data.email}</span> within 48 hours.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/" className="btn-primary px-8 py-3">
          Back to Home
        </Link>
        <Link href="/catalog" className="btn-secondary px-8 py-3">
          Browse Catalog
        </Link>
      </div>
    </div>
  )
}
