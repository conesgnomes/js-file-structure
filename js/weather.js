var apiKey = require('./../.env').apiKey;

Weather = function() {
}

Weather.prototype.getWeather = function(city, displayHumidity) {
  $.get('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey).then(function(response) {
    displayHumidity(city, response.main.humidity);
  }).fail(function(error) {
      $('.showeWeather').text(error.responseJSON.message);
  });
}

exports.weatherModule = Weather;
