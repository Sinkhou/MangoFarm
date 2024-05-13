document.addEventListener('DOMContentLoaded', function() {
    loadLocations();
    loadfieldSelectOptions()
});
const db = firebase.firestore();
let map;
let marker = [];
let currentMarker = null;

//load all options of selection
function loadfieldSelectOptions() {
    const selectElement = document.getElementById('fieldSelect');
    selectElement.innerHTML = '<option>Loading...</option>'; 

    db.collection("map_edition").get().then((querySnapshot) => {
        selectElement.innerHTML = ''; 
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.setAttribute('data-lat', data.lat);
            option.setAttribute('data-lng', data.lng);
            option.textContent = `${data.label} (Lat: ${data.lat.toFixed(4)}, Lng: ${data.lng.toFixed(4)})`;
            selectElement.appendChild(option);
        });
    }).catch((error) => {
        console.error("Error loading city options: ", error);
        selectElement.innerHTML = '<option>Error loading data</option>'; // Show error if data fails to load
    });
}

//release info
function fetchLocalityAndWeather() {
    const fieldSelect = document.getElementById('fieldSelect');
    const selectedDocument = fieldSelect.value;

    db.collection("map_edition").doc(selectedDocument).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            getWeather(data.locality, data.lat, data.lng);  
        } else {
            console.error("No document found!");
        }
    }).catch(error => {
        console.error("Error fetching locality: ", error);
    });
}

// initiate map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: -12.463415, lng: 130.844764}, 
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    window.map = map;
    loadLocations(); 
}

//weather api function
function getWeather() {
    const fieldSelect = document.getElementById('fieldSelect');
    const selectedDocument = fieldSelect.value;

    db.collection("map_edition").doc(selectedDocument).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const locality = data.locality;
            const lat = data.lat;
            const lng = data.lng;
            const label = data.label;

            if (marker && typeof marker.setMap === 'function') {
                marker.setMap(null);  
            } else {
                console.error('Marker is not initialized correctly.');
            }

            const unit = 'C';
            const api_key = 'f5e80542a7af4ad493700935241703';
            const base_url = 'https://api.weatherapi.com/v1/current.json';
            const full_url = `${base_url}?key=${api_key}&q=${locality+', Australia'}&aqi=no`;

            fetch(full_url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('City not found');
                }
                return response.json();
            })
            .then(data => {
                
                document.getElementById('localTime').innerHTML = `Local Time: ${data.location.localtime}`;
                document.getElementById('condition').innerHTML = `Condition: ${data.current.condition.text} <img src="https:${data.current.condition.icon}" alt="Weather Icon">`;
                document.getElementById('temperature').innerHTML = `Temperature: ${unit === 'F' ? data.current.temp_f + '°F' : data.current.temp_c + '°C'}`;
                document.getElementById('wind').innerHTML = `Wind: ${data.current.wind_mph} mph / ${data.current.wind_kph} kph, Direction: ${data.current.wind_dir}`;
                document.getElementById('humidity').innerHTML = `Humidity: ${data.current.humidity}%`;
                document.getElementById('uvIndex').innerHTML = `UV Index: ${data.current.uv}`;
                document.getElementById('pressure').innerHTML = `Pressure: ${data.current.pressure_mb} mb`;

                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: map,
                    title: locality
                });
                const infoWindow = new google.maps.InfoWindow({
                    content: `<h3>${label}</h3>`
                });

                infoWindow.open(map, marker);

                if (window.map) {
                    const center = new google.maps.LatLng(lat, lng);
                    window.map.setCenter(center);
                }
                fetchMonitoringData(label);
            })
            .catch(error => {
                console.error('Error:', error);
                const errorMessage = error.message || 'Failed to retrieve weather data.';
                Object.values(document.querySelectorAll('.module.info-window')).forEach(div => {
                    div.innerHTML = errorMessage; // 
                });
            });
        } else {
            console.error("Document not found!");
        }
    }).catch(error => {
        console.error("Error fetching document:", error);
    });
}

//release real-time data
function fetchMonitoringData(label) {
    db.collection("monitoring").doc(label).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('airQuality').innerHTML = `Air Quality(PM2.5): ${data.air || 'N/A'}`;
            document.getElementById('soilStatus').innerHTML = `Soil Moisture(%): ${data.soil || 'N/A'}`;
            document.getElementById('lightIntensity').innerHTML = `Light Intensity: ${data.light || 'N/A'}`;
            document.getElementById('waterQuality').innerHTML = `Water Quality(p.H): ${data.water || 'N/A'}`;
            document.getElementById('pestAlert').innerHTML = `Disease Recognizing: ${data.disease || 'N/A'}`;
        } else {
            console.error("No monitoring data found for label:", label);
            // Reset to default values if no data found
            resetMonitoringInfo();
        }
    }).catch(error => {
        console.error("Error fetching monitoring data:", error);
        resetMonitoringInfo();
    });
}

//reset info
function resetMonitoringInfo() {
    document.getElementById('airQuality').innerHTML = "Air Quality(PM2.5): N/A";
    document.getElementById('soilStatus').innerHTML = "Soil Moisture(%): N/A";
    document.getElementById('lightIntensity').innerHTML = "Light Intensity: N/A";
    document.getElementById('waterQuality').innerHTML = "Water Quality(p.H): N/A";
    document.getElementById('pestAlert').innerHTML = "Disease Recognizing: N/A";
}

//save button
function saveWeatherData() {
    const fieldSelect = document.getElementById('fieldSelect');
    const selectedDocument = fieldSelect.value; // Get the label

    // Create a unique identifier with the label and the current timestamp
    const timestamp = new Date().toISOString();
    const uniqueDocId = timestamp + ":" + selectedDocument;

    const weatherData = {
        location: selectedDocument,
        localTime: document.getElementById('localTime').textContent.replace('Local Time: ', ''),
        condition: document.getElementById('condition').textContent.replace('Condition: ', ''),
        temperature: document.getElementById('temperature').textContent.replace('Temperature: ', ''),
        wind: document.getElementById('wind').textContent.replace('Wind: ', ''),
        humidity: document.getElementById('humidity').textContent.replace('Humidity: ', ''),
        uvIndex: document.getElementById('uvIndex').textContent.replace('UV Index: ', ''),
        pressure: document.getElementById('pressure').textContent.replace('Pressure: ', ''),
        airQuality: document.getElementById('airQuality').textContent.replace('Air Quality(PM2.5): ', ''),
        soilStatus: document.getElementById('soilStatus').textContent.replace('Soil Moisture(%): ', ''),
        lightIntensity: document.getElementById('lightIntensity').textContent.replace('Light Intensity: ', ''),
        waterQuality: document.getElementById('waterQuality').textContent.replace('Water Quality(p.H): ', ''),
        pestAlert: document.getElementById('pestAlert').textContent.replace('Disease Recognizing: ', '')
    };

    // Save the data to Firestore with the unique document ID
    db.collection("weatherData").doc(uniqueDocId).set(weatherData)
    .then(() => {
        console.log("Weather and environmental data saved successfully for", uniqueDocId);
        alert("Save successfully!"); // 彈出提示框
    })
    .catch(error => {
        console.error("Error saving weather and environmental data:", error);
        alert("Error: " + error.message); // 如果發生錯誤，也彈出提示
    });
}

document.getElementById('saveDataButton').addEventListener('click', saveWeatherData);

// initiate the mark on map 
function loadLocations() {
    db.collection("map_edition").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            addPermanentMarker(doc.data(), doc.id);
        });
    }).catch((error) => {
        console.error("Error loading locations: ", error);
    });
}

//function of tag adding
function addPermanentMarker(data) {
    const newMarker = new google.maps.Marker({
        position: {lat: data.lat, lng: data.lng},
        map: map,
        title: data.label,
        icon: {
            url: 'icon-EM/mapicon-origin.png',
            scaledSize: new google.maps.Size(20, 20)
        }
    });
}

