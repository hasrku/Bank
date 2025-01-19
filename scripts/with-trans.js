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


newloan = document.getElementById('withdraw')
depCont = document.getElementById('deposit')
transCont = document.getElementById('transfer')

hideAllForms();

function hideAllForms(){
    newloan.style.display = "none";
    depCont.style.display = "none";
    transCont.style.display = "none";
}

document.getElementById('overlay').addEventListener("click", function() {
    hideAllForms();
})
document.getElementById("overlay2").addEventListener("click", function() {
    hideAllForms();
})
document.getElementById("overlay3").addEventListener("click", function() {
    hideAllForms();
})

function showWithdrawForm(){
    newloan.style.display = "flex";
    setWidth();
}
function showDepositForm(){
    depCont.style.display = "flex";
    setWidth();
}
function showTransForm(){
    transCont.style.display = "flex";
    setWidth();
}





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

        // Populate the select element with account numbers
        const accountSelect = document.getElementById("waccount");
        const accountSelect2 = document.getElementById("daccount");
        accountSelect.innerHTML = '<option value="" disabled selected>Select an Account</option>'; // Clear previous options
        accountSelect2.innerHTML = '<option value="" disabled selected>Select an Account</option>'; // Clear previous options
        // console.log(acc)
        accounts.forEach(account => {
            if(account.Type !== "Fixed"){
                const option = document.createElement("option");
                option.value = account.AccountNo;
                option.textContent = `A/C No:  ${account.AccountNo}  (Bal.: ₹${account.Balance})`;
                accountSelect.appendChild(option);
            }
            const option2 = document.createElement("option");
            option2.value = account.AccountNo;
            option2.textContent = `A/C No:  ${account.AccountNo}  (${account.Type})`;
            accountSelect2.appendChild(option2);
        });
        document.getElementById('taccount').innerHTML = accountSelect.innerHTML;

    } catch (error) {
        console.error("Error loading accounts:", error);
        showPopupMessage("Login Error loading accounts!", "error");
    }
}

document.getElementById("submit-withdraw").addEventListener("click", function() {
    handleWithdrawal();
});
async function handleWithdrawal(event) {

    const token = localStorage.getItem("authToken");
    const accountNo = document.getElementById("waccount").value;
    const amount = document.getElementById("wamount").value;

    if (!accountNo || !amount || isNaN(amount) || amount <= 0) {
        // alert("Please select a valid account and enter a positive amount.");
        showPopupMessage("Please select a valid account and enter a positive amount.", "error");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/withdraw", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ accountNo, amount: parseFloat(amount), type: "Withdraw" })
        });

        const result = await response.json();
        if (response.ok) {
            // alert(`Withdrawal successful! Transaction ID: ${result.transactionID}`);
            showPopupMessage(`Withdrawal successful! Transaction ID: ${result.transactionID}`,"success");
        } else {
            // alert(`Withdrawal failed: ${result.message}`);
            showPopupMessage(`Withdrawal failed: ${result.message}`,"error");
        }
    } catch (error) {
        console.error("Error processing withdrawal:", error);
    }
    setTimeout(() => {
        location.reload();
    }, 2500);
}


document.getElementById("submit-deposit").addEventListener("click", function() {
    handleDeposit();
});
async function handleDeposit(event) {

    const token = localStorage.getItem("authToken");
    const accountNo = document.getElementById("daccount").value;
    const amount = document.getElementById("damount").value;

    if (!accountNo || !amount || isNaN(amount) || amount <= 0) {
        // alert("Please select a valid account and enter a positive amount.");
        showPopupMessage("Please select a valid account and enter a positive amount.", "error");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/deposit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ accountNo, amount: parseFloat(amount), type: "Deposit" })
        });

        const result = await response.json();
        if (response.ok) {
            // alert(`Withdrawal successful! Transaction ID: ${result.transactionID}`);
            showPopupMessage(`Deposit successful! Transaction ID: ${result.transactionID}`,"success");
        } else {
            // alert(`Withdrawal failed: ${result.message}`);
            showPopupMessage(`Deposit failed: ${result.message}`,"error");
        }
    } catch (error) {
        console.error("Error processing deposit:", error);
    }
    setTimeout(() => {
        location.reload();
    }, 2500);
}

document.getElementById("submit-transfer").addEventListener("click", function() {
    handleTransfer();
});
async function handleTransfer(event) {
    // event.preventDefault();

    const token = localStorage.getItem("authToken");
    const sourceAccountNo = document.getElementById("taccount").value;
    const destinationAccountNo = document.getElementById("tdaccount").value;
    const amount = document.getElementById("tamount").value;
    console.log(amount)
    // Basic validation
    if (!sourceAccountNo || !destinationAccountNo || !amount || isNaN(amount) || amount <= 0) {
        // alert("Please select valid accounts and enter a positive amount.");
        showPopupMessage(`Please select valid accounts and enter a positive amount.`,"error");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/transfer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ sourceAccountNo, destinationAccountNo, amount: parseFloat(amount) })
        });

        const result = await response.json();
        if (response.ok) {
            // alert(`Transfer successful! Transaction ID: ${result.transactionID}`);
            showPopupMessage(`Transfer successful! Transaction ID: ${result.transactionID}`,"success");
        } else {
            // alert(`Transfer failed: ${result.message}`);
            showPopupMessage(`Transfer failed: ${result.message}`,"error");
        }
    } catch (error) {
        console.error("Error processing transfer:", error);
    }
    setTimeout(()=>{
        location.reload();
    },2500)
}