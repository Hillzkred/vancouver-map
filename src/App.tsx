import { DeckGL } from '@deck.gl/react/typed';
import { Map } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
function App() {
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
    <DeckGL controller={true} initialViewState={INITIAL_VIEW_STATE}>
      <Map mapLib={maplibregl} mapStyle={MAP_STYLE} />
    </DeckGL>
  );
}

export default App;
