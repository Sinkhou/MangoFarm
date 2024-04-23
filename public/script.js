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

    // Function to send reminders
    window.sendReminder = function() {
        const text = document.getElementById('reminder-text').value;
        const recipient = document.getElementById('reminder-recipient').value;
        const db = firebase.firestore();
    
        if (text.trim() === "") {
            alert("Please enter a reminder message.");
            return;
        }
    
        db.collection('reminders').add({
            text: text,
            recipient: recipient,
            date: new Date()
        })
        .then(function(docRef) {
            console.log("Reminder sent with ID: ", docRef.id);
            alert("Reminder sent successfully!");
            document.getElementById('reminder-text').value = '';
            loadPastReminders();
        })
        .catch(function(error) {
            console.error("Error sending reminder: ", error);
            alert("Failed to send reminder.");
        });
    };
    

    // Function to load past reminders
    function loadPastReminders() {
        const db = firebase.firestore();
        db.collection('reminders').orderBy('date', 'desc').limit(10)
            .get()
            .then(querySnapshot => {
                const container = document.getElementById('past-reminders');
                container.innerHTML = '';
                querySnapshot.forEach(doc => {
                    const reminder = doc.data();
                    const div = document.createElement('div');
                    div.textContent = `${reminder.date.toDate().toDateString()}: ${reminder.text} (To: ${reminder.recipient})`;
                    container.appendChild(div);
                });
            })
            .catch(function(error) {
                console.error("Error loading past reminders: ", error);
                alert("Failed to load past reminders.");
            });
    }

    loadPastReminders();
});
