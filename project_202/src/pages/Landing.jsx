import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { apiUrl } from '../lib/api';

gsap.registerPlugin(ScrollTrigger);

const FOOD_VIDEO_URL =
  'https://videos.pexels.com/video-files/3195385/3195385-hd_1920_1080_30fps.mp4';

const getPriceRange = (restaurant) => {
  if (restaurant.price_range) return restaurant.price_range;
  try {
    const menu = JSON.parse(restaurant.menu);
    const items = Array.isArray(menu)
      ? menu.flatMap(c => c.items || [])
      : Object.values(menu).flatMap(c => c.items || []);
    const avg = items.reduce((s, i) => s + i.price, 0) / (items.length || 1);
    return avg < 10 ? '$' : avg < 20 ? '$$' : '$$$';
  } catch {
    return '$$';
  }
};

const isOpenNow = (r) => {
  if (parseInt(r.status) === 0) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = (r.opentime || '00:00').split(':').map(Number);
  const [ch, cm] = (r.closetime || '23:59').split(':').map(Number);
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
};

const Landing = () => {
  const heroRef = useRef(null);
  const eyebrowRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaBtnRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const featuresRef = useRef(null);
  const previewRef = useRef(null);
  const ctaSectionRef = useRef(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [topRestaurants, setTopRestaurants] = useState([]);

  useEffect(() => {
    fetch(apiUrl('/restaurants'), { headers: { Accept: 'application/json' } })
      .then(r => r.json())
      .then(data => {
        const sorted = [...(data.restaurants || [])]
          .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
        setTopRestaurants(sorted.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(
        [eyebrowRef.current, titleRef.current, subtitleRef.current, ctaBtnRef.current, scrollIndicatorRef.current],
        { y: 40, opacity: 0, stagger: 0.18, duration: 1.2, ease: 'power3.out', delay: 0.3 }
      );
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!topRestaurants.length) return;
    const ctx = gsap.context(() => {
      gsap.from('.feature-cell', {
        scrollTrigger: { trigger: featuresRef.current, start: 'top 70%' },
        y: 60, opacity: 0, stagger: 0.15, duration: 0.9, ease: 'power3.out',
      });
      gsap.from('.preview-card', {
        scrollTrigger: { trigger: previewRef.current, start: 'top 75%' },
        y: 50, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out',
      });
      gsap.from(ctaSectionRef.current, {
        scrollTrigger: { trigger: ctaSectionRef.current, start: 'top 80%' },
        y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, [topRestaurants]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
  };

  return (
    <div style={styles.page}>
      {/* ── HERO ── */}
      <section ref={heroRef} style={styles.hero}>
        <video
          autoPlay muted loop playsInline
          style={styles.video}
          onError={e => { e.target.style.display = 'none'; }}
        >
          <source src={FOOD_VIDEO_URL} type="video/mp4" />
        </video>

        {/* warm color grade over video */}
        <div style={styles.videoOverlay} />
        {/* vignette */}
        <div style={styles.vignette} />
        {/* grain */}
        <svg style={styles.grain} xmlns="http://www.w3.org/2000/svg">
          <filter id="grain-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-filter)" opacity="0.04" />
        </svg>

        <div style={styles.heroContent}>
          <div ref={eyebrowRef} style={styles.eyebrow}>San Jose · Bay Area · Beyond</div>
          <h1 ref={titleRef} style={styles.heroTitle}>
            Find where<br /><em style={styles.heroItalic}>dinner</em><br />happens
          </h1>
          <p ref={subtitleRef} style={styles.heroSubtitle}>
            Real ratings. Live hours. Full menus.<br />Every restaurant worth knowing — one search away.
          </p>
          <button
            ref={ctaBtnRef}
            style={styles.heroCta}
            onClick={() => navigate('/explore')}
            onMouseEnter={e => { e.currentTarget.style.background = '#a8642e'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#c27a3a'; }}
          >
            Start Exploring
          </button>
        </div>

        <div ref={scrollIndicatorRef} style={styles.scrollIndicator}>
          <div style={styles.scrollLine} />
          <span style={{ fontSize: '0.55rem', letterSpacing: '3px' }}>SCROLL</span>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionLabel}>Why Forktable</div>
          <h2 style={styles.sectionTitle}>Everything you need<br />before you go</h2>
        </div>

        <div style={styles.featuresGrid}>
          {[
            {
              num: '01',
              name: 'Search by Location',
              desc: 'Enter a ZIP code, neighborhood, or dish. Instantly surface restaurants near you — including Google Places results.',
            },
            {
              num: '02',
              name: 'Real Ratings & Reviews',
              desc: 'Community ratings, not algorithms. Filter by minimum star rating and read reviews before you decide.',
            },
            {
              num: '03',
              name: 'Menus & Live Hours',
              desc: 'Full menu with prices. Live open/closed status so you never arrive to a locked door.',
            },
          ].map((f, i) => (
            <div
              key={f.num}
              className="feature-cell"
              style={{
                ...styles.featureCell,
                borderRight: i < 2 ? '1px solid rgba(194,122,58,0.15)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(194,122,58,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={styles.featureNum}>{f.num}</span>
              <div style={styles.featureName}>{f.name}</div>
              <div style={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RESTAURANT PREVIEW ── */}
      <section ref={previewRef} style={styles.previewSection}>
        <div style={{ ...styles.sectionHeader, textAlign: 'center' }}>
          <div style={styles.sectionLabel}>Featured Tonight</div>
          <h2 style={styles.sectionTitle}>Restaurants worth finding</h2>
          <div style={styles.divider} />
        </div>

        <div style={styles.cardsStrip}>
          {topRestaurants.map((r) => (
            <div
              key={r.rid}
              className="preview-card"
              style={styles.previewCard}
              onClick={() => navigate(`/restaurant/${r.rid}`)}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#c27a3a';
                e.currentTarget.style.transform = 'translateY(-6px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(194,122,58,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.cardCuisine}>{r.cuisine_type || 'Restaurant'}</div>
              <div style={styles.cardName}>{r.name}</div>
              <div style={styles.cardAddress}>{r.address}</div>
              <div style={styles.cardMeta}>
                <span style={{ color: '#f0c060' }}>★ {Number(r.rating || 0).toFixed(1)}</span>
                <span style={{ color: '#c27a3a' }}>{getPriceRange(r)}</span>
                <span style={{ color: isOpenNow(r) ? '#4ade80' : 'rgba(253,246,237,0.3)' }}>
                  ● {isOpenNow(r) ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaSectionRef} style={styles.ctaSection}>
        <div style={styles.sectionLabel2}>Ready?</div>
        <h2 style={styles.ctaTitle}>
          Your next<br /><em style={{ fontStyle: 'italic', color: '#c27a3a' }}>great meal</em><br />awaits
        </h2>
        <p style={styles.ctaSub}>Search by neighborhood, dish, or ZIP code</p>
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="ZIP code, neighborhood, or dish…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            style={styles.searchBtn}
            onMouseEnter={e => { e.currentTarget.style.background = '#c27a3a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1a1008'; }}
          >
            Search
          </button>
        </form>
      </section>
    </div>
  );
};

// ── Styles ──
const styles = {
  page: {
    background: '#1a1008',
    minHeight: '100vh',
    overflowX: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  hero: {
    position: 'relative',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.5,
  },
  videoOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, rgba(194,122,58,0.22) 0%, rgba(26,16,8,0.65) 60%)',
    zIndex: 1,
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 35%, rgba(26,16,8,0.82) 100%)',
    zIndex: 2,
  },
  grain: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 3,
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 4,
    textAlign: 'center',
    maxWidth: '900px',
    padding: '0 2rem',
  },
  eyebrow: {
    fontSize: '0.65rem',
    letterSpacing: '6px',
    textTransform: 'uppercase',
    color: '#c27a3a',
    marginBottom: '1.5rem',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(3.5rem, 9vw, 8rem)',
    fontWeight: 900,
    lineHeight: 0.92,
    letterSpacing: '-2px',
    color: '#fdf6ed',
    marginBottom: '1.5rem',
  },
  heroItalic: {
    fontStyle: 'italic',
    color: '#c27a3a',
  },
  heroSubtitle: {
    fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
    color: 'rgba(253,246,237,0.55)',
    letterSpacing: '0.5px',
    maxWidth: '480px',
    margin: '0 auto 2.5rem',
    lineHeight: 1.7,
  },
  heroCta: {
    display: 'inline-block',
    background: '#c27a3a',
    color: '#fdf6ed',
    padding: '0.9rem 2.5rem',
    borderRadius: 0,
    fontSize: '0.7rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    transition: 'background 0.3s, transform 0.2s',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '2.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'rgba(253,246,237,0.4)',
  },
  scrollLine: {
    width: '1px',
    height: '40px',
    background: 'linear-gradient(to bottom, #c27a3a, transparent)',
    animation: 'scrollBounce 2s ease-in-out infinite',
  },
  featuresSection: {
    background: '#1a1008',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8rem 4rem',
    gap: '4rem',
  },
  sectionHeader: {
    maxWidth: '700px',
    width: '100%',
  },
  sectionLabel: {
    fontSize: '0.6rem',
    letterSpacing: '5px',
    textTransform: 'uppercase',
    color: '#c27a3a',
    marginBottom: '1rem',
  },
  sectionLabel2: {
    fontSize: '0.6rem',
    letterSpacing: '5px',
    textTransform: 'uppercase',
    color: '#8b6a4a',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(2rem, 5vw, 4rem)',
    fontWeight: 700,
    color: '#fdf6ed',
    lineHeight: 1.1,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    maxWidth: '1100px',
    width: '100%',
    border: '1px solid rgba(194,122,58,0.15)',
  },
  featureCell: {
    padding: '3rem 2rem',
    transition: 'background 0.4s',
    cursor: 'default',
  },
  featureNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '3rem',
    color: 'rgba(194,122,58,0.2)',
    fontWeight: 900,
    display: 'block',
    marginBottom: '1rem',
  },
  featureName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.3rem',
    color: '#fdf6ed',
    marginBottom: '0.75rem',
  },
  featureDesc: {
    color: 'rgba(253,246,237,0.45)',
    fontSize: '0.82rem',
    lineHeight: 1.7,
  },
  previewSection: {
    background: '#120d06',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8rem 4rem',
    gap: '4rem',
  },
  divider: {
    width: '60px',
    height: '1px',
    background: '#c27a3a',
    margin: '1.5rem auto',
  },
  cardsStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    maxWidth: '1100px',
    width: '100%',
  },
  previewCard: {
    border: '1px solid rgba(194,122,58,0.2)',
    padding: '2rem 1.5rem',
    cursor: 'pointer',
    transition: 'border-color 0.3s, transform 0.3s',
  },
  cardCuisine: {
    fontSize: '0.55rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#c27a3a',
    marginBottom: '0.75rem',
  },
  cardName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.4rem',
    color: '#fdf6ed',
    marginBottom: '0.5rem',
  },
  cardAddress: {
    color: 'rgba(253,246,237,0.35)',
    fontSize: '0.75rem',
    marginBottom: '1.25rem',
  },
  cardMeta: {
    display: 'flex',
    gap: '1.5rem',
    fontSize: '0.75rem',
  },
  ctaSection: {
    background: '#f0e6d3',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8rem 4rem',
    gap: '1.5rem',
    textAlign: 'center',
  },
  ctaTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(2.5rem, 7vw, 6rem)',
    fontWeight: 900,
    color: '#1a1008',
    lineHeight: 1,
  },
  ctaSub: {
    color: '#8b6a4a',
    fontSize: '0.9rem',
    letterSpacing: '1px',
  },
  searchBar: {
    display: 'flex',
    maxWidth: '580px',
    width: '100%',
    border: '1px solid rgba(26,16,8,0.2)',
  },
  searchInput: {
    flex: 1,
    padding: '1.1rem 1.5rem',
    background: 'white',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.85rem',
    color: '#1a1008',
    outline: 'none',
  },
  searchBtn: {
    padding: '1.1rem 2rem',
    background: '#1a1008',
    color: '#fdf6ed',
    border: 'none',
    fontSize: '0.65rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
};

export default Landing;
