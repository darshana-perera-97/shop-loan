import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

function AllBills() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.BILLS);
      const data = await response.json();

      if (data.success) {
        const billsData = data.bills || [];
        setBills(billsData);
        setFilteredBills(billsData);
      } else {
        setError('Failed to fetch bills');
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError('Error connecting to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase().trim();
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search

    if (term === '') {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter(bill =>
        bill.customerName.toLowerCase().includes(term) ||
        bill.billNumber.toString().includes(term)
      );
      setFilteredBills(filtered);
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

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
        <h1>All Bills</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">All Bills</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {bills.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by customer name or bill number..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      )}

      {bills.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No bills found.
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No bills found matching your search.
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Bill Number</th>
                  <th>Customer Name</th>
                  <th>Customer ID</th>
                  <th>Bill Amount</th>
                  <th>Bill Date</th>
                </tr>
              </thead>
              <tbody>
                {currentBills.map((bill) => (
                  <tr key={bill.billNumber}>
                    <td>{bill.billNumber}</td>
                    <td>{bill.customerName}</td>
                    <td>{bill.customerId}</td>
                    <td>LKR {formatAmount(bill.billAmount)}</td>
                    <td>{bill.billDate ? new Date(bill.billDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Bills pagination" className="mt-3">
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
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBills.length)} of {filteredBills.length} bills
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default AllBills;

