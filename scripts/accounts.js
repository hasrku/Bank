document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        showPopupMessage("Please Login to view this page.", "error");
        setTimeout(() => {
            // popup.classList.remove('show');
            window.location.href = '/login.html'; // Redirect to login page if no token
        }, 2500);
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/user-info', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok) {
            // Set the user's name in the greetings section
            // await loadLoanAccounts();
            await loadAccounts();
            
        } else {
            alert(result.message);
            localStorage.removeItem('authToken');
            localStorage.removeItem('customerID');
            window.location.href = '/login.html'; // Redirect if token is invalid or expired
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please log in again.');
        window.location.href = '/login.html';
    }
});


overlay = document.getElementById('overlay')
newloan = document.getElementById('new-loan')
newloan.style.display = "none";
function showform(){
    newloan.style.display = "flex";
}
overlay.addEventListener("click", function() {
    newloan.style.display = "none";
})

function showPopupMessage(message, type) {
    const popup = document.getElementById('popup-message');
    popup.textContent = message;

    // Set the background color based on type
    popup.className = `show ${type}`; // 'type' should be 'success' or 'error'

    // Show the message and hide it after 3 seconds
    setTimeout(() => {
        popup.classList.remove('show');
    }, 1500);
}

// accounts.js
document.querySelector("#new-loan button").addEventListener("click", async (event) => {
    event.preventDefault();

    const accountType = document.querySelector("#source_w").value;
    const customerID = localStorage.getItem("customerID"); // Retrieve customerID from localStorage

    if (!accountType || accountType === "none" || !customerID) {
        showPopupMessage("Please select an account type and ensure you are logged in.", "error");
        // alert("Please select an account type and ensure you are logged in.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/create-account", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ customerID, accountType })
        });

        const result = await response.json();
        if (response.ok) {
            showPopupMessage(`Account created successfully! Account Number: ${result.accountNo}`, "success");
        } else {
            showPopupMessage(`Failed to create account: ${result.message}`, "error");
        }
    } catch (error) {
        console.error("Error creating account:", error);
        showPopupMessage(`An error occurred. Please try again.`, "error");
    }
    setTimeout(() => {
        location.reload();
    }, 1800);
});


// loading accounts...

document.addEventListener("DOMContentLoaded", async () => {
    await loadAccounts();
});

async function loadAccounts() {
    const token = localStorage.getItem("authToken");

    try {
        const response = await fetch("http://localhost:5000/api/accounts", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const accounts = await response.json();
        const accountsBody = document.getElementById("accounts-body");
        accountsBody.innerHTML = "";

        accounts.forEach(account => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${account.AccountNo}</td>
                <td>${account.Type}</td>
                <td>₹${account.Balance}</td>
                <td><button onclick="loadTransactions(${account.AccountNo})">View Transactions</button></td>
            `;
            accountsBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading accounts:", error);
    }
}


async function loadTransactions(accountNo) {
    // console.log("Fetching transactions for account:", accountNo);
    document.getElementById('curr-acc').innerText = `${accountNo}`;
    try {
        const response = await fetch(`http://localhost:5000/api/transactions?accountNo=${accountNo}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const transactions = await response.json();
        const transactionBody = document.getElementById("transactions-body");
        transactionBody.innerHTML = "";

        transactions.forEach(transaction => {
            const row = document.createElement("tr");
            if(transaction.DestinationAccountNo === accountNo){
                transaction.Type = "Credited Through Transfer"
            }
            row.innerHTML = `
                <td>${transaction.TransactionID}</td>
                <td>${transaction.Type}</td>
                <td>${transaction.DestinationAccountNo || "-"}</td>
                <td>₹${transaction.Amount}</td>
            `;
            transactionBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading transactions:", error);
    }
}
