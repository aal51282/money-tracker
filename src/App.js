import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");
  const [datetime, setDatetime] = useState("");
  const [description, setDescription] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [visibleTransactions, setVisibleTransactions] = useState(5);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    getTransactions().then(setTransactions);
  }, []);

  async function getTransactions() {
    const url = process.env.REACT_APP_API_URL + '/transactions';
    const response = await fetch(url);
    return await response.json();
  }

  function addNewTransaction(e) {
    e.preventDefault();
    const url = process.env.REACT_APP_API_URL + '/transaction';
    const price = name.split(' ')[0];
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price,
        name: name.substring(price.length + 1),
        description,
        datetime,
      })
    }).then(response => {
      response.json().then(json => {
        setName('');
        setDatetime('');
        setDescription('');
        setTransactions(prevTransactions => [json, ...prevTransactions]);
      });
    });
  }

  function editTransaction(transaction) {
    setEditingTransaction(transaction);
  }

  async function updateTransaction(e) {
    e.preventDefault();
    const url = process.env.REACT_APP_API_URL + '/transaction/' + editingTransaction._id;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTransaction)
      });
      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }
      setEditingTransaction(null);
      getTransactions().then(setTransactions);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    }
  }

  async function deleteTransaction(id) {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    const url = process.env.REACT_APP_API_URL + '/transaction/' + id;
    try {
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      getTransactions().then(setTransactions);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  }

  function loadMoreTransactions() {
    setVisibleTransactions(prevVisible => prevVisible + 5);
  }

  function showLessTransactions() {
    setVisibleTransactions(5);
  }

  const balance = transactions.reduce((acc, transaction) => acc + transaction.price, 0).toFixed(2);
  const isNegative = parseFloat(balance) < 0;

  return (
    <div className="app-container">
      <header>
        <h1>Money Tracker</h1>
        <div className={`balance ${isNegative ? 'negative' : 'positive'}`}>
          {isNegative ? '-' : '+'}${Math.abs(balance)}
        </div>
      </header>
      <main>
        <div className="form-container">
          <form onSubmit={addNewTransaction}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Transaction name (e.g. +200 New TV)"
            />
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
            <button type="submit">Add Transaction</button>
          </form>
        </div>
        <div className="transactions-container">
          <h2>Transactions</h2>
          <div className="transactions-list">
            {transactions.slice(0, visibleTransactions).map(transaction => (
              <div key={transaction._id} className="transaction">
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
            {visibleTransactions < transactions.length && (
              <button onClick={loadMoreTransactions} className="load-more-button">
                Load More
              </button>
            )}
            {visibleTransactions > 5 && (
              <button onClick={showLessTransactions} className="show-less-button">
                Show Less
              </button>
            )}
          </div>
        </div>
      </main>
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
                placeholder="Description"
              />
              <div className="modal-buttons">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingTransaction(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
