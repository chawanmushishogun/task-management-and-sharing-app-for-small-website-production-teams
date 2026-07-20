import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { toDateStr } from "../utils/date";

// ── DateRangePicker ──────────────────────────────────────────
export function DateRangePicker({
  startDate, endDate, onChange, onClose,
}: {
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    startDate ? new Date(startDate).getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    startDate ? new Date(startDate).getMonth() : today.getMonth()
  );
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [tempStart, setTempStart] = useState<string | null>(startDate);
  const [tempEnd, setTempEnd] = useState<string | null>(endDate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const blanks = (firstDay + 6) % 7; // Mon start
  const cells: (number | null)[] = [
    ...Array(blanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function handleDayClick(day: number) {
    const clicked = toDateStr(new Date(viewYear, viewMonth, day));
    if (selecting === "start" || !tempStart) {
      setTempStart(clicked);
      setTempEnd(null);
      setSelecting("end");
    } else {
      const start = tempStart!;
      if (clicked < start) {
        setTempStart(clicked);
        setTempEnd(start);
      } else {
        setTempEnd(clicked);
      }
      const finalEnd = clicked < start ? start : clicked;
      const finalStart = clicked < start ? clicked : start;
      setTempStart(finalStart);
      setTempEnd(finalEnd);
      onChange(finalStart, finalEnd);
      setSelecting("start");
    }
  }

  function inRange(day: number): boolean {
    if (!tempStart || !tempEnd) return false;
    const d = toDateStr(new Date(viewYear, viewMonth, day));
    return d > tempStart && d < tempEnd;
  }
  function isStart(day: number) { return toDateStr(new Date(viewYear, viewMonth, day)) === tempStart; }
  function isEnd(day: number) { return toDateStr(new Date(viewYear, viewMonth, day)) === tempEnd; }

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-card border border-border rounded-xl shadow-xl p-4 w-72 mt-1"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronLeft size={14} className="text-muted-foreground" />
        </button>
        <span className="text-[13px] font-medium text-foreground">{viewYear}年 {viewMonth + 1}月</span>
        <div className="flex items-center gap-1">
          <button onClick={nextMonth} className="p-1 rounded hover:bg-muted transition-colors">
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors ml-1">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["月","火","水","木","金","土","日"].map(d => (
          <div key={d} className="text-center text-[13px] text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {day ? (
              <button
                onClick={() => handleDayClick(day)}
                className={`w-7 h-7 rounded text-[13px] font-medium transition-colors
                  ${isStart(day) || isEnd(day) || inRange(day) ? "bg-primary/20 text-primary" :
                    "hover:bg-muted text-foreground"}`}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">
          {selecting === "start" ? "開始日を選択" : "終了日を選択"}
        </span>
        <button
          onClick={() => { onChange(null, null); onClose(); }}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          クリア
        </button>
      </div>
    </div>
  );
}
