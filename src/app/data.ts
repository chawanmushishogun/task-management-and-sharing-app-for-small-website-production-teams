import type { Member, Project, Status, Task } from "./types";

export const MEMBERS: Member[] = [
  { id: "m1", name: "田中 花子", initials: "田", color: "#e8673c", role: "プロジェクトマネージャー", avatarUrl: "https://i.pravatar.cc/150?img=47" },
  { id: "m2", name: "佐藤 太郎", initials: "佐", color: "#3b82f6", role: "エンジニア",             avatarUrl: "https://i.pravatar.cc/150?img=12" },
  { id: "m3", name: "鈴木 美咲", initials: "鈴", color: "#10b981", role: "デザイナー",             avatarUrl: "https://i.pravatar.cc/150?img=45" },
  { id: "m4", name: "伊藤 健一", initials: "伊", color: "#8b5cf6", role: "エンジニア",             avatarUrl: "https://i.pravatar.cc/150?img=15" },
  { id: "m5", name: "山本 さくら", initials: "山", color: "#f59e0b", role: "マーケター",           avatarUrl: "https://i.pravatar.cc/150?img=44" },
];

export const OTHER_PROJECT_ID = "p_other";

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
    tasks: ["favicon / touchicon / og:image", "メタタグ（description / keywords）", "GA/GTMタグ", "JSON-LD", "Webフォント アカウント", "SNS URL"],
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

export const PROJECTS: Project[] = [
  { id: "p1", name: "株式会社サンプル商事 コーポレートサイト", color: "#e8673c", starred: true, taskCount: 23, completedCount: 8 },
  { id: "p2", name: "美容室 SAMPLE ECサイト", color: "#3b82f6", starred: true, taskCount: 23, completedCount: 3 },
  { id: OTHER_PROJECT_ID, name: "その他案件", color: "#6b7280", starred: false, taskCount: 11, completedCount: 3 },
];

export const INITIAL_TASKS: Task[] = [
  // ── p1: 株式会社サンプル商事 コーポレートサイト ──
  // 企画/情報設計/PM
  { id: "p1-1",  projectId: "p1", section: "企画/情報設計/PM",  name: "PM（プロジェクトマネージメント）", assigneeId: "m1", endDate: "2026-07-15", startDate: "2026-07-10", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-2",  projectId: "p1", section: "企画/情報設計/PM",  name: "サイトマップ",                     assigneeId: "m1", endDate: "2026-07-18", startDate: "2026-07-15", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-3",  projectId: "p1", section: "企画/情報設計/PM",  name: "見積",                             assigneeId: "m1", endDate: "2026-07-10", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-4",  projectId: "p1", section: "企画/情報設計/PM",  name: "ワイヤフレーム",                   assigneeId: "m3", endDate: "2026-07-25", startDate: "2026-07-18", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [{ id: "c1", authorId: "m1", text: "お問い合わせページのフォーム設計も含めてください", time: "3日前" }], note: "" },
  { id: "p1-5",  projectId: "p1", section: "企画/情報設計/PM",  name: "スケジュール作成",                 assigneeId: "m1", endDate: "2026-07-12", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  // デザイン
  { id: "p1-6",  projectId: "p1", section: "デザイン",           name: "トップページ PC版",                assigneeId: "m3", endDate: "2026-08-05", startDate: "2026-07-28", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-7",  projectId: "p1", section: "デザイン",           name: "トップページ TA版",                assigneeId: "m3", endDate: "2026-08-07", startDate: "2026-08-05", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-8",  projectId: "p1", section: "デザイン",           name: "トップページ SP版",                assigneeId: "m3", endDate: "2026-08-15", startDate: "2026-08-08", status: "in_progress", completed: false, description: "", tags: [], subtasks: [{ id: "s1", name: "デザイン作成", done: true }, { id: "s2", name: "クライアント確認", done: false }], comments: [], note: "" },
  { id: "p1-9",  projectId: "p1", section: "デザイン",           name: "favicon / touchicon / og:image",   assigneeId: "m3", endDate: "2026-08-18", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  // コーディング
  { id: "p1-10", projectId: "p1", section: "コーディング",       name: "HTML/CSS/JS",                      assigneeId: "m2", endDate: "2026-09-05", startDate: "2026-08-20", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-11", projectId: "p1", section: "コーディング",       name: "ブラウザチェック",                 assigneeId: "m2", endDate: "2026-09-10", startDate: "2026-09-05", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  // メタタグ系入力
  { id: "p1-12", projectId: "p1", section: "メタタグ系入力",     name: "favicon / touchicon / og:image",   assigneeId: "m2", endDate: "2026-09-08", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-13", projectId: "p1", section: "メタタグ系入力",     name: "メタタグ（description / keywords）", assigneeId: "m2", endDate: "2026-09-08", startDate: null, status: "todo",       completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-14", projectId: "p1", section: "メタタグ系入力",     name: "GA/GTMタグ",                       assigneeId: "m2", endDate: "2026-09-08", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-15", projectId: "p1", section: "メタタグ系入力",     name: "JSON-LD",                          assigneeId: "m2", endDate: "2026-09-08", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-16", projectId: "p1", section: "メタタグ系入力",     name: "Webフォント アカウント",           assigneeId: "m2", endDate: "2026-08-25", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-17", projectId: "p1", section: "メタタグ系入力",     name: "SNS URL",                          assigneeId: "m1", endDate: "2026-08-25", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  // CMS/バックエンド
  { id: "p1-18", projectId: "p1", section: "CMS/バックエンド",   name: "WordPress構築",                    assigneeId: "m4", endDate: "2026-09-05", startDate: "2026-08-22", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-19", projectId: "p1", section: "CMS/バックエンド",   name: "メールフォーム構築",               assigneeId: "m4", endDate: "2026-09-08", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-20", projectId: "p1", section: "CMS/バックエンド",   name: "コンテンツ入力",                   assigneeId: "m5", endDate: "2026-09-12", startDate: "2026-09-01", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  // 素材/関連情報
  { id: "p1-21", projectId: "p1", section: "素材/関連情報",      name: "撮影",                             assigneeId: "m1", endDate: "2026-07-30", startDate: "2026-07-28", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-22", projectId: "p1", section: "素材/関連情報",      name: "支給写真",                         assigneeId: "m1", endDate: "2026-07-30", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-23", projectId: "p1", section: "素材/関連情報",      name: "ストックフォト選定/購入",          assigneeId: "m3", endDate: "2026-08-05", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-24", projectId: "p1", section: "素材/関連情報",      name: "支給原稿",                         assigneeId: "m1", endDate: "2026-08-15", startDate: "2026-08-01", status: "in_progress", completed: false, description: "", tags: [], subtasks: [], comments: [{ id: "c2", authorId: "m1", text: "会社概要ページの原稿を先にもらえると助かります", time: "1日前" }], note: "" },
  { id: "p1-25", projectId: "p1", section: "素材/関連情報",      name: "作成原稿",                         assigneeId: "m5", endDate: "2026-08-20", startDate: "2026-08-10", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-26", projectId: "p1", section: "素材/関連情報",      name: "ドメイン/サーバ情報",              assigneeId: "m1", endDate: "2026-08-01", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  // 公開
  { id: "p1-27", projectId: "p1", section: "公開",               name: "公開作業",                         assigneeId: "m2", endDate: "2026-09-20", startDate: "2026-09-15", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },

  // ── p2: 美容室 SAMPLE ECサイト ──
  // 企画/情報設計/PM
  { id: "p2-1",  projectId: "p2", section: "企画/情報設計/PM",  name: "PM（プロジェクトマネージメント）", assigneeId: "m1", endDate: "2026-08-01", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-2",  projectId: "p2", section: "企画/情報設計/PM",  name: "サイトマップ",                     assigneeId: "m1", endDate: "2026-08-08", startDate: "2026-08-05", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-3",  projectId: "p2", section: "企画/情報設計/PM",  name: "見積",                             assigneeId: "m1", endDate: "2026-07-28", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-4",  projectId: "p2", section: "企画/情報設計/PM",  name: "ワイヤフレーム",                   assigneeId: "m3", endDate: "2026-08-20", startDate: "2026-08-12", status: "in_progress", completed: false, description: "", tags: [], subtasks: [{ id: "s3", name: "トップ・商品一覧", done: true }, { id: "s4", name: "商品詳細・カート", done: false }], comments: [], note: "" },
  { id: "p2-5",  projectId: "p2", section: "企画/情報設計/PM",  name: "スケジュール作成",                 assigneeId: "m1", endDate: "2026-07-30", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  // デザイン
  { id: "p2-6",  projectId: "p2", section: "デザイン",           name: "トップページ PC版",                assigneeId: "m3", endDate: "2026-09-05", startDate: "2026-08-25", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-7",  projectId: "p2", section: "デザイン",           name: "トップページ TA版",                assigneeId: "m3", endDate: "2026-09-08", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-8",  projectId: "p2", section: "デザイン",           name: "トップページ SP版",                assigneeId: "m3", endDate: "2026-09-10", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-9",  projectId: "p2", section: "デザイン",           name: "favicon / touchicon / og:image",   assigneeId: "m3", endDate: "2026-09-10", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  // コーディング
  { id: "p2-10", projectId: "p2", section: "コーディング",       name: "HTML/CSS/JS",                      assigneeId: "m4", endDate: "2026-10-10", startDate: "2026-09-20", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-11", projectId: "p2", section: "コーディング",       name: "ブラウザチェック",                 assigneeId: "m4", endDate: "2026-10-15", startDate: "2026-10-10", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  // メタタグ系入力
  { id: "p2-12", projectId: "p2", section: "メタタグ系入力",     name: "favicon / touchicon / og:image",   assigneeId: "m4", endDate: "2026-10-12", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-13", projectId: "p2", section: "メタタグ系入力",     name: "メタタグ（description / keywords）", assigneeId: "m4", endDate: "2026-10-12", startDate: null, status: "todo",       completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-14", projectId: "p2", section: "メタタグ系入力",     name: "GA/GTMタグ",                       assigneeId: "m4", endDate: "2026-10-12", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-15", projectId: "p2", section: "メタタグ系入力",     name: "JSON-LD",                          assigneeId: "m4", endDate: "2026-10-12", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-16", projectId: "p2", section: "メタタグ系入力",     name: "Webフォント アカウント",           assigneeId: "m2", endDate: "2026-10-05", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-17", projectId: "p2", section: "メタタグ系入力",     name: "SNS URL",                          assigneeId: "m1", endDate: "2026-10-05", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  // CMS/バックエンド
  { id: "p2-18", projectId: "p2", section: "CMS/バックエンド",   name: "WordPress構築",                    assigneeId: "m2", endDate: "2026-10-10", startDate: "2026-09-25", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-19", projectId: "p2", section: "CMS/バックエンド",   name: "メールフォーム構築",               assigneeId: "m2", endDate: "2026-10-12", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-20", projectId: "p2", section: "CMS/バックエンド",   name: "コンテンツ入力",                   assigneeId: "m5", endDate: "2026-10-18", startDate: "2026-10-05", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  // 素材/関連情報
  { id: "p2-21", projectId: "p2", section: "素材/関連情報",      name: "撮影",                             assigneeId: "m1", endDate: "2026-09-15", startDate: "2026-09-13", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-22", projectId: "p2", section: "素材/関連情報",      name: "支給写真",                         assigneeId: "m1", endDate: "2026-09-15", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-23", projectId: "p2", section: "素材/関連情報",      name: "ストックフォト選定/購入",          assigneeId: "m3", endDate: "2026-09-20", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-24", projectId: "p2", section: "素材/関連情報",      name: "支給原稿",                         assigneeId: "m1", endDate: "2026-09-18", startDate: null, status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-25", projectId: "p2", section: "素材/関連情報",      name: "作成原稿",                         assigneeId: "m5", endDate: "2026-10-01", startDate: "2026-09-20", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-26", projectId: "p2", section: "素材/関連情報",      name: "ドメイン/サーバ情報",              assigneeId: "m1", endDate: "2026-09-10", startDate: null, status: "in_progress", completed: false, description: "", tags: [], subtasks: [], comments: [{ id: "c3", authorId: "m1", text: "サーバ移管が必要か確認中です", time: "2日前" }], note: "" },
  // 公開
  { id: "p2-27", projectId: "p2", section: "公開",               name: "公開作業",                         assigneeId: "m2", endDate: "2026-10-25", startDate: "2026-10-22", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },

  // ── その他案件 ──
  // サンプル工務店 LP修正
  { id: "po-1",  projectId: "p_other", section: "サンプル工務店 LP修正",           name: "修正箇所のヒアリング",       assigneeId: "m1", startDate: "2026-07-15", endDate: "2026-07-16", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-2",  projectId: "p_other", section: "サンプル工務店 LP修正",           name: "デザイン修正",               assigneeId: "m3", startDate: "2026-07-17", endDate: "2026-07-22", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-3",  projectId: "p_other", section: "サンプル工務店 LP修正",           name: "コーディング修正",           assigneeId: "m2", startDate: "2026-07-23", endDate: "2026-07-25", status: "in_progress", completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-4",  projectId: "p_other", section: "サンプル工務店 LP修正",           name: "納品・確認",                 assigneeId: "m1", startDate: "2026-07-28", endDate: "2026-07-28", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },

  // 株式会社サンプル広告 バナー制作
  { id: "po-5",  projectId: "p_other", section: "株式会社サンプル広告 バナー制作",   name: "バナーサイズ・仕様確認",     assigneeId: "m1", startDate: "2026-07-18", endDate: "2026-07-18", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-6",  projectId: "p_other", section: "株式会社サンプル広告 バナー制作",   name: "デザイン制作（3パターン）",  assigneeId: "m3", startDate: "2026-07-21", endDate: "2026-07-24", status: "in_progress", completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-7",  projectId: "p_other", section: "株式会社サンプル広告 バナー制作",   name: "クライアント確認・修正",     assigneeId: "m3", startDate: "2026-07-25", endDate: "2026-07-29", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-8",  projectId: "p_other", section: "株式会社サンプル広告 バナー制作",   name: "納品",                       assigneeId: "m1", startDate: "2026-07-30", endDate: "2026-07-30", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },

  // 社内業務
  { id: "po-9",  projectId: "p_other", section: "社内業務",                    name: "請求書発行（7月分）",         assigneeId: "m1", startDate: null,         endDate: "2026-07-31", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-10", projectId: "p_other", section: "社内業務",                    name: "サーバ費用の更新手続き",      assigneeId: "m2", startDate: null,         endDate: "2026-08-05", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-11", projectId: "p_other", section: "社内業務",                    name: "採用ページ原稿作成",          assigneeId: "m5", startDate: "2026-07-20", endDate: "2026-08-10", status: "in_progress", completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
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
