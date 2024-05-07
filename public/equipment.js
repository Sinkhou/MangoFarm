// Retrieve a reference to the Firestore database
const db = firebase.firestore();

// Retrieve a reference to the equipment list <ul> element
const equipmentList = document.getElementById('equipmentList');

// Add an event listener for the equipment form submission
document.getElementById('equipmentForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Retrieve values from the form inputs and ensure they are strings
    const name = document.getElementById('name').value.toString();
    const type = document.getElementById('type').value.toString();
    const status = document.getElementById('status').value.toString();

    // Add equipment data to Firestore ensuring all values are strings
    db.collection('equipment').add({
        name: name,
        type: type,
        status: status
    }).then(docRef => {
        console.log("Document written with ID: ", docRef.id);
        document.getElementById('equipmentForm').reset(); // Clear the form fields after submission
        loadEquipmentList(); // Refresh the equipment list to include the new entry
    }).catch(error => {
        console.error("Error adding document: ", error);
    });
});

// Function to load equipment list from Firestore
function loadEquipmentList() {
    db.collection('equipment').onSnapshot(snapshot => {
        equipmentList.innerHTML = ''; // Clear existing list items
        if (snapshot.empty) {
            console.log("No matching documents.");
            return;
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(data);  // 输出读取的数据以便调试
            const name = data.name ? data.name.toString() : 'No Name Provided';
            const type = data.type ? data.type.toString() : 'No Type Provided';
            const status = data.status ? data.status.toString() : 'No Status Provided';
            const listItem = document.createElement('li');
            listItem.textContent = `Name: ${name}, Type: ${type}, Status: ${status}`;
            equipmentList.appendChild(listItem);
        });
    }, error => {
        console.error("Error fetching data: ", error);
    });
}

// Call the function to load equipment list on page load
loadEquipmentList();

