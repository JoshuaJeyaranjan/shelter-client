import { getDistanceKm } from "./getDistance";

export const filterSheltersWithOccupancy = ({
  locations,
  showFullCapacity = false,
  filters = {},
  userLocation = null,
}) => {
  const now = new Date();
  const RECENT_HOURS = 24;
  const FRESH_HOURS = 72;
  const MAX_HIDE_HOURS = 24 * 30;

  return locations
    .map((location) => {
      
      const lat = Number(location.latitude);
      const lng = Number(location.longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.warn(
          `Skipping shelter ${location.location_name} due to invalid coordinates:`,
          location.latitude,
          location.longitude,
        );
        return null;
      }

      location.latitude = lat;
      location.longitude = lng;

      
      const filteredPrograms = (location.programs || [])
        .map((p) => {
          if (!p.occupancy_date) return null;
          const occupancyTime = new Date(p.occupancy_date);
          if (isNaN(occupancyTime)) return null;

          const hoursOld = (now - occupancyTime) / (1000 * 60 * 60);

          if (hoursOld <= RECENT_HOURS) p.freshness = "today";
          else if (hoursOld <= FRESH_HOURS) p.freshness = "recent";
          else if (hoursOld <= MAX_HIDE_HOURS) p.freshness = "old";
          else return null;

          const hasOccupancy =
            (p.occupied_beds != null && p.occupied_beds > 0) ||
            (p.occupied_rooms != null && p.occupied_rooms > 0);
          if (!hasOccupancy) return null;

          const fullCapacity =
            (p.capacity_actual_bed != null &&
              p.occupied_beds >= p.capacity_actual_bed) ||
            (p.capacity_actual_room != null &&
              p.occupied_rooms >= p.capacity_actual_room);
          if (!showFullCapacity && fullCapacity) return null;

          if (filters.sector && p.sector !== filters.sector) return null;

          return p;
        })
        .filter(Boolean);

      if (!filteredPrograms.length) return null;

      if (filters.city && location.city !== filters.city) return null;

      const distance =
        userLocation != null
          ? getDistanceKm(
              userLocation.latitude,
              userLocation.longitude,
              location.latitude,
              location.longitude,
            )
          : null;

      return { ...location, programs: filteredPrograms, distance };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        (a.distance != null ? a.distance : Infinity) -
        (b.distance != null ? b.distance : Infinity),
    );
};
