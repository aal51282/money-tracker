import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");
  const [datetime, setDatetime] = useState("");
  const [description, setDescription] = useState("");
  const [transactions, setTransactions] = useState([]);

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
        getTransactions().then(setTransactions);
      });
    });
  }

  const balance = transactions.reduce((acc, transaction) => acc + transaction.price, 0).toFixed(2);

  return (
    <div className="app-container">
      <header>
        <h1>Money Tracker</h1>
        <div className={`balance ${parseFloat(balance) < 0 ? 'negative' : ''}`}>
          ${Math.abs(balance)}
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
            {transactions.map(transaction => (
              <div key={transaction.id} className="transaction">
                <div className="transaction-details">
                  <div className="transaction-name">{transaction.name}</div>
                  <div className="transaction-description">{transaction.description}</div>
                  <div className="transaction-date">{new Date(transaction.datetime).toLocaleString()}</div>
                </div>
                <div className={`transaction-amount ${transaction.price > 0 ? 'positive' : 'negative'}`}>
                  ${Math.abs(transaction.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
