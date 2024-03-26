import { Feature } from "geojson";
export type BuildingPermitFeature = {
  [key: string]: string | Feature;
  geom: Feature;
};

export type BuildingHeight = {
  [key: string]: string | number;
  hgt_agl: number;
};

export type ObjProp = {
  object: {
    properties: BuildingHeight;
  };
};

export type BuildingPermits<T> = {
  [key: string]: T | BuildingPermitFeature[];
  results: BuildingPermitFeature[];
};
