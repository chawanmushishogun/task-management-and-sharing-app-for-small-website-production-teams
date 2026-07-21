import { Modal } from "../Modal";
import { ImageDropZone } from "../ImageDropZone";

/** ワークスペースのロゴ変更。変更は即時反映されるので保存ボタンはない */
export function LogoModal({
  logo, onChange, onClose,
}: {
  logo: string;
  onChange: (url: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal title="ロゴを変更" onClose={onClose}>
      <ImageDropZone value={logo} onChange={onChange} />
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => onChange("")}
          disabled={!logo}
          className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
        >
          既定のアイコンに戻す
        </button>
        <button
          onClick={onClose}
          className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          完了
        </button>
      </div>
    </Modal>
  );
}
