"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { NavigationControl, Source, Layer, Popup } from "react-map-gl/maplibre";
import { useState } from "react";
import { GeoJsonProperties, type FeatureCollection, type Point } from "geojson";

function App({ data }: { data: FeatureCollection[] }) {
  const [cursor, setCursor] = useState("");
  const [properties, setProperties] = useState<{
    coordinates: { lng: number; lat: number };
    data: GeoJsonProperties;
  }>({ coordinates: { lng: 0, lat: 0 }, data: {} });
  const [isPopupToggled, setIsPopupToggled] = useState(false);

  return (
    <div className="h-[100svh] w-[100svw]">
      <Map
        interactiveLayerIds={["point"]}
        onClick={(e) => {
          const coordinates = e.lngLat;
          if (e.features !== undefined) {
            const { properties } = e.features[0];
            setProperties({
              data: properties,
              coordinates: coordinates,
            });
            setIsPopupToggled(!isPopupToggled);
          }
          console.log(e.features);
        }}
        onMouseLeave={() => {
          setCursor("auto");
        }}
        onMouseEnter={() => {
          setCursor("pointer");
        }}
        cursor={cursor}
        initialViewState={{ latitude: 49.2827, longitude: -123.1207, zoom: 14, pitch: 60, bearing: -20 }}
        mapStyle={"/map.json"}>
        <NavigationControl />

        {isPopupToggled ? (
          <Popup latitude={properties.coordinates.lat} longitude={properties.coordinates.lng}>
            <div>
              <p>{properties.data?.permitnumber}</p>
            </div>
          </Popup>
        ) : null}
        {data.map((layer, index) => {
          return (
            <Source key={index} id="datasource" data={layer} type="geojson">
              <Layer
                key={index}
                source="datasource"
                id="point"
                type="circle"
                paint={{
                  "circle-color": "red",
                  "circle-radius": 5,
                }}
              />
            </Source>
          );
        })}
      </Map>
    </div>
  );
}

export default App;
