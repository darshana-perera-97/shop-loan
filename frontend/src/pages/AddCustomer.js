import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

function AddCustomer() {
  const [formData, setFormData] = useState({
    customerName: '',
    location: '',
    contactNumber: '',
    previousBills: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName.trim()) {
      setMessage({ type: 'danger', text: 'Customer Name is required' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(API_ENDPOINTS.CUSTOMERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message || 'Customer added successfully!' });
        // Reset form
        setFormData({
          customerName: '',
          location: '',
          contactNumber: '',
          previousBills: 0
        });
      } else {
        setMessage({ type: 'danger', text: data.message || 'Failed to add customer' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'danger', text: 'Error connecting to server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Add Customer</h1>
      
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
              <label htmlFor="customerName" className="form-label text-start d-block">
                Customer Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="location" className="form-label text-start d-block">Location</label>
              <input
                type="text"
                className="form-control"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="contactNumber" className="form-label text-start d-block">Contact Number</label>
              <input
                type="text"
                className="form-control"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="previousBills" className="form-label text-start d-block">Previous Bills</label>
              <input
                type="number"
                className="form-control"
                id="previousBills"
                name="previousBills"
                value={formData.previousBills}
                onChange={handleChange}
                min="0"
              />
            </div>

            <button
              type="submit"
              className="btn btn-outline-dark"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Customer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCustomer;

