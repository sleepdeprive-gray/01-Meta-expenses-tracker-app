import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("expenses"));
    if (saved) setExpenses(saved);

    const savedTheme = JSON.parse(localStorage.getItem("darkMode"));
    if (savedTheme) setDarkMode(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const addOrUpdateExpense = () => {
    if (!description || !category || !amount || !date) {
      alert("Fill all fields");
      return;
    }

    const newExpense = { description, category, amount, date };

    if (editIndex !== null) {
      const updated = [...expenses];
      updated[editIndex] = newExpense;
      setExpenses(updated);
      setEditIndex(null);
    } else {
      setExpenses([...expenses, newExpense]);
    }

    clearFields();
  };

  const deleteExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const editExpense = (index) => {
    const exp = expenses[index];
    setDescription(exp.description);
    setCategory(exp.category);
    setAmount(exp.amount);
    setDate(exp.date);
    setEditIndex(index);
  };

  const clearFields = () => {
    setDescription("");
    setCategory("");
    setAmount("");
    setDate("");
  };

  const filteredExpenses = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const total = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  return (
    <div className={darkMode ? "container dark" : "container"}>
      {/* LEFT PANEL */}
      <div className="left-panel">
        <h2>ADD EXPENSES</h2>

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Category</option>
          <option>Food</option>
          <option>Transport</option>
          <option>Bills</option>
          <option>Shopping</option>
          <option>Other</option>
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={addOrUpdateExpense}>
          {editIndex !== null ? "Update" : "Add"}
        </button>

        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <h3>Total: ₱{total}</h3>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <h2>Meta Expenses</h2>

        <input
          className="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="list-box">
          {filteredExpenses.map((item, index) => (
            <div key={index} className="expense-item">
              {item.date} | {item.description} | {item.category} | ₱{item.amount}

              <div className="actions">
                <button onClick={() => editExpense(index)}>Edit</button>
                <button onClick={() => deleteExpense(index)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;