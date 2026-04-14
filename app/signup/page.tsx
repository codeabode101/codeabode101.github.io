'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import confetti from 'canvas-confetti';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

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

const STUDENT_GOALS = [
  { value: 'build_a_game', label: 'Build a game' },
  { value: 'cs50_ai_certified', label: 'Get Harvard CS50 AI certified' },
  { value: 'pcep_certified', label: 'Get PCEP certified' },
  { value: 'app_dev', label: 'App dev' },
  { value: 'web_dev', label: 'Web dev' },
  { value: 'learn_python', label: 'Learn Python' },
  { value: 'learn_java', label: 'Learn Java' },
  { value: 'learn_rust', label: 'Learn Rust' }
];

function getFbcFromUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const url = new URL(window.location.href);
  return url.searchParams.get('fbc') || url.searchParams.get('fbclid') || undefined;
}

function getFbcFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;)\s*_fbc=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

function getFbpFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;)\s*_fbp=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

function validatePhonePN(phone: string): {valid: boolean; internationalFormat: string} {
  try {
    const parsed = parsePhoneNumber(phone, 'IN');
    if (!parsed || !isValidPhoneNumber(phone, 'IN')) {
      return { valid: false, internationalFormat: phone };
    }
    return { valid: true, internationalFormat: parsed.format('E.164') };
  } catch {
    return { valid: false, internationalFormat: phone };
  }
}

export default function SignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fbc, setFbc] = useState<string | undefined>();
  const [phoneValid, setPhoneValid] = useState(true);

  useEffect(() => {
    setFbc(getFbcFromUrl() || getFbcFromCookie());
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

  function handlePhoneChange(e: ChangeEvent<HTMLInputElement>) {
    const phone = e.target.value.replace(/\D/g, '');
    if (phone.length >= 10) {
      const result = validatePhonePN(phone);
      setPhoneValid(result.valid);
    } else {
      setPhoneValid(true);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const phoneInput = form.elements.namedItem('parent_number') as HTMLInputElement;
    const phone = phoneInput.value.replace(/\D/g, '');
    
    if (phone.length < 10) {
      setPhoneValid(false);
      setSubmitting(false);
      return;
    }

    const pnResult = validatePhonePN(phone);
    if (!pnResult.valid) {
      setPhoneValid(false);
      setSubmitting(false);
      return;
    }

    const eventId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

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
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'Lead', {}, { eventID: eventId });
        }
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

        .contact-options label,
        .goals-list label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 400;
          cursor: pointer;
        }

        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
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

        .experience-option:has(input:checked) {
          border-color: var(--primary);
          background-color: var(--primary);
          color: #fff;
        }

        .experience-option:hover:not(:has(input:checked)) {
          border-color: var(--primary);
          background-color: var(--bg-light);
        }

        h3 {
          border-top: 1px solid var(--input-border);
          padding-top: 0.75rem;
        }
      `}</style>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit}>
          <h2>Book Your Free Demo Class</h2>

          <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '0.75rem', marginTop: '1.25rem' }}>Parent Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="parent_first_name">Parent First Name</label>
              <input
                type="text"
                id="parent_first_name"
                name="parent_first_name"
                required
                placeholder="Jane"
              />
            </div>
            <div className="form-group">
              <label htmlFor="parent_last_name">Parent Last Name</label>
              <input
                type="text"
                id="parent_last_name"
                name="parent_last_name"
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '0.75rem', marginTop: '1.25rem' }}>Student Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="student_first_name">Student First Name</label>
              <input
                type="text"
                id="student_first_name"
                name="student_first_name"
                required
                placeholder="Alex"
              />
            </div>
            <div className="form-group">
              <label htmlFor="student_last_name">Student Last Name</label>
              <input
                type="text"
                id="student_last_name"
                name="student_last_name"
                required
                placeholder="Doe"
              />
            </div>
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
              placeholder="9876543210"
              onBlur={handlePhoneChange}
              style={{ borderColor: !phoneValid ? '#e00' : undefined }}
            />
            {!phoneValid && <p style={{ color: '#e00', fontSize: '0.875rem' }}>Please enter a valid phone number</p>}
          </div>

          <div className="form-group">
            <label htmlFor="student_experience">Student Experience (1 = Beginner, 5 = Advanced)</label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(num => (
                <label
                  key={num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.5rem',
                    height: '2.5rem',
                    border: '2px solid var(--input-border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  className="experience-option"
                >
                  <input
                    type="radio"
                    name="student_experience"
                    value={num}
                    required
                    style={{ display: 'none' }}
                  />
                  {num}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <p>Student Goals <small>(check all that apply)</small></p>
            <div className="goals-list">
              {STUDENT_GOALS.map(goal => (
                <label key={goal.value}>
                  <input type="checkbox" name="student_goals[]" value={goal.value} />
                  {goal.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="demo_datetime">When are you free for a demo?</label>
            <input
              type="datetime-local"
              id="demo_datetime"
              name="demo_datetime"
              min={new Date().toISOString().slice(0, 16)}
              placeholder="Select date and time"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Anything else?</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Share any additional details..."
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
