class LocationCoords{
  constructor(lat,lng){
    this.lng=lng;
    this.lat=lat;
  }
}


const map = L.map("map", { zoomControl: false }).setView([27.1767, 78.0081], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const UsersLocation = [];
const markers = [];
const check_new=0;

// create the line once, empty; we fill it after OSRM replies
const line = L.polyline([], { color: "green", weight: 4 }).addTo(map);


 

function getuserLocation(){
  return new Promise((resolve,reject)=>{
  if(!navigator.geolocation) reject({message:"unable to fetch location"});


  navigator.geolocation.getCurrentPosition((position)=>{
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;
   resolve({latitude:latitude,longitude:longitude,accuracy:accuracy}); }, (err)=>{
  reject({message:"error occured"});
  });})
}



const protocol = location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${protocol}://${location.host}/ws`);
 
  ws.onopen=async()=>{
  //  const data= await getuserLocation();
  //  ws.send(JSON.stringify(data));
 console.log("conection opened");
  }

   ws.onmessage=(event)=>{
   //UsersLocation.push(new LocationCoords(event.data.longitude,event.data.latitude));
    console.log(event.data);
  }
    



async function drawRoute() {
  // ONE request with ALL points, in lng,lat order
  const coords = UsersLocation.map((l) => `${l.lng},${l.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok") return console.error(data);
    
    // flip [lng, lat] -> [lat, lng]
    const path = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    line.setLatLngs(path);
  } catch (err) {
    console.error("routing failed", err);
  }
}





function initMarkers() {
  UsersLocation.forEach((loc) => {
    const m = L.marker([loc.lat, loc.lng], { draggable: true })
      .addTo(map)
      .bindPopup(loc.places);

    m.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      loc.lat = lat;
      loc.lng = lng;
      drawRoute();            // re-route after the move
    });

    markers.push(m);
  });

  drawRoute();                // first route
}

if(check_new < UsersLocation.length){
  initMarkers();
  check_new+=1;
}

