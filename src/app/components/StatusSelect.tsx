import { STATUS_CONFIG } from "../data";
import type { Status } from "../types";

/** ステータスのプルダウン。ステータスごとに配色が変わる */
export function StatusSelect({ status, onChange }: { status: Status; onChange: (status: Status) => void }) {
  const config = STATUS_CONFIG[status];
  return (
    <select
      value={status}
      onChange={e => { e.stopPropagation(); onChange(e.target.value as Status); }}
      onClick={e => e.stopPropagation()}
      className={`text-[13px] px-1.5 py-0.5 rounded-full border font-medium cursor-pointer outline-none appearance-none ${config.color} ${config.bg} ${config.border}`}
    >
      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
        <option key={k} value={k}>{v.label}</option>
      ))}
    </select>
  );
}
