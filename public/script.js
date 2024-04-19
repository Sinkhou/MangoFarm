document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAN_OFSyfnSAQ7-_j72Di-pAC1YuI2njKU",
        authDomain: "mangofarm-752a6.firebaseapp.com",
        projectId: "mangofarm-752a6",
        storageBucket: "mangofarm-752a6.appspot.com",
        messagingSenderId: "261621325120",
        appId: "1:261621325120:web:ee4c25610bfcd30f90aea5"
    };

    const app = firebase.initializeApp(firebaseConfig);

    // Function to handle user registration
    window.register = function() {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Registration successful, redirecting to dashboard...");
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                alert("Registration failed: " + error.message);
            });
    };

    // Function to handle user login
    window.login = function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Login successful, redirecting to dashboard...");
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                alert("Login failed: " + error.message);
            });
    };

    // Function to handle password reset
    window.resetPassword = function() {
        const email = document.getElementById('login-email').value;
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                alert("Password reset email sent. Please check your email.");
            })
            .catch((error) => {
                alert("Error resetting password: " + error.message);
            });
    };
});
