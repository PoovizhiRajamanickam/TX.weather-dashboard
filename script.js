const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');

const cityName = document.getElementById('city-name');
const temp = document.getElementById('temp');
const condition = document.getElementById('condition');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');

searchBtn.addEventListener('click', () => {
    const query = cityInput.value.trim();
    if (query) {
        getWeatherData(query);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = cityInput.value.trim();
        if (query) {
            getWeatherData(query);
        }
    }
});

async function getWeatherData(query) {
    try {
        errorMessage.classList.add('hidden');
        weatherCard.classList.add('hidden');

        let geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
        let geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            let cleanedQuery = query.replace(/district/gi, "").trim();
            geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanedQuery)}&count=10&language=en&format=json`);
            geoData = await geoResponse.json();
            
            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("Location not found. Please try entering the city or district name correctly.");
            }
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country, admin1 } = location;

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        const weatherData = await weatherResponse.json();

        const current = weatherData.current;

        cityName.textContent = `${name}, ${admin1 ? admin1 + ', ' : ''}${country || ''}`;
        temp.textContent = current.temperature_2m;
        condition.textContent = getWeatherCondition(current.weather_code);
        humidity.textContent = current.relative_humidity_2m;
        wind.textContent = current.wind_speed_10m;

        weatherCard.classList.remove('hidden');

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    }
}

function getWeatherCondition(code) {
    const codes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        95: "Thunderstorm"
    };
    return codes[code] || "Fair";
}