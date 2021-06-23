import React, { useEffect, useCallback, useState } from 'react';

import { mapInitAsync, mapGetWidthAsMeters, mapGetHeightAsMeters, mapCreateMarker, mapRecreateMarkers, mapRemoveAllMarkers, TGMapElement, TGMapMarkers, TGMapLatLngBounds } from 'gmap/GMap';

import './App.scss';

interface IStateMap {
  map: TGMapElement;
  mapBounds: TGMapLatLngBounds;
}

interface IStateMapPosition {
  latitude: number;
  longitude: number;
}

interface IStateMapDistances {
  mapWidth: number;
  mapHeight: number;
}

function App(): React.ReactElement {
  // App State: begin
  const [stateMap, setStateMap] = useState<IStateMap | null>(null);
  const [stateMapPosition, setStateMapPosition] = useState<IStateMapPosition>({ latitude: 0, longitude: 0 });
  const [stateMapDistancesAsMeters, setStateMapDistancesAsMeters] = useState<IStateMapDistances>({ mapWidth: 0, mapHeight: 0 });
  const [stateMapWidthShow, setStateMapWidthShow] = useState<boolean>(false);
  const [stateMapHeightShow, setStateMapHeightShow] = useState<boolean>(false);
  // App State: end

  // GMap Init and Events: begin
  const mapApiKey = ''; // restricted
  const mapElementId = 'Map';
  const mapCreateInitMarker = true;

  const mapInitAndEvents = useCallback(async () => {
    const { map, mapInitMarker, mapBounds } = await mapInitAsync({ mapApiKey, mapElementId, mapCreateInitMarker });
    setStateMap({ map, mapBounds });

    map.addListener('idle', () => {
      const mapWidth = mapGetWidthAsMeters(map);
      const mapHeight = mapGetHeightAsMeters(map);
      setStateMapDistancesAsMeters({
        mapWidth,
        mapHeight,
      });
    });

    map.addListener('center_changed', () => {
      const centerLat = map.getCenter().lat();
      const centerLong = map.getCenter().lng();
      const mapWidth = mapGetWidthAsMeters(map);
      const mapHeight = mapGetHeightAsMeters(map);

      mapInitMarker?.setPosition({
        lat: centerLat,
        lng: centerLong,
      });

      setStateMapDistancesAsMeters({
        mapWidth,
        mapHeight,
      });
      setStateMapPosition({
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
    mapInitAndEvents();
  }, [mapInitAndEvents]);
  // GMap Init and Events: begin

  // GMap Recreate Markers: begin
  const mapReMarker = () => {
    if (stateMap) {
      const newPositions = [
        {
          markerLat: 39.925018,
          markerLong: 32.836956,
        },
        {
          markerLat: 41.08416633,
          markerLong: 29.053666452,
        },
        {
          markerLat: 38.41273,
          markerLong: 27.13838,
        },
      ];

      const newMarkers: TGMapMarkers = [];
      newPositions.map(pos => {
        const newMarker = mapCreateMarker({
          position: {
            lat: pos.markerLat,
            lng: pos.markerLong,
          },
        });
        stateMap.mapBounds.extend({
          lat: pos.markerLat,
          lng: pos.markerLong,
        });
        newMarkers.push(newMarker);
      });

      mapRecreateMarkers({
        map: stateMap.map,
        newMarkers: newMarkers,
        clearExistingMarkers: true,
        autoFitBounds: true,
        mapBounds: stateMap.mapBounds,
      });
    }
  };
  // GMap Recreate Markers: end

  // GMap Remove All Markers: begin
  const mapRemoveAll = () => {
    mapRemoveAllMarkers();
  };
  // GMap Remove All Markers: end

  return (
    <div className="app">
      <div id={mapElementId} className="app__map" style={{ width: '100%', height: '100vh' }}></div>
      <div className="app__center__pointer"></div>
      <div className="app__buttons">
        <button type="button" className="app__button" onClick={mapRemoveAll}>Remove Markers</button>
        <button type="button" className="app__button" onClick={mapReMarker}>ReMarker</button>
      </div>
      <div className="app__info">
        <p className="app__info__text">
          <span className="app__info__key">Map Center Latitude:</span>
          <span className="app__info__value">{stateMapPosition.latitude}</span>
        </p>
        <p className="app__info__text">
          <span className="app__info__key">Map Center Longitude:</span>
          <span className="app__info__value">{stateMapPosition.longitude}</span>
        </p>
        <p
          className="app__info__text"
          onMouseEnter={() => setStateMapWidthShow(true)}
          onMouseLeave={() => setStateMapWidthShow(false)}
          onTouchStart={() => setStateMapWidthShow(true)}
          onTouchEnd={() => setStateMapWidthShow(false)}
        >
          <span className="app__info__key">Map Width (Meters):</span>
          <span className="app__info__value">{stateMapDistancesAsMeters.mapWidth}</span>
          <span className="app__info__highlight">{'?'}</span>
        </p>
        <p
          className="app__info__text"
          onMouseEnter={() => setStateMapHeightShow(true)}
          onMouseLeave={() => setStateMapHeightShow(false)}
          onTouchStart={() => setStateMapHeightShow(true)}
          onTouchEnd={() => setStateMapHeightShow(false)}
        >
          <span className="app__info__key">Map Height (Meters):</span>
          <span className="app__info__value">{stateMapDistancesAsMeters.mapHeight}</span>
          <span className="app__info__highlight">{'?'}</span>
        </p>
      </div>
      <div className={`app__distance distance--width ${stateMapWidthShow ? 'state--active' : ''}`}></div>
      <div className={`app__distance distance--height ${stateMapHeightShow ? 'state--active' : ''}`}></div>
    </div>
  );
}

export default App;
