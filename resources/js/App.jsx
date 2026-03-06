import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingOriginalExpense, setEditingOriginalExpense] = useState(null);
  const [showNoChangesModal, setShowNoChangesModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState({ open: false, type: null, payload: null });
  const [actionLoading, setActionLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const savedTheme = JSON.parse(localStorage.getItem("darkMode"));
    if (savedTheme) {
      setDarkMode(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.classList.toggle("dark-body", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/expenses");
        if (!response.ok) {
          throw new Error("Failed to load expenses");
        }
        const data = await response.json();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Error loading expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const addOrUpdateExpense = async () => {
    if (!description || !category || !amount || !date) {
      alert("Fill all fields");
      return;
    }

    const payload = {
      description,
      category,
      amount: Number(amount),
      date,
    };

    setError("");
    setActionLoading(true);

    try {
      const response = await fetch(
        editId ? `/api/expenses/${editId}` : "/api/expenses",
        {
          method: editId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save expense");
      }

      const saved = await response.json();

      if (editId) {
        setExpenses((prev) =>
          prev.map((expense) =>
            expense.expenses_ID === editId ? saved : expense
          )
        );

        setTimeout(() => {
          setActionLoading(false);
          setEditId(null);
          setEditingOriginalExpense(null);
          clearFields();
        }, 2000);
      } else {
        setExpenses((prev) => [...prev, saved]);
        clearFields();
        setTimeout(() => {
          setActionLoading(false);
        }, 2000);
      }
    } catch (err) {
      setActionLoading(false);
      setError(err.message || "Error saving expense");
    }
  };

  const deleteExpense = async (id) => {
    setError("");
    setActionLoading(true);
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete expense");
      }

      setExpenses((prev) => prev.filter((expense) => expense.expenses_ID !== id));

      setTimeout(() => {
        setActionLoading(false);
      }, 2000);
    } catch (err) {
      setActionLoading(false);
      setError(err.message || "Error deleting expense");
    }
  };

  const editExpense = (id) => {
    const expense = expenses.find((item) => item.expenses_ID === id);
    if (!expense) return;
    setEditingOriginalExpense(expense);
    setDescription(expense.description);
    setCategory(expense.category);
    setAmount(expense.amount);
    setDate(expense.date);
    setEditId(id);
  };

  const openConfirm = (type, payload = null) => {
    setConfirm({ open: true, type, payload });
  };

  const handleConfirm = async () => {
    if (!confirm.type) return;

    if (confirm.type === "update") {
      await addOrUpdateExpense();
    } else if (confirm.type === "delete") {
      await deleteExpense(confirm.payload);
    }

    setConfirm({ open: false, type: null, payload: null });
  };

  const handleCancelConfirm = () => {
    setConfirm({ open: false, type: null, payload: null });
  };

  const clearFields = () => {
    setDescription("");
    setCategory("");
    setAmount("");
    setDate("");
  };

  const handleResetCancel = () => {
    clearFields();
    setEditId(null);
    setEditingOriginalExpense(null);
  };

  const hasExpenseChanges = () => {
    if (!editingOriginalExpense) return true;

    return (
      description !== editingOriginalExpense.description ||
      category !== editingOriginalExpense.category ||
      Number(amount) !== Number(editingOriginalExpense.amount) ||
      date !== editingOriginalExpense.date
    );
  };

  const handleStartDateChange = (event) => {
    const selectedStartDate = event.target.value;

    if (endDate && selectedStartDate && selectedStartDate > endDate) {
      return;
    }

    setStartDate(selectedStartDate);
  };

  const handleEndDateChange = (event) => {
    const selectedEndDate = event.target.value;

    if (startDate && selectedEndDate && selectedEndDate < startDate) {
      return;
    }

    setEndDate(selectedEndDate);
  };

  const formatDate = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    const year = parsed.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        expense.category.toLowerCase().includes(search.toLowerCase());

      const withinStart = !startDate || expense.date >= startDate;
      const withinEnd = !endDate || expense.date <= endDate;

      return matchesSearch && withinStart && withinEnd;
    })
    .sort((a, b) => {
      if (a.date === b.date) {
        return Number(b.expenses_ID) - Number(a.expenses_ID);
      }
      return b.date.localeCompare(a.date);
    });

  const isFormComplete =
    description.trim() !== "" &&
    category.trim() !== "" &&
    amount !== "" &&
    date !== "";

  const total = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div className={darkMode ? "container dark" : "container"}>
      <div className="left-panel">
        <h2>Add / Edit Expenses</h2>

        <input
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Category</option>
          <option>Food</option>
          <option>Transportation</option>
          <option>Bills</option>
          <option>Others</option>
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />

        <input
          type="date"
          value={date}
          max={today}
          onChange={(event) => setDate(event.target.value)}
        />

        <div className="form-actions">
          <button
            className={editId !== null ? "primary-btn edit" : "primary-btn add"}
            disabled={editId === null && !isFormComplete}
            onClick={() => {
              if (editId !== null) {
                if (!hasExpenseChanges()) {
                  setShowNoChangesModal(true);
                  return;
                }
                openConfirm("update");
              } else {
                addOrUpdateExpense();
              }
            }}
          >
            {editId !== null ? "Update" : "Add"}
          </button>

          <button className="secondary-btn" onClick={handleResetCancel}>
            {editId !== null ? "Cancel" : "Reset"}
          </button>
        </div>
      </div>

      <div className="right-panel">
        <h2>Meta Expenses</h2>

        <div className="filters">
          <input
            className="search"
            placeholder="Search..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <input
            type="date"
            value={startDate}
            max={endDate || today}
            onChange={handleStartDateChange}
            aria-label="Start date"
          />

          <input
            type="date"
            value={endDate}
            min={startDate || ""}
            max={today}
            onChange={handleEndDateChange}
            aria-label="End date"
          />
        </div>

        <div className="list-header">
          <div>Description</div>
          <div>Type</div>
          <div>Price (₱)</div>
          <div>Date</div>
          <div>Action</div>
        </div>

        <div className="list-box">
          {loading && <div className="status">Loading expenses...</div>}
          {error && <div className="status error">{error}</div>}
          {!loading && !error && filteredExpenses.length === 0 && (
            <div className="status">No expenses found.</div>
          )}

          {!loading && !error && filteredExpenses.map((expense) => (
            <div key={expense.expenses_ID} className="expense-row">
              <div className="cell desc">{expense.description}</div>
              <div className="cell type">{expense.category}</div>
              <div className="cell price">{Number(expense.amount).toFixed(2)}</div>
              <div className="cell date">{formatDate(expense.date)}</div>
              <div className="cell actions">
                <button className="edit-btn" onClick={() => editExpense(expense.expenses_ID)}>Edit</button>
                <button className="delete-btn" onClick={() => openConfirm("delete", expense.expenses_ID)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div className="total-row">
          <span className="total-chip">Total Expenses: ₱{total.toFixed(2)}</span>
          <button
            className={darkMode ? "toggle-btn dark" : "toggle-btn"}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      {confirm.open && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Confirm {confirm.type === "delete" ? "Delete" : "Update"}</h3>
            <p className="modal-text">Are you sure you want to {confirm.type === "delete" ? "delete" : "update"} this expense?</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={handleCancelConfirm}>Cancel</button>
              <button
                className={`modal-btn ${confirm.type === "delete" ? "danger" : "success"}`}
                onClick={handleConfirm}
              >
                {confirm.type === "delete" ? "Delete" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoChangesModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>No Changes Detected</h3>
            <p className="modal-text">There are no updates to save.</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowNoChangesModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {actionLoading && (
        <div className="modal-backdrop subtle">
          <div className="modal small">
            <p>Applying changes...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
