'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type SectionId = 'home' | 'curriculum' | 'pricing' | 'contact' | 'team';

const SECTION_IDS: SectionId[] = ['home', 'curriculum', 'pricing', 'contact', 'team'];

function getInitialActiveSection(pathname: string): SectionId | null {
  if (pathname === '/' || pathname.startsWith('/#')) return 'home';
  return null;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(() =>
    getInitialActiveSection(pathname)
  );

  const links = useMemo(
    () => [
      { id: 'home' as const, label: 'Home', href: '/#home' },
      { id: 'curriculum' as const, label: 'Curriculum', href: '/#curriculum' },
      { id: 'pricing' as const, label: 'Pricing', href: '/#pricing' },
      { id: 'contact' as const, label: 'Contact', href: '/#contact' },
      { id: 'team' as const, label: 'Team', href: '/#team' }
    ],
    []
  );

  useEffect(() => {
    // Close the mobile menu on route change.
    setMenuOpen(false);
    setActiveSection(getInitialActiveSection(pathname));
  }, [pathname]);

  useEffect(() => {
    // Only track active sections on the landing page.
    if (pathname !== '/') return;

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const navbarHeight = 56; // matches --navbar-height in public/style.css
      const y = window.scrollY + navbarHeight + 8;

      let current: SectionId = 'home';
      for (const el of elements) {
        if (el.offsetTop <= y) current = el.id as SectionId;
      }
      setActiveSection(current);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    // Initial + after hash navigation.
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', update);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', update);
    };
  }, [pathname]);

  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <Link href="/#home">CodeAbode</Link>
        </div>

        <button
          type="button"
          className="hamburger"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>

        <ul className={`nav-links${menuOpen ? ' active' : ''}`}>
          {links.map((l) => (
            <li key={l.id}>
              <Link
                href={l.href}
                className={pathname === '/' && activeSection === l.id ? 'active' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
          {pathname === '/signup' ? (
            <li>
              <Link href="/#home" className="active">
                Back
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}

