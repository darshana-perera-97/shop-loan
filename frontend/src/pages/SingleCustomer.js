import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function SingleCustomer() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch customer
      const customerResponse = await fetch(`http://localhost:2026/api/customers/${id}`);
      const customerData = await customerResponse.json();
      
      if (customerData.success) {
        setCustomer(customerData.customer);
      } else {
        setError('Customer not found');
        return;
      }

      // Fetch bills
      const billsResponse = await fetch(`http://localhost:2026/api/bills/customer/${id}`);
      const billsData = await billsResponse.json();
      if (billsData.success) {
        setBills(billsData.bills || []);
      }

      // Fetch payments
      const paymentsResponse = await fetch(`http://localhost:2026/api/payments/customer/${id}`);
      const paymentsData = await paymentsResponse.json();
      if (paymentsData.success) {
        setPayments(paymentsData.payments || []);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setError('Error loading customer data');
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Calculate totals
  const previousBills = customer?.previousBills || 0;
  const billsTotal = bills.reduce((sum, bill) => sum + (bill.billAmount || 0), 0);
  const totalBillAmount = previousBills + billsTotal; // Include previous bills
  const totalPaid = payments.reduce((sum, payment) => sum + (payment.payingAmount || 0), 0);
  const amountToBePaid = totalBillAmount - totalPaid;

  if (loading) {
    return (
      <div className="container mt-4">
        <h1>Customer Details</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container mt-4">
        <h1>Customer Details</h1>
        <div className="alert alert-danger" role="alert">
          {error || 'Customer not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">{customer.customerName}</h1>
      
      <div className="mb-4">
        <p><strong>Customer ID:</strong> {customer.customerId}</p>
        {customer.location && <p><strong>Location:</strong> {customer.location}</p>}
        {customer.contactNumber && <p><strong>Contact Number:</strong> {customer.contactNumber}</p>}
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Total Bill Amount</h5>
              <h3 className="mb-0">LKR {formatAmount(totalBillAmount)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Total Paid</h5>
              <h3 className="mb-0">LKR {formatAmount(totalPaid)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Amount to be Paid</h5>
              <h3 className="mb-0">LKR {formatAmount(amountToBePaid)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Bills Table */}
        <div className="col-md-6">
          <h4 className="mb-3">Bills</h4>
          {bills.length === 0 ? (
            <div className="alert alert-info" role="alert">
              No bills found for this customer.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Bill Number</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.billNumber}>
                      <td>{bill.billNumber}</td>
                      <td>LKR {formatAmount(bill.billAmount)}</td>
                      <td>{formatDate(bill.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payments Table */}
        <div className="col-md-6">
          <h4 className="mb-3">Payments</h4>
          {payments.length === 0 ? (
            <div className="alert alert-info" role="alert">
              No payments found for this customer.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Payment Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={index}>
                      <td>LKR {formatAmount(payment.payingAmount)}</td>
                      <td>{formatDate(payment.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SingleCustomer;

