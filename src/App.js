import React, { useState, useEffect } from "react";
import ExpenseChart from "./ExpenseChart";
import "./App.css";

function App() {
  // State to store input values
  const [expense, setExpense] = useState({ description: "", amount: "", date: new Date().toISOString() });

  // State to store expense list
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  // State for budget goals
  const [budgetGoals, setBudgetGoals] = useState({
    Food: 100,
    Transport: 50,
    Entertainment: 75,
    Shopping: 200,
    Health: 100,
    Bills: 150,
    Other: 50
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Handle input changes
  const handleChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  // Function to categorize expense using AI
  const categorizeExpense = async (description) => {
    const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
    console.log("Using API Key:", apiKey);

    if (!apiKey) {
      console.error("API Key is missing!");
      return "Other";
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Categorize this expense in one word: Food, Transport, Entertainment, Shopping, Health, Bills, Other." },
            { role: "user", content: description }
          ],
          max_tokens: 5,
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content.trim() || "Other";
    } catch (error) {
      console.error("Error categorizing expense:", error);
      return "Other";
    }
  };

  // Function to add expense to the list
  const addExpense = async () => {
    if (expense.description && expense.amount) {
      const formattedDescription =
        expense.description.charAt(0).toUpperCase() + expense.description.slice(1).toLowerCase();

      const category = await categorizeExpense(expense.description);
      const amountValue = parseFloat(expense.amount);

      const existingExpenseIndex = expenses.findIndex(
        (exp) => exp.description.toLowerCase() === formattedDescription.toLowerCase()
      );

      let updatedExpenses;

      if (existingExpenseIndex !== -1) {
        updatedExpenses = expenses.map((exp, index) =>
          index === existingExpenseIndex ? { ...exp, amount: parseFloat(exp.amount) + amountValue } : exp
        );
      } else {
        const newExpense = {
          ...expense,
          description: formattedDescription,
          amount: amountValue,
          category,
          date: new Date().toISOString()
        };
        updatedExpenses = [...expenses, newExpense];
      }

      setExpenses(updatedExpenses);
      setExpense({ description: "", amount: "" });
    }
  };

  const deleteExpense = (index) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
  };

  // Function to calculate total expenses per category
  const getCategoryTotals = () => {
    const totals = {};

    expenses.forEach((expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + parseFloat(expense.amount);
    });

    return totals;
  };

  const categoryTotals = getCategoryTotals();

  // Function to update budget limits
  const updateBudget = (category, newLimit) => {
    setBudgetGoals((prev) => ({ ...prev, [category]: parseFloat(newLimit) || 0 }));
  };

  // Dark Mode Toggle
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <div className="container">
      {/* Dark Mode Toggle Button */}
      <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <h1>AI Expense Tracker</h1>

      {/* Expense Input Fields */}
      <input
        type="text"
        name="description"
        placeholder="Expense description"
        value={expense.description}
        onChange={handleChange}
        className="input-field"
      />
      <input
        type="number"
        placeholder="Amount"
        value={expense.amount}
        onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && addExpense()}
        className="input-field"
      />

      {/* Add Expense Button */}
      <button onClick={addExpense} className="add-btn">Add Expense</button>

      {/* Display Expenses */}
      <ul className="expense-list">
        {expenses.map((expense, index) => (
          <li key={index} className="expense-item">
            <span>{expense.description} - ${expense.amount}</span>
            <span className="category">{expense.category}</span>
            <button onClick={() => deleteExpense(index)} className="delete-btn">❌</button>
          </li>
        ))}
      </ul>

      {/* Budget Goals */}
     <div className= "budget-container ">
      <div className="budget-goals">
    <h3>Budget Goals</h3>
    <ul>
      {Object.entries(budgetGoals).map(([category, limit]) => {
        const spent = categoryTotals[category] || 0;
        const isOverBudget = spent > limit;

        return (
          <li key={category} className={isOverBudget ? "over-budget" : ""}>
            {category}: Spent ${spent} / Budget ${limit}
            {isOverBudget && <span className="alert">⚠ Over budget!</span>}
          </li>
        );
      })}
    </ul>
  </div>

      {/* Budget Settings */}
      <div className="budget-settings">
    <h3>Set Budget Goals</h3>
    {Object.keys(budgetGoals).map((category) => (
      <div key={category}>
        <label>{category}:</label>
        <input
          type="number"
          value={budgetGoals[category]}
          onChange={(e) => updateBudget(category, e.target.value)}
        />
      </div>
    ))}
  </div>
  </div>

      {/* Monthly Summary */}
    <div className="summary-container">
   
        <div className="monthly-summary">
          <h3>Monthly Summary</h3>
          <ul>
            {Object.entries(getCategoryTotals()).map(([month, total]) => (
              <li key={month}>
                {month}: <strong>${total.toFixed(2)}</strong>
              </li>
            ))}
          </ul>
        </div>
      
      {/* Expense Chart */}
      <div className="expense-breakdown">
    {expenses.length > 0 && <ExpenseChart expenses={expenses} />}
  </div>
  </div>
    </div>
  );
}

export default App;
