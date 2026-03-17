'use client';

import { useMemo } from 'react';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function generateEventId() {
  return 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
}

export default function SignupPage() {
  const formAction = useMemo(() => 'https://formspree.io/f/xeogbndr', []);

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-light)'
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'var(--card-bg)',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          padding: '2rem'
        }}
      >
        <form
          action={formAction}
          method="POST"
          onSubmit={(e) => {
            const eventId = generateEventId();

            try {
              if (typeof window.fbq === 'function') {
                window.fbq('track', 'Lead', {
                  content_name: 'Free Demo Signup',
                  event_id: eventId
                });
              }
            } catch (_) {}

            const parentNumber = (e.currentTarget.elements.namedItem('parent_number') as HTMLInputElement | null)
              ?.value;

            // Fire server-side event without blocking submit.
            try {
              const body = JSON.stringify({
                eventName: 'Lead',
                eventId,
                sourceUrl: window.location.href,
                formData: { parentNumber }
              });

              if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/track-lead', new Blob([body], { type: 'application/json' }));
              } else {
                fetch('/api/track-lead', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body,
                  keepalive: true
                }).catch(() => {});
              }
            } catch (_) {}
          }}
        >
          <h2 style={{ marginTop: 0, color: 'var(--primary)', textAlign: 'center', fontSize: '1.75rem' }}>
            Book Your Free Demo Class
          </h2>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              What's your name?
              <input
                type="text"
                name="name"
                required
                placeholder="Jane Doe"
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '0.6rem',
                  border: '1px solid var(--input-border)',
                  borderRadius: 6,
                  fontSize: '1rem'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              How old are you?
              <input
                type="number"
                name="age"
                required
                min={5}
                max={120}
                placeholder="e.g. 14"
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '0.6rem',
                  border: '1px solid var(--input-border)',
                  borderRadius: 6,
                  fontSize: '1rem'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Parent/Guardian Phone Number
              <input
                type="tel"
                name="parent_number"
                required
                placeholder="(555) 123-4567"
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '0.6rem',
                  border: '1px solid var(--input-border)',
                  borderRadius: 6,
                  fontSize: '1rem'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Previous programming experience
              <textarea
                name="experience"
                rows={3}
                placeholder="None, Scratch, Python, etc."
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '0.6rem',
                  border: '1px solid var(--input-border)',
                  borderRadius: 6,
                  fontSize: '1rem'
                }}
              ></textarea>
            </label>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              marginTop: '1rem',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Send Request
          </button>
        </form>
      </section>
    </main>
  );
}

