import "./globals.css";
import App from "./App";
import { PermitInfo } from "@/types/types";
import { Feature, FeatureCollection, Geometry, Point } from "geojson";

async function getData() {
  const buildingPermitsData = await fetch(
    "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records?limit=100"
  );

  const res: { results: PermitInfo[] } = await buildingPermitsData.json();

  return res;
}

export default async function Page() {
  const data = await getData();

  const result: Feature<Point, PermitInfo>[] = data.results.map((item) => {
    return {
      id: item.permitnumber,
      properties: item,
      geometry: item.geom.geometry ?? { coordinates: [0, 0], type: "Point" },
      type: "Feature",
    };
  });
  const featureCollection: FeatureCollection<Point, PermitInfo>[] = [
    { type: "FeatureCollection", features: result },
  ];

  return <App data={featureCollection} />;
}
