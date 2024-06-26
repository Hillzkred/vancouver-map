import { PermitInfo, PermitLists } from "@/types/types";
import { Feature, FeatureCollection, Geometry, Point } from "geojson";
import { MouseEvent, useEffect, useState } from "react";
import { LngLatLike, useMap } from "react-map-gl/maplibre";

export default function SearchBar({
  data,
  permits,
  handleClick,
}: {
  data: FeatureCollection<Geometry, PermitInfo>[];
  permits: PermitLists | undefined;
  handleClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [permitToShow, setPermitToShow] = useState("");
  const { current: map } = useMap();

  useEffect(() => {
    let searchedProperty: Feature<Point, PermitInfo> | undefined;

    data.map((d) => {
      const permitFound = d.features.find(
        (feature) => feature.properties.permitnumber === permitToShow
      ) as Feature<Point, PermitInfo>;

      if (permitFound) {
        searchedProperty = permitFound;
        return;
      }
    });

    if (searchedProperty && map) {
      const lng = searchedProperty.geometry.coordinates[0];
      const lat = searchedProperty.geometry.coordinates[1];
      map.flyTo({
        center: [lng, lat],
        zoom: 19,
      });
    }
  }, [permitToShow]);

  function filterPermitLists(input: string | undefined) {
    if (permits) {
      return permits.filter((permit) => {
        if (input)
          return (
            permit.address.toLowerCase().includes(input.toLowerCase()) ||
            permit.applicant.toLowerCase().includes(input.toLowerCase()) ||
            permit.permitnumber.toLowerCase().includes(input.toLowerCase())
          );
      });
    } else {
      return null;
    }
  }
  const handleClickSearch = (e: MouseEvent<HTMLButtonElement>) => {
    setPermitToShow(e.currentTarget.name);
    setSearchInput("");
  };

  const filteredPermits = filterPermitLists(searchInput);
  return (
    <div className="absolute z-10 top-10 left-10">
      <div className="relative">
        <input
          onChange={(e) => {
            setSearchInput(e.currentTarget.value);
          }}
          value={searchInput}
          className="px-5 py-1 rounded-2xl absolute z-10 w-[350px]"
          placeholder="Search for a permit"
        />
        {searchInput.length && filteredPermits ? (
          <div className="flex absolute flex-col w-[350px] rounded-2xl bg-[whitesmoke] h-96">
            <div className="py-4 bg-[whitesmoke] rounded-2xl" />
            <div className="overflow-y-auto">
              {filteredPermits.map((permit) => {
                return (
                  <button
                    name={permit.permitnumber}
                    onClick={handleClickSearch}
                    className="p-1 w-full"
                    key={permit.permitnumber}>
                    <p className="font-bold">{permit.address}</p>
                    <p>{permit.applicant}</p>
                    <p>{permit.permitnumber}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
