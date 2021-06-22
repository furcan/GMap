import React, { useEffect, useCallback, useState } from 'react';

import { mapInitAsync, mapGetDistanceAsMeters, mapClearAllMarkers } from 'gmap/GMap';

import './App.scss';

interface IAppStatePosition {
  latitude: number;
  longitude: number;
}

function App(): React.ReactElement {
  // App State: begin
  const [appStatePosition, setAppStatePosition] = useState<IAppStatePosition>({ latitude: 0, longitude: 0 });
  const [appStateDistanceAsMeters, setAppStateDistanceAsMeters] = useState<number>(0);
  const [appStateShowDistance, setAppStateShowDistance] = useState<boolean>(false);
  // App State: end

  // Map: begin
  const mapApiKey = 'AIzaSyA6TZYmSMAyAvrWL9Cdu0sKpGhn-1OZSvc'; // restricted
  const mapElementId = 'Map';
  const mapCreateInitMarker = true;

  const appMapInit = useCallback(async () => {
    const { map, mapInitMarker } = await mapInitAsync({ mapApiKey, mapElementId, mapCreateInitMarker });

    map.addListener('idle', () => {
      const meters = mapGetDistanceAsMeters(map);
      setAppStateDistanceAsMeters(meters);
    });

    map.addListener('center_changed', () => {
      const centerLat = map.getCenter().lat();
      const centerLong = map.getCenter().lng();
      const meters = mapGetDistanceAsMeters(map);

      mapInitMarker?.setPosition({
        lat: centerLat,
        lng: centerLong,
      });

      setAppStateDistanceAsMeters(meters);
      setAppStatePosition({
        latitude: centerLat,
        longitude: centerLong,
      });
    });

    mapInitMarker?.addListener('click', () => {
      const markerTitle = mapInitMarker.getTitle();
      console.log('mapInitMarker: ', mapInitMarker);
      console.log('markerTitle: ', markerTitle);
    });
  }, [mapCreateInitMarker]);

  useEffect(() => {
    appMapInit();
  }, [appMapInit]);
  // Map: end

  return (
    <div className="app">
      <div id={mapElementId} className="app__map" style={{ width: '100%', height: '100vh' }}></div>
      <div className="app__center__pointer"></div>
      <div className="app__buttons state--passive">
        <button type="button" className="app__button" onClick={mapClearAllMarkers}>Remove Markers</button>
      </div>
      <div className="app__info">
        <p className="app__info__text">
          <span className="app__info__key">Center Latitude:</span>
          <span className="app__info__value">{appStatePosition.latitude}</span>
        </p>
        <p className="app__info__text">
          <span className="app__info__key">Center Longitude:</span>
          <span className="app__info__value">{appStatePosition.longitude}</span>
        </p>
        <p
          className="app__info__text"
          onMouseEnter={() => setAppStateShowDistance(true)}
          onMouseLeave={() => setAppStateShowDistance(false)}
          onTouchStart={() => setAppStateShowDistance(true)}
          onTouchEnd={() => setAppStateShowDistance(false)}
        >
          <span className="app__info__key">Map Height Distance (Meters):</span>
          <span className="app__info__value">{appStateDistanceAsMeters}</span>
          <span className="app__info__highlight">{'?'}</span>
        </p>
      </div>
      <div className={`app__distance ${appStateShowDistance ? 'state--active' : ''}`}></div>
    </div>
  );
}

export default App;
