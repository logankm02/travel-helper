const API_KEY = "51401bfb057db09e748ed75e801f79c6";
const geo_API_URL = "https://api.openweathermap.org/geo/1.0/direct?q=";
const weatherAPI_URL = "https://api.openweathermap.org/data/2.5/weather?"
const timeAPI_KEY = "1IKXPPTNEWI8"
const timeAPI_URL = "https://api.timezonedb.com/v2.1/get-time-zone?key="
const timeConvertAPI_URL = "https://api.timezonedb.com/v2.1/convert-time-zone?key="

let latitude, longitude;
let fromTimeZone, toTimeZone;
let Is_AM=true;

let searchBox = document.querySelector(".search-bar input");
let searchBtn = document.querySelector(".search-bar button");

let timeSearchBtn = document.querySelector(".GoButton button");
let city1Box = document.querySelector(".city1-search input");
let timeBox = document.querySelector(".time-search input");
let city2Box = document.querySelector(".city2-search input");

async function getLatandLong(city) {
  const response = await fetch(geo_API_URL + city + `&appid=${API_KEY}`);
  var data = await response.json();
  latitude = data[0].lat;
  longitude = data[0].lon;
}

async function getTime(city) {
  await getLatandLong(city);
  const response = await fetch(timeAPI_URL + timeAPI_KEY + "&format=json&by=position&" + "lat=" + latitude + "&lng=" + longitude);
  var data = await response.json();
  console.log(data.countryName);
  let country = data.countryName;
  let date_and_time = data.formatted;
  let time = date_and_time.substring(11);
  let minute = time.substring(3, 5);
  let hour = parseInt(time.substring(0, 2));
  if (hour > 12) {
    Is_AM = false;
    hour = hour - 12;
  } else {
    Is_AM=true;
    if (hour==0) {
      hour=12;
    }
  }
  let twelve_hr_time = hour + ":" + minute + (Is_AM ? "am" : "pm");
  document.querySelector(".local-time").innerHTML = twelve_hr_time;
}

async function getWeather(city) {
  await getLatandLong(city);
  const response = await fetch(weatherAPI_URL + "lat=" + latitude + "&lon=" + longitude + `&appid=${API_KEY}` + "&units=metric");
  var data = await response.json();
  document.body.style.backgroundImage = "url('travel.jpg')";
  // console.log(data);
  // var imageURL = "https://source.unsplash.com/random/1600x900?" + city;
  // document.body.style.backgroundImage = "url('" + imageURL + "')";
  // console.log(imageURL);

  document.querySelector(".temp").innerHTML = Math.round(data.main.temp, 2) + "°C";
  document.querySelector(".weather").innerHTML = data.weather[0].main;
  var feels = document.querySelector(".feels-like");
  feels.querySelector("p").innerHTML = Math.round(data.main.feels_like, 2) + "°C";
  var hum = document.querySelector(".humidity");
  hum.querySelector("p").innerHTML = Math.round(data.main.humidity, 2) + "%";
}

async function updateValues_Weather(city) {
  await getLatandLong(city);
  const response = await fetch(timeAPI_URL + timeAPI_KEY + "&format=json&by=position&" + "lat=" + latitude + "&lng=" + longitude);
  var data = await response.json();
  console.log(data);

  if (data.countryCode=="US"){
    document.querySelector(".city").innerHTML = data.cityName + ", " + data.regionName + ", " + data.countryName;
  } else if (data.countryCode=="GB") {
    document.querySelector(".city").innerHTML = data.cityName + ", " + data.regionName;
  } else {
    document.querySelector(".city").innerHTML = data.cityName + ", " + data.countryName;
  }
}

async function getFromTimeZone(city) {
  await getLatandLong(city);
  const response = await fetch("https://api.ipgeolocation.io/timezone?apiKey=6b292d342dfd42b692a8a9c6057a870e&lat=" + latitude + "&long=" + longitude);
  var data = await response.json();
  fromTimeZone = data.timezone;
}

async function getToTimeZone(city) {
  await getLatandLong(city);
  const response = await fetch("https://api.ipgeolocation.io/timezone?apiKey=6b292d342dfd42b692a8a9c6057a870e&lat=" + latitude + "&long=" + longitude);
  var data = await response.json();
  toTimeZone = data.timezone;
}

async function convertTime(fromCity, time, toCity) {
  await getFromTimeZone(fromCity);
  //console.log(fromTimeZone);
  await getToTimeZone(toCity);
  //console.log(toTimeZone);
  const constant_date = new Date();
  console.log(constant_date.getDay());
  console.log("Time:", time)
  var [hours, minutes] = time.split(':');
  // console.log(hours)
  // console.log(minutes)
  constant_date.setHours(hours);
  constant_date.setMinutes(minutes);

  var unixTime = Math.floor(constant_date.getTime() / 1000); 

  const response = await fetch(timeConvertAPI_URL + timeAPI_KEY + "&format=json" + "&from=" + fromTimeZone + "&to=" + toTimeZone + "&time=" + unixTime);
  var dataPromise = response.json();
  dataPromise
  .then(data => {
    var date = new Date(data.toTimestamp*1000);
    // console.log(data);
    // console.log(date.getHours() + ":" + date.getMinutes());
    hour = date.getHours();
    // console.log(hour);
    if (hour > 12) {
      Is_AM = false;
      hour = hour - 12;
    } else {
      Is_AM=true;
    }
    console.log("Date at source: " + constant_date);
    console.log(constant_date.getDay());
    console.log("Date at destination: " + date);
    console.log(date.getDay());
    var DayBefore = (constant_date.getDay() == date.getDay() + 1);
    if (!DayBefore) {
      var DayBefore = (constant_date.getDay() == 0 && date.getDay() == 6);
    }
    var DayAfter = (constant_date.getDay() == date.getDay() - 1);
    if (!DayAfter) {
      var DayAfter = (constant_date.getDay() == 6 && date.getDay() == 0);
    }
    document.querySelector(".final-time").innerHTML = hour + ":" + date.getMinutes().toString().padStart(2, '0') + (Is_AM ? "am" : "pm")
    + (DayBefore ? " the day before" : "") + (DayAfter ? " the next day" : "");
    DayBefore=false;
    DayAfter=false;
  })

  // var imageURL = "https://source.unsplash.com/1600x900/?" + toCity;
  // document.body.style.backgroundImage = "url('" + imageURL + " ')";
  document.body.style.backgroundImage = "url('travel.jpg')";
}

function toggleTemp() {
  const temperature = document.querySelector(".temp");

  
}

// var imageURL = "https://source.unsplash.com/1600x900/?London";
// document.body.style.backgroundImage = "url('" + imageURL + " ')";
document.body.style.backgroundImage = "url('travel.jpg')";

if (window.page1==true) {
  getWeather("London");
  getTime("London");
  updateValues_Weather("London");

  searchBox.addEventListener("keypress", (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      getWeather(searchBox.value);
      getTime(searchBox.value);
      updateValues_Weather(searchBox.value);
    }
  });
  
  searchBtn.addEventListener("click", () => {
    getWeather(searchBox.value);
    getTime(searchBox.value);
    updateValues_Weather(searchBox.value);
  })
}

if (window.page2==true) {
  timeSearchBtn.addEventListener("click", () => {
    convertTime(city1Box.value, timeBox.value, city2Box.value);
  });

  city2Box.addEventListener("keypress", (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      convertTime(city1Box.value, timeBox.value, city2Box.value);
    }
  });
}
