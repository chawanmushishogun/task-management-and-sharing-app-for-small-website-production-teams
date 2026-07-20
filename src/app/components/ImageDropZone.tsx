import { useState, useRef } from "react";

const MAX_IMAGE_BITS = 1_000_000; // 1 Mbit

export function ImageDropZone({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setError("画像ファイルを選択してください"); return; }
    if (file.size * 8 > MAX_IMAGE_BITS) { setError(`ファイルサイズが大きすぎます（上限 1Mbit / 約125KB）`); return; }
    setError("");
    const reader = new FileReader();
    reader.onload = e => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div
        className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"}`}
        style={{ height: 120 }}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="" className="w-16 h-16 rounded-full object-cover" />
            <span className="text-[13px] text-muted-foreground">クリックまたはドロップで変更</span>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-lg">＋</div>
            <span className="text-[13px] text-muted-foreground text-center">画像をドラッグ＆ドロップ<br />またはクリックして選択</span>
            <span className="text-[13px] text-muted-foreground/60">上限 1Mbit（約125KB）</span>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {error && <p className="text-[13px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
