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

interface IMapLoaderOptions {
  apiKey: string;
  divId: string;
  append?: boolean;
  mapOptions: TGMapOptions;
  apiOptions?: TGMapApiOptions;
}

interface IMapInitAsync {
  mapApiKey: string;
  mapElementId: string;
  mapCreateInitMarker: boolean;
  mapOptions?: TGMapMarkerOptions;
  apiOptions?: TGMapApiOptions;
}

interface IMapReturnData {
  map: TGMapElement,
  mapZoomBounds: TGMapLatLngBounds;
  mapInitMarker?: TGMapMarker,
}
// Map: Types and Interfaces: end

// Map: Init Variables: begin
const mapInitLat = 39.925018;
const mapInitLong = 32.836956;
// Map: Init Variables: end

// Map: Markers: begin
const markers: TGMapMarkers = [];
// Map: Markers: end

// Map: Distance Calculator: begin
const calcDistanceAsKM = (p1Lat: number, p1Long: number, p2Lat: number, p2Long: number) => {
  const radiusOfTheEarth = 3958.8; // Radius of the Earth in miles
  const radiansLat1 = p1Lat * (Math.PI / 180); // Convert degrees to radians
  const radiansLat2 = p2Lat * (Math.PI / 180); // Convert degrees to radians
  const radianDiffLat = radiansLat2 - radiansLat1; // Radian difference (latitudes)
  const radianDiffLong = (p2Long - p1Long) * (Math.PI / 180); // Radian difference (longitudes)
  const distanceAsMile = 2 * radiusOfTheEarth * Math.asin(Math.sqrt(Math.sin(radianDiffLat / 2) * Math.sin(radianDiffLat / 2) + Math.cos(radiansLat1) * Math.cos(radiansLat2) * Math.sin(radianDiffLong / 2) * Math.sin(radianDiffLong / 2)));
  return Math.round(distanceAsMile * 1.609344 * 1000); // as km
};

const mapGetDistanceAsKM = (map: TGMapElement): number => {
  const bounds = map.getBounds();
  if (bounds) {
    const boundNorthEast = bounds.getNorthEast();
    const boundSouthWest = bounds.getSouthWest();
    const p1Lat = boundNorthEast.lat();
    const p1Long = boundSouthWest.lng();
    const p2Lat = boundSouthWest.lat();
    const p2Long = boundSouthWest.lng();
    const distanceAsKM = calcDistanceAsKM(p1Lat, p1Long, p2Lat, p2Long);
    return distanceAsKM;
  }
  return 1000; // fallback as km
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
  markers.push(marker);

  return marker;
};
// Map: Create New Marker: end

// Map: Clear All Markers: begin
const mapClearAllMarkers = (): void => {
  markers.forEach((marker) => {
    marker.setMap(null);
  });
};
// Map: Clear All Markers: end

// Map: Adjust Zoom: begin
const mapAdjustZoom = (map: TGMapElement, markerLat: number, markerLong: number, adjustZoomBounds?: TGMapLatLngBounds): void => {
  if (!adjustZoomBounds) {
    adjustZoomBounds = new google.maps.LatLngBounds();
  }
  adjustZoomBounds.extend(new google.maps.LatLng(markerLat, markerLong));
  map.fitBounds(adjustZoomBounds);
};
// Map: Adjust Zoom: end

// Map: Init: begin
const mapInitAsync = async ({ mapApiKey, mapElementId, mapCreateInitMarker, mapOptions, apiOptions }: IMapInitAsync): Promise<IMapReturnData> => {
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

  const mapLoaderOptions: IMapLoaderOptions = {
    apiKey: mapApiKey,
    divId: mapElementId,
    append: false, // true => creates a new div element and append it to the "divId" element.
    mapOptions: { ...mapInitOptions, ...mapOptions },
    apiOptions: { ...mapApiInitOptions, ...apiOptions },
  };

  const mapLoader = new GoogleMap();

  const map: TGMapElement = await mapLoader.initMap(mapLoaderOptions);

  const mapZoomBounds = new google.maps.LatLngBounds();

  if (mapCreateInitMarker) {
    const mapInitMarker = mapCreateMarker({ map: map });
    mapAdjustZoom(map, mapInitLat, mapInitLong, mapZoomBounds);

    return {
      map,
      mapZoomBounds,
      mapInitMarker,
    };
  }

  return {
    map,
    mapZoomBounds,
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
  IMapLoaderOptions,
  IMapInitAsync,
  IMapReturnData,
};

export {
  mapInitAsync,
  mapGetDistanceAsKM,
  mapCreateMarker,
  mapClearAllMarkers,
  mapAdjustZoom,
};
