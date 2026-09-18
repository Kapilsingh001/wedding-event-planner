import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001';

// Loads the display fonts once. Safe to keep here even if this
// component mounts more than once — it just skips re-adding the link.
function useThemeFonts() {
  useEffect(() => {
    if (document.getElementById('vivaha-fonts')) return;
    const link = document.createElement('link');
    link.id = 'vivaha-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Marcellus&family=Karla:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);
}

const CATEGORY_STYLES = {
  Catering: { color: '#B25A2A', background: '#FBE9DC' },
  Photographer: { color: '#3D4B8C', background: '#E4E7F6' },
  Venue: { color: '#7A1130', background: '#F7E3E7' },
  Decorator: { color: '#1F6B4F', background: '#E1F0E8' },
  Music: { color: '#8B3A62', background: '#F5E2ED' },
};
const DEFAULT_CATEGORY_STYLE = { color: '#6B5A4E', background: '#EFE7DA' };

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" style={{ fill: '#7A1130', flexShrink: 0 }}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" style={{ fill: '#C79A3E' }}>
    <path d="M21.71 20.29 18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42-1.39ZM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7Z" />
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" style={{ fill: '#C79A3E' }}>
    <path d="M12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.6 5.8 21 7 14.1 2 9.3 9 8.5Z" />
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
    backgroundColor: '#FBF4E8',
    minHeight: '100vh',
    fontFamily: "'Karla', 'Segoe UI', sans-serif",
    color: '#2B1810',
  };

  const heroStyle = {
    background: 'linear-gradient(160deg, #7A1130 0%, #5A0C24 100%)',
    color: '#FBF4E8',
    padding: '52px 24px 68px',
    textAlign: 'center',
  };

  const eyebrowRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '16px',
  };
  const eyebrowDotStyle = { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#E8C877' };
  const eyebrowTextStyle = { letterSpacing: '0.14em', fontSize: '12px', color: '#E8C877', fontWeight: 700 };

  const titleStyle = {
    fontFamily: "'Marcellus', serif",
    fontWeight: 400,
    fontSize: 'clamp(32px, 5vw, 46px)',
    margin: '0 0 12px',
  };
  const subtitleStyle = { fontSize: '15px', color: '#EFDDD0', maxWidth: '520px', margin: '0 auto', lineHeight: 1.55 };

  const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' };

  const controlsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    marginTop: '-36px',
    marginBottom: '10px',
    backgroundColor: '#FFFDF8',
    padding: '20px',
    borderRadius: '4px',
    border: '1px solid #E7D9BF',
    boxShadow: '0 18px 40px -22px rgba(90,12,36,0.35)',
    position: 'relative',
  };

  const fieldWrapStyle = {
    flex: '2 1 240px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 14px',
    borderRadius: '3px',
    border: '1px solid #E7D9BF',
    backgroundColor: '#fff',
  };

  const inputStyle = {
    flex: 1,
    padding: '13px 0',
    fontSize: '14.5px',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: "'Karla', sans-serif",
    color: '#2B1810',
  };

  const selectWrapStyle = {
    flex: '1 1 170px',
    padding: '0 14px',
    borderRadius: '3px',
    border: '1px solid #E7D9BF',
    backgroundColor: '#fff',
  };

  const selectStyle = {
    width: '100%',
    padding: '13px 0',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#5A4636',
    cursor: 'pointer',
    fontFamily: "'Karla', sans-serif",
  };

  const resultsRowStyle = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    margin: '30px 2px 18px',
    flexWrap: 'wrap',
    gap: '10px',
  };

  const resultsHeadingStyle = {
    fontFamily: "'Marcellus', serif",
    fontWeight: 400,
    fontSize: '22px',
    margin: 0,
    color: '#5A0C24',
  };
  const resultsCountStyle = { fontSize: '13.5px', color: '#6B5A4E' };

  const sortSelectStyle = {
    fontFamily: "'Karla', sans-serif",
    fontSize: '13.5px',
    color: '#6B5A4E',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #E7D9BF',
    padding: '4px 4px',
    cursor: 'pointer',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
  };

  const getCardStyle = (id) => ({
    backgroundColor: '#FFFDF8',
    borderRadius: '2px',
    border: '1px solid #E7D9BF',
    borderLeft: hoveredCardId === id ? '3px solid #7A1130' : '3px solid #C79A3E',
    padding: '20px',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: hoveredCardId === id ? '0 20px 30px -20px rgba(90,12,36,0.3)' : 'none',
    transform: hoveredCardId === id ? 'translateY(-3px)' : 'translateY(0)',
    transition: 'all 0.18s ease',
  });

  const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' };

  const categoryPillStyle = (category) => ({
    fontSize: '12px',
    fontWeight: 700,
    padding: '5px 12px',
    borderRadius: '20px',
    ...(CATEGORY_STYLES[category] || DEFAULT_CATEGORY_STYLE),
  });

  const ratingBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#5A0C24',
  };

  const cardTitleStyle = { fontFamily: "'Marcellus', serif", fontWeight: 400, fontSize: '19px', margin: '0 0 10px', lineHeight: 1.3, color: '#2B1810' };
  const cityRowStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', color: '#6B5A4E', margin: '0 0 20px' };

  const cardFooterStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: '14px',
    borderTop: '1px dashed #E7D9BF',
  };
  const priceLabelStyle = { fontSize: '11px', letterSpacing: '0.06em', color: '#6B5A4E' };
  const priceStyle = { fontFamily: "'Marcellus', serif", fontSize: '19px', color: '#5A0C24' };

  const statusWrapStyle = { textAlign: 'center', padding: '70px 20px', color: '#6B5A4E' };
  const statusHeadingStyle = { fontFamily: "'Marcellus', serif", fontSize: '22px', color: '#5A0C24', fontWeight: 400, margin: '0 0 8px' };
  const resetButtonStyle = {
    marginTop: '16px',
    backgroundColor: '#7A1130',
    color: '#FBF4E8',
    border: 'none',
    padding: '10px 22px',
    borderRadius: '3px',
    fontSize: '13.5px',
    fontFamily: "'Karla', sans-serif",
    cursor: 'pointer',
  };

  return (
    <div style={pageStyle}>
      <div style={heroStyle}>
        <div style={eyebrowRowStyle}>
          <span style={eyebrowDotStyle} />
          <span style={eyebrowTextStyle}>CURATED ACROSS INDIA</span>
          <span style={eyebrowDotStyle} />
        </div>
        <h1 style={titleStyle}>The Vivaha Directory</h1>
        <p style={subtitleStyle}>
          Discover top-rated caterers, photographers, venues, decorators and more — handpicked across every city.
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
            <h2 style={resultsHeadingStyle}>Vendors</h2>
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
                      <StarIcon /> {Number(vendor.rating).toFixed(1)}
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
