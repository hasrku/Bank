
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    MiddleName VARCHAR(50),
    LastName VARCHAR(50) NOT NULL,
    DOB DATE NOT NULL,
    Address VARCHAR(255),
    MobileNumber VARCHAR(15) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL
);

-- Account Table
CREATE TABLE Account (
    AccountNo INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    Type ENUM('Savings', 'Current', 'Fixed') NOT NULL,
    Balance DECIMAL(15, 2) DEFAULT 0.0,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

-- Loan Table
CREATE TABLE Loan (
    LoanID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    AccountNo INT,
    Amount DECIMAL(15, 2) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE,
    Interest DECIMAL(5, 2) DEFAULT 10.54,
	FOREIGN KEY (AccountNo) REFERENCES Account(AccountNo),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

-- Transaction Table
CREATE TABLE Transaction (
    TransactionID INT PRIMARY KEY AUTO_INCREMENT,
    AccountNo INT,
    Amount DECIMAL(15, 2) NOT NULL,
    Type ENUM('Deposit', 'Withdraw', 'Transfer') NOT NULL,
    DestinationAccountNo INT,
    FOREIGN KEY (AccountNo) REFERENCES Account(AccountNo),
);

-- Loan Payment Table
CREATE TABLE LoanPayment (
    LoanPaymentID INT PRIMARY KEY AUTO_INCREMENT,
    LoanID INT,
    Amount DECIMAL(15, 2) NOT NULL,
    OutstandingAmount DECIMAL(15, 2),
    FOREIGN KEY (LoanID) REFERENCES Loan(LoanID)
);



INSERT INTO Customer (FirstName, MiddleName, LastName, DOB, Address, MobileNumber, Password) VALUES
('John', 'A.', 'Doe', '1985-04-12', '123 Elm Street, Springfield', '1234567890', 'password123'),
('Jane', NULL, 'Smith', '1990-08-25', '456 Oak Avenue, Rivertown', '1234567891', 'pass456'),
('Michael', 'B.', 'Johnson', '1978-01-15', '789 Pine Road, Lake City', '1234567892', 'password789'),
('Emily', 'C.', 'Davis', '1982-06-10', '321 Cedar Lane, Brookfield', '1234567893', 'mypassword'),
('Daniel', NULL, 'Williams', '1995-09-30', '654 Maple Drive, Ashton', '1234567894', 'securepass'),
('Sarah', 'D.', 'Brown', '1988-12-20', '987 Birch Boulevard, Greenvale', '1234567895', 'hello123'),
('David', NULL, 'Taylor', '1975-11-05', '135 Fir Street, Northwood', '1234567896', 'password456'),
('Jessica', 'E.', 'Anderson', '1993-03-08', '246 Spruce Road, Clearview', '1234567897', 'pass789'),
('Thomas', 'F.', 'Moore', '1983-07-22', '357 Redwood Place, Hilltop', '1234567898', 'secret123'),
('Laura', NULL, 'Jackson', '1999-05-13', '468 Walnut Lane, Fairview', '1234567899', 'mysecurepass');


INSERT INTO Account (CustomerID, Type, Balance) VALUES
(1, 'Savings', 1500.00),
(1, 'Current', 2000.00),
(2, 'Savings', 1200.00),
(3, 'Savings', 5000.00),
(4, 'Current', 3000.00),
(5, 'Savings', 7500.00),
(6, 'Fixed', 10000.00),
(7, 'Current', 2500.00),
(8, 'Savings', 1800.00),
(9, 'Fixed', 5500.00);


INSERT INTO Loan (CustomerID, Amount, StartDate, EndDate, Interest) VALUES
(1, 10000.00, '2023-01-15', '2024-01-15', 5.5),
(2, 5000.00, '2023-03-10', '2023-09-10', 6.0),
(3, 8000.00, '2022-11-20', '2023-11-20', 4.5),
(4, 20000.00, '2023-05-01', '2024-05-01', 5.0),
(5, 15000.00, '2023-07-25', '2024-07-25', 6.5),
(6, 6000.00, '2023-02-15', '2023-08-15', 5.7),
(7, 10000.00, '2023-06-12', '2024-06-12', 4.8),
(8, 12000.00, '2022-10-18', '2023-10-18', 5.2),
(9, 5000.00, '2023-04-22', '2023-10-22', 6.3),
(10, 7500.00, '2023-08-30', '2024-08-30', 5.4);

INSERT INTO Transaction (AccountNo, Amount, Type, DestinationAccountNo) VALUES
(1, 500.00, 'Deposit', NULL),
(2, 200.00, 'Withdraw', NULL),
(3, 1500.00, 'Deposit', NULL),
(4, 1000.00, 'Withdraw', NULL),
(5, 2500.00, 'Deposit', NULL),
(6, 3000.00, 'Withdraw', NULL),
(7, 1200.00, 'Transfer', 8),
(8, 800.00, 'Deposit', NULL),
(9, 500.00, 'Withdraw', NULL),
(10, 700.00, 'Transfer', 1);

INSERT INTO LoanPayment (LoanID, Amount, AccountBalance) VALUES
(1, 1000.00, 1400.00),
(2, 500.00, 700.00),
(3, 800.00, 4200.00),
(4, 2000.00, 1000.00),
(5, 1500.00, 6000.00),
(6, 600.00, 4000.00),
(7, 1000.00, 2200.00),
(8, 1200.00, 1600.00),
(9, 500.00, 3300.00),
(10, 750.00, 4500.00);

select * from customer;




