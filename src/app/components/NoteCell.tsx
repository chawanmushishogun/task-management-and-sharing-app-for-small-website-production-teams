import { useEffect, useRef, useState } from "react";

const BASE_CLASS =
  "w-full text-[13px] px-2 py-0.5 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent focus:bg-card transition-colors placeholder-muted-foreground/50";

/**
 * 備考欄。入力中は手元の下書きを持ち、欄を離れたときに保存する
 * （1文字ごとに保存すると DB への書き込みが増え、他端末の変更通知で入力中の文字が飛ぶため）。
 * multiline のときは中身に合わせて高さが伸びる
 */
export function NoteCell({
  value,
  onChange,
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);

  // 他端末の変更で value が変わったら、入力中でなければ追従する
  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);

  const commit = () => {
    focused.current = false;
    if (draft !== value) onChange(draft);
  };

  const common = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
    onFocus: () => {
      focused.current = true;
    },
    onBlur: commit,
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    placeholder: "メモを入力...",
  };

  if (!multiline) {
    return (
      <input
        type="text"
        {...common}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className={BASE_CLASS}
      />
    );
  }
  return (
    <textarea
      rows={1}
      {...common}
      // 中身に合わせて高さを追従させる（毎レンダー実行される）
      ref={(el) => {
        if (el) {
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }
      }}
      className={`${BASE_CLASS} resize-none overflow-hidden block leading-snug`}
    />
  );
}
