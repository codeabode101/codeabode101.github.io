'use client';

import { useEffect, useState, useMemo, FormEvent } from 'react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    fbc?: string;
  }
}

const CONTACT_OPTIONS = [
  { value: 'call', label: 'Phone Call' },
  { value: 'text', label: 'Text (SMS)' },
  { value: 'whatsapp_call', label: 'WhatsApp Call' },
  { value: 'whatsapp_text', label: 'WhatsApp Text' },
  { value: 'messenger', label: 'Facebook Messenger' }
];

function getFbcFromUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const url = new URL(window.location.href);
  return url.searchParams.get('fbc') || url.searchParams.get('fbclid') || undefined;
}

export default function SignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fbc, setFbc] = useState<string | undefined>();

  useEffect(() => {
    setFbc(getFbcFromUrl());
  }, []);

  function fireConfetti() {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const eventId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {}, { eventID: eventId });
    }

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const data: Record<string, any> = {};
      formData.forEach((value, key) => {
        if (data[key]) {
          if (!Array.isArray(data[key])) data[key] = [data[key]];
          data[key].push(value);
        } else {
          data[key] = value;
        }
      });
      data.event_id = eventId;
      if (fbc) data.fbc = fbc;

      const response = await fetch('/api/track-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.ok) {
        fireConfetti();
        setSubmitted(true);
      } else {
        alert('Something went wrong. Please try again.');
        setSubmitting(false);
      }
    } catch (error) {
      alert('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="form-wrapper" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ color: '#3366ff', marginBottom: '1rem', fontSize: '2rem' }}>
          Thank You!
        </h2>
        <p style={{ color: '#555', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Your request has been received.<br />
          We&apos;ll be in touch soon to get started.
        </p>
        <button
          className="btn submit-btn"
          onClick={() => {
            setSubmitted(false);
            setSubmitting(false);
          }}
          style={{
            display: 'inline-block',
            padding: '0.85rem 2rem',
            backgroundColor: 'transparent',
            color: '#3366ff',
            border: '2px solid #3366ff',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#3366ff';
            (e.target as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.target as HTMLButtonElement).style.color = '#3366ff';
          }}
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Client-side Pixel for browser tracking */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID || ''}');
            fbq('track', 'PageView');
          `
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID || ''}&ev=PageView&noscript=1`}
        />
      </noscript>

      <style>{`
        :root {
          --primary: #3366ff;
          --bg-light: #e6f2ff;
          --card-bg: #ffffff;
          --text-dark: #1a1a1a;
          --input-border: #cccccc;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Manrope', sans-serif;
          background-color: var(--bg-light);
          color: var(--text-dark);
          line-height: 1.4;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
        }

        .form-wrapper {
          width: 100%;
          max-width: 500px;
          background: var(--card-bg);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          padding: 2rem;
        }

        .form-wrapper h2 {
          margin-top: 0;
          color: var(--primary);
          text-align: center;
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label,
        .form-group p {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group input[type="tel"],
        .form-group input[type="email"],
        .form-group input[type="datetime-local"],
        .form-group textarea {
          width: 100%;
          padding: 0.6rem;
          border: 1px solid var(--input-border);
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        .form-group label > input[type="checkbox"] {
          margin-right: 0.5rem;
        }

        .contact-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1rem;
        }

        .contact-options label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 400;
          cursor: pointer;
        }

        .btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          margin-top: 1rem;
          background-color: var(--primary);
          color: #fff;
          text-decoration: none;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .btn:hover {
          background-color: #294bb5;
        }

        .submit-btn {
          width: 100%;
          text-align: center;
        }
      `}</style>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit}>
          <h2>Book Your Free Demo Class</h2>

          <div className="form-group">
            <label htmlFor="name">What&apos;s your name?</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Jane Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Student Age</label>
            <input
              type="number"
              id="age"
              name="age"
              required
              min="5"
              max="120"
              placeholder="e.g. 14"
            />
          </div>

          <div className="form-group">
            <label htmlFor="parent-number">Parent/Guardian Phone Number</label>
            <input
              type="tel"
              id="parent-number"
              name="parent_number"
              required
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">How can we help your child?</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Tell us about your child's goals and needs..."
            />
          </div>

          <div className="form-group">
            <p>Preferred Contact Method <small>(check all that apply)</small></p>
            <div className="contact-options">
              {CONTACT_OPTIONS.map(opt => (
                <label key={opt.value}>
                  <input type="checkbox" name="contact[]" value={opt.value} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Send Request'}
          </button>
        </form>
      </div>
    </>
  );
}
