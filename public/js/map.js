
 
  mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        style: "mapbox://styles/mapbox/streets-v12",
        container: 'map', // container ID
        center: [77.209, 28.6139], // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });
