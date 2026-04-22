'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type SectionId = 'home' | 'curriculum' | 'pricing' | 'contact';

const SECTION_IDS: SectionId[] = ['home', 'curriculum', 'pricing', 'contact'];

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
      { id: 'about' as const, label: 'About Us', href: '/about' }
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
      const cssNavbarHeight = Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'),
        10
      );
      const navbarHeight = Number.isFinite(cssNavbarHeight) ? cssNavbarHeight : 56;
      const y = window.scrollY + navbarHeight + 8;

      const isAtBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 10;
      if (isAtBottom && elements.length > 0) {
        setActiveSection(elements[elements.length - 1].id as SectionId);
        return;
      }

      let current: SectionId = 'home';
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          current = el.id as SectionId;
        }
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
    const onHashChange = () => {
      // Hash navigation can fire before the browser finishes scrolling.
      window.requestAnimationFrame(() => window.requestAnimationFrame(update));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [pathname]);

  return (
    <header>
      <nav className="navbar">
        <div className="navbar-content">
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
                  onClick={() => {
                    setMenuOpen(false);
                    if (pathname === '/' && l.id !== 'about') setActiveSection(l.id as SectionId);
                  }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link 
                href="/signup" 
                className="cta-button"
                onClick={() => setMenuOpen(false)}
              >
                Book a Demo
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

