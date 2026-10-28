import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getShortlist, toggleShortlist } from './shortlist';

const API_BASE_URL = 'http://localhost:3001';

function useThemeFonts() {
  useEffect(() => {
    if (document.getElementById('wedding-fonts')) return;
    const link = document.createElement('link');
    link.id = 'wedding-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);
}

const CATEGORY_STYLES = {
  Catering: { color: '#D97B3F', background: '#FBEADD' },
  Photographer: { color: '#6C63A6', background: '#ECE9F7' },
  Venue: { color: '#F43F65', background: '#FFE3E9' },
  Decorator: { color: '#2E9E77', background: '#E1F5EC' },
  Music: { color: '#C2447A', background: '#FBE4EF' },
};
const DEFAULT_CATEGORY_STYLE = { color: '#8B7A82', background: '#F3EBEE' };

const SERVICES_BY_CATEGORY = {
  Catering: [
    'Veg and non-veg menus',
    'Live food counters',
    'Custom menu for every function',
    'Trained serving staff',
    'Crockery, cutlery and setup included',
  ],
  Photographer: [
    'Candid and traditional photography',
    'Pre-wedding shoot',
    'Cinematic wedding film',
    'Drone coverage',
    'Edited photo album and online gallery',
  ],
  Decorator: [
    'Stage and mandap decoration',
    'Fresh flower arrangements',
    'Theme-based decor',
    'Lighting and entrance gate',
    'Setup and cleanup crew',
  ],
  Venue: [
    'Banquet hall and open lawn',
    'Rooms for the bride and groom party',
    'Parking for guests',
    'Power backup',
    'In-house catering option',
  ],
  Music: [
    'Live band or DJ',
    'Sound and light system',
    'Sangeet and baraat performances',
    'Custom playlist on request',
    'MC / anchor support',
  ],
};

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" style={{ fill: '#F43F65', flexShrink: 0 }}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z" />
  </svg>
);
const HeartIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ fill: '#F43F65' }}>
    <path d="M12 21s-6.716-4.35-9.428-8.06C.86 10.42 1.2 6.9 4.1 5.2c2.2-1.28 4.9-.62 6.4 1.28 1.5-1.9 4.2-2.56 6.4-1.28 2.9 1.7 3.24 5.22 1.53 7.74C18.72 16.65 12 21 12 21Z" />
  </svg>
);
const ShortlistHeart = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    style={{ fill: filled ? '#FFFFFF' : 'none', stroke: filled ? '#FFFFFF' : '#F43F65', strokeWidth: 2 }}
  >
    <path d="M12 21s-6.716-4.35-9.428-8.06C.86 10.42 1.2 6.9 4.1 5.2c2.2-1.28 4.9-.62 6.4 1.28 1.5-1.9 4.2-2.56 6.4-1.28 2.9 1.7 3.24 5.22 1.53 7.74C18.72 16.65 12 21 12 21Z" />
  </svg>
);

export default function VendorDetail() {
  useThemeFonts();

  const { id } = useParams();

  const [vendor, setVendor] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  // Load the vendor (and similar vendors) every time the id in the URL changes
  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    const loadVendor = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setVendor(null);
      setSimilar([]);

      try {
        const response = await fetch(`${API_BASE_URL}/vendors/${id}`);

        if (response.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!response.ok) {
          throw new Error(`Server status error: ${response.status}`);
        }

        const data = await response.json();
        if (cancelled) return;
        setVendor(data);

        // Similar vendors: same category, not this vendor, max 3
        try {
          const allRes = await fetch(`${API_BASE_URL}/vendors`);
          if (allRes.ok) {
            const all = await allRes.json();
            if (!cancelled) {
              setSimilar(
                all
                  .filter((v) => v.category === data.category && String(v.id) !== String(data.id))
                  .slice(0, 3)
              );
            }
          }
        } catch (err) {
          console.warn('Could not load similar vendors');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch vendor data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadVendor();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Check if this vendor is already shortlisted
  useEffect(() => {
    setShortlisted(getShortlist().includes(String(id)));
  }, [id]);

  const handleToggleShortlist = () => {
    const updated = toggleShortlist(id);
    setShortlisted(updated.includes(String(id)));
  };

  // ---------- styles ----------

  const pageStyle = {
    backgroundColor: '#FFF7F8',
    minHeight: '100vh',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    color: '#241B22',
    padding: '32px 24px 80px',
  };

  const containerStyle = { maxWidth: '900px', margin: '0 auto' };

  const backLinkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
    color: '#F43F65',
    backgroundColor: '#FFFFFF',
    border: '1px solid #FCE1E7',
    padding: '8px 18px',
    borderRadius: '30px',
    fontSize: '13.5px',
    fontWeight: 600,
    marginBottom: '22px',
  };

  const mainCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    border: '1px solid #FCE9EE',
    padding: '32px',
    boxShadow: '0 22px 45px -28px rgba(244,63,101,0.35)',
  };

  const topRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '18px',
  };

  const categoryPillStyle = (category) => ({
    fontSize: '12.5px',
    fontWeight: 600,
    padding: '6px 16px',
    borderRadius: '20px',
    ...(CATEGORY_STYLES[category] || DEFAULT_CATEGORY_STYLE),
  });

  const ratingBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    fontWeight: 700,
    color: '#F43F65',
    backgroundColor: '#FFE3E9',
    padding: '6px 14px',
    borderRadius: '20px',
  };

  const nameStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: 'clamp(26px, 4vw, 36px)',
    margin: '0 0 10px',
    lineHeight: 1.25,
  };

  const cityRowStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', color: '#8B7A82', margin: '0 0 24px' };

  const priceRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '20px 0',
    borderTop: '1px dashed #FCE9EE',
    borderBottom: '1px dashed #FCE9EE',
  };

  const priceLabelStyle = { fontSize: '11.5px', letterSpacing: '0.06em', color: '#8B7A82', marginBottom: '4px' };
  const priceStyle = { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '30px', color: '#F43F65' };

  const shortlistButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px 24px',
    borderRadius: '30px',
    border: shortlisted ? '1px solid transparent' : '1px solid #F43F65',
    background: shortlisted ? 'linear-gradient(135deg, #FF8FA3, #F43F65)' : '#FFFFFF',
    color: shortlisted ? '#FFFFFF' : '#F43F65',
  };

  const sectionHeadingStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '22px',
    margin: '28px 0 14px',
  };

  const serviceListStyle = { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' };
  const serviceItemStyle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#5C4650' };
  const tickStyle = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#FFE3E9',
    color: '#F43F65',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const similarGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
  };

  const similarCardStyle = (cardId) => ({
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #FCE9EE',
    padding: '18px',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    boxShadow: hoveredId === cardId ? '0 24px 40px -22px rgba(244,63,101,0.35)' : '0 8px 20px -14px rgba(36,27,34,0.12)',
    transform: hoveredId === cardId ? 'translateY(-4px)' : 'translateY(0)',
    transition: 'all 0.22s ease',
  });

  const similarNameStyle = { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '17px', margin: 0 };
  const similarMetaStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#8B7A82' };
  const similarPriceStyle = { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '16px', color: '#F43F65' };

  const statusWrapStyle = { textAlign: 'center', padding: '80px 20px', color: '#8B7A82' };
  const statusHeadingStyle = { fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#241B22', fontWeight: 700, margin: '0 0 8px' };

  // ---------- render ----------

  const services = vendor ? SERVICES_BY_CATEGORY[vendor.category] || [] : [];

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <Link to="/vendors" style={backLinkStyle}>
          ← Back to vendors
        </Link>

        {loading && (
          <div style={statusWrapStyle}>
            <p style={statusHeadingStyle}>Loading vendor…</p>
          </div>
        )}

        {error && !loading && (
          <div style={statusWrapStyle}>
            <h3 style={statusHeadingStyle}>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {notFound && !loading && (
          <div style={statusWrapStyle}>
            <h3 style={statusHeadingStyle}>Vendor not found</h3>
            <p>This vendor does not exist or may have been removed.</p>
          </div>
        )}

        {vendor && !loading && !error && !notFound && (
          <>
            <div style={mainCardStyle}>
              <div style={topRowStyle}>
                <span style={categoryPillStyle(vendor.category)}>{vendor.category}</span>
                <span style={ratingBadgeStyle}>
                  <HeartIcon size={15} /> {Number(vendor.rating).toFixed(1)}
                </span>
              </div>

              <h1 style={nameStyle}>{vendor.name}</h1>
              <div style={cityRowStyle}>
                <PinIcon /> {vendor.city}
              </div>

              <div style={priceRowStyle}>
                <div>
                  <div style={priceLabelStyle}>STARTING PRICE</div>
                  <div style={priceStyle}>₹{Number(vendor.price).toLocaleString('en-IN')}</div>
                </div>

                <button type="button" style={shortlistButtonStyle} onClick={handleToggleShortlist}>
                  <ShortlistHeart filled={shortlisted} />
                  {shortlisted ? 'Shortlisted' : 'Add to shortlist'}
                </button>
              </div>

              {services.length > 0 && (
                <>
                  <h2 style={sectionHeadingStyle}>Services usually offered</h2>
                  <ul style={serviceListStyle}>
                    {services.map((service) => (
                      <li key={service} style={serviceItemStyle}>
                        <span style={tickStyle}>✓</span>
                        {service}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {similar.length > 0 && (
              <>
                <h2 style={sectionHeadingStyle}>Similar vendors</h2>
                <div style={similarGridStyle}>
                  {similar.map((item) => (
                    <Link
                      key={item.id}
                      to={`/vendors/${item.id}`}
                      style={similarCardStyle(item.id)}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <span style={{ ...categoryPillStyle(item.category), alignSelf: 'flex-start', fontSize: '11.5px', padding: '4px 12px' }}>
                        {item.category}
                      </span>
                      <h3 style={similarNameStyle}>{item.name}</h3>
                      <div style={similarMetaStyle}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <PinIcon /> {item.city}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F43F65', fontWeight: 700 }}>
                          <HeartIcon /> {Number(item.rating).toFixed(1)}
                        </span>
                      </div>
                      <div style={similarPriceStyle}>₹{Number(item.price).toLocaleString('en-IN')}</div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}