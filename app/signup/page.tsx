'use client';

import { useState, FormEvent } from 'react';

const CONTACT_OPTIONS = [
  { value: 'call', label: 'Phone Call' },
  { value: 'text', label: 'Text (SMS)' },
  { value: 'whatsapp_call', label: 'WhatsApp Call' },
  { value: 'whatsapp_text', label: 'WhatsApp Text' },
  { value: 'messenger', label: 'Facebook Messenger' }
];

export default function SignupPage() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

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

      const response = await fetch('/api/track-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.ok) {
        window.location.href = '/thank-you';
      } else {
        alert('Something went wrong. Please try again.');
        setSubmitting(false);
      }
    } catch (error) {
      alert('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
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
