import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001';

// Loads the display fonts once. Safe even if this component mounts more
// than once — it just skips re-adding the link.
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

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" style={{ fill: '#F43F65', flexShrink: 0 }}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" style={{ fill: '#F43F65' }}>
    <path d="M21.71 20.29 18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42-1.39ZM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7Z" />
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" style={{ fill: '#F43F65' }}>
    <path d="M12 21s-6.716-4.35-9.428-8.06C.86 10.42 1.2 6.9 4.1 5.2c2.2-1.28 4.9-.62 6.4 1.28 1.5-1.9 4.2-2.56 6.4-1.28 2.9 1.7 3.24 5.22 1.53 7.74C18.72 16.65 12 21 12 21Z" />
  </svg>
);

export default function Vendors() {
  useThemeFonts();

  const [vendors, setVendors] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const citiesRes = await fetch(`${API_BASE_URL}/cities`);
        if (citiesRes.ok) setCities(await citiesRes.json());

        const categoriesRes = await fetch(`${API_BASE_URL}/categories`);
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
      } catch (err) {
        console.warn('Filter endpoints unavailable');
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (selectedCity) params.append('city', selectedCity);
        if (selectedCategory) params.append('category', selectedCategory);

        const queryString = params.toString();
        const url = `${API_BASE_URL}/vendors${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Server status error: ${response.status}`);
        }

        const data = await response.json();
        setVendors(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch vendor data.');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [selectedCity, selectedCategory]);

  let filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  if (sortBy === 'rating-desc') {
    filteredVendors = [...filteredVendors].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'price-asc') {
    filteredVendors = [...filteredVendors].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredVendors = [...filteredVendors].sort((a, b) => b.price - a.price);
  }

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedCategory('');
    setSortBy('default');
  };

  // ---------- styles ----------

  const pageStyle = {
    backgroundColor: '#FFF7F8',
    minHeight: '100vh',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    color: '#241B22',
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #FFD1DC 0%, #FF8FA3 55%, #F43F65 100%)',
    padding: '56px 24px 90px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const heroFlowerLeftStyle = { position: 'absolute', top: '18px', left: '28px', fontSize: '20px', opacity: 0.8 };
  const heroFlowerRightStyle = { position: 'absolute', bottom: '24px', right: '30px', fontSize: '20px', opacity: 0.8 };

  const badgeRowStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: '7px 18px',
    borderRadius: '30px',
    marginBottom: '18px',
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#F43F65',
    letterSpacing: '0.03em',
  };

  const titleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: 'clamp(30px, 5vw, 44px)',
    margin: '0 0 12px',
    color: '#241B22',
    lineHeight: 1.2,
  };

  const subtitleStyle = {
    fontSize: '15px',
    color: '#5C4650',
    maxWidth: '520px',
    margin: '0 auto',
    lineHeight: 1.6,
  };

  const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' };

  const controlsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    marginTop: '-52px',
    marginBottom: '10px',
    backgroundColor: '#FFFFFF',
    padding: '20px',
    borderRadius: '24px',
    boxShadow: '0 22px 45px -20px rgba(244,63,101,0.35)',
    position: 'relative',
  };

  const fieldWrapStyle = {
    flex: '2 1 240px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 18px',
    borderRadius: '30px',
    border: '1px solid #FCE1E7',
    backgroundColor: '#FFF7F8',
  };

  const inputStyle = {
    flex: 1,
    padding: '14px 0',
    fontSize: '14.5px',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: "'Poppins', sans-serif",
    color: '#241B22',
  };

  const selectWrapStyle = {
    flex: '1 1 170px',
    padding: '0 18px',
    borderRadius: '30px',
    border: '1px solid #FCE1E7',
    backgroundColor: '#FFF7F8',
  };

  const selectStyle = {
    width: '100%',
    padding: '14px 0',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#5C4650',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  };

  const resultsRowStyle = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    margin: '34px 4px 20px',
    flexWrap: 'wrap',
    gap: '10px',
  };

  const resultsHeadingStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '24px',
    margin: 0,
    color: '#241B22',
  };
  const resultsCountStyle = { fontSize: '13.5px', color: '#8B7A82' };

  const sortSelectStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '13.5px',
    color: '#8B7A82',
    background: '#FFFFFF',
    border: '1px solid #FCE1E7',
    borderRadius: '20px',
    padding: '8px 16px',
    cursor: 'pointer',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '22px',
  };

  const getCardStyle = (id) => ({
    backgroundColor: '#FFFFFF',
    borderRadius: '22px',
    border: '1px solid #FCE9EE',
    padding: '22px',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: hoveredCardId === id ? '0 24px 40px -22px rgba(244,63,101,0.35)' : '0 8px 20px -14px rgba(36,27,34,0.12)',
    transform: hoveredCardId === id ? 'translateY(-5px)' : 'translateY(0)',
    transition: 'all 0.22s ease',
  });

  const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' };

  const categoryPillStyle = (category) => ({
    fontSize: '12px',
    fontWeight: 600,
    padding: '6px 14px',
    borderRadius: '20px',
    ...(CATEGORY_STYLES[category] || DEFAULT_CATEGORY_STYLE),
  });

  const ratingBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#F43F65',
    backgroundColor: '#FFE3E9',
    padding: '5px 10px',
    borderRadius: '20px',
  };

  const cardTitleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '19px',
    margin: '0 0 10px',
    lineHeight: 1.35,
    color: '#241B22',
  };
  const cityRowStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', color: '#8B7A82', margin: '0 0 20px' };

  const cardFooterStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: '16px',
    borderTop: '1px dashed #FCE9EE',
  };
  const priceLabelStyle = { fontSize: '11px', letterSpacing: '0.06em', color: '#8B7A82' };
  const priceStyle = { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '19px', color: '#F43F65' };

  const statusWrapStyle = { textAlign: 'center', padding: '70px 20px', color: '#8B7A82' };
  const statusHeadingStyle = { fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#241B22', fontWeight: 700, margin: '0 0 8px' };
  const resetButtonStyle = {
    marginTop: '18px',
    background: 'linear-gradient(135deg, #FF8FA3, #F43F65)',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '30px',
    fontSize: '13.5px',
    fontWeight: 600,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
  };

  return (
    <div style={pageStyle}>
      <div style={heroStyle}>
        <span style={heroFlowerLeftStyle}>🌸</span>
        <span style={heroFlowerRightStyle}>🌸</span>

        <span style={badgeRowStyle}>
          <HeartIcon /> Curated Across India
        </span>
        <h1 style={titleStyle}>
          Find Vendors for Your<br />
          Dream <span style={{ color: '#FFFFFF' }}>Wedding</span> 💍
        </h1>
        <p style={subtitleStyle}>
          Browse top-rated caterers, photographers, venues, decorators and more — everything you need to plan the big day.
        </p>
      </div>

      <div style={containerStyle}>
        <div style={controlsContainerStyle}>
          <div style={fieldWrapStyle}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search vendors by name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={selectWrapStyle}>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={selectStyle}>
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>

          <div style={selectWrapStyle}>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={selectStyle}>
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={resultsRowStyle}>
          <div>
            <h2 style={resultsHeadingStyle}>Our Vendors</h2>
            <div style={resultsCountStyle}>
              {!loading && !error &&
                `${filteredVendors.length} ${filteredVendors.length === 1 ? 'vendor' : 'vendors'} found`}
            </div>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={sortSelectStyle}>
            <option value="default">Sort: Featured</option>
            <option value="rating-desc">Rating: High to low</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
          </select>
        </div>

        {loading && (
          <div style={statusWrapStyle}>
            <p style={statusHeadingStyle}>Loading vendors…</p>
          </div>
        )}

        {error && (
          <div style={statusWrapStyle}>
            <h3 style={statusHeadingStyle}>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredVendors.length === 0 && (
          <div style={statusWrapStyle}>
            <h3 style={statusHeadingStyle}>No vendors match your search</h3>
            <p>Try a different city, category, or clear your search.</p>
            <button style={resetButtonStyle} onClick={resetFilters}>Clear filters</button>
          </div>
        )}

        {!loading && !error && filteredVendors.length > 0 && (
          <div style={gridStyle}>
            {filteredVendors.map((vendor) => (
              <Link
                key={vendor.id}
                to={`/vendors/${vendor.id}`}
                style={getCardStyle(vendor.id)}
                onMouseEnter={() => setHoveredCardId(vendor.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                <div>
                  <div style={cardHeaderStyle}>
                    <span style={categoryPillStyle(vendor.category)}>{vendor.category}</span>
                    <span style={ratingBadgeStyle}>
                      <HeartIcon /> {Number(vendor.rating).toFixed(1)}
                    </span>
                  </div>
                  <h3 style={cardTitleStyle}>{vendor.name}</h3>
                  <div style={cityRowStyle}>
                    <PinIcon /> {vendor.city}
                  </div>
                </div>

                <div style={cardFooterStyle}>
                  <span style={priceLabelStyle}>STARTING PRICE</span>
                  <span style={priceStyle}>₹{Number(vendor.price).toLocaleString('en-IN')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
