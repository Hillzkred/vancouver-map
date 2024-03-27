"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { NavigationControl, Source, Layer, Popup } from "react-map-gl/maplibre";
import { useState } from "react";
import { GeoJsonProperties, type FeatureCollection, type Point } from "geojson";
import { PermitInfo } from "@/types/types";

function App({ data }: { data: FeatureCollection[] }) {
  const [cursor, setCursor] = useState("");
  const [properties, setProperties] = useState<{
    coordinates: { lng: number; lat: number };
    permitInfo: Partial<PermitInfo>;
  }>();
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="h-[100svh] w-[100svw]">
      <Map
        interactiveLayerIds={["point"]}
        onClick={(e) => {
          const { features, lngLat } = e;
          const coordinates = e.lngLat;
          if (features?.length && features[0] && Object.values(features[0].properties).length > 0) {
            setShowPopup(true);
            setProperties({
              permitInfo: features[0].properties,
              coordinates: lngLat,
            });
          }
        }}
        onMouseLeave={() => {
          setCursor("auto");
        }}
        onMouseEnter={() => {
          setCursor("pointer");
        }}
        cursor={cursor}
        initialViewState={{ latitude: 49.2827, longitude: -123.1207, zoom: 15, pitch: 60, bearing: -20 }}
        mapStyle={"/map.json"}>
        <NavigationControl />

        {showPopup && properties ? (
          <Popup
            closeOnClick={false}
            onClose={() => setShowPopup(false)}
            anchor="bottom"
            offset={10}
            latitude={properties.coordinates.lat}
            longitude={properties.coordinates.lng}>
            <div className="bg-gray-950/85 text-slate-50 p-7">
              <h1 className="font-bold text-lg">{properties.permitInfo?.applicant}</h1>
              <p className="text-sky-500 text-lg">{properties.permitInfo?.permitnumber}</p>
              <div className="py-2" />
              <p>{properties.permitInfo?.permitnumbercreateddate}</p>
              <p className="text-slate-400">{properties.permitInfo?.address}</p>
              <div className="py-2" />
              <p className="text-slate-300 h-40 overflow-y-auto">
                {properties.permitInfo?.projectdescription}
              </p>
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
                  "circle-color": "#ed0024",
                  "circle-radius": 7,
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
