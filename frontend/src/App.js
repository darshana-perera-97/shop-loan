import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddCustomer from './pages/AddCustomer';
import ViewCustomers from './pages/ViewCustomers';
import AddBills from './pages/AddBills';
import AllBills from './pages/AllBills';
import AddPayments from './pages/AddPayments';
import SingleCustomer from './pages/SingleCustomer';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/view-customers" element={<ViewCustomers />} />
          <Route path="/add-bills" element={<AddBills />} />
          <Route path="/all-bills" element={<AllBills />} />
          <Route path="/add-payments" element={<AddPayments />} />
          <Route path="/customer/:id" element={<SingleCustomer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
