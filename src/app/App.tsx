"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { NavigationControl, Source, Layer, Popup } from "react-map-gl/maplibre";
import { useEffect, useState } from "react";
import { GeoJsonProperties, type Feature, type FeatureCollection, type Point, Geometry } from "geojson";
import { PermitInfo, Permits } from "../types/types";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

type OptionalAccess = {
  somePermitInfo?: PermitInfo;
};

type Properties<T extends OptionalAccess> = {
  fields: T;
  coordinates: { lat: number; lng: number };
};

function App({ data }: { data: PermitInfo[] }) {
  const [featureCollection, setFeatureCollection] = useState<FeatureCollection[]>([]);
  const [cursor, setCursor] = useState("");
  const [properties, setProperties] = useState<Properties<{ [name: string]: any }>>({
    fields: {},
    coordinates: { lat: 0, lng: 0 },
  });
  const [isPopupToggled, setIsPopupToggled] = useState(false);

  useEffect(() => {
    setFeatureCollection((prev) => {
      const result: Feature[] = data.map((item) => {
        return {
          id: item.permitnumber,
          properties: item,
          geometry: item.geom?.geometry ?? { coordinates: [0, 0], type: "Point" },
          type: "Feature",
        };
      });

      return [...prev, { type: "FeatureCollection", features: result }];
    });
  }, []);

  return (
    <div className="h-[100svh] w-[100svw]">
      <Map
        interactiveLayerIds={["point", "building-3d"]}
        onClick={(e) => {
          const coordinates = e.lngLat;
          if (e.features !== undefined) {
            const { properties } = e.features[0];
            setProperties((prev) => {
              return {
                fields: properties,
                coordinates: coordinates,
              };
            });
            setIsPopupToggled(true);
          }
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
        {featureCollection.map((layer, index) => {
          return (
            <Source key={index} id="datasource" data={layer} type="geojson">
              {isPopupToggled ? (
                <Popup latitude={properties.coordinates.lat} longitude={properties.coordinates.lng}>
                  <div>
                    <p>{properties.fields.permitnumber}</p>
                  </div>
                </Popup>
              ) : null}
              <Layer
                key={index}
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
