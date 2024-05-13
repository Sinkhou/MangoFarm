document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();

//dataset selecting
    function handleRowClick(rowId) {
        const previousSelected = document.querySelector('.selected-row');
        if (previousSelected) {
            previousSelected.classList.remove('selected-row');
        }
        const currentRow = document.getElementById(rowId);
        if (currentRow) {
            currentRow.classList.add('selected-row');
        }
    }

//load weather data from firebase   
    function loadWeatherData() {
        const tableBody = document.getElementById('weatherData');
        tableBody.innerHTML = '';
        db.collection("weatherData").orderBy("localTime", "desc").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const rowId = `row-${doc.id}`;
                const row = `<tr id="${rowId}" data-docId="${doc.id}" onclick="handleRowClick('${rowId}')">
                    <td>${data.location || ''}</td>
                    <td>${data.localTime || ''}</td>
                    <td>${data.condition || ''}</td>
                    <td>${data.humidity || ''}</td>
                    <td>${data.pressure || ''}</td>
                    <td>${data.temperature || ''}</td>
                    <td>${data.uvIndex || ''}</td>
                    <td>${data.wind || ''}</td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        }).catch((error) => {
            console.error("Error loading data: ", error);
        });
    }

//load real-time data 
    function loadSpecificData() {
        const selectedRow = document.querySelector('.selected-row');
        if (!selectedRow) {
            alert('Please select a row first.');
            return;
        }
        
        const docId = selectedRow.getAttribute('data-docId');
        db.collection("weatherData").doc(docId).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                const tableBody2 = document.getElementById('weatherData2');
                tableBody2.innerHTML = `<tr>
                    <td>${data.airQuality || 'N/A'}</td>
                    <td>${data.soilStatus || 'N/A'}</td>
                    <td>${data.lightIntensity || 'N/A'}</td>
                    <td>${data.waterQuality || 'N/A'}</td>
                    <td>${data.pestAlert || 'N/A'}</td>
                </tr>`;
            } else {
                console.error("No such document!");
            }
        }).catch(error => {
            console.error("Error getting document:", error);
        });
    }

//data filter
function filterTable() {
    const locationInput = document.getElementById('locationInput').value.trim();
    const dateInput = document.getElementById('dateInput').value.trim();
    const tableBody = document.getElementById('weatherData');
    tableBody.innerHTML = ''; 

    let query = db.collection("weatherData");

    if (locationInput) {
        query = query.where("location", "==", locationInput);
    }

    if (dateInput) {
        const startDate = new Date(dateInput + ' 00:00');
        const endDate = new Date(dateInput + ' 23:59');
        query = query.where("localTime", ">=", startDate.toISOString())
                     .where("localTime", "<=", endDate.toISOString());
    }

    query.get()
         .then(querySnapshot => {
             if (querySnapshot.empty) {
                 alert('No matching records found.');
             } else {
                 querySnapshot.forEach(doc => {
                     appendRow(doc);
                 });
             }
         })
         .catch(error => {
             console.error("Error filtering data: ", error);
         });
}

function appendRow(doc) {
    const data = doc.data();
    const rowId = `row-${doc.id}`;
    const row = `<tr id="${rowId}" data-docId="${doc.id}" onclick="handleRowClick('${rowId}')">
        <td>${data.location || ''}</td>
        <td>${data.localTime || ''}</td>
        <td>${data.condition || ''}</td>
        <td>${data.humidity || ''}</td>
        <td>${data.pressure || ''}</td>
        <td>${data.temperature || ''}</td>
        <td>${data.uvIndex || ''}</td>
        <td>${data.wind || ''}</td>
    </tr>`;
    document.getElementById('weatherData').innerHTML += row;
}



    function deleteSelectedDocument() {
        const selectedRow = document.querySelector('.selected-row');
        if (!selectedRow) {
            alert('Please select a record to delete.');
            return;
        }

        const docId = selectedRow.getAttribute('data-docId');
        if (confirm('Are you sure you want to delete this record?')) {
            db.collection("weatherData").doc(docId).delete().then(() => {
                console.log("Document successfully deleted!");
                selectedRow.remove(); // Optionally remove the row from the table
                alert('Record has been deleted.');
            }).catch(error => {
                console.error("Error removing document: ", error);
                alert('Failed to delete the record.');
            });
        }
    }

    document.getElementById('deleteButton').addEventListener('click', deleteSelectedDocument);

    window.loadWeatherData = loadWeatherData;
    window.handleRowClick = handleRowClick;
    window.loadSpecificData = loadSpecificData;
    window.filterTable = filterTable;
})

  document.addEventListener('DOMContentLoaded', () => {
    loadWeatherData();
});

document.getElementById('loadDataButton').addEventListener('click', () => {
    loadSpecificData();
});
