import 'maplibre-gl/dist/maplibre-gl.css';
import Map, {
  Popup,
  useControl,
  NavigationControl,
} from 'react-map-gl/maplibre';
import { MapboxOverlay, MapboxOverlayProps } from '@deck.gl/mapbox/typed';
import maplibregl, { LngLat } from 'maplibre-gl';
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

function DeckGLOverlay(props: MapboxOverlayProps & { interleaved?: boolean }) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function App() {
  const [buildingPermits, setBuildingPermits] = useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });
  const [popUpCoordinates, setPopupCoordinates] = useState<number[] | null>(
    null
  );
  const [permitInfo, setPermitInfo] = useState(null);

  useEffect(() => {
    document.oncontextmenu = () => false;
    const buildingPermits =
      'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records?limit=100';
    async function getPermitData() {
      const res = await fetch(buildingPermits);
      const data = (await res.json()) as BuildingPermits<
        string | BuildingPermitFeature[]
      >;

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
      id: 'permits',
      data: buildingPermits,
      getFillColor: [130, 200, 100],
      getPointRadius: 60,
      pickable: true,
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

  console.log(popUpCoordinates);

  return (
    <div className='h-screen'>
      <Map
        mapLib={maplibregl}
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={MAP_STYLE}
      >
        {popUpCoordinates && (
          <div className='absolute z-20'>
            <Popup
              offset={10}
              longitude={popUpCoordinates[0]}
              latitude={popUpCoordinates[1]}
            >
              <div className='h-52 w-40'>
                <h1 className='text-3xl'>Popup info</h1>
              </div>
            </Popup>
          </div>
        )}
        <NavigationControl />
        <DeckGLOverlay
          interleaved={true}
          onClick={(e) => {
            const { object, coordinate } = e;
            if (object) {
              setPopupCoordinates(coordinate);
            } else {
              setPopupCoordinates(null);
            }
          }}
          getCursor={(cursor) => {
            if (cursor.isHovering) {
              return 'pointer';
            } else {
              return 'auto';
            }
          }}
          layers={layers}
        />
      </Map>
    </div>

    // <div>
    //   <DeckGL
    //     // style={{ overflowY: 'hidden' }}
    //     onClick={(e) => {
    //       const { object, coordinate } = e;
    //       if (object) {
    //         console.log(coordinate);
    //         setPopupCoordinates(coordinate);
    //         //coordinates are not valid lat long.
    //         // setPermitInfo(object);
    //       } else {
    //         setPopupCoordinates(undefined);
    //       }
    //     }}
    //     getCursor={(cursor) => {
    //       if (cursor.isHovering) {
    //         return 'pointer';
    //       } else {
    //         return 'auto';
    //       }
    //     }}
    //     layers={layers}
    //     controller={true}
    //     initialViewState={INITIAL_VIEW_STATE}
    //   >
    //     {popUpCoordinates && (
    //       <Popup longitude={popUpCoordinates[0]} latitude={popUpCoordinates[1]}>
    //         <h1>Hello</h1>
    //       </Popup>
    //     )}
    //     <Map mapLib={maplibregl} mapStyle={MAP_STYLE} />
    //   </DeckGL>
    // </div>
  );
}

export default App;
