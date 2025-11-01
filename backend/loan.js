const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 2026;

// Data folder path
const dataDir = path.join(__dirname, 'data');
const customersFile = path.join(dataDir, 'customers.json');
const billsFile = path.join(dataDir, 'bills.json');
const paymentsFile = path.join(dataDir, 'payments.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper function to initialize JSON file with empty array if it doesn't exist
function ensureJsonFile(filePath, defaultValue = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    console.log(`Initialized ${path.basename(filePath)} with empty data`);
  }
}

// Initialize all JSON files with empty data if they don't exist
ensureJsonFile(customersFile, []);
ensureJsonFile(billsFile, []);
ensureJsonFile(paymentsFile, []);

// Helper function to read customers
function readCustomers() {
  try {
    ensureJsonFile(customersFile, []); // Ensure file exists before reading
    const data = fs.readFileSync(customersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading customers:', error);
    return [];
  }
}

// Helper function to write customers
function writeCustomers(customers) {
  fs.writeFileSync(customersFile, JSON.stringify(customers, null, 2));
  console.log(`[${new Date().toISOString()}] Written ${customers.length} customers to file`);
}

// Helper function to read bills
function readBills() {
  try {
    ensureJsonFile(billsFile, []); // Ensure file exists before reading
    const data = fs.readFileSync(billsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading bills:', error);
    return [];
  }
}

// Helper function to write bills
function writeBills(bills) {
  fs.writeFileSync(billsFile, JSON.stringify(bills, null, 2));
  console.log(`[${new Date().toISOString()}] Written ${bills.length} bills to file`);
}

// Helper function to read payments
function readPayments() {
  try {
    ensureJsonFile(paymentsFile, []); // Ensure file exists before reading
    const data = fs.readFileSync(paymentsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading payments:', error);
    return [];
  }
}

// Helper function to write payments
function writePayments(payments) {
  fs.writeFileSync(paymentsFile, JSON.stringify(payments, null, 2));
  console.log(`[${new Date().toISOString()}] Written ${payments.length} payments to file`);
}

// Generate CustomerId
function generateCustomerId() {
  const customers = readCustomers();
  if (customers.length === 0) {
    return 'CUST001';
  }
  const lastId = customers[customers.length - 1].customerId || 'CUST000';
  const num = parseInt(lastId.replace('CUST', '')) + 1;
  return `CUST${String(num).padStart(3, '0')}`;
}

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log(`[${timestamp}] Request Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root API endpoint
app.get('/', (req, res) => {
  console.log(`[${new Date().toISOString()}] Root endpoint accessed`);
  res.json({ 
    message: 'Loan API is running',
    status: 'success'
  });
});

// Get all customers endpoint
app.get('/api/customers', (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all customers...`);
    const customers = readCustomers();
    console.log(`[${new Date().toISOString()}] Found ${customers.length} customers`);
    res.json({
      success: true,
      customers: customers
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching customers:`, error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single customer by ID
app.get('/api/customers/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[${new Date().toISOString()}] Fetching customer with ID: ${id}`);
    const customers = readCustomers();
    const customer = customers.find(c => c.customerId === id);
    
    if (!customer) {
      console.log(`[${new Date().toISOString()}] Customer not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    console.log(`[${new Date().toISOString()}] Customer found: ${customer.customerName} (${customer.customerId})`);
    res.json({
      success: true,
      customer: customer
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching customer:`, error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create customer endpoint
app.post('/api/customers', (req, res) => {
  try {
    const { customerName, location, contactNumber, previousBills } = req.body;
    console.log(`[${new Date().toISOString()}] Creating new customer: ${customerName}`);

    // Validate required fields
    if (!customerName || customerName.trim() === '') {
      console.log(`[${new Date().toISOString()}] Validation failed: Customer Name is required`);
      return res.status(400).json({ 
        success: false,
        message: 'Customer Name is required' 
      });
    }

    // Read existing customers
    const customers = readCustomers();
    console.log(`[${new Date().toISOString()}] Current customer count: ${customers.length}`);

    // Create new customer
    const previousBillsAmount = previousBills ? parseFloat(previousBills) : 0;
    const newCustomer = {
      customerId: generateCustomerId(),
      customerName: customerName.trim(),
      location: location ? location.trim() : '',
      contactNumber: contactNumber ? contactNumber.trim() : '',
      previousBills: previousBillsAmount,
      bills: [],
      paidAmount: 0,
      toBePaid: previousBillsAmount  // Set initial toBePaid from previousBills
    };

    console.log(`[${new Date().toISOString()}] Generated Customer ID: ${newCustomer.customerId}`);

    // Add to array
    customers.push(newCustomer);

    // Write back to file
    writeCustomers(customers);

    console.log(`[${new Date().toISOString()}] Customer created successfully: ${newCustomer.customerName} (${newCustomer.customerId})`);
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: newCustomer
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating customer:`, error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all bills endpoint
app.get('/api/bills', (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all bills...`);
    const bills = readBills();
    console.log(`[${new Date().toISOString()}] Found ${bills.length} bills`);
    res.json({
      success: true,
      bills: bills
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching bills:`, error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get bills by customer ID
app.get('/api/bills/customer/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[${new Date().toISOString()}] Fetching bills for customer ID: ${id}`);
    const bills = readBills();
    const customerBills = bills.filter(b => b.customerId === id);
    console.log(`[${new Date().toISOString()}] Found ${customerBills.length} bills for customer ${id}`);
    res.json({
      success: true,
      bills: customerBills
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching customer bills:`, error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create bill endpoint
app.post('/api/bills', (req, res) => {
  try {
    const { billNumber, customerId, billAmount, billDate, notes } = req.body;
    console.log(`[${new Date().toISOString()}] Creating new bill - Bill Number: ${billNumber}, Customer ID: ${customerId}`);

    // Validate required fields
    if (!billNumber || billNumber.toString().length !== 4) {
      console.log(`[${new Date().toISOString()}] Validation failed: Bill Number must be 4 digits, got: ${billNumber}`);
      return res.status(400).json({ 
        success: false,
        message: 'Bill Number must be a 4-digit number' 
      });
    }

    if (!customerId || customerId.trim() === '') {
      console.log(`[${new Date().toISOString()}] Validation failed: Customer ID is required`);
      return res.status(400).json({ 
        success: false,
        message: 'Customer selection is required' 
      });
    }

    if (!billAmount || parseFloat(billAmount) <= 0) {
      console.log(`[${new Date().toISOString()}] Validation failed: Bill amount must be greater than 0, got: ${billAmount}`);
      return res.status(400).json({ 
        success: false,
        message: 'Bill amount is required and must be greater than 0' 
      });
    }

    if (!billDate || billDate.trim() === '') {
      console.log(`[${new Date().toISOString()}] Validation failed: Bill date is required`);
      return res.status(400).json({ 
        success: false,
        message: 'Bill date is required' 
      });
    }

    // Verify customer exists
    const customers = readCustomers();
    const customer = customers.find(c => c.customerId === customerId);
    if (!customer) {
      console.log(`[${new Date().toISOString()}] Customer not found: ${customerId}`);
      return res.status(400).json({
        success: false,
        message: 'Selected customer not found'
      });
    }
    console.log(`[${new Date().toISOString()}] Customer verified: ${customer.customerName} (${customer.customerId})`);

    // Check if bill number already exists
    const bills = readBills();
    const existingBill = bills.find(b => b.billNumber === billNumber.toString());
    if (existingBill) {
      console.log(`[${new Date().toISOString()}] Bill number already exists: ${billNumber}`);
      return res.status(400).json({
        success: false,
        message: 'Bill number already exists'
      });
    }

    // Create new bill
    const newBill = {
      billNumber: billNumber.toString(),
      customerId: customerId,
      customerName: customer.customerName,
      billAmount: parseFloat(billAmount),
      billDate: billDate.trim(),
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString()
    };

    console.log(`[${new Date().toISOString()}] Creating bill:`, JSON.stringify(newBill, null, 2));

    // Add to array
    bills.push(newBill);

    // Write back to file
    writeBills(bills);

    // Update customer's bill information
    const customerIndex = customers.findIndex(c => c.customerId === customerId);
    if (customerIndex !== -1) {
      // Initialize fields if they don't exist (for existing customers)
      if (!customers[customerIndex].bills) {
        customers[customerIndex].bills = [];
      }
      if (customers[customerIndex].paidAmount === undefined) {
        customers[customerIndex].paidAmount = 0;
      }
      if (customers[customerIndex].toBePaid === undefined) {
        customers[customerIndex].toBePaid = 0;
      }

      // Add bill number to customer's bills array (if not already there)
      if (!customers[customerIndex].bills.includes(newBill.billNumber)) {
        customers[customerIndex].bills.push(newBill.billNumber);
      }

      // Update toBePaid amount (add the new bill amount)
      customers[customerIndex].toBePaid = (customers[customerIndex].toBePaid || 0) + newBill.billAmount;

      // Write updated customers back to file
      writeCustomers(customers);

      console.log(`[${new Date().toISOString()}] Updated customer loan amount - Customer: ${customers[customerIndex].customerName}, Bills: [${customers[customerIndex].bills.join(', ')}], To Be Paid: ${customers[customerIndex].toBePaid}`);
    }

    console.log(`[${new Date().toISOString()}] Bill created successfully - Bill Number: ${newBill.billNumber}, Amount: ${newBill.billAmount}`);
    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      bill: newBill
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating bill:`, error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get payments by customer ID
app.get('/api/payments/customer/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[${new Date().toISOString()}] Fetching payments for customer ID: ${id}`);
    const payments = readPayments();
    const customerPayments = payments.filter(p => p.customerId === id);
    console.log(`[${new Date().toISOString()}] Found ${customerPayments.length} payments for customer ${id}`);
    res.json({
      success: true,
      payments: customerPayments
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching customer payments:`, error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create payment endpoint
app.post('/api/payments', (req, res) => {
  try {
    const { customerId, payingAmount, notes } = req.body;
    console.log(`[${new Date().toISOString()}] Creating new payment - Customer ID: ${customerId}, Amount: ${payingAmount}`);

    // Validate required fields
    if (!customerId || customerId.trim() === '') {
      console.log(`[${new Date().toISOString()}] Validation failed: Customer ID is required`);
      return res.status(400).json({ 
        success: false,
        message: 'Customer selection is required' 
      });
    }

    if (!payingAmount || parseFloat(payingAmount) <= 0) {
      console.log(`[${new Date().toISOString()}] Validation failed: Paying amount must be greater than 0, got: ${payingAmount}`);
      return res.status(400).json({ 
        success: false,
        message: 'Paying amount is required and must be greater than 0' 
      });
    }

    // Verify customer exists
    const customers = readCustomers();
    const customer = customers.find(c => c.customerId === customerId);
    if (!customer) {
      console.log(`[${new Date().toISOString()}] Customer not found: ${customerId}`);
      return res.status(400).json({
        success: false,
        message: 'Selected customer not found'
      });
    }
    console.log(`[${new Date().toISOString()}] Customer verified: ${customer.customerName} (${customer.customerId})`);

    // Create new payment
    const newPayment = {
      customerId: customerId,
      customerName: customer.customerName,
      payingAmount: parseFloat(payingAmount),
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString()
    };

    console.log(`[${new Date().toISOString()}] Creating payment:`, JSON.stringify(newPayment, null, 2));

    // Read existing payments
    const payments = readPayments();
    
    // Add to array
    payments.push(newPayment);

    // Write back to file
    writePayments(payments);

    // Update customer's paidAmount
    const customerIndex = customers.findIndex(c => c.customerId === customerId);
    if (customerIndex !== -1) {
      // Initialize fields if they don't exist
      if (customers[customerIndex].paidAmount === undefined) {
        customers[customerIndex].paidAmount = 0;
      }
      if (customers[customerIndex].toBePaid === undefined) {
        customers[customerIndex].toBePaid = 0;
      }

      // Update paidAmount (add the new payment amount)
      customers[customerIndex].paidAmount = (customers[customerIndex].paidAmount || 0) + newPayment.payingAmount;

      // Write updated customers back to file
      writeCustomers(customers);

      console.log(`[${new Date().toISOString()}] Updated customer payment - Customer: ${customers[customerIndex].customerName}, Paid Amount: ${customers[customerIndex].paidAmount}`);
    }

    console.log(`[${new Date().toISOString()}] Payment created successfully - Customer: ${newPayment.customerName}, Amount: ${newPayment.payingAmount}`);
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment: newPayment
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating payment:`, error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`\n========================================`);
  console.log(`[${timestamp}] Server is running on port ${PORT}`);
  console.log(`[${timestamp}] API endpoints available:`);
  console.log(`[${timestamp}]   GET  /`);
  console.log(`[${timestamp}]   GET  /api/customers`);
  console.log(`[${timestamp}]   GET  /api/customers/:id`);
  console.log(`[${timestamp}]   POST /api/customers`);
  console.log(`[${timestamp}]   GET  /api/bills`);
  console.log(`[${timestamp}]   POST /api/bills`);
  console.log(`[${timestamp}]   GET  /api/bills/customer/:id`);
  console.log(`[${timestamp}]   GET  /api/payments/customer/:id`);
  console.log(`[${timestamp}]   POST /api/payments`);
  console.log(`========================================\n`);
});

module.exports = app;

