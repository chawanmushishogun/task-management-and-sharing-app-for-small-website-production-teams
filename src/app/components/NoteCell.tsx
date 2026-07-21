const BASE_CLASS =
  "w-full text-[13px] px-2 py-0.5 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent focus:bg-card transition-colors placeholder-muted-foreground/50";

/** 備考欄。multiline のときは中身に合わせて高さが伸びる */
export function NoteCell({
  value, onChange, multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  if (!multiline) {
    return (
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onClick={e => e.stopPropagation()}
        placeholder="メモを入力..."
        className={BASE_CLASS}
      />
    );
  }
  return (
    <textarea
      rows={1}
      value={value}
      onChange={e => onChange(e.target.value)}
      onClick={e => e.stopPropagation()}
      // 中身に合わせて高さを追従させる（毎レンダー実行される）
      ref={el => {
        if (el) {
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }
      }}
      placeholder="メモを入力..."
      className={`${BASE_CLASS} resize-none overflow-hidden block leading-snug`}
    />
  );
}
