// Retrieve a reference to the Firestore database
const db = firebase.firestore();

// Retrieve a reference to the equipment list <ul> element
const equipmentList = document.getElementById('equipmentList');

// Add an event listener for the equipment form submission
document.getElementById('equipmentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.toString();
    const type = document.getElementById('type').value;
    const purchaseDate = document.getElementById('purchaseDate').value;
    const maintenanceDate = document.getElementById('maintenanceDate').value;
    const status = document.getElementById('status').value.toString();
    const timestamp = new Date();

    // Check the purchase date
    if (new Date(purchaseDate) > new Date()) {
        alert('Purchase Date cannot be later than the current date.');
        return;
    }

    if (new Date(purchaseDate) > new Date(maintenanceDate)) {
        alert('Purchase Date cannot be later than the maintenance date.');
        return;
    }

    // Check if the equipment name already exists
    db.collection('equipment').where('name', '==', name).get().then(querySnapshot => {
        if (!querySnapshot.empty) {
            alert('Equipment name already exists.');
            return;
        }

        // Add the new equipment document if the name is unique
        db.collection('equipment').add({
            name: name,
            type: type,
            status: status,
            purchaseDate: purchaseDate,
            maintenanceDate: maintenanceDate,
            timestamp: timestamp
        }).then(docRef => {
            console.log("Document written with ID: ", docRef.id);
            document.getElementById('equipmentForm').reset();
            // Reset pseudo-placeholder after form reset
            const purchaseDateInput = document.getElementById('purchaseDate');
            const maintenanceDateInput = document.getElementById('maintenanceDate');
            purchaseDateInput.dispatchEvent(new Event('blur'));
            maintenanceDateInput.dispatchEvent(new Event('blur'));
            alert(`Successfully added ${name}`);
            loadEquipmentList();
        }).catch(error => {
            console.error("Error adding document: ", error);
        });
    }).catch(error => {
        console.error("Error checking existing equipment: ", error);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const purchaseDateInput = document.getElementById('purchaseDate');
    const maintenanceDateInput = document.getElementById('maintenanceDate');

    // Set initial pseudo-placeholder
    purchaseDateInput.setAttribute('data-placeholder', 'Purchase Date');
    maintenanceDateInput.setAttribute('data-placeholder', 'Next Maintenance Date');

    // Handle focus and blur events
    purchaseDateInput.addEventListener('focus', function() {
        this.removeAttribute('data-placeholder');
    });

    purchaseDateInput.addEventListener('blur', function() {
        if (!this.value) {
            this.setAttribute('data-placeholder', 'Purchase Date');
        }
    });

    maintenanceDateInput.addEventListener('focus', function() {
        this.removeAttribute('data-placeholder');
    });

    maintenanceDateInput.addEventListener('blur', function() {
        if (!this.value) {
            this.setAttribute('data-placeholder', 'Next Maintenance Date');
        }
    });

    // Trigger blur event initially to show pseudo-placeholder if fields are empty
    purchaseDateInput.dispatchEvent(new Event('blur'));
    maintenanceDateInput.dispatchEvent(new Event('blur'));
});

// Function to load equipment list from Firestore
function loadEquipmentList() {
    db.collection('equipment').onSnapshot(snapshot => {
        let equipments = [];
        snapshot.forEach(doc => {
            equipments.push({ id: doc.id, ...doc.data() });
        });

        // Sort the equipments by type and then by name
        equipments.sort((a, b) => {
            if (a.type < b.type) return -1;
            if (a.type > b.type) return 1;
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });

        equipmentList.innerHTML = '';
        equipments.forEach(data => {
            const listItem = document.createElement('li');

            const equipmentInfo = document.createElement('div');
            equipmentInfo.classList.add('equipment-info');
            equipmentInfo.innerHTML = `
                ${data.name}, ${data.type} <br> 
                ${data.status} <br>
                Purchase Date: ${data.purchaseDate} <br>
                Maintenance Date: ${data.maintenanceDate}
            `;

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => confirmDeleteEquipment(data.id);

            listItem.appendChild(equipmentInfo);
            listItem.appendChild(deleteButton);

            equipmentList.appendChild(listItem);
        });
    });
}

function confirmDeleteEquipment(id) {
    const userConfirmed = window.confirm('Are you sure you want to delete this equipment?');
    if (userConfirmed) {
        deleteEquipment(id);
    }
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
