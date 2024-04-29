document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();

    // Function to send reminders
    window.sendReminder = function() {
        const title = document.getElementById('reminder-title').value.trim();
        const email = document.getElementById('reminder-email').value.trim();
        const color = document.getElementById('reminder-color').value;
        const date = document.getElementById('reminder-date').value;
        const time = document.getElementById('reminder-time').value;

        if (!title || !date || !time || !email) {
            alert("Please fill all the fields.");
            return;
        }

        db.collection('reminders').add({
            title: title,
            color: color,
            date: date,
            time: time
        }).then(function(docRef) {
            console.log("Reminder sent with ID: ", docRef.id);
            alert("Reminder sent successfully!");
            sendEmailNotification(email, title, date, time);
            loadPastReminders(); // Reload the reminders
        }).catch(function(error) {
            console.error("Error sending reminder: ", error);
            alert("Failed to send reminder.");
        });
    };

    // Send an email notification
    function sendEmailNotification(email, title, date, time) {
        fetch('http://localhost:3000/send-reminder-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: email,
                subject: 'Reminder Notification',
                text: `Hi, you have a reminder for: ${title} on ${date} at ${time}.`
            })
        }).then(response => response.text())
        .then(data => console.log("Email sent successfully:", data))
        .catch(error => console.error('Error sending email:', error));
    }

    // Function to load past reminders
    function loadPastReminders() {
        const container = document.getElementById('past-reminders');
        if (!container) {
            console.error('Failed to find the past-reminders element.');
            return;
        }

        container.innerHTML = '';
        db.collection('reminders').orderBy('date', 'desc').limit(10)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const reminder = doc.data();
                    const div = document.createElement('div');
                    div.className = 'reminder-entry';
                    div.innerHTML = `<span>${new Date(reminder.date).toDateString()} at ${reminder.time}: ${reminder.title}</span>
                                     <span class="color-indicator" style="background-color: ${getColor(reminder.color)};"></span>
                                     <button onclick="deleteReminder('${doc.id}')">Delete</button>`;
                    container.appendChild(div);
                });
            }).catch(function(error) {
                console.error("Error loading past reminders: ", error);
                alert("Failed to load past reminders.");
            });
    }

    function getColor(color) {
        switch (color) {
            case 'red': return '#ff4444';
            case 'yellow': return '#ffbb33';
            case 'green': return '#00c850';
            default: return '#ffffff'; // Default white
        }
    }

    window.deleteReminder = function(reminderId) {
        db.collection('reminders').doc(reminderId).delete().then(() => {
            console.log("Reminder successfully deleted!");
            loadPastReminders(); // Refresh the list after deletion
        }).catch((error) => {
            console.error("Error removing reminder: ", error);
        });
    };

    loadPastReminders();
});
