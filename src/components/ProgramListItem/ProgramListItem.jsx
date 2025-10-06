import React from "react";
import './ProgramListItem.scss'
const ProgramListItem = ({ program }) => {
  const hasBeds = program.capacity_actual_bed > 0;
  const hasRooms = program.capacity_actual_room > 0;
  const programFull =
    (hasBeds && (program.occupied_beds || 0) >= program.capacity_actual_bed) ||
    (hasRooms && (program.occupied_rooms || 0) >= program.capacity_actual_room);

  return (
    <li className={`program-item ${programFull ? "full-capacity" : ""}`}>
      <p className="program-title">
        <strong>{program.program_name || "N/A"} {" "}</strong>| 
        <strong>Sector:</strong> {program.sector || "N/A"}
      </p>
      {hasBeds && (
        <p className="program-beds">
          <strong>Beds:</strong> {program.occupied_beds || 0} / {program.capacity_actual_bed}
        </p>
      )}
      {hasRooms && (
        <p className="program-rooms">
          <strong>Rooms:</strong> {program.occupied_rooms || 0} / {program.capacity_actual_room}
        </p>
      )}
    </li>
  );
};

export default ProgramListItem;