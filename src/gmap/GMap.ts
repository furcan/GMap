import { GoogleMap, MapsJSAPIOptions } from '@googlemaps/map-loader';

// Map: Types and Interfaces: begin
type TGMapMarkerOptions = google.maps.MarkerOptions;
type TGMapMarker = google.maps.Marker;
type TGMapMarkers = Array<TGMapMarker>;
type TGMapLatLngBounds = google.maps.LatLngBounds;
type TGMapElement = google.maps.Map<Element>;
type TGMapLibraries = ('drawing' | 'geometry' | 'localContext' | 'places' | 'visualization')[];
type TGMapOptions = google.maps.MapOptions;
type TGMapApiOptions = MapsJSAPIOptions;

interface IGMapLoaderOptions {
  apiKey: string;
  divId: string;
  append?: boolean;
  mapOptions: TGMapOptions;
  apiOptions?: TGMapApiOptions;
}

interface IGMapInitAsync {
  mapApiKey: string;
  mapElementId: string;
  mapCreateInitMarker: boolean;
  mapOptions?: TGMapMarkerOptions;
  apiOptions?: TGMapApiOptions;
}

interface IGMapReturnData {
  map: TGMapElement,
  mapBounds: TGMapLatLngBounds;
  mapInitMarker?: TGMapMarker,
}

interface IGMapAutoZoomByBounds {
  map: TGMapElement;
  markerLat: number;
  markerLong: number;
  mapBounds?: TGMapLatLngBounds;
}

interface IGMapRecreateMarkers {
  map: TGMapElement;
  newMarkers: TGMapMarkers,
  clearExistingMarkers: boolean;
  autoFitBounds?: boolean;
  mapBounds?: TGMapLatLngBounds;
}
// Map: Types and Interfaces: end

// Map: Init Variables: begin
const mapInitLat = 39.925018;
const mapInitLong = 32.836956;
// Map: Init Variables: end

// Map: Markers Chunk: begin
const mapMarkersChunk: TGMapMarkers = [];
// Map: Markers Chunk: end

// Map: Distance Calculator: begin
const calcDistanceAsMeters = (p1Lat: number, p1Long: number, p2Lat: number, p2Long: number) => {
  const radiusOfTheEarth = 3958.8; // Radius of the Earth in miles
  const radiansLat1 = p1Lat * (Math.PI / 180); // Convert degrees to radians
  const radiansLat2 = p2Lat * (Math.PI / 180); // Convert degrees to radians
  const radianDiffLat = radiansLat2 - radiansLat1; // Radian difference (latitudes)
  const radianDiffLong = (p2Long - p1Long) * (Math.PI / 180); // Radian difference (longitudes)
  const distanceAsMile = 2 * radiusOfTheEarth * Math.asin(Math.sqrt(Math.sin(radianDiffLat / 2) * Math.sin(radianDiffLat / 2) + Math.cos(radiansLat1) * Math.cos(radiansLat2) * Math.sin(radianDiffLong / 2) * Math.sin(radianDiffLong / 2)));
  return Math.round(distanceAsMile * 1.609344 * 1000); // convert to km and convert to meters
};

const mapGetHeightAsMeters = (map: TGMapElement): number => {
  const bounds = map.getBounds();
  if (bounds) {
    const boundNorthEast = bounds.getNorthEast();
    const boundSouthWest = bounds.getSouthWest();
    const p1Lat = boundNorthEast.lat();
    const p1Long = boundSouthWest.lng();
    const p2Lat = boundSouthWest.lat();
    const p2Long = boundSouthWest.lng();
    const distanceAsMeters = calcDistanceAsMeters(p1Lat, p1Long, p2Lat, p2Long);
    return distanceAsMeters;
  }
  return 1000; // fallback, 1km - 1000m
};
// Map: Distance Calculator: end

// Map: Create New Marker: begin
const mapCreateMarker = (markerOptions: TGMapMarkerOptions): TGMapMarker => {
  const markerSize = 48;
  const defaultOptions: TGMapMarkerOptions = {
    title: 'Marker Title',
    label: {
      text: 'Marker Label',
      color: '#fff',
      fontSize: '13px',
      fontWeight: '400',
      fontFamily: '"Red Hat Display", sans-serif',
    },
    icon: {
      url: `${process.env.PUBLIC_URL}/content/marker.png`,
      size: new google.maps.Size(markerSize, markerSize),
      scaledSize: new google.maps.Size(markerSize, markerSize),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(markerSize / 2, markerSize),
      labelOrigin: new google.maps.Point(markerSize / 2, -(markerSize / 3)),
    },
    position: new google.maps.LatLng(mapInitLat, mapInitLong),
    map: undefined,
    animation: google.maps.Animation.DROP,
  };

  const marker = new google.maps.Marker({ ...defaultOptions, ...markerOptions });
  mapMarkersChunk.push(marker);

  return marker;
};
// Map: Create New Marker: end

// Map: Remove All Markers: begin
const mapRemoveAllMarkers = (): void => {
  mapMarkersChunk.map(marker => {
    marker.setMap(null);
  });
  mapMarkersChunk.splice(0, mapMarkersChunk.length);
};
// Map: Remove All Markers: end

// Map: Auto Zoom by Bounds: begin
const mapAutoZoomByBounds = ({ map, markerLat, markerLong, mapBounds }: IGMapAutoZoomByBounds): void => {
  if (!mapBounds) {
    mapBounds = new google.maps.LatLngBounds();
  }
  mapBounds.extend(new google.maps.LatLng(markerLat, markerLong));
  map.fitBounds(mapBounds);
};
// Map: Auto Zoom by Bounds: end

// Map: Recreate Markers: begin
const mapRecreateMarkers = ({ map, newMarkers, clearExistingMarkers, autoFitBounds, mapBounds }: IGMapRecreateMarkers): void => {
  if (clearExistingMarkers) {
    mapRemoveAllMarkers();
  }
  mapMarkersChunk.push(...newMarkers);
  newMarkers.map(x => x.setMap(map));
  if (autoFitBounds && mapBounds) {
    map.fitBounds(mapBounds);
  }
};
// Map: Recreate Markers: end


// Map: Init: begin
const mapInitAsync = async ({ mapApiKey, mapElementId, mapCreateInitMarker, mapOptions, apiOptions }: IGMapInitAsync): Promise<IGMapReturnData> => {
  const mapInitOptions: TGMapOptions = {
    center: {
      lat: mapInitLat,
      lng: mapInitLong,
    },
    zoom: 13,
    minZoom: 2,
    maxZoom: 18,
    backgroundColor: '#f8f8f8',
    draggable: true,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: false,
    mapTypeControl: false,
    rotateControl: false,
    scaleControl: false,
    panControl: true,
    keyboardShortcuts: false,
    mapTypeId: 'roadmap', // "roadmap" || "satellite" || "hybrid" || "terrain"
    clickableIcons: false,
    styles: [],
  };

  const mapApiInitLibraries: TGMapLibraries = ['places'];
  const mapApiInitOptions: TGMapApiOptions = {
    version: 'weekly',
    language: 'tr',
    region: 'TR',
    libraries: mapApiInitLibraries,
  };

  const mapLoaderOptions: IGMapLoaderOptions = {
    apiKey: mapApiKey,
    divId: mapElementId,
    append: false, // true => creates a new div element and append it to the "divId" element.
    mapOptions: { ...mapInitOptions, ...mapOptions },
    apiOptions: { ...mapApiInitOptions, ...apiOptions },
  };

  const map: TGMapElement = await new GoogleMap().initMap(mapLoaderOptions);

  const mapBounds = new google.maps.LatLngBounds();

  if (mapCreateInitMarker) {
    const mapInitMarker = mapCreateMarker({ map: map });

    mapAutoZoomByBounds({
      map,
      markerLat: mapInitLat,
      markerLong: mapInitLong,
      mapBounds,
    });

    return {
      map,
      mapBounds,
      mapInitMarker,
    };
  }

  return {
    map,
    mapBounds,
  };
};
// Map: Init: end

export type {
  TGMapMarker,
  TGMapMarkers,
  TGMapMarkerOptions,
  TGMapLatLngBounds,
  TGMapElement,
  TGMapLibraries,
  TGMapOptions,
  TGMapApiOptions,
  IGMapLoaderOptions,
  IGMapInitAsync,
  IGMapReturnData,
  IGMapAutoZoomByBounds,
  IGMapRecreateMarkers,
};

export {
  mapInitAsync,
  mapAutoZoomByBounds,
  mapGetHeightAsMeters,
  mapCreateMarker,
  mapRemoveAllMarkers,
  mapRecreateMarkers,
};
