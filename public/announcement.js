// announcement.js
document.addEventListener('DOMContentLoaded', function() {
    // Function to send announcements
    const db = firebase.firestore();
    window.sendAnnouncement = function() {
        const text = document.getElementById('announcement-text').value.trim();
        const recipient = document.getElementById('announcement-recipient').value;

        if (!text) {
            alert("Please enter a announcement message.");
            return;
        }
        db.collection('announcements').add({
            text: text,
            recipient: recipient,
            date: new Date()
        }).then(function(docRef) {
            console.log("Announcement sent with ID: ", docRef.id);
            alert("Announcement sent successfully!");
            document.getElementById('announcement-text').value = '';
            loadPastAnnouncements(); // Reload the announcements
        }).catch(function(error) {
            console.error("Error sending announcement: ", error);
            alert("Failed to send announcement.");
        });
    };

    // Function to load past announcements
    function loadPastAnnouncements() {
        const container = document.getElementById('past-announcements');
        if (!container) {
            console.error('Failed to find the past-announcements element.');
            return;
        }
        const db = firebase.firestore();
        db.collection('announcements').orderBy('date', 'desc').limit(10)
            .get()
            .then(querySnapshot => {
                container.innerHTML = '';
                querySnapshot.forEach(doc => {
                    const announcement = doc.data();
                    const div = document.createElement('div');
                    div.className = 'announcement-entry'; // Add a class for styling
                    div.innerHTML = `${announcement.date.toDate().toDateString()}: ${announcement.text} (To: ${announcement.recipient})
                                     <button onclick="deleteAnnouncement('${doc.id}')">Delete</button>`; // Add delete button
                    container.appendChild(div);
                });
            }).catch(error => {
                console.error("Error loading past announcements: ", error);
                alert("Failed to load past announcements.");
            });
    }

    // Function to delete a announcement
    window.deleteAnnouncement = function(docId) {
        const db = firebase.firestore();
        db.collection('announcements').doc(docId).delete()
            .then(() => {
                console.log("Announcement deleted successfully");
                loadPastAnnouncements(); // Reload to update the list
            }).catch(error => {
                console.error("Error deleting announcement: ", error);
                alert("Failed to delete announcement.");
            });
    };
    loadPastAnnouncements();
});
