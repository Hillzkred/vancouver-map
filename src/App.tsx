import "maplibre-gl/dist/maplibre-gl.css";
import Map, { useControl, NavigationControl, Source, Layer } from "react-map-gl/maplibre";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import maplibregl from "maplibre-gl";
import { useEffect, useState } from "react";
import type { Feature, FeatureCollection } from "geojson";
import { loadInBatches } from "@loaders.gl/core";
import { _GeoJSONLoader } from "@loaders.gl/json";
import "@total-typescript/ts-reset/json-parse";
import "@total-typescript/ts-reset/fetch";
import type { BuildingHeight, BuildingPermitFeature, BuildingPermits, ObjProp } from "./types/types";

function DeckGLOverlay(props: MapboxOverlayProps & { interleaved?: boolean }) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function App() {
  const [buildingPermits, setBuildingPermits] = useState<FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });

  const [completeBuildingHeight, setCompleteBuildingHeight] = useState<FeatureCollection>();

  const [popUpCoordinates, setPopupCoordinates] = useState<number[] | undefined>(undefined);

  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [displayedHeight, setDisplayedHeight] = useState(0);

  const buildingPermitsData =
    "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records?limit=100";

  // const buildingFootprintsAPI =
  //   'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/building-footprints-2015/exports/geojson';

  const buildingHeightData =
    "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/building-footprints-2009/exports/geojson";

  useEffect(() => {
    document.oncontextmenu = () => false;

    // fetch("https://opendata.vancouver.ca/api/explore/v2.1/catalog/exports")
    //   .then((res) => res.json())
    //   .then((data) => {
    //     const fetchedJson = data.links.find((obj) => obj.rel === "json");
    //     json = fetchedJson.href;
    //   })
    //   .catch((err) => console.log(err));

    // if (json) {
    //   console.log(json);
    //   fetch(json)
    //     .then((res) => res.json())
    //     .then((data) => console.log(data))
    //     .catch((err) => console.log(err));
    // }
    async function getBuildingHeight() {
      // const batches = await loadInBatches(buildingHeightData, _GeoJSONLoader);
      // for await (const batch of batches) {
      //   setFeatureArray((prev) => {
      //     return [...prev, ...batch.data] as Feature[];
      //   });
      // }
      const res = await fetch(buildingHeightData);
      const data = (await res.json()) as FeatureCollection;
      setCompleteBuildingHeight(data);
    }

    void getBuildingHeight();

    async function loadDecoyBuildingHeights() {
      const batches = await loadInBatches(buildingHeightData, _GeoJSONLoader);
      for await (const batch of batches) {
        setFeatureArrayForDecoy((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          return [...prev, ...batch.data] as Feature[];
        });
        if (completeBuildingHeight !== undefined) {
          break;
        }
      }
    }

    void loadDecoyBuildingHeights();

    // async function getBuildingFootprints() {
    // const features: Feature[] = [];
    // const res = await fetch(buildingFootprintsAPI);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // const data = (await res.json()) as FeatureCollection;
    // const filteredData: FeatureCollection = data.links.filter((item) => {
    //   return item.rel === 'geojson';
    // });
    // setBuildingFootprints(data);
    // }

    // void getBuildingFootprints();

    async function getPermitData() {
      const res = await fetch(buildingPermitsData);
      const data = (await res.json()) as BuildingPermits<string | BuildingPermitFeature[]>;

      const feature: Feature[] = [];
      data.results
        .filter((item) => {
          return item.geom !== null;
        })
        .map((item) => {
          const featureObject: typeof item.geom = {
            type: "Feature",
            geometry: item.geom.geometry,
            properties: {},
          };
          feature.push(featureObject);
        });

      if (feature !== null) {
        setBuildingPermits((prev) => {
          return {
            ...prev,
            features: feature.filter((geometry) => geometry !== null),
          };
        });
      }
    }
    void getPermitData();
  }, []);

  return (
    <div className="h-screen">
      {popUpCoordinates !== undefined && (
        <div className="absolute z-20 top-5 left-5 bg-yellow-300/90 rounded-lg">
          <div className="text-2xl text-blue-600 p-3">
            <p>longitude: {popUpCoordinates[0]}</p>
            <p>latitude: {popUpCoordinates[1]}</p>
          </div>
        </div>
      )}
      {isWindowOpen && (
        <div className="absolute z-20 top-32 left-5 bg-yellow-200/90 rounded-lg">
          <div className="text-2xl text-blue-600 p-3">
            <p>Height: {displayedHeight} metres</p>
          </div>
        </div>
      )}
      <Map
        mapLib={maplibregl}
        initialViewState={{ latitude: 49.2827, longitude: -123.1207, zoom: 14, pitch: 60, bearing: -20 }}
        mapStyle={"/map.json"}>
        <NavigationControl />
        {/* <Source>
          <Layer />
        </Source> */}
      </Map>
    </div>
  );
}

export default App;
