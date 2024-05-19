document.addEventListener('DOMContentLoaded', function() { 
    loadLocations(); 
});
const db = firebase.firestore();
let map;
let marker;
let selectedElement = null;
let selectedDocId = null;
let markers = {};
let localityName = '';

//initiate map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: -12.463415, lng: 130.844764}, 
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    loadLocations();
    window.map = map; // This line is redundant if you use the global 'map' variable
}

//function of place searching
function searchPlace() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const latlng = { lat, lng };
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ 'location': latlng }, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
                map.setCenter(results[0].geometry.location);
                if (marker) {
                    marker.setMap(null);
                }
                marker = new google.maps.Marker({
                    position: latlng,
                    map: map
                });

                const addressComponents = results[0].address_components;
                addressComponents.forEach(component => {
                    if (component.types.includes('locality')) {
                        localityName = component.long_name; 
                        document.getElementById('locality').textContent = 'Locality: ' + localityName;
                    }
                });
            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}

//function of location saving
function saveLocation() {
    if (!marker) {
        alert("No marker to save.");
        return;
    }

    const lat = marker.getPosition().lat();
    const lng = marker.getPosition().lng();
    const customName = document.getElementById('customName').value;

    if (!customName) {
        alert("Please enter a name.");
        return;
    }
    const scale = prompt("Please enter a number for the farmland scale(m²) :", "");
    if (!scale || isNaN(scale)) {
        alert("You must enter a numeric scale to save the location.");
        return;
    }

    const markerData = {
        lat: lat,
        lng: lng,
        label: customName,
        locality: localityName,
        scale: scale // 新增範圍欄位
    };
    const monitoringData = { air: "null", disease: "null", light: "null", soil: "null", water: "null" };

    db.collection("map_edition").doc(customName).set(markerData)
    .then(() => {
        console.log("Location saved successfully with custom name: ", customName);
        addPermanentMarker(markerData);
        hideDialog();
        loadLocations();

        return db.collection("monitoring").doc(customName).set(monitoringData);
    })
    .then(() => {
        console.log("Monitoring data created successfully for: ", customName);
    })
    .catch(error => {
        console.error("Error saving location or creating monitoring data: ", error);
    });
}

//clear button
function clearAllInputs() {
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.value = '';
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

//delet the dataset of location
function deleteLocation(docId) {
    
    if (confirm("Delete the location?")) {
        db.collection("map_edition").doc(docId).delete().then(() => {
            console.log("Document successfully deleted!");
            removeMarker(docId);
            loadLocations();
            return db.collection("monitoring").doc(docId).delete();
        })
        .then(() => {
            console.log("Monitoring data successfully deleted!");
            return db.collection("weatherData").where("location", "==", docId).get();
        })
        .then(querySnapshot => {
            const batch = db.batch();
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            return batch.commit();
        })
        .then(() => {
            console.log("Weather data successfully deleted!");
        })
        .catch((error) => {
            console.error("Error removing documents: ", error);
        });
    } else {
        console.log("Deletion cancelled by user.");
    }
}


//location deleting
function handleDelete() {
    if (selectedDocId) {
        deleteLocation(selectedDocId); 
        selectedElement = null;
        selectedDocId = null; 
    } else {
        alert('Please select a location to delete.');
    }
}

//function of mark removing
function removeMarker(docId) {
    if (markers[docId]) {
        markers[docId].setMap(null); 
        delete markers[docId]; 
    }
}

//info update
function loadLocations() {
    db.collection("map_edition").get().then((querySnapshot) => {
        const container = document.getElementById('locationsList');
        container.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const div = document.createElement('div');
            div.textContent = `${doc.id}: Lat: ${data.lat}, Lng: ${data.lng}, Scale(m²): ${data.scale},  ${data.locality}`;
            div.onclick = function() {
                if (selectedElement) {
                    selectedElement.classList.remove('selected');
                }
                selectedElement = div;
                selectedElement.classList.add('selected');
                selectedDocId = doc.id; 
                moveToLocation(data.lat, data.lng); 
            };
            container.appendChild(div);

            if (!markers[doc.id]) {  
                addPermanentMarker({
                    lat: data.lat,
                    lng: data.lng,
                    label: doc.id
                });
            }
        });
    }).catch((error) => {
        console.error("Error loading locations: ", error);
    });
}

//move to current locaiton of selecting
function moveToLocation(lat, lng) {
    const center = new google.maps.LatLng(lat, lng);
    map.panTo(center); 

    if (marker) {
        marker.setMap(null); 
    }
    marker = new google.maps.Marker({
        position: center,
        map: map,
        title: "Selected Location"
    });
}


function promptForName() {
    document.getElementById('inputDialog').style.display = 'block'; 
}

function hideDialog() {
    document.getElementById('inputDialog').style.display = 'none'; 
}