import { getDistanceKm } from "./getDistance";

// Helper to filter shelters with at least one program with occupancy
export const filterSheltersWithOccupancy = ({
  locations,
  showFullCapacity = false,
  filters = {},
  userLocation = null,
}) => {
  const now = new Date();
  const RECENT_HOURS = 24; // updated within last 24 hours
  const FRESH_HOURS = 72; // updated within last 3 days
  const MAX_HIDE_HOURS = 24 * 30; // hide data older than 30 days

  return locations
    .map((location) => {
      if (!location.latitude || !location.longitude) return null;

      const filteredPrograms = location.programs
        .map((p) => {
          if (!p.occupancy_date) return null;

          const occupancyTime = new Date(p.occupancy_date);
          if (isNaN(occupancyTime)) return null;

          // Calculate hours difference
          const hoursOld = (now - occupancyTime) / (1000 * 60 * 60);

          // Determine freshness
          if (hoursOld <= RECENT_HOURS) {
            p.freshness = "today"; // 🔥 Updated in last 24h
          } else if (hoursOld <= FRESH_HOURS) {
            p.freshness = "recent"; // ✅ Fresh
          } else if (hoursOld <= MAX_HIDE_HOURS) {
            p.freshness = "old"; // ⚠️ Old
          } else {
            return null; // Ignore very old data
          }

          // Only include programs with actual occupancy
          const hasOccupancy =
            (p.occupied_beds && p.occupied_beds > 0) ||
            (p.occupied_rooms && p.occupied_rooms > 0);
          if (!hasOccupancy) return null;

          // Exclude full capacity if toggle off
          const fullCapacity =
            (p.capacity_actual_bed &&
              p.occupied_beds >= p.capacity_actual_bed) ||
            (p.capacity_actual_room &&
              p.occupied_rooms >= p.capacity_actual_room);
          if (!showFullCapacity && fullCapacity) return null;

          // Sector filter
          if (filters.sector && p.sector !== filters.sector) return null;

          return p;
        })
        .filter(Boolean); // remove nulls

      if (!filteredPrograms.length) return null;

      // City filter
      if (filters.city && location.city !== filters.city) return null;

      // Calculate distance if user location is provided
      let distance = null;
      if (userLocation) {
        distance = getDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          location.latitude,
          location.longitude,
        );
      }

      const todayCount = filteredPrograms.filter(
        (p) => p.freshness === "today",
      ).length;
      console.log(
        `${location.location_name}: ${todayCount} programs updated today`,
      );

      return { ...location, programs: filteredPrograms, distance };
    })
    .filter(Boolean)
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
};
