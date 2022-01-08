//---------------------Variable declaration---------------------
const apiKey = '597e7780183a41e3002ae9e07002ff0d';  //Our API key for Open Weather
let city = '';  //City data will be taken from the user
let tempType = 'Celcius';   //Temperature to show the data in
let tempTyepCode = '&#8451;';   //UTF-8 code for the temperature to show the data in
let weatherData;    //Variable to hold our final weather data for the city


//---------------------DOM caching---------------------
let searchBtn = document.querySelector('#searchBtn');
let toggleCelciusFahrenheitBtn = document.querySelector('#toggleCelciusFahrenheitBtn');
let weatherDataDiv = document.querySelector('#weatherData');
let welcomeMessageDiv = document.querySelector('#welcomeMessage');
let loadingMessageDiv = document.querySelector('#loadingMessage');
let weatherDataContainerDiv = document.querySelector('#weatherDataContainer');
let degCelSpan = document.querySelector('#degCel');
let degFahrenSpan = document.querySelector('#degFahren');


//---------------------Event listeners---------------------
searchBtn.addEventListener('click',getWeatherDataFromAPI);
toggleCelciusFahrenheitBtn.addEventListener('click', changeTempType);


//---------------------Main function-----------------------
//Function to fetch the weather data from the API, process it and show it on screen
function getWeatherDataFromAPI() {
    let searchInput = document.querySelector('#searchInput').value;
    if(searchInput == '') { //If city is not entered alert user to enter city name
        alert('Please enter city name.');
    } else {
        displayLoadingMessage();
        city = searchInput;
        
        let apiURL = 'https://api.openweathermap.org/data/2.5/weather?q='+city+'&APPID='+apiKey;
        
        //Fetch and process data from the API
        fetch(apiURL, {mode: 'cors'})
            .then(function(response) {
                return response.json();   
            })
            .then(function(response) {
                //The promise spec only rejects the promise if there was an error making or receiving the response. A HTTP 404 should be treated as a "successful" response and is up to the user to decide what to do with such response.
                if(response.cod == 404) {   //If city name not found and error of 404 (Not found) is returned) then alert the user
                    alert('Error: '+city+' '+response.message);
                    clearSearchBox();
                    clearCityData();
                    displayWelcomeMessage();
                } else {
                    processAPIData(response);
                    convertTemperatures();
                    roundTempValues();
                    showWeatherDataOnScreen();
                }
            });
    }
}

//---------------------Helper functions---------------------
//Function to clear search box
function clearSearchBox() {
    let searchInput = document.querySelector('#searchInput');
    searchInput.value = '';
}

//Function to clear city data
function clearCityData() {
    city='';
}

//Display welcome message for entering city name
function displayWelcomeMessage() {
    welcomeMessageDiv.classList.remove('hideDiv');
    loadingMessageDiv.classList.add('hideDiv');
    weatherDataContainerDiv.classList.add('hideDiv');
}

//Display message for loading
function displayLoadingMessage() {
    welcomeMessageDiv.classList.add('hideDiv');
    loadingMessageDiv.classList.remove('hideDiv');
    weatherDataContainerDiv.classList.add('hideDiv');
}

//Display weather data area
function displayWeatherDataArea() {
    welcomeMessageDiv.classList.add('hideDiv');
    loadingMessageDiv.classList.add('hideDiv');
    weatherDataContainerDiv.classList.remove('hideDiv');
}

//Function to grab all the data that we want to display on the page
function processAPIData(weatherAPIResposnse) {
    //Create an object for our weather data and fill it with the data from the JSON data that we get from the API
    weatherData = {
        location: weatherAPIResposnse.name,
        country: weatherAPIResposnse.sys.country,
        coordinates: {
            lattitude: weatherAPIResposnse.coord.lat,
            longitude: weatherAPIResposnse.coord.lon
        },
        condition: weatherAPIResposnse.weather[0].description, //Weather condition within the group
        iconCode: weatherAPIResposnse.weather[0].icon,
        temperature: weatherAPIResposnse.main.temp, //Temperatue. Unit:Kelvin
        feelsLike: weatherAPIResposnse.main.feels_like, //This temperature parameter accounts for the human perception of weather. Unit:Kelvin
        cloudsPercentage: weatherAPIResposnse.clouds,   //Percentage of cloudiness
        humidity: weatherAPIResposnse.main.humidity,    //Percentage of humidity
        wind: weatherAPIResposnse.wind.speed    //Wind speed. Unit: meter/sec
    }
}

//Function to convert all the temperatures of our data
function convertTemperatures() {
    if(tempType == 'Celcius') {
        //Convert all temperatures to celcius
        weatherData.temperature = convertKelvinToCelcius(weatherData.temperature);
        weatherData.feelsLike = convertKelvinToCelcius(weatherData.feelsLike);
    } else if (tempType == 'Fahrenheit') {
        //Convert all temperatures to fahrenheit
        weatherData.temperature = convertKelvingToFahrenheit(weatherData.temperature);
        weatherData.feelsLike = convertKelvingToFahrenheit(weatherData.feelsLike);
    }
}

//Function to convert temeprature from Kelvin to Celcius
function convertKelvinToCelcius(tempInKelvin) {
    let tempInCelcius = tempInKelvin - 273.15;  //Change data to celcius
    return tempInCelcius;
}

//Function to convert temeprature from Kelvin to Fahrenheit
function convertKelvingToFahrenheit(tempInKelvin) {
    let tempInFahrenheit = ((tempInKelvin - 273.15)*1.8)+32;   //Change data to fahrenheit
    return tempInFahrenheit;
}

//Function to round off temperature values to 2 decimal places
function roundTempValues() {
    weatherData.temperature = Math.round(weatherData.temperature * 100) / 100; //Round off to 2 decimal places
    weatherData.feelsLike = Math.round(weatherData.feelsLike * 100) / 100;
}

//Show weather data on screen
function showWeatherDataOnScreen() {
    displayWeatherDataArea();
    let weatherImgURL = 'http://openweathermap.org/img/wn/'+weatherData.iconCode+'@2x.png'; //Get the weather icon from the openweather API using the icon code received in API request

    //Show the data on screen
    weatherDataDiv.innerHTML = 
        `<div id="mainData">
            <img src="${weatherImgURL}" id="weatherImgURL" alt="Weather Image"/>
            <div id="temp">${weatherData.temperature} ${tempTyepCode}</div>
            <div id="weather">${weatherData.condition}</div>
            <div id="location"><span id="city">${weatherData.location}, </span><span id="country">${weatherData.country}</div>
        </div>
        <div id="secondaryData">
            <div id="lattitude">Lattitude: ${weatherData.coordinates.lattitude}</div>
            <div id="longitude">Longitude: ${weatherData.coordinates.longitude}</div>
            <div id="feelsLike">Feels like: ${weatherData.feelsLike} ${tempTyepCode}</div>
            <div id="cloudCover">Cloud cover: ${weatherData.cloudsPercentage.all}%</div>
            <div id="humidity">Humidity: ${weatherData.humidity}%</div>
            <div id="wind">Wind speed: ${weatherData.wind} m/s</div>
        </div>`
    ;
}

//Function to toggle the temperature between fahrenheit and celcius
function changeTempType() {
    //Change the variables of temperature and temperature code
    if(tempType == 'Celcius') {
        tempType = 'Fahrenheit';
        tempTyepCode = '&#8457;';
        makeFahrenheitBold();
    } else if(tempType == 'Fahrenheit') {
        tempType = 'Celcius';
        tempTyepCode = '&#8451;';
        makeCelciusBold();
    } 

    //Update the temperature data if present
    if(city != '') {
        getWeatherDataFromAPI();
    }
}

//Function to make degree celcius bold on U/I
function makeCelciusBold() {
    degCelSpan.classList.add('activeTemp');
    degFahrenSpan.classList.remove('activeTemp');
}

//Function to make degree fahrenheit bold on U/I
function makeFahrenheitBold() {
    degCelSpan.classList.remove('activeTemp');
    degFahrenSpan.classList.add('activeTemp');
}