function showPopupMessage(message, type) {
    const popup = document.getElementById('popup-message');
    popup.textContent = message;

    popup.className = `show ${type}`; 

    
    // setTimeout(() => {
    //     popup.classList.remove('show');
    // }, 1500);
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        showPopupMessage("Please Login to view this page.", "error");
        setTimeout(() => {
            // popup.classList.remove('show');
            window.location.href = '/login.html'; // Redirect to login page if no token
        }, 3000);
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
            document.getElementById('cust-name').textContent = `${result.firstName}  ${result.lastName}`;
        } else {
            alert(result.message);
            localStorage.removeItem('authToken');
            window.location.href = '/login.html'; // Redirect if token is invalid or expired
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please log in again.');
        window.location.href = '/login.html';
    }
});

// Logout Functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
});
