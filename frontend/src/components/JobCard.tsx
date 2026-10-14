'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Hash, ArrowLeft } from 'lucide-react'
import { Job } from '@/types'
import { truncate } from '@/lib/utils'
import { getJobEmoji, getEmojiColors } from '@/lib/jobEmoji'

export { getJobEmoji }

export function JobCard({ job }: { job: Job }) {
  const emoji = getJobEmoji(job.title || '')
  const colors = getEmojiColors(emoji)
  const [isNew, setIsNew] = useState(false)
  useEffect(() => {
    setIsNew(!!job.created_at && (Date.now() - new Date(job.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000)
  }, [job.created_at])

  return (
    <Link href={`/jobs/${job.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          border: '1.5px solid #E5E7EB',
          padding: '20px',
          cursor: 'pointer',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = '#818CF8'
          el.style.boxShadow = '0 8px 30px rgba(99,102,241,0.15)'
          el.style.transform = 'translateY(-3px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = '#E5E7EB'
          el.style.boxShadow = 'none'
          el.style.transform = 'none'
        }}
      >
        {/* Top row: emoji + badges */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: colors.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            {emoji}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {isNew && (
              <span style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px', letterSpacing: '0.5px' }}>
                חדש ✨
              </span>
            )}
            {job.salary ? (
              <span style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '999px' }}>
                ₪ {job.salary}
              </span>
            ) : (
              <span style={{ background: '#F3F4F6', color: '#9CA3AF', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: '500', padding: '3px 8px', borderRadius: '999px' }}>
                שכר חסוי
              </span>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', lineHeight: '1.4', margin: '0 0 8px', wordBreak: 'break-word' }}>
          {(job.title || '').replace(/^\*+\s*|\s*\*+$/g, '').trim()}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
          <MapPin style={{ width: '12px', height: '12px', color: job.city ? '#6366F1' : '#9CA3AF', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: job.city ? '#4B5563' : '#9CA3AF', fontWeight: '500' }}>
            {job.city || 'מיקום לא צוין'}
          </span>
        </div>

        {job.description && (
          <p style={{ fontSize: '12px', color: '#9CA3AF', lineHeight: '1.6', margin: '0 0 auto', paddingBottom: '14px' }}>
            {truncate(job.description.replace(/\n+/g, ' '), 90)}
          </p>
        )}

        <div style={{ paddingTop: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Hash style={{ width: '10px', height: '10px', color: '#D1D5DB' }} />
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
              {job.job_number ? `משרה ${job.job_number}` : 'ללא מספר'}
            </span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '3px' }}>
            פרטים <ArrowLeft style={{ width: '12px', height: '12px' }} />
          </span>
        </div>
      </div>
    </Link>
  )
}
