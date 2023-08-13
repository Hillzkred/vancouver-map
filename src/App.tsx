import "maplibre-gl/dist/maplibre-gl.css";
import Map, { useControl, NavigationControl } from "react-map-gl/maplibre";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import maplibregl from "maplibre-gl";
import { useEffect, useState } from "react";
import type { Feature, FeatureCollection } from "geojson";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { loadInBatches } from "@loaders.gl/core";
import { _GeoJSONLoader } from "@loaders.gl/json";
import "@total-typescript/ts-reset/json-parse";
import "@total-typescript/ts-reset/fetch";

type BuildingPermitFeature = {
  [key: string]: string | Feature;
  geom: Feature;
};

type BuildingHeight = {
  [key: string]: string | number;
  hgt_agl: number;
};

type ObjProp = {
  object: {
    properties: BuildingHeight;
  };
};

type BuildingPermits<T> = {
  [key: string]: T | BuildingPermitFeature[];
  results: BuildingPermitFeature[];
};

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
  // const [buildingFootprints, setBuildingFootprints] =
  //   useState<FeatureCollection>({
  //     type: 'FeatureCollection',
  //     features: [],
  //   });

  const [featureArrayForDecoy, setFeatureArrayForDecoy] = useState<Feature[]>([]);

  const decoyBuildingHeights = {
    type: "FeatureCollection",
    features: featureArrayForDecoy,
  };

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

  const layers = [
    new GeoJsonLayer({
      id: "building-height",
      data: completeBuildingHeight !== undefined ? completeBuildingHeight : decoyBuildingHeights,
      getFillColor: (e) => {
        const height = e.properties as BuildingHeight;
        if (height.hgt_agl < 6) {
          return [3, 100, 150];
        } else if (height.hgt_agl > 50) {
          return [50, 230, 255];
        }
        return [5, 160, 200];
      },
      opacity: 0.8,
      getLineWidth: 50,
      pickable: true,
      extruded: true,
      getElevation: (e) => {
        const height = e.properties as BuildingHeight;
        return height.hgt_agl;
      },
      onClick: (e) => {
        const heightInfo = e as ObjProp;
        setIsWindowOpen(true);
        const height = heightInfo.object.properties.hgt_agl;
        setDisplayedHeight(height);
        return;
      },
      autoHighlight: true,
      highlightColor: [0, 50, 90],
    }),
    // new GeoJsonLayer({
    //   id: 'building-footprints',
    //   data: buildingFootprints,
    //   getFillColor: [252, 232, 3],
    //   getLineWidth: 0,
    //   opacity: 0.5,
    //   pickable: true,
    // }),
    new GeoJsonLayer({
      id: "permits",
      data: buildingPermits,
      getFillColor: [130, 200, 100],
      getPointRadius: 6,
      pickable: true,
    }),
  ];

  const MAP_STYLE = "https://api.maptiler.com/maps/basic-v2/style.json?key=ZDFWcNAeAKwpseiIpuuj";
  const INITIAL_VIEW_STATE = {
    longitude: -123.1207,
    latitude: 49.2827,
    zoom: 13,
    pitch: 0,
    bearing: 0,
  };

  return (
    <div className="h-screen">
      {popUpCoordinates !== undefined && (
        <div className="absolute z-20 top-0 left-0 bg-yellow-300">
          <div className="text-2xl text-blue-500 p-3">
            <p>longitude: {popUpCoordinates[0]}</p>
            <p>latitude: {popUpCoordinates[1]}</p>
          </div>
        </div>
      )}
      {isWindowOpen && (
        <div className="absolute z-20 top-24 bg-yellow-200">
          <div className="text-2xl text-blue-600 p-3">
            <p>Height: {displayedHeight} metres</p>
          </div>
        </div>
      )}
      <Map mapLib={maplibregl} initialViewState={INITIAL_VIEW_STATE} mapStyle={MAP_STYLE}>
        <NavigationControl />
        <DeckGLOverlay
          interleaved={true}
          onClick={(e) => {
            const { coordinate } = e;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const checker = e.object;
            if (checker) {
              setPopupCoordinates(coordinate);
            } else {
              setPopupCoordinates(undefined);
            }
          }}
          getCursor={(cursor) => {
            if (cursor.isHovering) {
              return "pointer";
            } else {
              return "auto";
            }
          }}
          layers={layers}
        />
      </Map>
    </div>
  );
}

export default App;
