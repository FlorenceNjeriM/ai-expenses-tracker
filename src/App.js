import React, { useState, useEffect } from "react";

import './index.css';






function App() {
  // State to store input values
  const [expense, setExpense] = useState({ description: "", amount: "" });

  // State to store expense list
  const [expenses, setExpenses] = useState([]);

  // Load expenses from local storage when the app starts
  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(savedExpenses);
  }, []);

  // Save expenses to local storage whenever the list updates
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Handle input changes
  const handleChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  // Function to add expense to the list
  const addExpense = () => {
    if (expense.description && expense.amount) {
      const newExpenses = [...expenses, expense]; // Add new expense
      setExpenses(newExpenses); // Update state
      setExpense({ description: "", amount: "" }); // Clear input fields
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>AI Expense Tracker</h1>

      {/* Expense Input Fields */}
      <input
        type="text"
        name="description"
        placeholder="Expense description"
        value={expense.description}
        onChange={handleChange}
        style={{ margin: "10px", padding: "10px", width: "200px" }}
      />
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={expense.amount}
        onChange={handleChange}
        style={{ margin: "10px", padding: "10px", width: "200px" }}
      />

      {/* Add Expense Button */}
      <button
        onClick={addExpense}
        style={{ padding: "10px 20px", background: "#007bff", color: "white", border: "none", marginLeft: "10px" }}
      >
        Add Expense
      </button>

      {/* Display Expenses */}
      <ul style={{ listStyle: "none", padding: "0", marginTop: "20px" }}>
        {expenses.map((exp, index) => (
          <li key={index} style={{ background: "#f8f9fa", padding: "10px", margin: "5px", borderRadius: "5px" }}>
            {exp.description} - ${exp.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;


