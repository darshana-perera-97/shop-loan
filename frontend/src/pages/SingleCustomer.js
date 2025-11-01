import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_ENDPOINTS } from '../config/api';

function SingleCustomer() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch customer
      const customerResponse = await fetch(API_ENDPOINTS.CUSTOMER_BY_ID(id));
      const customerData = await customerResponse.json();
      
      if (customerData.success) {
        setCustomer(customerData.customer);
      } else {
        setError('Customer not found');
        return;
      }

      // Fetch bills
      const billsResponse = await fetch(API_ENDPOINTS.BILLS_BY_CUSTOMER(id));
      const billsData = await billsResponse.json();
      if (billsData.success) {
        setBills(billsData.bills || []);
      }

      // Fetch payments
      const paymentsResponse = await fetch(API_ENDPOINTS.PAYMENTS_BY_CUSTOMER(id));
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
    try {
      // Handle date string (YYYY-MM-DD format from billDate)
      if (dateString.includes('T')) {
        // ISO date string (from createdAt)
        const date = new Date(dateString);
        return date.toLocaleDateString();
      } else {
        // Date string format (YYYY-MM-DD from billDate)
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString();
      }
    } catch (e) {
      return dateString;
    }
  };

  const formatBillDate = (bill) => {
    // Prioritize billDate, fallback to createdAt for backwards compatibility
    if (bill.billDate) {
      return formatDate(bill.billDate);
    }
    // Only use createdAt if billDate doesn't exist (for old bills)
    return formatDate(bill.createdAt);
  };

  // Get the date string from a bill (for filtering)
  const getBillDateString = (bill) => {
    if (bill.billDate) {
      return bill.billDate;
    }
    return bill.createdAt || '';
  };

  // Extract month-year from date string (YYYY-MM-DD or ISO string)
  const getMonthYear = (dateString) => {
    if (!dateString) return null;
    try {
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString + 'T00:00:00');
      }
      if (isNaN(date.getTime())) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    } catch (e) {
      return null;
    }
  };

  // Get unique months from bills
  const getAvailableMonths = () => {
    const months = new Set();
    bills.forEach(bill => {
      const monthYear = getMonthYear(getBillDateString(bill));
      if (monthYear) {
        months.add(monthYear);
      }
    });
    return Array.from(months).sort().reverse(); // Most recent first
  };

  // Format month-year for display (e.g., "2024-01" -> "January 2024")
  const formatMonthYear = (monthYear) => {
    if (!monthYear) return '';
    const [year, month] = monthYear.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Filter bills by selected month
  const filteredBills = selectedMonth === 'all' 
    ? bills 
    : bills.filter(bill => {
        const monthYear = getMonthYear(getBillDateString(bill));
        return monthYear === selectedMonth;
      });

  // Download PDF function
  const downloadBillsPDF = () => {
    if (filteredBills.length === 0) return;

    const doc = new jsPDF();
    
    // Add customer name
    doc.setFontSize(18);
    doc.text(customer.customerName, 14, 20);
    
    // Add generated date
    doc.setFontSize(10);
    const generatedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated on: ${generatedDate}`, 14, 30);
    
    // Add filter info if not showing all months
    if (selectedMonth !== 'all') {
      doc.setFontSize(10);
      doc.text(`Month: ${formatMonthYear(selectedMonth)}`, 14, 36);
    }
    
    // Prepare table data
    const tableData = filteredBills.map(bill => [
      bill.billNumber,
      `LKR ${formatAmount(bill.billAmount)}`,
      formatBillDate(bill)
    ]);

    // Add table
    autoTable(doc, {
      startY: selectedMonth !== 'all' ? 42 : 36,
      head: [['Bill Number', 'Amount', 'Date']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
        2: { cellWidth: 70 }
      }
    });

    // Calculate total
    const filteredTotal = filteredBills.reduce((sum, bill) => sum + (bill.billAmount || 0), 0);
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: LKR ${formatAmount(filteredTotal)}`, 14, finalY);
    
    // Save PDF
    const fileName = `${customer.customerName}_Bills_${selectedMonth !== 'all' ? formatMonthYear(selectedMonth).replace(' ', '_') : 'All'}.pdf`;
    doc.save(fileName);
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Bills</h4>
            {bills.length > 0 && (
              <div className="d-flex gap-2 align-items-center">
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="all">All Months</option>
                  {getAvailableMonths().map(month => (
                    <option key={month} value={month}>
                      {formatMonthYear(month)}
                    </option>
                  ))}
                </select>
                {filteredBills.length > 0 && (
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={downloadBillsPDF}
                    title="Download Bills as PDF"
                  >
                    Download PDF
                  </button>
                )}
              </div>
            )}
          </div>
          {bills.length === 0 ? (
            <div className="alert alert-info" role="alert">
              No bills found for this customer.
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="alert alert-info" role="alert">
              No bills found for the selected month.
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
                  {filteredBills.map((bill) => (
                    <tr key={bill.billNumber}>
                      <td>{bill.billNumber}</td>
                      <td>LKR {formatAmount(bill.billAmount)}</td>
                      <td>{formatBillDate(bill)}</td>
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

