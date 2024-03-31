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

  return <App data={data} />;
}
