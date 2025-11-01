import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CUSTOMERS);
      const data = await response.json();

      if (data.success) {
        const customersData = data.customers || [];
        setCustomers(customersData);
        setFilteredCustomers(customersData);
      } else {
        setError('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Error connecting to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase().trim();
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search

    if (term === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.customerName.toLowerCase().includes(term) ||
        customer.customerId.toLowerCase().includes(term)
      );
      setFilteredCustomers(filtered);
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h1>View Customers</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">View Customers</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {customers.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No customers found.
        </div>
      ) : (
        <>
          {customers.length > 0 && (
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by customer ID or name..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          )}

          {filteredCustomers.length === 0 ? (
            <div className="alert alert-info" role="alert">
              No customers found matching your search.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Customer ID</th>
                      <th>Customer Name</th>
                      <th>Location</th>
                      <th>Contact Number</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCustomers.map((customer) => (
                      <tr key={customer.customerId}>
                        <td>{customer.customerId}</td>
                        <td>{customer.customerName}</td>
                        <td>{customer.location || '-'}</td>
                        <td>{customer.contactNumber || '-'}</td>
                        <td>
                          <Link
                            to={`/customer/${customer.customerId}`}
                            className="btn btn-outline-dark btn-sm"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Customers pagination" className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={handlePrevious} disabled={currentPage === 1}>
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => paginate(pageNumber)}>
                            {pageNumber}
                          </button>
                        </li>
                      );
                    })}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={handleNext} disabled={currentPage === totalPages}>
                        Next
                      </button>
                    </li>
                  </ul>
                  <div className="text-center mt-2 text-muted">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customers
                  </div>
                </nav>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ViewCustomers;

