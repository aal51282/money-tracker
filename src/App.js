import "./App.css";
import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [datetime, setDatetime] = useState("");
  const [description, setDescription] = useState("");

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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
      setName('');
      setDatetime('');
      setDescription('');
    }).then(e => {
      // Handle successful response
      console.log('Success', e);
    }).catch(error => {
      // Handle errors here
      console.error('Error:', error);
    });
  }

  return (
    <main>
      <h1>$400<span>.00</span></h1>
      <form onSubmit={addNewTransaction}>
        <div className="basic">
          <input type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={"+200 new samsung tv"} />
          <input type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)} />
        </div>
        <div className="description">
          <input type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={"description"} />
        </div>
        <button type="submit">Add new transaction</button>
      </form>
      <div className="transaction">
        <div className="left">
          <div className="name">New Samsung TV</div>
          <div className="description">It was time for a new TV</div>
        </div>
        <div className="right">
          <div className="price red">-$500</div>
          <div className="datetime">2024-01-01 15:45</div>
        </div>
      </div>
      <div className="transaction">
        <div className="left">
          <div className="name">Gig job new website</div>
          <div className="description">It was time for a new TV</div>
        </div>
        <div className="right">
          <div className="price green">+$400</div>
          <div className="datetime">2024-01-01 15:45</div>
        </div>
      </div>
      <div className="transaction">
        <div className="left">
          <div className="name">iPhone 15</div>
          <div className="description">It was time for a new TV</div>
        </div>
        <div className="right">
          <div className="price red">-$900</div>
          <div className="datetime">2024-01-01 15:45</div>
        </div>
      </div>
    </main>
  );
}

export default App;