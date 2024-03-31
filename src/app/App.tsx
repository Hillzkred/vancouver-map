"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, {
  NavigationControl,
  Source,
  Layer,
  Popup,
  MapLayerMouseEvent,
  LngLat,
  LngLatLike,
} from "react-map-gl/maplibre";
import { MouseEvent, createContext, useEffect, useState } from "react";
import { type FeatureCollection, type Point, Geometry, Feature } from "geojson";
import { PermitInfo } from "@/types/types";
import SearchBar from "./components/SearchBar";
import { PermitLists } from "@/types/types";

function App({ data }: { data: FeatureCollection<Point, PermitInfo>[] }) {
  const [cursor, setCursor] = useState("");
  const [permitLists, setPermitLists] = useState<PermitLists>();
  const [popupPermitInfo, setPopupPermitInfo] = useState<{
    coordinates: { lat: number; lng: number };
    permitInfo: Partial<PermitInfo>;
  }>();
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const permits: Pick<PermitInfo, "applicant" | "permitnumber" | "address">[] = [];

    data.map((item) => {
      item.features.map((feature) => {
        const { properties } = feature;

        permits.push({
          applicant: properties.applicant,
          permitnumber: properties.permitnumber,
          address: properties.address,
        });
      });
    });

    setPermitLists(permits);
  }, []);

  const handleMapClick = (e: MapLayerMouseEvent) => {
    const { features, lngLat } = e;
    if (features?.length && features[0] && Object.values(features[0].properties).length > 0) {
      setShowPopup(true);
      setPopupPermitInfo({
        permitInfo: features[0].properties,
        coordinates: lngLat,
      });
    }
  };

  const activateSearch = (permitNumber: string) => {
    const permitFound = data.map((layer) => {
      const permitFound = layer.features.find((feature) => {
        return feature.properties.permitnumber === permitNumber;
      });

      return permitFound;
    });

    if (permitFound && permitFound[0] && permitFound[0].properties && permitFound[0].geometry) {
      setShowPopup(true);
      setPopupPermitInfo({
        permitInfo: permitFound[0]?.properties,
        coordinates: {
          lat: permitFound[0].geometry.coordinates[1],
          lng: permitFound[0].geometry.coordinates[0],
        },
      });
    }
    setShowPopup(true);
  };

  return (
    <div className="h-[100svh] w-[100svw]">
      <Map
        interactiveLayerIds={["point"]}
        onClick={handleMapClick}
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
        <SearchBar activateSearch={activateSearch} data={data} permits={permitLists} />
        {showPopup && popupPermitInfo ? (
          <Popup
            closeOnClick={false}
            onClose={() => setShowPopup(false)}
            anchor="bottom"
            offset={10}
            latitude={popupPermitInfo.coordinates.lat}
            longitude={popupPermitInfo.coordinates.lng}>
            <div className="bg-gray-950/85 text-slate-50 p-7">
              <h1 className="font-bold text-lg">{popupPermitInfo.permitInfo?.applicant}</h1>
              <p className="text-sky-500 text-lg">{popupPermitInfo.permitInfo?.permitnumber}</p>
              <div className="py-2" />
              <p>{popupPermitInfo.permitInfo?.permitnumbercreateddate}</p>
              <p className="text-slate-400">{popupPermitInfo.permitInfo?.address}</p>
              <div className="py-2" />
              <p className="text-slate-300 h-40 overflow-y-auto">
                {popupPermitInfo.permitInfo?.projectdescription}
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
                  "circle-stroke-width": 3,
                  "circle-stroke-color": "cornsilk",
                  "circle-stroke-opacity": 0.5,
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
