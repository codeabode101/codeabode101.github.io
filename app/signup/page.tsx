'use client';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function generateEventId() {
  return 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
}

export default function SignupPage() {
  return (
    <main className="signup-page-bg">
      <section className="signup-form-wrapper">
        <form
          id="demo-signup-form"
          action="https://formspree.io/f/xeogbndr"
          method="POST"
          onSubmit={(e) => {
            const eventId = generateEventId();

            try {
              if (typeof window.fbq === 'function') {
                window.fbq('track', 'Lead', {
                  content_name: 'Free Demo Signup',
                  event_id: eventId,
                });
                console.log('Meta Pixel Lead event fired (signup form submitted), event_id:', eventId);
              } else {
                console.warn('fbq is not available when trying to fire Lead event');
              }
            } catch (err) {
              console.warn('Error firing Meta Pixel Lead event:', err);
            }

            const parentNumber =
              (e.currentTarget.elements.namedItem('parent_number') as HTMLInputElement | null)?.value || '';

            const body = JSON.stringify({
              eventName: 'Lead',
              eventId,
              sourceUrl: window.location.href,
              formData: { parentNumber },
            });

            try {
              if (navigator.sendBeacon) {
                const ok = navigator.sendBeacon('/api/track-lead', new Blob([body], { type: 'application/json' }));
                if (!ok) throw new Error('sendBeacon failed');
              } else {
                fetch('/api/track-lead', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body,
                  keepalive: true,
                }).catch(() => {});
              }
            } catch (_) {}
          }}
        >
          <h2 className="signup-form-title">Book Your Free Demo Class</h2>

          <div className="signup-form-group">
            <label htmlFor="name">What&apos;s your name?</label>
            <input type="text" id="name" name="name" required placeholder="Jane Doe" />
          </div>

          <div className="signup-form-group">
            <label htmlFor="age">How old are you?</label>
            <input type="number" id="age" name="age" required min={5} max={120} placeholder="e.g. 14" />
          </div>

          <div className="signup-form-group">
            <label htmlFor="parent-number">Parent/Guardian Phone Number</label>
            <input type="tel" id="parent-number" name="parent_number" required placeholder="(555) 123-4567" />
          </div>

          <div className="signup-form-group">
            <label htmlFor="experience">Previous programming experience</label>
            <textarea id="experience" name="experience" rows={3} placeholder="None, Scratch, Python, etc." />
          </div>

          <div className="signup-form-group">
            <p>What do you hope to learn? <small>(check all that apply)</small></p>
            <label><input type="checkbox" name="interests[]" value="Web Development" /> Web Development</label><br />
            <label><input type="checkbox" name="interests[]" value="Game Development" /> Game Development</label><br />
            <label><input type="checkbox" name="interests[]" value="Python" /> Python</label><br />
            <label><input type="checkbox" name="interests[]" value="Java" /> Java</label><br />
            <label><input type="checkbox" name="interests[]" value="AI Development" /> AI Development</label><br />
            <label><input type="checkbox" name="interests[]" value="Other" /> Other</label>
          </div>

          <div className="signup-form-group">
            <label htmlFor="availability">When are you available for a demo class?</label>
            <input type="datetime-local" id="availability" name="availability" required />
          </div>

          <div className="signup-form-group">
            <label htmlFor="comments">Any additional questions or comments?</label>
            <textarea id="comments" name="comments" rows={3} placeholder="Let us know anything else we should prepare for!" />
          </div>

          <button type="submit" className="signup-submit-btn">
            Send Request
          </button>
        </form>
      </section>
    </main>
  );
}
