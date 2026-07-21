import { useState } from "react";
import { Calendar } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { formatDateRange } from "../utils/date";

/** 期日の表示と、クリックで開く期間ピッカー。開閉状態は内部で持つ */
export function DueDateCell({
  startDate, endDate, overdue, onChange,
}: {
  startDate: string | null;
  endDate: string | null;
  overdue: boolean;
  onChange: (start: string | null, end: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-[13px] px-2 py-0.5 rounded hover:bg-muted transition-colors ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
      >
        <Calendar size={10} className="flex-shrink-0" />
        {formatDateRange(startDate, endDate)}
      </button>
      {open && (
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
