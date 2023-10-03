/*
https://home.openweathermap.org/api_keys
https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=f76c276e91986fd36d44848316201569      weather
http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid=f76c276e91986fd36d44848316201569     geocoder
GIVEN a weather dashboard with form inputs
WHEN I search for a city
THEN I am presented with current and future conditions for that city and that city is added to the search history
WHEN I view current weather conditions for that city
THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, and the wind speed
WHEN I view future weather conditions for that city
THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
WHEN I click on a city in the search history
THEN I am again presented with current and future conditions for that city
*/
var countrySelect = $('#country');
var countries = [];
var country = 'choose';
var stateSelect = $('#state');
var states = [];
var state = 'choose';
var citySelect = $('#city');
var cities = [];
var city = 'choose';
var searchBtn = $('#search');
var longitude = '';
var latitude = '';
var cityName = '';
var fiveDayDisplay = $("#five-day-display");
var cityHistory = [];
var searchHistory = $('#search-history')
var forecastCity = $('#forecast-city')

//requirements for geo api to work
var headers = new Headers();
headers.append("X-CSCAPI-KEY", "bWFQTGxZNzRpWDRvY1BaWTByWVJlNTVhT1VZNHBKUWZqc2RJVWFrSQ==");
var requestOptions = {
   method: 'GET',
   headers: headers,
   redirect: 'follow'
};

//gets list of countries appends them to country select and gives it the value of the iso2 country code
fetch("https://api.countrystatecity.in/v1/countries", requestOptions)
.then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        console.log(data);
        for(var i = 0; i < data.length; i++){
            var countryOptionEl = $('<option>');
            countryOptionEl.html(data[i].name);
            countryOptionEl.val(data[i].iso2);
            countrySelect.append(countryOptionEl);
            console.log(data[i].name + " / "  + countryOptionEl.val());
        }
    });
    } else {
      html(ERROR);
      console.log(response.statusText)
    }
  });

  // gets states and puts in stateSelect
countrySelect.on('click', function(event){
    country = $(event.target).val()
    if(country !== "choose"){
        stateSelect.html('');
        states = [];
        cities = []
        fetch("https://api.countrystatecity.in/v1/countries/"+ country +"/states", requestOptions)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                console.log(data);
                for(var i = 0; i < data.length; i++){
                    var stateOptionEl = $('<option>');
                    stateOptionEl.html(data[i].name);
                    stateOptionEl.val(data[i].iso2);
                    stateSelect.append(stateOptionEl);
                    console.log(data[i].name + " / "  + stateOptionEl.val());
                }
                });
            } else {
                html(ERROR);
                console.log(response.statusText)
            }
        });
    }
});

  //gets cities and puts in citySelect
stateSelect.on('click', function(event){
    state = $(event.target).val()
    console.log(city);
    if(state !== "choose"){
        citySelect.html('');
        cities = [];
        fetch("https://api.countrystatecity.in/v1/countries/"+ country +"/states/" + state + "/cities", requestOptions)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                console.log(data);
                for(var i = 0; i < data.length; i++){
                    var cityOptionEl = $('<option>');
                    cityOptionEl.html(data[i].name);
                    cityOptionEl.val(data[i].name);
                    citySelect.append(cityOptionEl);
                    console.log(data[i].name + " / "  + cityOptionEl.val());
                }
                });
            } else {
                html(ERROR);
                console.log(response.statusText)
            }
        });
    }
})

citySelect.on("click", function(event){
    city = $(event.target).val();
    console.log(city);

})

function getHistory(){
    console.log('get history')
    searchHistory.html('')
    var localHistory = JSON.parse(localStorage.getItem('cities'));
    console.log(localHistory);
    if(localHistory !== null){
        cityHistory = localHistory;
        console.log(cityHistory);
    }
    for(var i = 0; i < cityHistory.length; i++){
        var historyP = $("<p>");
        searchHistory.append(historyP);
        
        historyP.text(cityHistory[i].name);
        historyP.data('lon', cityHistory[i].lon);
        historyP.data('lat', cityHistory[i].lat);
    }
}

function addHistory(){
    var city = {
        name: cityName,
        lat: latitude,
        lon: longitude
    }
    
    console.log(city);
    if(cityHistory == []){cityHistory = [city]}
    else{cityHistory.unshift(city);}
    if(cityHistory.length == 10){cityHistory.pop()}
    console.log(cityHistory);
    localStorage.clear();
    localStorage.setItem('cities',JSON.stringify(cityHistory));
    getHistory();
}

function getWeather(){
    console.log('getWeather')
    if(city !== 'choose' && latitude !== '' && longitude!== ''){
        fetch('https://api.openweathermap.org/data/2.5/forecast?lat='+latitude+'&lon='+longitude+'&units=imperial&appid=f76c276e91986fd36d44848316201569')
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data);
                    forecastCity.text('5-Day Forecast: '+cityName)
                    fiveDayDisplay.html('')
                    for(var i = 0; i < data.list.length; i++){
                        if(i % 8 == 0 ){
                            console.log('i: '+i)
                            var dayDiv = $('<div>');
                            dayDiv.addClass('forecast')
                            var dateH2 = $('<h2>');
                            var iconImg = $("<img>");
                            var tempP = $('<p>');
                            var windP = $('<p>');
                            var humidP = $('<p>');
                            
                            todaysTemp = data.list[i].main.temp;//temp
                            console.log(todaysTemp);
                            todaysWind = data.list[i].wind.speed;//wind
                            console.log(todaysWind);
                            todaysHumidity = data.list[i].main.humidity;//humidity
                            console.log(todaysHumidity);
                            todaysIcon = data.list[i].weather[0].icon;//icon
                            var iconURL = "http://openweathermap.org/img/w/" + todaysIcon + ".png"
                            console.log(todaysIcon)
                            todaysDate = data.list[i].dt_txt.substr(0, 10);//temp
                            console.log(todaysDate);

                            fiveDayDisplay.append(dayDiv);
                            dayDiv.append(dateH2);
                            dayDiv.append(iconImg);
                            dayDiv.append(tempP);
                            dayDiv.append(windP);
                            dayDiv.append(humidP);
                            
                            if(i==0){dayDiv.addClass('first');console.log('first');}
                            else{dayDiv.addClass('other');console.log('other');}
                            dateH2.text(todaysDate);
                            iconImg.attr('src', iconURL);
                            tempP.text('temperature: '+ Math.round(todaysTemp) +'° F');
                            windP.text('Wind speed: '+ Math.round(todaysWind) +' MPH');
                            humidP.text('Humidity: '+ todaysHumidity + '%');
                        }
                    }
            });
            } else {
                console.log(response.statusText);
            }
        })
    }
}

function getCoordinates(){
    if(city != 'choose' && city.length < 25){
        fetch('https://api.openweathermap.org/geo/1.0/direct?q='+city+','+state+','+country+'&limit='+1+'&appid=f76c276e91986fd36d44848316201569')
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data);
                    latitude = data[0].lat;
                    longitude = data[0].lon;
                    cityName = data[0].name;
                    console.log('lat: '+ latitude[0-5] + ' / lon: '+ longitude[0-5] + ' / city: '+ cityName)
                    getWeather();
                    addHistory();
                 }
            );
            } else {
                html(ERROR);
                console.log(response.statusText);
            }
        })
    }
}

searchHistory.on('click', 'p', function(event){
    var target=$(event.target)
    cityName = target.text();
    city = cityName
    longitude =target.data('lon'); 
    latitude =target.data('lat');
    console.log(cityName +longitude+latitude);
    getWeather();
})


getHistory();

searchBtn.on('click', function(){
    getCoordinates();
})


