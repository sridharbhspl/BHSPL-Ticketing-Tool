import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
      <Link to="/" style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
        <Home size={14} />
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} color="var(--text-dim)" />
            <Link 
              to={to} 
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 500, 
                color: last ? 'var(--primary)' : 'var(--text-dim)',
                textTransform: 'capitalize'
              }}
            >
              {value}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
