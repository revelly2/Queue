import React from "react";
import { StudentBookingIllustration } from "./StudentBookingIllustration";

export function StudentKioskIllustration({
  size = 180,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return <StudentBookingIllustration size={size} className={className} />;
}
