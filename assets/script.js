//getting a handle on things in the DOM and creating arrays/vars for information to go into
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

//this whole thing gets list of countries appends them to country select and gives it the value of the iso2 country code
//this part specifically fetches list of country names
fetch("https://api.countrystatecity.in/v1/countries", requestOptions)
.then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        console.log(data);
        //this appends country names to country select as options
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

// this whole function gets states and puts in stateSelect
//this listens for a click on the country select then saves the value of the clicked element and uses that for the fetch call for states
countrySelect.on('click', function(event){
    country = $(event.target).val()
    //verification to make sure country is not empty and since we are changing the list we clear the arrays and select options associated with the data coming in
    if(country !== "choose"){
        stateSelect.html('');
        citySelect.html('')
        states = [];
        cities = []
        //does fetch to get list of states in country chosen
        fetch("https://api.countrystatecity.in/v1/countries/"+ country +"/states", requestOptions)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                console.log(data);
                //appends states as options into state select
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


//this function gets cities and puts in citySelect
//this listens for a click on the state select then saves the value of the clicked element and uses that for the fetch call for cities
stateSelect.on('click', function(event){
    state = $(event.target).val()
    console.log(city);
    //verification to make sure state is not empty
    if(state !== "choose" && state != 'UM-84'){
        citySelect.html('');
        cities = [];
        //does fetch to get list of cities in country chosen
        fetch("https://api.countrystatecity.in/v1/countries/"+ country +"/states/" + state + "/cities", requestOptions)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                console.log(data);
                //appends citys as options in city select
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

//this listens for a click on cities and saves the target value as the city 
citySelect.on("click", function(event){
    city = $(event.target).val();
    console.log(city);

})

//this looks in local storage for previously searched locations and prints them to the history aside
function getHistory(){
    console.log('get history')
    searchHistory.html('')
    var localHistory = JSON.parse(localStorage.getItem('cities'));
    console.log(localHistory);
    //verification to make sure its not empty
    if(localHistory !== null){
        cityHistory = localHistory;
        console.log(cityHistory);
    }
    //cycles through and prints each item to history saving the important info into data attributesfor use later
    for(var i = 0; i < cityHistory.length; i++){
        var historyP = $("<p>");
        searchHistory.append(historyP);
        
        historyP.text(cityHistory[i].name);
        historyP.data('lon', cityHistory[i].lon);
        historyP.data('lat', cityHistory[i].lat);
    }
}

//this function saves a searched city into history 
function addHistory(){
    //creates object for searched city
    var city = {
        name: cityName,
        lat: latitude,
        lon: longitude
    }
    console.log(city);
    //verifies to see if there is other items in history then saves to history sets max of 10 and removes extras
    if(cityHistory == []){cityHistory = [city]}
    else{cityHistory.unshift(city);}
    if(cityHistory.length == 10){cityHistory.pop()}
    console.log(cityHistory);
    //clears local storage so we dont duplicate items then saves to it
    localStorage.clear();
    localStorage.setItem('cities',JSON.stringify(cityHistory));
    getHistory();
}

//this function gets the five day forcast and appends it to the screen
function getWeather(){
    console.log('getWeather')
    //verification to make sure all search parameters are filled in the fetching weather info
    if(city !== 'choose' && latitude !== '' && longitude!== ''){
        fetch('https://api.openweathermap.org/data/2.5/forecast?lat='+latitude+'&lon='+longitude+'&units=imperial&appid=f76c276e91986fd36d44848316201569')
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data);
                    forecastCity.text('5-Day Forecast: '+cityName)
                    fiveDayDisplay.html('')
                    //for loop loops through info (which goes in 3 hr incraments) and selecting the info for every 24 hour period (8 cycles)
                    for(var i = 0; i < data.list.length; i++){
                        if(i % 8 == 0 ){
                            //creates elemets for info to go into
                            console.log('i: '+i)
                            var dayDiv = $('<div>');
                            dayDiv.addClass('forecast')
                            var dateH2 = $('<h2>');
                            var iconImg = $("<img>");
                            var tempP = $('<p>');
                            var windP = $('<p>');
                            var humidP = $('<p>');
                            
                            //gets data out of fetched data and assigns it to variables
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
                            
                            //appends the created elements to the DOM
                            fiveDayDisplay.append(dayDiv);
                            dayDiv.append(dateH2);
                            dayDiv.append(iconImg);
                            dayDiv.append(tempP);
                            dayDiv.append(windP);
                            dayDiv.append(humidP);
                            
                            //applies classes to the divs so i can style the first(today) seperate from the others
                            if(i==0){dayDiv.addClass('first');console.log('first');}
                            else{dayDiv.addClass('other');console.log('other');}

                            //sets the elemnts displayed inside text to show the info retrieved from the fetch call 
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

//function uses data gathered by the selects to search for coordinates of a location
function getCoordinates(){

    if(city != 'choose' && city.length < 25){
        fetch('https://api.openweathermap.org/geo/1.0/direct?q='+city+','+state+','+country+'&limit='+1+'&appid=f76c276e91986fd36d44848316201569')

    //verification makes sure its not empty and makes sure its not selecting every option
    if(city != 'choose' && city.length < 30){
        fetch('https://api.openweathermap.org/geo/1.0/direct?q='+city+','+state+','+country+'&limit='+1+'&appid=f76c276e91986fd36d44848316201569')
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data);
                    latitude = data[0].lat;
                    longitude = data[0].lon;
                    cityName = data[0].name;
                    console.log('lat: '+ latitude + ' / lon: '+ longitude + ' / city: '+ cityName)
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
}}

//when a history city is clicked it sets searching variables to the data attributes of that city and gets the wateher
searchHistory.on('click', 'p', function(event){
    var target=$(event.target)
    cityName = target.text();
    city = cityName
    longitude =target.data('lon'); 
    latitude =target.data('lat');
    console.log(cityName +longitude+latitude);
    getWeather();
})

//gets history and appends to page on page load
getHistory();

//adds event listener to search button to start events to search
searchBtn.on('click', function(){
    getCoordinates();
})