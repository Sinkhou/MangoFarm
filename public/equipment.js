// Retrieve a reference to the Firestore database
const db = firebase.firestore();

// Retrieve a reference to the equipment list <ul> element
const equipmentList = document.getElementById('equipmentList');

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

// Add an event listener for the equipment form submission
document.getElementById('equipmentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.toString();
    const type = document.getElementById('type').value;
    const purchaseDate = document.getElementById('purchaseDate').value;
    const maintenanceDate = document.getElementById('maintenanceDate').value;
    const status = document.getElementById('status').value.toString();
    const timestamp = new Date();

    db.collection('equipment').add({
        name: name,
        type: type,
        status: status,
        purchaseDate: purchaseDate,
        maintenanceDate: maintenanceDate,
        updatedAt: timestamp
    }).then(docRef => {
        console.log("Document written with ID: ", docRef.id);
        document.getElementById('equipmentForm').reset();
        // Reset pseudo-placeholder after form reset
        const purchaseDateInput = document.getElementById('purchaseDate');
        const maintenanceDateInput = document.getElementById('maintenanceDate');
        purchaseDateInput.dispatchEvent(new Event('blur'));
        maintenanceDateInput.dispatchEvent(new Event('blur'));
        loadEquipmentList();
    }).catch(error => {
        console.error("Error adding document: ", error);
    });
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
            deleteButton.onclick = () => deleteEquipment(data.id);

            listItem.appendChild(equipmentInfo);
            listItem.appendChild(deleteButton);

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
