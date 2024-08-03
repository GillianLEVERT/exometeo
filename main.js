const API_KEY = import.meta.env.VITE_API_KEY;
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

let cityInput, searchButton, weatherIcon, weatherDetails, forecastElement;

document.addEventListener('DOMContentLoaded', () => {
    cityInput = document.getElementById('city');
    searchButton = document.getElementById('search');
    weatherIcon = document.getElementById('weather-icon');
    weatherDetails = document.getElementById('weather-details');
    forecastElement = document.getElementById('forecast');

    if (searchButton) {
        searchButton.addEventListener('click', getWeatherAndForecast);
    }
});

async function getWeatherAndForecast() {
    const city = cityInput.value.trim();
    if (!city) {
        updateWeatherInfo('Veuillez entrer un nom de ville ou un code postal.');
        return;
    }

    try {
        const [weatherData, forecastData] = await Promise.all([
            fetchData(`${WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=fr`),
            fetchData(`${FORECAST_API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=fr`)
        ]);

        displayWeather(weatherData);
        displayForecast(forecastData);
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        updateWeatherInfo('Une erreur s\'est produite lors de la récupération des données météo.');
    }
}

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

function displayWeather(data) {
    const { name, main, weather } = data;
    const temperature = main.temp.toFixed(1);
    const description = weather[0].description;
    const iconCode = weather[0].icon;

    if (weatherIcon) {
        weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}">`;
    }
    
    updateWeatherInfo(`
        <h2>${name}</h2>
        <p>Température : ${temperature}°C</p>
        <p>Description : ${description}</p>
    `);
}

function displayForecast(data) {
    const dailyForecasts = groupForecastsByDay(data.list);
    let forecastHTML = '<h3>Prévisions sur plusieurs jours</h3>';

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        forecastHTML += `
            <div class="forecast-day">
                <p>${date.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
                <p>Temp : ${forecast.main.temp.toFixed(1)}°C</p>
                <p>${forecast.weather[0].description}</p>
            </div>
        `;
    });

    if (forecastElement) {
        forecastElement.innerHTML = forecastHTML;
    }
}

function groupForecastsByDay(forecastList) {
    const groupedForecasts = {};
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toDateString();
        if (!groupedForecasts[date]) {
            groupedForecasts[date] = forecast;
        }
    });
    return Object.values(groupedForecasts);
}

function updateWeatherInfo(content) {
    if (weatherDetails) {
        weatherDetails.innerHTML = content;
    }
}