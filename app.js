let weatherAPIKey="";//Your SecretAPIKey Type Here which will be  Providing by OpenWeatherApI Application 
let weatherBaseEndPoint="https://api.openweathermap.org/data/2.5/weather?appid="+weatherAPIKey+"&units=metric";
let forecastBaseEndpoint="https://api.openweathermap.org/data/2.5/forecast?units=metric&appid="+weatherAPIKey;
let geocodingBaseEndpoint="http://api.openweathermap.org/geo/1.0/direct?&limit=5&appid="+weatherAPIKey+"&q="

let datalist=document.querySelector("#suggestions");
let searchInp=document.querySelector(".weather_search");
let city=document.querySelector(".weather_city");
let day=document.querySelector(".weather_day");
let humidity=document.querySelector(".weather_indicator--humidity>.value");
let wind=document.querySelector(".weather_indicator--wind>.value");
let pressur=document.querySelector(".weather_indicator--pressure>.value");
let temperature=document.querySelector(".weather_temperature>.value");
let image=document.querySelector(".weather_image");
let forecastBlock= document.querySelector(".weather_forecast");
let weatherImages=[
    {
        url:"images/broken-clouds.png",
        ids:[803,804],
    },
    {
        url:"images/clear-sky.png",
        ids:[800],
    },
    {
        url:"images/few-clouds.png",
        ids:[801],
    },
    {
        url:"images/mist.png",
        ids:[701,711,721,731,741,751,761,762,771,781],
    },
    {
        url:"images/rain.png",
        ids:[500,501,502,503,504],
    },
    {
        url:"images/scattered-clouds.png",
        ids:[802],
    },
    {
        url:"images/shower-rain/png",
        ids:[520,521,522,531,300,301,302,310,311,312,313,314,321],
    },
    {
        url:"images/snow.png",
        ids:[511,600,601,602,611,612,613,615,616,620,621,622]
    },
    {
        url:"images/thunderstorm.png",
        ids:[200,201,202,210,211,212,221,230,231,232],
    },
];

let updateCurrentWeather=(data)=>{
    // console.log(data);
    city.innerText=data.name;
    day.innerText=dayofWeek();
    humidity.innerText=data.main.humidity;
    pressur.innerText=data.main.pressure;
    let windDirection;
    let deg=data.wind.deg;
    if(deg>45 && deg<=135){
        windDirection="East";
    }else if(deg>135 && deg<=225){
        windDirection="South";
    }else if(deg>=225 && deg<=315){
        windDirection="West";
    }else{
        windDirection="North";
    }
    wind.innerText=windDirection+","+data.wind.speed;
    temperature.innerText=data.main.temp>0?"+"+Math.round(data.main.temp):Math.round(data.main.temp);
let imgID=data.weather[0].id;
    weatherImages.forEach((obj)=>{
        if(obj.ids.indexOf(imgID)!=-1){
            image.src = obj.url;
        }
    });
};
let dayofWeek=(dt=new Date().getTime())=>{
    let today=new Date(dt).toLocaleDateString("en-EN",{weekday:"long"});
    return today;
}
 let weatherForCity=async (city)=>{
     let weather=await getWeatherByCityName(city);
     if(weather.cod==="404"){
         Swal.fire({icon:"error",title:"Opps....",text:"You Typed Wrong City Name",})
         return;
     }
     updateCurrentWeather(weather)
     let cityID=weather.id;
    let forecast= await getForecastByCityID(cityID);
    updateForecast(forecast);
 }
let getWeatherByCityName=async (city)=>{
    let endPoint= weatherBaseEndPoint+"&q=" + city;
    let respone= await fetch(endPoint);
    let weather=await respone.json();
    return weather;
}
let getForecastByCityID= async (id)=>{
 let endPoint=forecastBaseEndpoint + "&id="+id;
  let result=await fetch(endPoint);
  let forecast= await result.json();
//   console.log(forecast);
  let forecastList=forecast.list;
  let daily=[];
  forecastList.forEach((day)=> {
      let date_txt=day.dt_txt;
      date_txt=date_txt.replace(" ","T");
      let date=new Date(date_txt);
      let hours=date.getHours();
      if(hours===12){
          daily.push(day)
      }
  });
//   console.log(daily);
  return daily;
};
searchInp.addEventListener("keydown",async(e)=>{
    if(e.keyCode===13){
        weatherForCity(searchInp.value);
    }
});
searchInp.addEventListener("input",async()=>{
    if(searchInp.value.length<=2){
        return;
    }
    let endPoint=geocodingBaseEndpoint+searchInp.value;
    let result=await fetch(endPoint);
    result=await result.json();
    datalist.innerHTML="";
    result.forEach((city)=>{
        // console.log(city);
        let option = document.createElement("option");
        option.value= `${city.name}${city.state?","+city.state:""},${city.country}`;
        datalist.appendChild(option);
        // console.log(datalist)
    });
});
let updateForecast=(forecast)=>{
    forecastBlock.innerHTML="";
    let forecastItem="";
    forecast.forEach((day)=>{
        let iconUrl="http://openweathermap.org/img/wn/"+day.weather[0].icon+"@2x.png";
        let temperature=day.main.temp>0?"+"+Math.round(day.main.temp):Math.round(day.main.temp);
        let dayName=dayofWeek(day.dt*1000);
        console.log(dayName);
        forecastItem+=` <div class="col mb-3">
        <div class="card weather_forecast_item">
           <div class="card-body text-center">
           <img class="img-fluid mt-4" src="${iconUrl}" width="150px" alt="${day.weather[0].description}">
             <h3 class="card-title mt-4">${dayName}</h3>
             <p class="weather_forecast_temperature mt-3">
              <span class="value">${temperature}</span> &deg;C
            </p>
           </div>
        </div>
      </div>`
    });
forecastBlock.innerHTML= forecastItem;
};
let getloction= async(lat,lon)=>{
    let endPoint="http://api.openweathermap.org/geo/1.0/reverse?lat="+lat+"&lon="+lon+"&limit=5&appid="+weatherAPIKey;
    let result=await fetch(endPoint);
    let name= await result.json()
    console.log(name[0].name);
    Swal.fire({icon:"success",title:"Location Detected Successfully..",})
    weatherForCity(name[0].name); 
    }
show();
function show(){
    let options={
        enableHighFrequency: true,
        timeout:5000,
        maximumAge:0,
    };
    navigator.geolocation.getCurrentPosition(success,error,options);
}
function success(pos){
    let crd=pos.coords;
    let lat=crd.latitude.toString();
    let lon=crd.longitude.toString();
    getloction(lat,lon);      
}
function error(err){
    console.log(err.code,err.msg);
    Swal.fire({icon:"error",title:"Location Detected",text:"Failed..",})
}