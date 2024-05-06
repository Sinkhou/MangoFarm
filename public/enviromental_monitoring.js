
document.addEventListener('DOMContentLoaded', function() {

    const firebaseConfig = {
        apiKey: "AIzaSyAN_OFSyfnSAQ7-_j72Di-pAC1YuI2njKU",
        authDomain: "mangofarm-752a6.firebaseapp.com",
        projectId: "mangofarm-752a6",
        storageBucket: "mangofarm-752a6.appspot.com",
        messagingSenderId: "261621325120",
        appId: "1:261621325120:web:ee4c25610bfcd30f90aea5"
    };

    const app = firebase.initializeApp(firebaseConfig);
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
        // 获取当前时间，并转换为 ISO 格式字符串（或其他格式）
        const timestamp = new Date().toISOString();

        // 构造文档名，例如 "Mango Farm 1_2023-09-15T12:00:00Z"
        const docName = `${cityName}_${timestamp}`;

        const docRef = db.collection('weatherData').doc(docName); // 使用构造的文档名

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
        tableBody.innerHTML = ''; // 清空表格
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


function getWeather() {
    const citySelect = document.getElementById('citySelect');
    const cityName = citySelect.value;
    const lat = parseFloat(citySelect.options[citySelect.selectedIndex].getAttribute('data-lat'));
    const lng = parseFloat(citySelect.options[citySelect.selectedIndex].getAttribute('data-lng'));

    const unit = 'C';
    const api_key = 'f5e80542a7af4ad493700935241703';
    const base_url = 'https://api.weatherapi.com/v1/current.json';
    const full_url = `${base_url}?key=${api_key}&q=${cityName}&aqi=no`;

    fetch(full_url)
        .then(response => {
            if (response.status === 404) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            if ('error' in data) {
                throw new Error('The city could not be found.');
            }
            // Set individual elements
            document.getElementById('localTime').innerHTML = `Local Time: ${data.location.localtime}`;
            document.getElementById('condition').innerHTML = `Condition: ${data.current.condition.text} <img src="https:${data.current.condition.icon}" alt="Weather Icon">`;
            document.getElementById('temperature').innerHTML = `Temperature: ${unit === 'F' ? data.current.temp_f + '°F' : data.current.temp_c + '°C'}`;
            document.getElementById('wind').innerHTML = `Wind: ${data.current.wind_mph} mph / ${data.current.wind_kph} kph, Direction: ${data.current.wind_dir}`;
            document.getElementById('humidity').innerHTML = `Humidity: ${data.current.humidity}%`;
            document.getElementById('uvIndex').innerHTML = `UV Index: ${data.current.uv}`;
            document.getElementById('pressure').innerHTML = `Pressure: ${data.current.pressure_mb} mb`;
        
            // 更新 Google 地图中心
            if (window.map) {
                const center = new google.maps.LatLng(lat, lng);
                window.map.setCenter(center);
            }
        
            // 准备要上传的数据
            const weatherData = {
                localTime: data.location.localtime,
                condition: data.current.condition.text,
                temperature: unit === 'F' ? data.current.temp_f : data.current.temp_c,
                wind: `${data.current.wind_mph} mph / ${data.current.wind_kph} kph, Direction: ${data.current.wind_dir}`,
                humidity: data.current.humidity,
                uvIndex: data.current.uv,
                pressure: data.current.pressure_mb
            };
        
            // 上传数据到 Firebase
            uploadDataToFirebase(cityName, weatherData);
        })
        .catch(error => {
            console.error('Error:', error);
            const errorMessage = error.message || 'Failed to retrieve weather data.';
            Object.values(document.querySelectorAll('.module.info-window')).forEach(div => {
                div.innerHTML = errorMessage; // Show user-friendly error message in all fields
            });
        });
}


function updateMonitoringInfo() {
    document.getElementById('airQuality').innerHTML = 'Air Quality: Good (PM2.5 level at 12, PM10 at 20)';
    document.getElementById('soilStatus').innerHTML = 'Soil Condition: Moist (30% moisture, 22°C)';
    document.getElementById('lightIntensity').innerHTML = 'Light Intensity: 5000 lux';
    document.getElementById('waterQuality').innerHTML = 'Water Quality: Excellent (pH 7.2, Hardness 120 ppm)';
    document.getElementById('pestAlert').innerHTML = 'Disease Recognizing: No threats detected';
}
function clearMonitoringInfo() {
    const fieldWindows = document.querySelectorAll('.field-window');
    fieldWindows.forEach(window => {
        const defaultText = window.getAttribute('data-default');
        window.innerHTML = defaultText;
    });
}

function fetchDataAndUpdateUI() {
    db.collection("monitoring").doc("farm1-1").get().then((doc) => {
        if (doc.exists) {
            // 获取文档数据
            const data = doc.data();
            // 更新 UI
            airQualityDiv.innerHTML = 'Air Quality: ' + data.air;
            soilStatusDiv.innerHTML = 'Soil Condition: ' + data.soil;
            lightIntensityDiv.innerHTML = 'Light Intensity: ' + data.light;
            waterQualityDiv.innerHTML = 'Water Quality: ' + data.water;
            pestAlertDiv.innerHTML = 'Disease Recognizing: ' + data.disease;
        } else {
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadWeatherData();
});


