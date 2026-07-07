import { getInitial } from "../../lib/utils";
import type { Person } from "../../lib/types";

export function Avatar({ person, size = 36 }: { person: Person; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white shrink-0 select-none"
      style={{
        width: size,
        height: size,
        background: person.color,
        fontSize: size * 0.4,
        letterSpacing: "-0.01em",
      }}
    >
      {getInitial(person.name)}
    </div>
  );
}
