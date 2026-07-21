import { useRef, useState } from "react";

const MIN_W = 160;
const MAX_W = 400;
/** これより狭くドラッグしたらアイコンだけの折りたたみ表示に切り替える */
const COLLAPSE_W = 120;

/** サイドバーの幅をドラッグで変えるためのフック */
export function useSidebarResize(initialWidth = 240) {
  const [width, setWidth] = useState(initialWidth);
  const [expanded, setExpanded] = useState(true);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  function onResizeStart(e: React.MouseEvent) {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const next = Math.min(MAX_W, Math.max(MIN_W, startWidth.current + (ev.clientX - startX.current)));
      setWidth(next);
      setExpanded(next > COLLAPSE_W);
    };
    const onUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return { width, expanded, setExpanded, isResizing, onResizeStart };
}
