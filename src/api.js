const Http = new XMLHttpRequest();
const Http2 = new XMLHttpRequest();
const apiKey = "d2de489f04724cc29c9d855cef1051b1";
const apiKeyWeather = "d522aa97197fd864d36b418f39ebb323";
let numberOfRequests = 0;
let timerSet = false;
let interval = null;
let temp = 0;
const url =
  "http://api.sl.se/api2/realtimedeparturesV4.json?key=" +
  apiKey +
  "&siteid=1860&timewindow=60";
const tempUrl = 'https://api.weather.com/v2/turbo/vt1observation?apiKey=' + apiKeyWeather + '&format=json&geocode=59.33%2C18.07&language=en-US&units=m';

start();

function getSLinfo() {
  document.getElementById("content-sl").innerHTML = "Laddar ...";
  Http.open("GET", url);
  Http.send();
  numberOfRequests++;
}

function getTemp() {
  document.getElementById("temp").innerHTML = "Laddar ...";
  Http2.open("GET", tempUrl);
  Http2.send();
  numberOfRequests++;
}

function getHours() {
  const d = new Date();
  return d.getHours();
}

function start() {
  getSLinfo();
  getTemp();
  isItFriday();
  
  if (!interval) {
    interval = setInterval(function() {
      getSLinfo();
    }, 10000);
  }

  if (!timerSet) {
    timerSet = true;
    setTimeout(() => {
      clearInterval(interval);
      timerSet = false;
      interval = null;
      document.getElementById("content").innerHTML = "<h1>Uppdatera</h1>";
    }, 60000 * 10);
  }
}

function isItFriday() {
  let d = new Date();
  let text = '';
  if (d.getDay() === 2) {
    text = (temp > 15 ? 'OCH' : 'MEN' ) + ' DET ÄR FREDAG! :D :D :D';
  } else {
    text = 'Det är inte fredag :(';
  }
  document.getElementById("friday").innerHTML = text;
  console.log(d.getDay());
}

Http.onreadystatechange = e => {
  if (e.currentTarget.readyState == 4) {
    let response = JSON.parse(Http.responseText);
    let buses = response.ResponseData.Buses;

    gullmars = buses.filter(obj => obj.Destination === "Gullmarsplan");
    alvsjo = buses.filter(obj => obj.Destination !== "Gullmarsplan");

    document.getElementById("content-sl").innerHTML =
      "<h2>Gullmarsplan</h2><h1>" +
      gullmars[0].DisplayTime +
      "</h1>" +
      gullmars[1].DisplayTime +
      "<br>" +
      gullmars[2].DisplayTime +
      "<br>" +
      "<h2>Älvsjö</h2><h1>" +
      alvsjo[0].DisplayTime +
      "</h1>" +
      alvsjo[1].DisplayTime +
      "<br>" +
      alvsjo[2].DisplayTime +
      "<br>";
  }
};

Http2.onreadystatechange = e => {
  if (e.currentTarget.readyState == 4) {
    let response = JSON.parse(Http2.responseText);
    temp = response.vt1observation.temperature;
    document.getElementById("temp").innerHTML = '<b>' + temp + '</b> jävla grader är det!';
  }
};
