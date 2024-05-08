// Retrieve a reference to the Firestore database
const db = firebase.firestore();

// Retrieve a reference to the equipment list <ul> element
const equipmentList = document.getElementById('equipmentList');

// Add an event listener for the equipment form submission
document.getElementById('equipmentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.toString();
    const type = document.getElementById('type').value.toString();
    const purchaseDate = document.getElementById('purchaseDate').value;
    const maintenanceDate = document.getElementById('maintenanceDate').value;
    const status = document.getElementById('status').value.toString();

    db.collection('equipment').add({
        name: name,
        type: type,
        status: status,
        purchaseDate: purchaseDate,
        maintenanceDate: maintenanceDate
    }).then(docRef => {
        console.log("Document written with ID: ", docRef.id);
        document.getElementById('equipmentForm').reset();
        loadEquipmentList();
    }).catch(error => {
        console.error("Error adding document: ", error);
    });
});

// Function to load equipment list from Firestore
function loadEquipmentList() {
    db.collection('equipment').onSnapshot(snapshot => {
        equipmentList.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const listItem = document.createElement('li');
            listItem.innerHTML = `Name: ${data.name}, Type: ${data.type}, Status: ${data.status}, Purchase Date: ${data.purchaseDate}, Maintenance Date: ${data.maintenanceDate} <button onclick="deleteEquipment('${doc.id}')">Delete</button>`;
            equipmentList.appendChild(listItem);
        });
    });
}

function deleteEquipment(id) {
    db.collection('equipment').doc(id).delete().then(() => {
        console.log("Document successfully deleted!");
        loadEquipmentList();
    }).catch(error => {
        console.error("Error removing document: ", error);
    });
}

// Call the function to load equipment list on page load
loadEquipmentList();

