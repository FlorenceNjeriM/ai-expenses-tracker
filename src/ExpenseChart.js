import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CF5"];

const ExpenseChart = ({ expenses }) => {
  // Group expenses by category & sum up amounts
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {});

  // Convert to Recharts data format
  const data = Object.entries(categoryTotals).map(([category, amount], index) => ({
    name: category ? `${category}: $${amount}` : "Uncategorized",  // Handle undefined categories
    value: amount,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Expense Breakdown</h3>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={70} // Increase radius for better spacing
          fill="#8884d8"
          dataKey="value"
          label={({ name }) => name.length > 15 ? `${name.substring(0, 15)}...` : name} // Truncate long labels
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={50} /> {/* Move legend below */}
      </PieChart>
    </div>
  );
};

export default ExpenseChart;
