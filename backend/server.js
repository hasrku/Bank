const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT

const app = express();
const PORT = 5000;

// Secret key for JWT (Store this securely in environment variables in production)
const JWT_SECRET = 'your_secret_key';

// Configure CORS
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// Middleware to parse JSON bodies
app.use(express.json());

// Database configuration and connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'takla',
    database: 'bank'
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + db.threadId);
});

// Registration Endpoint
app.post('/api/register', async (req, res) => {
    const { firstName, middleName, lastName, dob, mobile, address, password } = req.body;

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO Customer (FirstName, MiddleName, LastName, DOB, MobileNumber, Address, Password) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [firstName, middleName, lastName, dob, mobile, address, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error executing query:', err.sqlMessage || err.message);
            res.status(500).json({ message: 'Error registering user', error: err.sqlMessage || err.message });
        } else {
            const customerID = result.insertId;
            console.log('User registered successfully with CustomerID:', customerID);
            res.status(201).json({ message: 'User registered successfully', customerID: customerID });
        }
    });
});

// Login Endpoint
// Login Endpoint (server.js)
app.post('/api/login', (req, res) => {
    const { customerID, password } = req.body;

    if (!customerID || !password) {
        return res.status(400).json({ message: 'CustomerID and Password are required' });
    }

    const sql = 'SELECT * FROM Customer WHERE CustomerID = ?';

    db.query(sql, [customerID], async (err, results) => {
        if (err) {
            console.error('Error executing query:', err.sqlMessage || err.message);
            return res.status(500).json({ message: 'Error logging in', error: err.sqlMessage || err.message });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid CustomerID or Password' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.Password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid CustomerID or Password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { customerID: user.CustomerID, firstName: user.FirstName, lastName: user.LastName },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send token and customerID
        res.status(200).json({ message: 'Login successful', token: token, customerID: user.CustomerID });
    });
});


// Middleware to Verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extracts the token after 'Bearer'

    if (!token) {
        return res.status(401).json({ message: 'Access Token Required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json({ message: 'Invalid Token' });
        }
        req.user = user;
        next();
    });
};



// Protected Route Example
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: `Hello ${req.user.firstName}, you have accessed a protected route!` });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



// Get User Info Route
app.get('/api/user-info', authenticateToken, (req, res) => {
    // Send back user data from the decoded JWT
    res.json({ firstName: req.user.firstName , lastName: req.user.lastName}
    );
});



// Account creation endpoint
app.post('/api/create-account', (req, res) => {
    const { customerID, accountType } = req.body;

    if (!customerID || !accountType) {
        return res.status(400).json({ message: "CustomerID and Account Type are required." });
    }

    const sql = "INSERT INTO Account (CustomerID, Type) VALUES (?, ?)";
    db.query(sql, [customerID, accountType], (err, result) => {
        if (err) {
            console.error("Error executing query:", err.sqlMessage || err.message);
            res.status(500).json({ message: "Error creating account", error: err.sqlMessage || err.message });
        } else {
            const accountNo = result.insertId;
            console.log(`Account created successfully with AccountNo: ${accountNo}`);
            res.status(201).json({ message: "Account created successfully", accountNo: accountNo });
        }
    });
});


// Endpoint to get all accounts for a customer
app.get('/api/accounts', authenticateToken, (req, res) => {
    const customerID = req.user.customerID; // Get customer ID from the authenticated user

    const sql = 'SELECT AccountNo, Type, Balance FROM Account WHERE CustomerID = ?';
    db.query(sql, [customerID], (err, results) => {
        if (err) {
            console.error("Error fetching accounts:", err.sqlMessage || err.message);
            res.status(500).json({ message: "Error fetching accounts", error: err.sqlMessage || err.message });
        } else {
            res.json(results);
        }
    });
});

app.post('/api/loan', authenticateToken, (req, res) => {
    const {customerID, accountNo, amount, startDate, endDate } = req.body;

    if (!accountNo || !amount || amount <= 0 || !startDate || !endDate) {
        return res.status(400).json({ message: "Invalid input. Please enter valid loan details." });
    }

    const insertLoanQuery = `INSERT INTO Loan (CustomerID,AccountNo, Amount, StartDate, EndDate)VALUES (?,?, ?, ?, ?)`;

    db.query(insertLoanQuery, [customerID, accountNo, amount, startDate, endDate], (err, result) => {
        if (err) {
            console.error("Error inserting loan:", err.sqlMessage || err.message);
            return res.status(500).json({ message: "Error creating loan." });
        }

        const loanID = result.insertId;
        
        // Insert initial entry in LoanPayment with OutstandingAmount as the loan amount
        const insertInitialLoanPaymentQuery = `
            INSERT INTO LoanPayment (LoanID, Amount,AccountNo, OutstandingAmount)VALUES (?, 0,?, ?)`;
        db.query(insertInitialLoanPaymentQuery, [loanID,accountNo, amount], (err) => {
            if (err) {
                console.error("Error inserting initial loan payment:", err.sqlMessage || err.message);
                return res.status(500).json({ message: "Error creating initial loan payment." });
            }
            res.status(201).json({ message: "Loan created successfully", loanID });
        });
    });
});

app.post('/api/loan-payment', authenticateToken, (req, res) => {
    const { loanID, amount } = req.body;

    if (!loanID || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid input. Please enter valid loan payment details." });
    }

    // Retrieve current outstanding amount
    const getOutstandingAmountQuery = `SELECT OutstandingAmount FROM LoanPayment WHERE LoanID = ? ORDER BY LoanPaymentID DESC LIMIT 1`;
    db.query(getOutstandingAmountQuery, [loanID], (err, results) => {
        if (err) {
            console.error("Error fetching outstanding amount:", err.sqlMessage || err.message);
            return res.status(500).json({ message: "Error fetching outstanding amount." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Loan not found." });
        }

        const currentOutstanding = results[0].OutstandingAmount;
        const newOutstandingAmount = currentOutstanding - amount;

        if (newOutstandingAmount < 0) {
            return res.status(400).json({ message: "Payment exceeds outstanding loan amount." });
        }

        // Update loan payment table with the new outstanding amount
        const insertLoanPaymentQuery = `
            INSERT INTO LoanPayment (LoanID, Amount, OutstandingAmount)
            VALUES (?, ?, ?)
        `;
        db.query(insertLoanPaymentQuery, [loanID, amount, newOutstandingAmount], (err, result) => {
            if (err) {
                console.error("Error inserting loan payment:", err.sqlMessage || err.message);
                return res.status(500).json({ message: "Error processing loan payment." });
            }

            res.status(201).json({ message: "Loan payment successful", outstandingAmount: newOutstandingAmount });
        });
    });
});


app.get('/api/loan-accounts', authenticateToken, (req, res) => {
    const customerID = req.user.customerID; // Get customer ID from the authenticated user

    // SQL query to get loan details along with the least outstanding amount from LoanPayment
    const sql = `
        SELECT l.LoanID, l.AccountNo, l.Amount, l.StartDate, l.EndDate, l.Interest, 
            IFNULL(lp.MinOutstandingAmount, l.Amount) AS OutstandingAmount
        FROM Loan AS l
        LEFT JOIN (
            SELECT LoanID, MIN(OutstandingAmount) AS MinOutstandingAmount
            FROM LoanPayment
            GROUP BY LoanID
        ) AS lp ON l.LoanID = lp.LoanID
        WHERE l.AccountNo IN (SELECT AccountNo FROM Account WHERE CustomerID = ?)
    `;


    db.query(sql, [customerID], (err, results) => {
        if (err) {
            console.error("Error fetching loan accounts:", err.sqlMessage || err.message);
            res.status(500).json({ message: "Error fetching loan accounts", error: err.sqlMessage || err.message });
        } else {
            res.json(results);
        }
    });
});


app.get('/api/transactions', (req, res) => {
    const accountNo = req.query.accountNo; // Retrieve accountNo from query parameters

    const sql = 'SELECT * FROM Transaction WHERE AccountNo = ? OR DestinationAccountNo = ?';
    db.query(sql, [accountNo, accountNo], (err, results) => {
        if (err) {
            console.error("Error fetching transactions:", err.sqlMessage || err.message);
            res.status(500).json({ message: "Error fetching transactions", error: err.sqlMessage || err.message });
        } else {
            res.json(results);
        }
    });
});

app.get('/api/loan-transactions', (req, res) => {
    const loanid = req.query.loanid; // Retrieve accountNo from query parameters

    const sql = 'SELECT * FROM LoanPayment WHERE LoanID = ?';
    db.query(sql, [loanid], (err, results) => {
        if (err) {
            console.error("Error fetching transactions:", err.sqlMessage || err.message);
            res.status(500).json({ message: "Error fetching transactions", error: err.sqlMessage || err.message });
        } else {
            res.json(results);
        }
    });
});


app.post('/api/withdraw', authenticateToken, (req, res) => {
    const { accountNo, amount, type } = req.body;

    if (type !== "Withdraw") {
        return res.status(400).json({ message: "Invalid transaction type." });
    }

    // Check if account has sufficient balance for withdrawal
    const checkBalanceQuery = 'SELECT Balance FROM Account WHERE AccountNo = ?';
    db.query(checkBalanceQuery, [accountNo], (err, results) => {
        if (err) {
            console.error("Error checking balance:", err.sqlMessage || err.message);
            return res.status(500).json({ message: "Error checking balance." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Account not found." });
        }

        const currentBalance = results[0].Balance;
        if (currentBalance < amount) {
            return res.status(400).json({ message: "Insufficient funds." });
        }

        // Update balance and insert transaction record
        const newBalance = currentBalance - amount;
        const updateBalanceQuery = 'UPDATE Account SET Balance = ? WHERE AccountNo = ?';
        const insertTransactionQuery = 'INSERT INTO Transaction (AccountNo, Amount, Type) VALUES (?, ?, ?)';

        db.query(updateBalanceQuery, [newBalance, accountNo], (err) => {
            if (err) {
                console.error("Error updating balance:", err.message);
                return res.status(500).json({ message: "Error updating balance." });
            }

            // Insert transaction record after balance update
            db.query(insertTransactionQuery, [accountNo, amount, type], (err, result) => {
                if (err) {
                    console.error("Error inserting transaction:", err.message);
                    return res.status(500).json({ message: "Error inserting transaction." });
                }

                res.status(201).json({ message: "Withdrawal successful", transactionID: result.insertId });
            });
        });
    });
});


app.post('/api/deposit', authenticateToken, (req, res) => {
    const { accountNo, amount, type } = req.body;

    if (type !== "Deposit") {
        return res.status(400).json({ message: "Invalid transaction type." });
    }

    // Check if account has sufficient balance for withdrawal
    const checkBalanceQuery = 'SELECT Balance FROM Account WHERE AccountNo = ?';
    db.query(checkBalanceQuery, [accountNo], (err, results) => {
        if (err) {
            console.error("Error checking balance:", err.sqlMessage || err.message);
            return res.status(500).json({ message: "Error checking balance." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Account not found." });
        }

        const currentBalance = parseFloat(results[0].Balance);
        // Update balance and insert transaction record
        const newBalance = currentBalance + amount;
        console.log(newBalance)
        const updateBalanceQuery = 'UPDATE Account SET Balance = ? WHERE AccountNo = ?';
        const insertTransactionQuery = 'INSERT INTO Transaction (AccountNo, Amount, Type) VALUES (?, ?, ?)';

        db.query(updateBalanceQuery, [newBalance, accountNo], (err) => {
            if (err) {
                console.error("Error updating balance:", err.message);
                return res.status(500).json({ message: "Error updating balance." });
            }

            // Insert transaction record after balance update
            db.query(insertTransactionQuery, [accountNo, amount, type], (err, result) => {
                if (err) {
                    console.error("Error inserting transaction:", err.message);
                    return res.status(500).json({ message: "Error inserting transaction." });
                }

                res.status(201).json({ message: "Withdrawal successful", transactionID: result.insertId });
            });
        });
    });
});


app.post('/api/transfer', authenticateToken, (req, res) => {
    const { sourceAccountNo, destinationAccountNo, amount } = req.body;

    if (!sourceAccountNo || !destinationAccountNo || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid input. Please enter valid accounts and amount." });
    }

    // Check if source account has sufficient balance
    const checkBalanceQuery = 'SELECT Balance FROM Account WHERE AccountNo = ?';
    db.query(checkBalanceQuery, [sourceAccountNo], (err, results) => {
        if (err) {
            console.error("Error checking balance:", err.sqlMessage || err.message);
            return res.status(500).json({ message: "Error checking balance." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Source account not found." });
        }

        const currentBalance = results[0].Balance;
        if (currentBalance < amount) {
            return res.status(400).json({ message: "Insufficient funds in the source account." });
        }

        // Deduct amount from source account and add to destination account
        const newSourceBalance = currentBalance - amount;
        const updateSourceBalanceQuery = 'UPDATE Account SET Balance = ? WHERE AccountNo = ?';
        const updateDestinationBalanceQuery = 'UPDATE Account SET Balance = Balance + ? WHERE AccountNo = ?';
        const insertTransactionQuery = 'INSERT INTO Transaction (AccountNo, Amount, Type, DestinationAccountNo) VALUES (?, ?, ?, ?)';

        // Update source account balance
        db.query(updateSourceBalanceQuery, [newSourceBalance, sourceAccountNo], (err) => {
            if (err) {
                console.error("Error updating source account balance:", err.message);
                return res.status(500).json({ message: "Error updating source account balance." });
            }

            // Update destination account balance
            db.query(updateDestinationBalanceQuery, [amount, destinationAccountNo], (err) => {
                if (err) {
                    console.error("Error updating destination account balance:", err.message);
                    return res.status(500).json({ message: "Error updating destination account balance." });
                }

                // Insert transaction record
                db.query(insertTransactionQuery, [sourceAccountNo, amount, 'Transfer', destinationAccountNo], (err, result) => {
                    if (err) {
                        console.error("Error inserting transaction:", err.message);
                        return res.status(500).json({ message: "Error inserting transaction." });
                    }

                    res.status(201).json({ message: "Transfer successful", transactionID: result.insertId });
                });
            });
        });
    });
});



