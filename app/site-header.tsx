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

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (visible?.target?.id && SECTION_IDS.includes(visible.target.id as SectionId)) {
          setActiveSection(visible.target.id as SectionId);
        }
      },
      {
        root: null,
        // Favor the section near the top, below the fixed navbar.
        rootMargin: '-30% 0px -60% 0px',
        threshold: [0.1, 0.2, 0.35, 0.5, 0.75]
      }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
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

