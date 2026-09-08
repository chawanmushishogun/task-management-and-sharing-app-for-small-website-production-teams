import type { KeyboardEvent } from "react";

/**
 * 「入力完了」の Enter かどうか。
 *
 * 日本語入力（IME）では、変換候補を確定するときにも Enter を押す。
 * そのときも keydown は発火し、e.key は "Enter" になるので、
 * e.key だけで判定すると変換確定のつもりが入力完了として扱われてしまう。
 *
 * 変換中は nativeEvent.isComposing が true になるので、それを除外する。
 * Safari は変換確定の Enter で isComposing が false のまま keyCode 229 を送ってくるため、
 * keyCode も合わせて見る。
 */
export function isSubmitEnter(e: KeyboardEvent<HTMLElement>): boolean {
  if (e.key !== "Enter") return false;
  if (e.nativeEvent.isComposing) return false;
  if (e.keyCode === 229) return false;
  return true;
}
