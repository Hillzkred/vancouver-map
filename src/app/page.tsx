import "./globals.css";
import App from "./App";
import { PermitInfo } from "@/types/types";
import { Feature, FeatureCollection } from "geojson";

export function generateStaticParams() {
  return [{ slug: [""] }];
}

async function getData() {
  const buildingPermitsData = await fetch(
    "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records?limit=100"
  );

  const res: PermitInfo[] = await buildingPermitsData.json();
  const result: Feature[] = res.map((item) => {
    return {
      id: item.permitnumber,
      properties: item,
      geometry: item.geom?.geometry ?? { coordinates: [0, 0], type: "Point" },
      type: "Feature",
    };
  });
  const featureCollection: FeatureCollection[] = [{ type: "FeatureCollection", features: result }];

  return featureCollection;
}

export default async function Page() {
  const data = await getData();

  return <App data={data} />;
}
