import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  // Get greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  return (
    <div className="container mt-5">
      <p className="text-muted ">{getGreeting()}</p>
      <h1 className="mb-2 fw-light mb-5">Dashboard</h1>

      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <Link to="/add-customer" className="text-decoration-none">
            <div className="card dashboard-card h-100">
              <div className="card-body text-center p-5">
                <h5 className="card-title mb-3 fw-normal">Add Customer</h5>
                <p className="card-text text-muted small mb-0">Create new customer record</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-6 col-lg-4">
          <Link to="/view-customers" className="text-decoration-none">
            <div className="card dashboard-card h-100">
              <div className="card-body text-center p-5">
                <h5 className="card-title mb-3 fw-normal">View Customers</h5>
                <p className="card-text text-muted small mb-0">Browse all customers</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-6 col-lg-4">
          <Link to="/add-bills" className="text-decoration-none">
            <div className="card dashboard-card h-100">
              <div className="card-body text-center p-5">
                <h5 className="card-title mb-3 fw-normal">Add Bills</h5>
                <p className="card-text text-muted small mb-0">Create new bill</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-6 col-lg-4">
          <Link to="/all-bills" className="text-decoration-none">
            <div className="card dashboard-card h-100">
              <div className="card-body text-center p-5">
                <h5 className="card-title mb-3 fw-normal">All Bills</h5>
                <p className="card-text text-muted small mb-0">View all bills</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-6 col-lg-4">
          <Link to="/add-payments" className="text-decoration-none">
            <div className="card dashboard-card h-100">
              <div className="card-body text-center p-5">
                <h5 className="card-title mb-3 fw-normal">Add Payments</h5>
                <p className="card-text text-muted small mb-0">Record payment</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

