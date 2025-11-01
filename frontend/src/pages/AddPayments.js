import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

function AddPayments() {
  // Default to today's date
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    customerId: '',
    payingAmount: '',
    paidDate: today,
    notes: ''
  });
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.position-relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await fetch(API_ENDPOINTS.CUSTOMERS);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers || []);
        setFilteredCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setMessage({ type: 'danger', text: 'Error loading customers' });
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomerSelect = (customerId, customerName) => {
    setFormData(prev => ({
      ...prev,
      customerId: customerId
    }));
    setSearchTerm(`${customerId} - ${customerName}`);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (!formData.customerId) {
      setFormData(prev => ({
        ...prev,
        customerId: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      setMessage({ type: 'danger', text: 'Please select a customer' });
      return;
    }

    if (!formData.payingAmount || parseFloat(formData.payingAmount) <= 0) {
      setMessage({ type: 'danger', text: 'Paying amount is required and must be greater than 0' });
      return;
    }

    if (!formData.paidDate || formData.paidDate.trim() === '') {
      setMessage({ type: 'danger', text: 'Paid date is required' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(API_ENDPOINTS.PAYMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message || 'Payment recorded successfully!' });
        // Reset form - keep paidDate for next entry
        setFormData({
          customerId: '',
          payingAmount: '',
          paidDate: formData.paidDate,
          notes: ''
        });
        setSearchTerm('');
      } else {
        setMessage({ type: 'danger', text: data.message || 'Failed to record payment' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'danger', text: 'Error connecting to server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.customerId === formData.customerId);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Add Payments</h1>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage({ type: '', text: '' })}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-md-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="customerId" className="form-label text-start d-block">
                Customer <span className="text-danger">*</span>
              </label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  id="customerId"
                  placeholder="Search and select customer"
                  value={selectedCustomer ? `${selectedCustomer.customerId} - ${selectedCustomer.customerName}` : searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  required
                />
                {showDropdown && filteredCustomers.length > 0 && (
                  <div className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.customerId}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => handleCustomerSelect(customer.customerId, customer.customerName)}
                      >
                        <strong>{customer.customerId} - {customer.customerName}</strong>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && filteredCustomers.length === 0 && searchTerm && !customersLoading && (
                  <div className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                    <div className="list-group-item">No customers found</div>
                  </div>
                )}
              </div>
              {customersLoading && <small className="form-text text-muted">Loading customers...</small>}
            </div>

            <div className="mb-3">
              <label htmlFor="payingAmount" className="form-label text-start d-block">
                Paying Amount <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="payingAmount"
                name="payingAmount"
                value={formData.payingAmount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="paidDate" className="form-label text-start d-block">
                Paid Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="paidDate"
                name="paidDate"
                value={formData.paidDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="notes" className="form-label text-start d-block">Notes</label>
              <textarea
                className="form-control"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="btn btn-outline-dark"
              disabled={loading}
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPayments;

