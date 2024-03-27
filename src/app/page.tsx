import "./globals.css";
import App from "./App";
import { PermitInfo } from "@/types/types";

export function generateStaticParams() {
  return [{ slug: [""] }];
}

async function getData() {
  // const buildingPermitsData = await fetch(
  //   "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records?limit=100"
  // );
  const buildingPermitsData = await fetch(
    "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/exports/json"
  );

  /*
  const buildingHeightData = await fetch(
    "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/building-footprints-2009/exports/geojson"
  );
  */

  const res: PermitInfo[] = await buildingPermitsData.json();

  return res;
}

export default async function Page() {
  const data = await getData();

  return <App data={data} />;
}
