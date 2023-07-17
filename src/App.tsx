import { DeckGL } from '@deck.gl/react/typed';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { useEffect, useState } from 'react';
import { Feature, FeatureCollection } from 'geojson';
import { GeoJsonLayer } from '@deck.gl/layers/typed';

type BuildingPermitFeature = {
  [key: string]: string | Feature;
  geom: Feature;
};

type BuildingPermits<T> = {
  [key: string]: T | BuildingPermitFeature[];
  results: BuildingPermitFeature[];
};

function App() {
  const [buildingPermits, setBuildingPermits] = useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });
  const [xCoordinate, setXCoordinate] = useState<number | null>(null);
  const [yCoordinate, setYCoordinate] = useState<number | null>(null);
  const [isInformationShown, setIsInformationShown] = useState(false);
  const [permitInfo, setPermitInfo] = useState({});
  useEffect(() => {
    document.oncontextmenu = () => false;
    const buildingPermits =
      'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records?limit=100';
    async function getPermitData() {
      const res = await fetch(buildingPermits);
      const data = (await res.json()) as BuildingPermits<
        string | BuildingPermitFeature[]
      >;

      // const filteredData = data.results.map(
      //   (item, index) => item[index] !== null
      // );

      const feature: Feature[] = [];
      data.results
        .filter((item) => {
          return item.geom !== null;
        })
        .map((item) => {
          const featureObject: typeof item.geom = {
            type: 'Feature',
            geometry: item.geom.geometry,
            properties: {},
          };
          feature.push(featureObject);
          console.log(item.geom);
        });

      console.log(feature);

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
      id: 'permits',
      data: buildingPermits,
      getFillColor: [130, 200, 100],
      getPointRadius: 60,
      pickable: true,
      onClick: (e) => {
        setIsInformationShown(true);
        setXCoordinate(e.x + 10);
        setYCoordinate(e.y + 10);
      },
    }),
  ];

  const MAP_STYLE =
    'https://api.maptiler.com/maps/basic-v2/style.json?key=ZDFWcNAeAKwpseiIpuuj';
  const INITIAL_VIEW_STATE = {
    longitude: -123.1207,
    latitude: 49.2827,
    zoom: 13,
    pitch: 0,
    bearing: 0,
  };
  return (
    <DeckGL
      getCursor={(cursor) => {
        if (cursor.isHovering) {
          return 'pointer';
        } else {
          return 'auto';
        }
      }}
      layers={layers}
      controller={true}
      initialViewState={INITIAL_VIEW_STATE}
    >
      <Map mapLib={maplibregl} mapStyle={MAP_STYLE} />
    </DeckGL>
  );
}

export default App;
