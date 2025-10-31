import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Shop Loan
        </Link>
        {!isDashboard && (
          <Link className="btn btn-outline-light" to="/">
            Back to Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

