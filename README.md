# Money Tracker

Money Tracker is a full-stack web application built with the MERN (MongoDB, Express, React, Node.js) stack. It allows users to track their income and expenses, providing a clear overview of their financial transactions.

## Features

- Add, edit, and delete financial transactions
- Categorize transactions as income or expenses
- Filter transactions by type (income/expense) or custom search
- View transactions in different timeframes (All Time, Yearly, Monthly)
- Real-time balance calculation
- Responsive design for desktop and mobile devices

## Technologies Used

- Frontend:
  - React.js
  - CSS3 for styling
- Backend:
  - Node.js
  - Express.js
- Database:
  - MongoDB

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/aal51282/money-tracker
   cd money-tracker
   ```

2. Install dependencies for both frontend and backend:

   ```
   a. cd api
   b. run: yarn install (installs the dependencies for the backend)
   c. cd ../money-tracker
   d. run: yarn install (installs the dependencies for the frontend)
   ```

3. Create a `.env` file in the api directory and add your MongoDB connection string:

   ```
   MONGODB_URL=your_mongodb_connection_string
   ```

4. Start the backend server:

   ```
   cd api
   nodemon index.js
   ```

5. In a new terminal, start the frontend development server:

   ```
   cd ../money-tracker
   yarn start
   ```

6. Open your browser and navigate to `http://localhost:3000` to use the application.

## Usage

1. Add a new transaction by filling out the form at the top of the page.
2. View your transactions in the list below.
3. Use the search bar to find specific transactions.
4. Filter transactions by type using the "All", "Income", and "Expenses" buttons.
5. Select different timeframes using the "All Time", "Yearly", and "Monthly" options.
6. Edit or delete transactions using the buttons next to each entry.
7. Use the "Select Multiple" checkbox to delete multiple transactions at once.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Coding with Dawid](https://www.youtube.com/@CodingWithDawid)
