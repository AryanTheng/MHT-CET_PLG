import api from "./client";

export const getDropdownOptions = () =>
  api.get("/colleges/options").then((r) => r.data);

export const searchColleges = ({ percentile, seatTypes, preferredCities, preferredBranches }) => {
  const params = new URLSearchParams();
  params.set("percentile", percentile);
  params.set("seat_types", seatTypes.join(","));
  if (preferredCities?.length)   params.set("preferred_cities",   preferredCities.join(","));
  if (preferredBranches?.length) params.set("preferred_branches", preferredBranches.join(","));
  return api.get(`/colleges/search?${params.toString()}`).then((r) => r.data);
};
