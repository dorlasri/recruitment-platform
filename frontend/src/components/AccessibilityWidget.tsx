'use client'

import { useState, useEffect } from 'react'

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false)
  const [fontSize, setFontSize] = useState(0)       // -2 to +4
  const [contrast, setContrast] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [grayscale, setGrayscale] = useState(false)
  const [bigCursor, setBigCursor] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = fontSize === 0 ? '' : `${100 + fontSize * 10}%`
  }, [fontSize])

  useEffect(() => {
    document.body.classList.toggle('a11y-contrast', contrast)
  }, [contrast])

  useEffect(() => {
    document.body.classList.toggle('a11y-underline', underline)
  }, [underline])

  useEffect(() => {
    document.body.classList.toggle('a11y-grayscale', grayscale)
  }, [grayscale])

  useEffect(() => {
    document.body.classList.toggle('a11y-cursor', bigCursor)
  }, [bigCursor])

  const reset = () => {
    setFontSize(0); setContrast(false)
    setUnderline(false); setGrayscale(false); setBigCursor(false)
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: `1.5px solid ${active ? '#F97316' : '#EDE9E4'}`,
    background: active ? '#FFF7ED' : 'white',
    color: active ? '#EA580C' : '#292524',
    fontWeight: active ? '700' : '400',
    fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'all 0.15s',
  })

  return (
    <>
      {/* Global CSS for accessibility modes */}
      <style>{`
        .a11y-contrast { filter: contrast(1.5) !important; background: #000 !important; color: #fff !important; }
        .a11y-contrast * { color: #fff !important; background: #000 !important; border-color: #fff !important; }
        .a11y-underline a, .a11y-underline button { text-decoration: underline !important; }
        .a11y-grayscale { filter: grayscale(100%) !important; }
        .a11y-cursor, .a11y-cursor * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M8 2 L8 26 L14 20 L19 30 L22 29 L17 19 L25 19 Z' fill='black' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E") 0 0, auto !important; }
      `}</style>

      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="תפריט נגישות"
        style={{
          position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999,
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#F97316', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {/* Wheelchair accessibility icon */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <circle cx="12" cy="3" r="2"/>
          <path d="M13 9h-2L9.5 14H7v2h3l1-4h2l1 5H8v2h8l-1.5-7z"/>
          <path d="M8 20c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          <path d="M15.5 17c0 2.5-2 4.5-4.5 4.5S6.5 19.5 6.5 17"/>
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="אפשרויות נגישות"
          style={{
            position: 'fixed', bottom: '88px', left: '24px', zIndex: 9998,
            width: '260px', background: 'white',
            borderRadius: '20px', border: '1.5px solid #EDE9E4',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            padding: '20px', direction: 'rtl',
            fontFamily: 'Rubik, Arial, sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#292524', margin: 0 }}>נגישות</h2>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', fontSize: '18px', padding: 0, lineHeight: 1 }} aria-label="סגור">✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

            {/* Font size */}
            <div style={{ background: '#FFFBF5', borderRadius: '10px', border: '1.5px solid #EDE9E4', padding: '10px 14px' }}>
              <p style={{ fontSize: '13px', color: '#57534E', margin: '0 0 8px', fontWeight: '600' }}>גודל טקסט</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setFontSize(v => Math.max(v - 1, -2))} style={{ flex: 1, height: '34px', borderRadius: '8px', border: '1.5px solid #EDE9E4', background: 'white', cursor: 'pointer', fontSize: '18px', fontWeight: '700' }} aria-label="הקטן טקסט">A−</button>
                <span style={{ fontSize: '13px', color: '#A8A29E', minWidth: '24px', textAlign: 'center' }}>{fontSize > 0 ? `+${fontSize}` : fontSize}</span>
                <button onClick={() => setFontSize(v => Math.min(v + 1, 4))} style={{ flex: 1, height: '34px', borderRadius: '8px', border: '1.5px solid #EDE9E4', background: 'white', cursor: 'pointer', fontSize: '18px', fontWeight: '700' }} aria-label="הגדל טקסט">A+</button>
              </div>
            </div>

            <button onClick={() => setContrast(v => !v)} style={btnStyle(contrast)} aria-pressed={contrast}>
              <span>ניגודיות גבוהה</span>
              <span style={{ fontSize: '16px' }}>{contrast ? '✓' : '○'}</span>
            </button>

            <button onClick={() => setUnderline(v => !v)} style={btnStyle(underline)} aria-pressed={underline}>
              <span>הדגשת קישורים</span>
              <span style={{ fontSize: '16px' }}>{underline ? '✓' : '○'}</span>
            </button>

            <button onClick={() => setGrayscale(v => !v)} style={btnStyle(grayscale)} aria-pressed={grayscale}>
              <span>גווני אפור</span>
              <span style={{ fontSize: '16px' }}>{grayscale ? '✓' : '○'}</span>
            </button>

            <button onClick={() => setBigCursor(v => !v)} style={btnStyle(bigCursor)} aria-pressed={bigCursor}>
              <span>סמן גדול</span>
              <span style={{ fontSize: '16px' }}>{bigCursor ? '✓' : '○'}</span>
            </button>

            <button onClick={reset} style={{ width: '100%', padding: '9px', borderRadius: '10px', border: '1.5px solid #EDE9E4', background: '#F5F3F0', color: '#78716C', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
              איפוס הגדרות
            </button>

            <a href="/accessibility" style={{ display: 'block', textAlign: 'center', fontSize: '12px', color: '#A8A29E', marginTop: '4px', textDecoration: 'underline' }}>
              הצהרת נגישות
            </a>
          </div>
        </div>
      )}
    </>
  )
}
