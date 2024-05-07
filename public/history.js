
/*---------------------------------Environmental Monitoring----------------------------------------------*/ 
document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();
    
    function fetchDataAndUpdateUI(docId) {
        db.collection("monitoring").doc(docId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('airQuality').innerHTML = 'Air Quality: ' + data.air;
            document.getElementById('soilStatus').innerHTML = 'Soil Condition: ' + data.soil;
            document.getElementById('lightIntensity').innerHTML = 'Light Intensity: ' + data.light;
            document.getElementById('waterQuality').innerHTML = 'Water Quality: ' + data.water;
            document.getElementById('pestAlert').innerHTML = 'Disease Recognizing: ' + data.disease;
        } else {
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

    function uploadDataToFirebase(cityName, weatherData) {
        
        const timestamp = new Date().toISOString();

        
        const docName = `${cityName}_${timestamp}`;

        const docRef = db.collection('weatherData').doc(docName); 

        docRef.set(weatherData)
            .then(() => {
                console.log("Document successfully written!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }

    function loadWeatherData() {
        const tableBody = document.getElementById('weatherData');
        tableBody.innerHTML = ''; 
        db.collection("weatherData").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = `<tr>
                    <td>${data.condition || ''}</td>
                    <td>${data.humidity || ''}</td>
                    <td>${data.localTime || ''}</td>
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

    window.fetchDataAndUpdateUI = fetchDataAndUpdateUI;
    window.uploadDataToFirebase = uploadDataToFirebase;
    window.loadWeatherData = loadWeatherData;
})

  document.addEventListener('DOMContentLoaded', () => {
    loadWeatherData();
});


