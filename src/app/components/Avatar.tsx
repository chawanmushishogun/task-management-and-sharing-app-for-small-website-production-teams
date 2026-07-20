import { useState } from "react";
import type { Member } from "../types";

export function Avatar({ member, size = "sm", showName = false }: { member: Member; size?: "sm" | "md" | "lg"; showName?: boolean }) {
  const sz = size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-10 h-10";
  const textSz = size === "sm" ? "text-[13px]" : size === "md" ? "text-[15px]" : "text-base";
  const [imgError, setImgError] = useState(false);

  const circle = imgError ? (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 ${textSz}`}
      style={{ backgroundColor: member.color }}
      title={member.name}
    >
      {member.initials}
    </div>
  ) : (
    <img
      src={member.avatarUrl}
      alt={member.name}
      title={member.name}
      onError={() => setImgError(true)}
      className={`${sz} rounded-full object-cover flex-shrink-0`}
    />
  );

  if (!showName) return circle;
  return (
    <div className="flex items-center gap-1.5">
      {circle}
      <span className={`${textSz} text-foreground`}>{member.name}</span>
    </div>
  );
}

