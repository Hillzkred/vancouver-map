"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, {
  NavigationControl,
  Source,
  Layer,
  Popup,
  useMap,
  LngLat,
  LngLatLike,
} from "react-map-gl/maplibre";
import { MouseEvent, createContext, useEffect, useState } from "react";
import { type FeatureCollection, type Point, Geometry, Feature } from "geojson";
import { PermitInfo } from "@/types/types";
import SearchBar from "./components/SearchBar";
import { PermitLists } from "@/types/types";

function App({ data }: { data: FeatureCollection<Geometry, PermitInfo>[] }) {
  const [cursor, setCursor] = useState("");
  const [permitLists, setPermitLists] = useState<PermitLists>();
  const [popupPermitInfo, setPopupPermitInfo] = useState<{
    coordinates: { lng: number; lat: number };
    permitInfo: Partial<PermitInfo>;
  }>();
  const [showPopup, setShowPopup] = useState(true);
  // const [permitToShow, setPermitToShow] = useState("");
  // const { current: map } = useMap();

  /*
  useEffect(() => {
    let searchedProperty: Feature<Point, PermitInfo> | undefined;

    data.map((d) => {
      const permitFound = d.features.find(
        (feature) => feature.properties.permitnumber === permitToShow
      ) as Feature<Point, PermitInfo>;

      if (permitFound) {
        searchedProperty = permitFound;
        return;
      }
    });

    console.log(map);
    if (searchedProperty && map) {
      const lng = searchedProperty.geometry.coordinates[0];
      const lat = searchedProperty.geometry.coordinates[1];
      const coordinates = [lng, lat];
      const lngLat = coordinates as LngLatLike;
      map.flyTo({
        center: lngLat,
        zoom: 9,
        speed: 0.2,
        curve: 1,
        easing(t) {
          return t;
        },
      });
    }
  }, [permitToShow]);
  */

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

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    console.log("triggered");
    setShowPopup(true);
  };

  return (
    <div className="h-[100svh] w-[100svw]">
      <Map
        interactiveLayerIds={["point"]}
        onLoad={() => {
          console.log("triggered");
        }}
        onClick={(e) => {
          const { features, lngLat } = e;
          const coordinates = e.lngLat;
          if (features?.length && features[0] && Object.values(features[0].properties).length > 0) {
            setShowPopup(true);
            setPopupPermitInfo({
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
        <SearchBar handleClick={handleClick} data={data} permits={permitLists} />
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
