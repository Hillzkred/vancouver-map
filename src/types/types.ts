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

export type PermitInfo = {
  address: string;
  applicant: string;
  applicantaddress: string;
  buildingcontractor: string | null;
  buildingcontractoraddress: string | null;
  geo_point_2d: { lon: number; lat: number };
  geolocalarea: string;
  geom: Feature;
  issuedate: string;
  issueyear: string;
  permitcategory: string | null;
  permitelapseddays: number;
  permitnumber: string;
  permitnumbercreateddate: string;
  projectdescription: string;
  projectvalue: number;
  propertyuse: string[];
  specificusecategory: string[];
  typeofwork: string;
  yearmonth: string;
};

export type Permits = {
  results: PermitInfo[];
};
