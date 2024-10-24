import React, { useState, useEffect, useCallback, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import "./App.css";
import { AuthContext, AuthProvider } from './services/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import axios from 'axios';
import { FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

function App() {
  const { authData, logoutUser } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [datetime, setDatetime] = useState("");
  const [description, setDescription] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [visibleTransactions, setVisibleTransactions] = useState(5);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [, setTotalTransactions] = useState(0);
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [error, setError] = useState(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'positive', or 'negative'
  const [, setFilteredBalance] = useState(0);
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'yearly', or 'monthly'
  const [, setYearlyData] = useState({});
  const [, setMonthlyData] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [darkMode, setDarkMode] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (authData) {
      getTransactions().catch(err => setError('Failed to fetch transactions'));
    }
  }, [authData]);

  const filterTransactions = useCallback(() => {
    let filtered = transactions;

    // Apply transaction type filter
    if (filter === 'positive') {
      filtered = filtered.filter(t => t.price >= 0);
    } else if (filter === 'negative') {
      filtered = filtered.filter(t => t.price < 0);
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.name.toLowerCase().includes(lowercaseQuery) ||
        transaction.description.toLowerCase().includes(lowercaseQuery) ||
        transaction.price.toString().includes(lowercaseQuery) ||
        new Date(transaction.datetime).toLocaleString().toLowerCase().includes(lowercaseQuery)
      );
    }

    setFilteredTransactions(filtered);
    
    // Calculate and set the filtered balance
    const newFilteredBalance = filtered.reduce((sum, transaction) => sum + transaction.price, 0);
    setFilteredBalance(newFilteredBalance);
  }, [transactions, filter, searchQuery]);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  const calculateTimeframeData = useCallback(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const yearlyTransactions = transactions.filter(t => new Date(t.datetime).getFullYear() === currentYear);
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.datetime);
      return transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === currentMonth;
    });

    setYearlyData({
      transactions: yearlyTransactions,
      balance: yearlyTransactions.reduce((sum, t) => sum + t.price, 0).toFixed(2),
      count: yearlyTransactions.length
    });

    setMonthlyData({
      transactions: monthlyTransactions,
      balance: monthlyTransactions.reduce((sum, t) => sum + t.price, 0).toFixed(2),
      count: monthlyTransactions.length
    });
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      calculateTimeframeData();
    }
  }, [calculateTimeframeData, transactions.length]);

  async function getTransactions() {
    try {
      const response = await axios.get(`${API_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setTransactions(response.data);
      setTotalTransactions(response.data.length);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    }
  }

  function validateTransaction() {
    const errors = [];
    
    if (!name.trim()) {
      errors.push("Transaction name is required.");
    }
    
    if (!price.trim()) {
      errors.push("Price is required.");
    } else if (isNaN(parseFloat(price))) {
      errors.push("Price must be a valid number.");
    }
    
    if (!datetime) {
      errors.push("Date and time are required.");
    }
    return errors;
  }

  async function addNewTransaction(e) {
    e.preventDefault();
    const validationErrors = validateTransaction();
    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"));
      setShowErrorPopup(true);
      return;
    }

    try {
      const priceAsNumber = parseFloat(price);
      const response = await axios.post(`${API_URL}/transaction`, {
        price: priceAsNumber,
        name,
        description: description || '',
        datetime,
      }, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });

      setName('');
      setPrice('');
      setDatetime('');
      setDescription('');
      setTransactions(prevTransactions => {
        const updatedTransactions = [...prevTransactions];
        const insertIndex = updatedTransactions.findIndex(t => new Date(t.datetime) < new Date(response.data.datetime));
        if (insertIndex === -1) {
          updatedTransactions.push(response.data);
        } else {
          updatedTransactions.splice(insertIndex, 0, response.data);
        }
        return updatedTransactions;
      });
      setTotalTransactions(prevTotal => prevTotal + 1);
      setRecentlyAddedId(response.data._id);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction. Please try again.');
      setShowErrorPopup(true);
    }
  }

  function closeErrorPopup() {
    setShowErrorPopup(false);
    setError(null);
  }

  function editTransaction(transaction) {
    // Convert the datetime string to a format that works with datetime-local input
    const datetimeForInput = new Date(transaction.datetime).toISOString().slice(0, 16);
    setEditingTransaction({ ...transaction, datetime: datetimeForInput });
  }

  async function updateTransaction(e) {
    e.preventDefault();
    setError(null);
    if (!editingTransaction.name || !editingTransaction.datetime || editingTransaction.price === undefined) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      const response = await axios.put(`${API_URL}/transaction/${editingTransaction._id}`, editingTransaction, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setEditingTransaction(null);
      setTransactions(prevTransactions =>
        prevTransactions.map(t => t._id === response.data._id ? response.data : t)
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      setError('Failed to update transaction. Please try again.');
    }
  }

  async function deleteTransaction(id) {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    setError(null);
    try {
      await axios.delete(`${API_URL}/transaction/${id}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setTransactions(prevTransactions => prevTransactions.filter(t => t._id !== id));
      setTotalTransactions(prevTotal => prevTotal - 1);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Failed to delete transaction. Please try again.');
    }
  }

  function toggleSelectMode() {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      // Clear selections when exiting select mode
      setSelectedTransactions([]);
    }
  }

  function toggleTransactionSelection(id) {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  }

  async function deleteSelectedTransactions() {
    if (selectedTransactions.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedTransactions.length} transaction(s)?`)) {
      return;
    }
    setError(null);
    try {
      await axios.post(`${API_URL}/transactions/delete`, { ids: selectedTransactions }, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setTransactions(prevTransactions => 
        prevTransactions.filter(t => !selectedTransactions.includes(t._id))
      );
      setTotalTransactions(prevTotal => prevTotal - selectedTransactions.length);
      setSelectedTransactions([]);
      setIsSelectMode(false);
    } catch (error) {
      console.error('Error deleting transactions:', error);
      setError('Failed to delete transactions. Please try again.');
    }
  }

  function getDisplayedTransactions() {
    let filtered = filteredTransactions;
    
    if (timeframe === 'yearly' || timeframe === 'monthly') {
      filtered = filtered.filter(t => new Date(t.datetime).getFullYear() === selectedYear);
      
      if (timeframe === 'monthly') {
        filtered = filtered.filter(t => new Date(t.datetime).getMonth() === selectedMonth);
      }
    }
    
    return filtered;
  }

  function getDisplayedBalance() {
    const displayedTransactions = getDisplayedTransactions();
    return displayedTransactions.reduce((sum, t) => sum + t.price, 0).toFixed(2);
  }

  const years = Array.from(new Set(transactions.map(t => new Date(t.datetime).getFullYear()))).sort((a, b) => b - a);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const displayedTransactions = getDisplayedTransactions();
  const displayedBalance = getDisplayedBalance();

  function toggleDarkMode() {
    setDarkMode(prevMode => !prevMode);
  }

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <header>
          <h1>Money Tracker</h1>
          {authData && (
            <div className={`balance ${parseFloat(displayedBalance) < 0 ? 'negative' : 'positive'}`}>
              {parseFloat(displayedBalance) < 0 ? '-' : '+'}${Math.abs(parseFloat(displayedBalance))}
            </div>
          )}
          <nav>
            {authData ? (
              <>
                <span style={{ alignSelf: 'center', color: '#3498db', fontWeight: 'bold' }}>Welcome, {authData.username}</span>
                <button onClick={logoutUser}><FaSignOutAlt /> Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"><FaSignInAlt /> Login</Link>
                <Link to="/register"><FaUserPlus /> Register</Link>
              </>
            )}
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <div className="form-container">
                    <form onSubmit={addNewTransaction}>
                      <div className="basic">
                        <input 
                          type="text" 
                          value={name}
                          onChange={ev => setName(ev.target.value)}
                          placeholder={'Transaction Name'}
                        />
                        <input 
                          type="number" 
                          value={price}
                          onChange={ev => setPrice(ev.target.value)}
                          placeholder={'Price'}
                          step="0.01"
                        />
                        <input 
                          type="datetime-local" 
                          value={datetime}
                          onChange={ev => setDatetime(ev.target.value)}
                        />
                      </div>
                      <div className="description">
                        <input 
                          type="text"
                          value={description}
                          onChange={ev => setDescription(ev.target.value)}
                          placeholder={'Description (Optional)'}
                        />
                      </div>
                      <button type="submit">Add new transaction</button>
                    </form>
                  </div>
                  <div className="transactions-container">
                    <h2>Transactions</h2>
                    <div className="timeframe-tabs">
                      <button 
                        className={`timeframe-button ${timeframe === 'all' ? 'active' : ''}`}
                        onClick={() => setTimeframe('all')}
                      >
                        All Time
                      </button>
                      <select 
                        className={`timeframe-select ${timeframe === 'yearly' || timeframe === 'monthly' ? 'active' : ''}`}
                        value={selectedYear}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setSelectedYear(value);
                          setTimeframe('yearly');
                        }}
                      >
                        <option value="">Select Year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <select 
                        className={`timeframe-select ${timeframe === 'monthly' ? 'active' : ''}`}
                        value={selectedMonth}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setSelectedMonth(value);
                          setTimeframe('monthly');
                        }}
                        disabled={timeframe !== 'yearly' && timeframe !== 'monthly'}
                      >
                        <option value="">Select Month</option>
                        {months.map((month, index) => (
                          <option key={month} value={index}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div className="timeframe-info">
                      {timeframe !== 'all' && (
                        <p>
                          Showing {displayedTransactions.length} transactions 
                          for {timeframe === 'monthly' ? `${months[selectedMonth]} ` : ''}
                          {timeframe === 'yearly' || timeframe === 'monthly' ? selectedYear : ''}
                        </p>
                      )}
                    </div>
                    <div className="filters">
                      <div className="search-bar">
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="filter-buttons">
                        <button 
                          className={filter === 'all' ? 'active' : ''} 
                          onClick={() => setFilter('all')}
                        >
                          All
                        </button>
                        <button 
                          className={filter === 'positive' ? 'active' : ''} 
                          onClick={() => setFilter('positive')}
                        >
                          Income
                        </button>
                        <button 
                          className={filter === 'negative' ? 'active' : ''} 
                          onClick={() => setFilter('negative')}
                        >
                          Expenses
                        </button>
                      </div>
                    </div>
                    <div className="transactions-header">
                      <p className="transaction-count">
                        Showing {Math.min(visibleTransactions, displayedTransactions.length)} of {displayedTransactions.length}
                      </p>
                      <div className="select-multiple-container">
                        <label className="select-multiple-label">
                          <input
                            type="checkbox"
                            checked={isSelectMode}
                            onChange={toggleSelectMode}
                            className="select-multiple-checkbox"
                          />
                          Select Multiple
                        </label>
                        {isSelectMode && selectedTransactions.length > 0 && (
                          <button onClick={deleteSelectedTransactions} className="delete-selected-button">
                            Delete Selected ({selectedTransactions.length})
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="transactions-list">
                      {displayedTransactions.slice(0, visibleTransactions).map((transaction) => (
                        <div 
                          key={transaction._id} 
                          className={`transaction ${transaction._id === recentlyAddedId ? 'highlight' : ''}`}
                        >
                          {isSelectMode && (
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(transaction._id)}
                              onChange={() => toggleTransactionSelection(transaction._id)}
                              className="transaction-checkbox"
                            />
                          )}
                          <div className="transaction-details">
                            <div className="transaction-name">{transaction.name}</div>
                            <div className="transaction-description">{transaction.description}</div>
                            <div className="transaction-date">{new Date(transaction.datetime).toLocaleString()}</div>
                          </div>
                          <div className={`transaction-amount ${transaction.price >= 0 ? 'positive' : 'negative'}`}>
                            {transaction.price >= 0 ? '+' : '-'}${Math.abs(transaction.price)}
                          </div>
                          <div className="transaction-actions">
                            <button onClick={() => editTransaction(transaction)} className="edit-button">Edit</button>
                            <button onClick={() => deleteTransaction(transaction._id)} className="delete-button">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="transaction-buttons">
                      {displayedTransactions.length > visibleTransactions && (
                        <button onClick={() => setVisibleTransactions(prev => prev + 5)} className="load-more-button">
                          Load More
                        </button>
                      )}
                      {visibleTransactions > 5 && displayedTransactions.length > 5 && (
                        <button onClick={() => setVisibleTransactions(5)} className="show-less-button">
                          Show Less
                        </button>
                      )}
                    </div>
                  </div>
                  {editingTransaction && (
                    <div className="modal-overlay">
                      <div className="modal">
                        <h2>Edit Transaction</h2>
                        <form onSubmit={updateTransaction}>
                          <input
                            type="text"
                            value={editingTransaction.name}
                            onChange={e => setEditingTransaction({...editingTransaction, name: e.target.value})}
                            placeholder="Transaction name"
                          />
                          <input
                            type="number"
                            value={editingTransaction.price}
                            onChange={e => setEditingTransaction({...editingTransaction, price: parseFloat(e.target.value)})}
                            placeholder="Amount"
                          />
                          <input
                            type="datetime-local"
                            value={editingTransaction.datetime}
                            onChange={e => setEditingTransaction({...editingTransaction, datetime: e.target.value})}
                          />
                          <input
                            type="text"
                            value={editingTransaction.description}
                            onChange={e => setEditingTransaction({...editingTransaction, description: e.target.value})}
                            placeholder="Description (Optional)"
                          />
                          <div className="modal-buttons">
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setEditingTransaction(null)}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                  {showErrorPopup && (
                    <div className="error-popup-overlay">
                      <div className="error-popup">
                        <h3>Error</h3>
                        <p>{error}</p>
                        <button onClick={closeErrorPopup}>Close</button>
                      </div>
                    </div>
                  )}
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
