// Check for an existing login token on page load
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("authToken");

    // If token exists, redirect to user-page.html
    if (token) {
        window.location.href = "/user-page.html";
    }
});

loginform = document.getElementById("login-form");
regform = document.getElementById("register-form");
regnow = document.getElementById("regnow");
loginnow = document.getElementById("loginnow");
regform.style.display = "none";
regnow.addEventListener("click", function () {
    loginform.style.display = "none";
    regform.style.display = "flex";
    document.title = "Register";
});
loginnow.addEventListener("click", function () {
    loginform.style.display = "flex";
    regform.style.display = "none";
    document.title = "Login";
});

// Toggle password visibility
document.getElementById("open").style.display = "none";
document.getElementById("clos").addEventListener("click", function () {
    document.getElementById("passlog").type = "text";
    document.getElementById("open").style.display = "block";
    document.getElementById("clos").style.display = "none";
});
document.getElementById("open").addEventListener("click", function () {
    document.getElementById("passlog").type = "password";
    document.getElementById("open").style.display = "none";
    document.getElementById("clos").style.display = "block";
});

document
    .getElementById("submit-btn")
    .addEventListener("click", async (event) => {
        event.preventDefault();

        const firstName = document.getElementById("fname").value;
        const middleName = document.getElementById("mname").value;
        const lastName = document.getElementById("lname").value;
        const dob = document.getElementById("dob").value;
        const mobile = document.getElementById("mobnum").value;
        const address = document.getElementById("addres").value;
        const password = document.getElementById("passw").value;

        try {
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    middleName,
                    lastName,
                    dob,
                    mobile,
                    address,
                    password,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                showPopupMessage(
                    `${result.message}\nYour CustomerID for login is: ${result.customerID}`,
                    "success"
                );
                setTimeout(() => {
                    window.location.href = "/login.html";
                }, 2000);
            } else {
                showPopupMessage(
                    "Registration failed. Please try again.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error:", error);
            // alert("An error occurred. Please try again.");
            showPopupMessage("An error occurred. Please try again.", "error");
        }
    });

// Function to show popup message
function showPopupMessage(message, type) {
    const popup = document.getElementById("popup-message");
    popup.textContent = message;

    popup.className = `show ${type}`;

    setTimeout(() => {
        popup.classList.remove("show");
    }, 1500);
}

// this is alternative for offline server just for frontend Demo
document.getElementById("submit-login").addEventListener("click", async (event) => {
    event.preventDefault();
    showPopupMessage("Login successful!", "success");
    setTimeout(() => {
        window.location.href = "/user-page.html";
    }, 1000);
}

/* for demo puposes this code section is commented out as backend server is offline 
    when server gets online remove the above "submit-login" EventListener
document
    .getElementById("submit-login")
    .addEventListener("click", async (event) => {
        event.preventDefault();

        const customerID = parseInt(document.getElementById("cid").value, 10);
        const password = document.getElementById("passlog").value;

        if (isNaN(customerID)) {
            showPopupMessage("Please enter a valid Customer ID.", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerID, password }),
            });

            const result = await response.json();

            if (response.ok) {
                showPopupMessage("Login successful!", "success");
                localStorage.setItem("authToken", result.token);
                localStorage.setItem("customerID", result.customerID);
                setTimeout(() => {
                    window.location.href = "/user-page.html";
                }, 1000);
            } else {
                showPopupMessage(
                    result.message || "Login failed. Please try again.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error:", error);
            showPopupMessage(
                "An error occurred. Please try again later.",
                "error"
            );
        }
    });
*/
