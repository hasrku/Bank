function showPopupMessage(message, type) {
    const popup = document.getElementById('popup-message');
    popup.textContent = message;

    popup.className = `show ${type}`; 

    setTimeout(() => {
        popup.classList.remove('show');
    }, 1500);
}

overlay = document.getElementById('overlay')
overlay2 = document.getElementById('overlay2')
newloan = document.getElementById('new-loan')
loanPayFrom = document.getElementById('loan-payment-form')

hideAllForms();
function hideAllForms(){
    newloan.style.display = "none";
    loanPayFrom.style.display = "none";
}

overlay.addEventListener("click", function() {
    hideAllForms();
})
overlay2.addEventListener("click", function() {
    hideAllForms();
})

function showform(){
    newloan.style.display = "flex";
    setWidth();
}
function showPymentform(){
    loanPayFrom.style.display = "flex";
}

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
            await loadLoanAccounts();
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

        // Populate the select element with account numbers
        const accountSelect = document.getElementById("account");
        accountSelect.innerHTML = '<option value="" disabled selected>Select an Account</option>'; // Clear previous options

        accounts.forEach(account => {
            if(account.Type !== "Fixed"){
                const option = document.createElement("option");
                option.value = account.AccountNo;
                option.textContent = `A/C No:  ${account.AccountNo}  (Avl Bal: ${account.Balance})`;
                accountSelect.appendChild(option);
            }
        });
        document.getElementById('taccount').innerHTML = accountSelect.innerHTML;

    } catch (error) {
        console.error("Error loading accounts:", error);
        showPopupMessage("Login Error loading accounts!", "error");
    }
}


document.getElementById('submit-loan').addEventListener("click", async function handleLoanSubmission(event) {
    event.preventDefault();

    const token = localStorage.getItem("authToken");
    const customerID = localStorage.getItem("customerID");
    const accountNo = document.getElementById("account").value;
    const amount = parseFloat(document.getElementById("amt").value);
    const durationMonths = parseInt(document.getElementById("duration").value);

    if (!accountNo || isNaN(amount) || amount <= 0 || isNaN(durationMonths) || durationMonths <= 0) {
        // alert("Please enter valid loan details.");
        showPopupMessage("Please enter valid loan details.", "error");
        return;
    }

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + durationMonths);

    try {
        const response = await fetch(`http://localhost:5000/api/loan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                customerID,
                accountNo,
                amount,
                startDate: startDate.toISOString().split('T')[0],  // Format to YYYY-MM-DD
                endDate: endDate.toISOString().split('T')[0]       // Format to YYYY-MM-DD
            })
        });

        const result = await response.json();
        if (response.ok) {
            // alert(`Loan created successfully! Loan ID: ${result.loanID}`);
            showPopupMessage(`Loan created successfully! Loan ID: ${result.loanID}`, "success");
        } else {
            // alert(`Failed to create loan: ${result.message}`);
            showPopupMessage(`Failed to create loan: ${result.message}`, "error");
        }
    } catch (error) {
        console.error("Error creating loan:", error);
    }
    setTimeout(()=>{
        location.reload();
    },2500)
})


function formatDate(dateString) {
    const date = new Date(dateString); // Convert to Date object
    const day = String(date.getDate()).padStart(2, '0'); // Day with leading zero
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month with leading zero
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}




async function loadLoanAccounts() {
    const token = localStorage.getItem("authToken");

    try {
        const response = await fetch("http://localhost:5000/api/loan-accounts", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const accounts = await response.json();
        const accountsBody = document.getElementById("loans-body");
        accountsBody.innerHTML = "";

        accounts.forEach(account => {
            const row = document.createElement("tr");
            account.StartDate = formatDate(account.StartDate);
            account.EndDate = formatDate(account.EndDate);
            
            row.innerHTML = `
                <td>${account.LoanID}</td>
                <td>${account.AccountNo}</td>
                <td>${account.StartDate}</td>
                <td>${account.EndDate}</td>
                <td>${account.Interest}%</td>
                <td>₹${account.OutstandingAmount}</td>
                <td>
                    <button onclick="loadLoanTransactions(${account.LoanID})">View Transactions</button>
                    <button onclick="loadLoanPaymentForm(${account.LoanID})">Pay</button>
                </td>
            `;
            accountsBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading accounts:", error);
    }
}

function loadLoanPaymentForm(loanid){
    loanPayFrom.style.display = "flex";
    document.getElementById('curr-loanid').innerText = loanid;
    document.getElementById("submit-loan-payment").addEventListener("click", handleLoanPayment);

    async function handleLoanPayment(event) {
        event.preventDefault();

        const token = localStorage.getItem("authToken");
        const loanID = document.getElementById("curr-loanid").innerText;
        const accountNo = document.getElementById("taccount").value;
        const amount = parseFloat(document.getElementById("tamount").value);

        if (!accountNo || isNaN(amount) || amount <= 0) {
            // alert("Please select a valid account and enter a positive amount.");
            showPopupMessage(`Please select a valid account and enter a positive amount.`, "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/loan-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ loanID, amount })
            });

            const result = await response.json();
            if (response.ok) {
                // alert(`Loan payment successful! Remaining balance: ₹${result.outstandingAmount}`);
                showPopupMessage(`Loan payment successful! Remaining balance: ₹${result.outstandingAmount}`, "success");
            } else {
                // alert(`Loan payment failed: ${result.message}`);
                showPopupMessage(`Loan payment failed: ${result.message}`, "error");
            }
        } catch (error) {
            console.error("Error processing loan payment:", error);
        }
        setTimeout(()=>{
            location.reload();
        },2500)
    }
}

async function loadLoanTransactions(loanid){
    document.getElementById('curr-loan').innerText = `${loanid}`;

    try {
        const response = await fetch(`http://localhost:5000/api/loan-transactions?loanid=${loanid}`, {
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
            row.innerHTML = `
                <td>${transaction.LoanPaymentID}</td>
                <td>₹${transaction.Amount}</td>
                <td>${transaction.AccountNo || "-"}</td>
                <td>₹${transaction.OutstandingAmount}</td>
            `;
            transactionBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading transactions:", error);
    }
}


function setWidth(){
    const w = document.querySelector('.form-cont select').offsetWidth;
    // document.querySelector('.form-cont input').style.width = w + 'px';
    console.log(document.querySelector('.form-cont select').offsetWidth)
    

}
