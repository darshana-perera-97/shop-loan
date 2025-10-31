import React from 'react';
import { useParams } from 'react-router-dom';

function SingleBill() {
  const { id } = useParams();
  
  return (
    <div className="container mt-4">
      <h1>Single Bill</h1>
      <p>Bill ID: {id}</p>
    </div>
  );
}

export default SingleBill;

