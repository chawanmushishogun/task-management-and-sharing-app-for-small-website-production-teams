import type { Status } from "./types";

export const PROJECT_COLORS = ["#e8673c", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

export const WEB_TEMPLATE: { section: string; tasks: string[] }[] = [
  {
    section: "企画/情報設計/PM",
    tasks: ["PM（プロジェクトマネージメント）", "サイトマップ", "見積", "ワイヤフレーム", "スケジュール作成"],
  },
  {
    section: "デザイン",
    tasks: ["トップページ PC版", "トップページ TA版", "トップページ SP版", "favicon / touchicon / og:image"],
  },
  {
    section: "コーディング",
    tasks: ["HTML/CSS/JS", "ブラウザチェック"],
  },
  {
    section: "メタタグ系入力",
    tasks: [
      "favicon / touchicon / og:image",
      "メタタグ（description / keywords）",
      "GA/GTMタグ",
      "JSON-LD",
      "Webフォント アカウント",
      "SNS URL",
    ],
  },
  {
    section: "CMS/バックエンド",
    tasks: ["WordPress構築", "メールフォーム構築", "コンテンツ入力"],
  },
  {
    section: "素材/関連情報",
    tasks: ["撮影", "支給写真", "ストックフォト選定/購入", "支給原稿", "作成原稿", "ドメイン/サーバ情報"],
  },
  {
    section: "公開",
    tasks: ["公開作業"],
  },
];

export const STATUS_CONFIG = {
  todo: { label: "未着手", color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-300" },
  in_progress: { label: "進行中", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300" },
  done: { label: "完了", color: "text-green-600", bg: "bg-green-50", border: "border-green-300" },
};

export const BOARD_COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: "todo", label: "未着手", color: "#6b7280" },
  { key: "in_progress", label: "進行中", color: "#3b82f6" },
  { key: "done", label: "完了", color: "#10b981" },
];
