import { useState, useRef, useEffect } from "react";
import {
  CheckSquare, ChevronDown, ChevronRight,
  Plus, Settings, MoreHorizontal, X,
  List, Columns,
  CheckCircle2, Star,
  Zap, Send, ChevronLeft, Calendar, Users
} from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";

type Status = "todo" | "in_progress" | "done";

interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  avatarUrl: string;
}

interface Task {
  id: string;
  projectId: string;
  name: string;
  assigneeId: string | null;
  startDate: string | null;
  endDate: string | null;
  status: Status;
  description: string;
  completed: boolean;
  tags: string[];
  subtasks: { id: string; name: string; done: boolean }[];
  comments: { id: string; authorId: string; text: string; time: string }[];
  section: string;
  note: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  starred: boolean;
  taskCount: number;
  completedCount: number;
}

const MEMBERS: Member[] = [
  { id: "m1", name: "田中 花子", initials: "田", color: "#e8673c", role: "プロジェクトマネージャー", avatarUrl: "https://i.pravatar.cc/150?img=47" },
  { id: "m2", name: "佐藤 太郎", initials: "佐", color: "#3b82f6", role: "エンジニア",             avatarUrl: "https://i.pravatar.cc/150?img=12" },
  { id: "m3", name: "鈴木 美咲", initials: "鈴", color: "#10b981", role: "デザイナー",             avatarUrl: "https://i.pravatar.cc/150?img=45" },
  { id: "m4", name: "伊藤 健一", initials: "伊", color: "#8b5cf6", role: "エンジニア",             avatarUrl: "https://i.pravatar.cc/150?img=15" },
  { id: "m5", name: "山本 さくら", initials: "山", color: "#f59e0b", role: "マーケター",           avatarUrl: "https://i.pravatar.cc/150?img=44" },
];

const OTHER_PROJECT_ID = "p_other";

const PROJECT_COLORS = ["#e8673c", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

const WEB_TEMPLATE: { section: string; tasks: string[] }[] = [
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

const PROJECTS: Project[] = [
  { id: "p1", name: "株式会社山田商事 コーポレートサイト", color: "#e8673c", starred: true, taskCount: 23, completedCount: 8 },
  { id: "p2", name: "美容室 Luce ECサイト", color: "#3b82f6", starred: true, taskCount: 23, completedCount: 3 },
  { id: OTHER_PROJECT_ID, name: "その他案件", color: "#6b7280", starred: false, taskCount: 11, completedCount: 3 },
];

const INITIAL_TASKS: Task[] = [
  // ── p1: 株式会社山田商事 コーポレートサイト ──
  // 企画/情報設計/PM
  { id: "p1-1",  projectId: "p1", section: "企画/情報設計/PM",  name: "PM（プロジェクトマネージメント）", assigneeId: "m1", endDate: "2026-07-15", startDate: "2026-07-10", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-2",  projectId: "p1", section: "企画/情報設計/PM",  name: "サイトマップ",                     assigneeId: "m1", endDate: "2026-07-18", startDate: "2026-07-15", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-3",  projectId: "p1", section: "企画/情報設計/PM",  name: "見積",                             assigneeId: "m1", endDate: "2026-07-10", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-4",  projectId: "p1", section: "企画/情報設計/PM",  name: "ワイヤフレーム",                   assigneeId: "m3", endDate: "2026-07-25", startDate: "2026-07-18", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [{ id: "c1", authorId: "m1", text: "お問い合わせページのフォーム設計も含めてください", time: "3日前" }], note: "" },
  { id: "p1-5",  projectId: "p1", section: "企画/情報設計/PM",  name: "スケジュール作成",                 assigneeId: "m1", endDate: "2026-07-12", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  // デザイン
  { id: "p1-6",  projectId: "p1", section: "デザイン",           name: "トップページ PC版",                assigneeId: "m3", endDate: "2026-08-05", startDate: "2026-07-28", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-7",  projectId: "p1", section: "デザイン",           name: "トップページ TA版",                assigneeId: "m3", endDate: "2026-08-07", startDate: "2026-08-05", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p1-8",  projectId: "p1", section: "デザイン",           name: "トップページ SP版",                assigneeId: "m3", endDate: "2026-08-15", startDate: "2026-08-08", status: "in_progress", completed: false, description: "", tags: [], subtasks: [{ id: "s1", name: "デザイン作成", done: true }, { id: "s2", name: "クライアント確認", done: false }], comments: [] },
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

  // ── p2: 美容室 Luce ECサイト ──
  // 企画/情報設計/PM
  { id: "p2-1",  projectId: "p2", section: "企画/情報設計/PM",  name: "PM（プロジェクトマネージメント）", assigneeId: "m1", endDate: "2026-08-01", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-2",  projectId: "p2", section: "企画/情報設計/PM",  name: "サイトマップ",                     assigneeId: "m1", endDate: "2026-08-08", startDate: "2026-08-05", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-3",  projectId: "p2", section: "企画/情報設計/PM",  name: "見積",                             assigneeId: "m1", endDate: "2026-07-28", startDate: null, status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "p2-4",  projectId: "p2", section: "企画/情報設計/PM",  name: "ワイヤフレーム",                   assigneeId: "m3", endDate: "2026-08-20", startDate: "2026-08-12", status: "in_progress", completed: false, description: "", tags: [], subtasks: [{ id: "s3", name: "トップ・商品一覧", done: true }, { id: "s4", name: "商品詳細・カート", done: false }], comments: [] },
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
  // 田中工務店 LP修正
  { id: "po-1",  projectId: "p_other", section: "田中工務店 LP修正",           name: "修正箇所のヒアリング",       assigneeId: "m1", startDate: "2026-07-15", endDate: "2026-07-16", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-2",  projectId: "p_other", section: "田中工務店 LP修正",           name: "デザイン修正",               assigneeId: "m3", startDate: "2026-07-17", endDate: "2026-07-22", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-3",  projectId: "p_other", section: "田中工務店 LP修正",           name: "コーディング修正",           assigneeId: "m2", startDate: "2026-07-23", endDate: "2026-07-25", status: "in_progress", completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-4",  projectId: "p_other", section: "田中工務店 LP修正",           name: "納品・確認",                 assigneeId: "m1", startDate: "2026-07-28", endDate: "2026-07-28", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },

  // 株式会社フジタ バナー制作
  { id: "po-5",  projectId: "p_other", section: "株式会社フジタ バナー制作",   name: "バナーサイズ・仕様確認",     assigneeId: "m1", startDate: "2026-07-18", endDate: "2026-07-18", status: "done",        completed: true,  description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-6",  projectId: "p_other", section: "株式会社フジタ バナー制作",   name: "デザイン制作（3パターン）",  assigneeId: "m3", startDate: "2026-07-21", endDate: "2026-07-24", status: "in_progress", completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-7",  projectId: "p_other", section: "株式会社フジタ バナー制作",   name: "クライアント確認・修正",     assigneeId: "m3", startDate: "2026-07-25", endDate: "2026-07-29", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-8",  projectId: "p_other", section: "株式会社フジタ バナー制作",   name: "納品",                       assigneeId: "m1", startDate: "2026-07-30", endDate: "2026-07-30", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },

  // 社内業務
  { id: "po-9",  projectId: "p_other", section: "社内業務",                    name: "請求書発行（7月分）",         assigneeId: "m1", startDate: null,         endDate: "2026-07-31", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-10", projectId: "p_other", section: "社内業務",                    name: "サーバ費用の更新手続き",      assigneeId: "m2", startDate: null,         endDate: "2026-08-05", status: "todo",        completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
  { id: "po-11", projectId: "p_other", section: "社内業務",                    name: "採用ページ原稿作成",          assigneeId: "m5", startDate: "2026-07-20", endDate: "2026-08-10", status: "in_progress", completed: false, description: "", tags: [], subtasks: [], comments: [], note: "" },
];


const STATUS_CONFIG = {
  todo: { label: "未着手", color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-300" },
  in_progress: { label: "進行中", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300" },
  done: { label: "完了", color: "text-green-600", bg: "bg-green-50", border: "border-green-300" },
};

const BOARD_COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: "todo", label: "未着手", color: "#6b7280" },
  { key: "in_progress", label: "進行中", color: "#3b82f6" },
  { key: "done", label: "完了", color: "#10b981" },
];


const MAX_IMAGE_BITS = 1_000_000; // 1 Mbit

function ImageDropZone({ value, onChange }: { value: string; onChange: (url: string) => void }) {
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

function Avatar({ member, size = "sm", showName = false }: { member: Member; size?: "sm" | "md" | "lg"; showName?: boolean }) {
  const sz = size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-10 h-10";
  const textSz = size === "sm" ? "text-[13px]" : size === "md" ? "text-[15px]" : "text-base";
  const [imgError, setImgError] = useState(false);

  const circle = imgError ? (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 ${textSz}`}
      style={{ backgroundColor: member.color }}
      title={member.name}
    >
      {member.initials}
    </div>
  ) : (
    <img
      src={member.avatarUrl}
      alt={member.name}
      title={member.name}
      onError={() => setImgError(true)}
      className={`${sz} rounded-full object-cover flex-shrink-0`}
    />
  );

  if (!showName) return circle;
  return (
    <div className="flex items-center gap-1.5">
      {circle}
      <span className={`${textSz} text-foreground`}>{member.name}</span>
    </div>
  );
}


function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center text-[13px] px-2 py-0.5 rounded-full font-medium border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return "—";
  if (startDate && endDate) return `${formatDateShort(startDate)} 〜 ${formatDateShort(endDate)}`;
  if (endDate) return formatDateShort(endDate);
  return formatDateShort(startDate);
}

function isOverdue(endDate: string | null): boolean {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── DateRangePicker ──────────────────────────────────────────
function DateRangePicker({
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

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", INITIAL_TASKS);
  const [projects, setProjects] = useLocalStorage<Project[]>("projects", PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("p1");
  const [view, setView] = useState<"list" | "board">("list");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<"mytasks" | "project" | "members">("project");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  function onResizeStart(e: React.MouseEvent) {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = ev.clientX - startX.current;
      const next = Math.min(400, Math.max(160, startWidth.current + delta));
      setSidebarWidth(next);
      setSidebarExpanded(next > 120);
    };
    const onUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskSection, setNewTaskSection] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [newComment, setNewComment] = useState("");
  const [members, setMembers] = useLocalStorage<Member[]>("members", MEMBERS);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState<Omit<Member, "id">>({ name: "", initials: "", color: "#3b82f6", role: "", avatarUrl: "" });
  const [editingTaskName, setEditingTaskName] = useState<{ id: string; value: string } | null>(null);
  const COL_W = 160;
  const [openAssignee, setOpenAssignee] = useState<string | null>(null);
  const [openDatePicker, setOpenDatePicker] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;
  const currentProject = projects.find(p => p.id === selectedProjectId);

  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
  const filteredTasks = projectTasks.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  const sections = [...new Set(filteredTasks.map(t => t.section))];

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed, status: !t.completed ? "done" : "in_progress" } : t
    ));
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }

  function updateTaskStatus(id: string, status: Status) {
    updateTask(id, { status, completed: status === "done" });
  }

  function addWebProject() {
    if (!newProjectName.trim()) return;
    const id = `p${Date.now()}`;
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    const newProject: Project = {
      id,
      name: newProjectName.trim(),
      color,
      starred: false,
      taskCount: WEB_TEMPLATE.reduce((acc, s) => acc + s.tasks.length, 0),
      completedCount: 0,
    };
    const newTasks: Task[] = WEB_TEMPLATE.flatMap(s =>
      s.tasks.map(name => ({
        id: `t${Date.now()}_${Math.random().toString(36).slice(2)}`,
        projectId: id,
        name,
        assigneeId: null,
        startDate: null,
      endDate: null,
        status: "todo" as Status,
        description: "",
        completed: false,
        tags: [],
        section: s.section,
        subtasks: [],
        comments: [],
        note: "",
      }))
    );
    setProjects(prev => {
      const others = prev.filter(p => p.id !== OTHER_PROJECT_ID);
      const other = prev.find(p => p.id === OTHER_PROJECT_ID)!;
      return [...others, newProject, other];
    });
    setTasks(prev => [...prev, ...newTasks]);
    setSelectedProjectId(id);
    setActiveNav("project");
    setNewProjectName("");
    setShowNewProject(false);
  }

  function addOtherSection() {
    if (!newSectionName.trim()) return;
    const task: Task = {
      id: `t${Date.now()}`,
      projectId: OTHER_PROJECT_ID,
      name: "タスクを追加",
      assigneeId: null,
      startDate: null,
      endDate: null,
      status: "todo",
      description: "",
      completed: false,
      tags: [],
      section: newSectionName.trim(),
      subtasks: [],
      comments: [],
      note: "",
    };
    setTasks(prev => [...prev, task]);
    setNewSectionName("");
    setShowAddSection(false);
  }

  function addTask() {
    if (!newTaskName.trim()) return;
    const task: Task = {
      id: `t${Date.now()}`,
      projectId: selectedProjectId,
      name: newTaskName.trim(),
      assigneeId: null,
      startDate: null,
      endDate: null,

      status: "todo",
      description: "",
      completed: false,
      tags: [],
      section: newTaskSection || (sections[0] ?? "その他"),
      subtasks: [],
      comments: [],
      note: "",
    };
    setTasks(prev => [...prev, task]);
    setNewTaskName("");
    setShowAddTask(false);
  }

  function addComment() {
    if (!newComment.trim() || !selectedTaskId) return;
    setTasks(prev => prev.map(t =>
      t.id === selectedTaskId
        ? { ...t, comments: [...t.comments, { id: `c${Date.now()}`, authorId: "m1", text: newComment, time: "今" }] }
        : t
    ));
    setNewComment("");
  }

  function toggleSubtask(taskId: string, subtaskId: string) {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s) }
        : t
    ));
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  const myTasks = tasks.filter(t => t.assigneeId === "m1" && !t.completed);

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 overflow-hidden relative"
        style={{ width: sidebarExpanded ? sidebarWidth : 56, backgroundColor: "var(--sidebar)", transition: isResizing.current ? "none" : "width 0.2s" }}
      >
        {/* Team Header */}
        <div className="flex items-center gap-2.5 px-3 py-4 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          {sidebarExpanded && (
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-medium text-white truncate">Acme Corp</div>
              <div className="text-[13px] text-white/40">チームワークスペース</div>
            </div>
          )}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            {sidebarExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>


        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {[
            { key: "mytasks" as const, icon: CheckSquare, label: "マイタスク", badge: myTasks.length },
            ].map(({ key, icon: Icon, label, badge }) => (
            <button
              key={key}
              onClick={() => setActiveNav(key)}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[15px] transition-colors ${
                activeNav === key
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={15} className="flex-shrink-0" />
              {sidebarExpanded && (
                <>
                  <span className="flex-1 text-left truncate">{label}</span>
                  {badge ? (
                    <span className="text-[13px] bg-primary text-white rounded-full px-1.5 py-0.5 font-medium leading-none">
                      {badge}
                    </span>
                  ) : null}
                </>
              )}
            </button>
          ))}

          {/* Projects Section */}
          <div className="pt-3">
            {sidebarExpanded && (
              <div className="px-2 py-1 text-[13px] font-medium text-white/40 uppercase tracking-wider">
                プロジェクト
              </div>
            )}
            <div className="mt-1 space-y-0.5">
              {projects.filter(p => p.id !== OTHER_PROJECT_ID).map(project => (
                <button
                  key={project.id}
                  onClick={() => { setSelectedProjectId(project.id); setActiveNav("project"); setSelectedTaskId(null); }}
                  className={`w-full flex items-center px-2 py-1.5 rounded-md text-[15px] transition-colors ${
                    activeNav === "project" && selectedProjectId === project.id
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {sidebarExpanded && (
                    <>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                      <span className="flex-1 text-left truncate ml-2" style={{ fontSize: "14px" }}>{project.name}</span>
                    </>
                  )}
                </button>
              ))}
              {sidebarExpanded && (
                <button
                  onClick={() => setShowNewProject(true)}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] text-white/40 hover:text-white/60 transition-colors"
                >
                  <Plus size={13} />
                  <span>Webサイト制作を追加</span>
                </button>
              )}
              {/* その他案件 — 区切り線の後に固定表示 */}
              <div className="border-t border-white/10 pt-1 mt-1">
                {(() => {
                  const other = projects.find(p => p.id === OTHER_PROJECT_ID)!;
                  return (
                    <button
                      onClick={() => { setSelectedProjectId(OTHER_PROJECT_ID); setActiveNav("project"); setSelectedTaskId(null); }}
                      className={`w-full flex items-center px-2 py-1.5 rounded-md text-[15px] transition-colors ${
                        activeNav === "project" && selectedProjectId === OTHER_PROJECT_ID
                          ? "bg-white/15 text-white"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {sidebarExpanded && (
                        <>
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: other.color }} />
                          <span className="flex-1 text-left truncate text-[13px] ml-2">{other.name}</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-2 py-2 border-t border-white/10">
          <button
            onClick={() => setActiveNav("members")}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors ${activeNav === "members" ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}
          >
            <Users size={15} className="flex-shrink-0" />
            {sidebarExpanded && <span className="text-[13px]">メンバー</span>}
          </button>
          <button className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors`}>
            <Settings size={15} className="flex-shrink-0" />
            {sidebarExpanded && <span className="text-[13px]">設定</span>}
          </button>
          {sidebarExpanded && (
            <div className="flex items-center gap-2 px-2 py-2 mt-1">
              <Avatar member={MEMBERS[0]} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-white/80 truncate">{MEMBERS[0].name}</div>
              </div>
            </div>
          )}
        </div>
        {/* Resize handle */}
        <div
          onMouseDown={onResizeStart}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/40 transition-colors group z-20"
        />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {activeNav === "project" && currentProject && (
              <>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentProject.color }} />
                <h1 className="font-medium text-foreground" style={{ fontSize: "30px" }}>{currentProject.name}</h1>
                <span className="text-[13px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {projectTasks.filter(t => !t.completed).length}件
                </span>
              </>
            )}
            {activeNav === "mytasks" && <h1 className="font-medium text-foreground" style={{ fontSize: "30px" }}>マイタスク</h1>}
            {activeNav === "members" && <h1 className="font-medium text-foreground" style={{ fontSize: "30px" }}>メンバー</h1>}
          </div>
        </header>

        {/* Project content */}
        {activeNav === "project" && (
          <div className="flex flex-1 overflow-hidden">
            {/* Content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-6 py-2.5 bg-card border-b border-border flex-shrink-0">
                <div className="flex items-center rounded-md border border-border overflow-hidden">
                  <button
                    onClick={() => setView("list")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <List size={12} />リスト
                  </button>
                  <button
                    onClick={() => setView("board")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors ${view === "board" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <Columns size={12} />ボード
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {(["all", "todo", "in_progress", "done"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`text-[13px] px-2 py-1 rounded-md font-medium transition-colors ${
                        filterStatus === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s === "all" ? "すべて" : STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List View */}
              {view === "list" && (
                <div className="flex-1 overflow-y-auto">
                  {/* Table header */}
                  <div className="flex items-center border-b border-border bg-muted/50 text-[13px] font-medium text-muted-foreground sticky top-0 z-10">
                    <div className="flex-1 min-w-0 px-6 py-2 border-r border-border/40">タスク名</div>
                    <div className="flex-shrink-0 px-3 py-2 border-r border-border/40" style={{ width: COL_W }}>
                      担当者
                                          </div>
                    <div className="flex-shrink-0 px-3 py-2 border-r border-border/40" style={{ width: COL_W }}>
                      期日
                    </div>
                    <div className="flex-shrink-0 px-3 py-2 border-r border-border/40" style={{ width: COL_W }}>
                      ステータス
                    </div>
                    <div className="flex-shrink-0 px-3 py-2 border-r border-border/40" style={{ width: COL_W }}>
                      備考
                    </div>
                    <div className="w-8 flex-shrink-0" />
                  </div>

                  {sections.map(section => {
                    const sectionTasks = filteredTasks.filter(t => t.section === section);
                    const isCollapsed = expandedSections[section] === false;
                    return (
                      <div key={section}>
                        {/* Section header */}
                        <div
                          className="flex items-center gap-2 px-6 py-2 cursor-pointer hover:bg-muted/30 group"
                          onClick={() => toggleSection(section)}
                        >
                          {isCollapsed ? <ChevronRight size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
                          <span className="font-medium text-foreground" style={{ fontSize: "22px" }}>{section}</span>
                        </div>

                        {!isCollapsed && sectionTasks.map(task => {
                          const assignee = MEMBERS.find(m => m.id === task.assigneeId);
                          const overdue = isOverdue(task.endDate) && !task.completed;
                          const isEditingName = editingTaskName?.id === task.id;
                          return (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTaskId(task.id)}
                              className={`flex items-center border-b border-border/50 hover:bg-card cursor-pointer group transition-colors ${selectedTaskId === task.id ? "bg-accent/50" : ""}`}
                            >
                              {/* タスク名 */}
                              <div className="flex-1 min-w-0 px-6 py-1.5 border-r border-border/20">
                                {isEditingName ? (
                                  <input
                                    autoFocus
                                    className="w-full text-foreground bg-transparent outline-none border-b border-primary" style={{ fontSize: "15px" }}
                                    value={editingTaskName.value}
                                    onChange={e => setEditingTaskName({ id: task.id, value: e.target.value })}
                                    onBlur={() => { updateTask(task.id, { name: editingTaskName.value }); setEditingTaskName(null); }}
                                    onKeyDown={e => { if (e.key === "Enter") { updateTask(task.id, { name: editingTaskName.value }); setEditingTaskName(null); } e.stopPropagation(); }}
                                    onClick={e => e.stopPropagation()}
                                  />
                                ) : (
                                  <span
                                    className="text-foreground hover:underline decoration-dotted underline-offset-2 cursor-text font-medium" style={{ fontSize: "15px" }}
                                    onClick={e => { e.stopPropagation(); setEditingTaskName({ id: task.id, value: task.name }); }}
                                  >
                                    {task.name}
                                  </span>
                                )}
                              </div>

                              {/* 担当者 */}
                              <div className="flex flex-shrink-0 relative overflow-hidden px-2 py-1.5 border-r border-border/20" style={{ width: COL_W }}>
                                <button
                                  onClick={e => { e.stopPropagation(); setOpenAssignee(openAssignee === task.id ? null : task.id); }}
                                  className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-muted transition-colors"
                                >
                                  {assignee
                                    ? <Avatar member={assignee} size="sm" showName />
                                    : <span className="text-[13px] text-muted-foreground hover:text-foreground">未割り当て</span>}
                                </button>
                                {openAssignee === task.id && (
                                  <div
                                    className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg z-50 py-1 w-44"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <button
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted transition-colors"
                                      onClick={() => { updateTask(task.id, { assigneeId: null }); setOpenAssignee(null); }}
                                    >
                                      未割り当て
                                    </button>
                                    {MEMBERS.map(m => (
                                      <button
                                        key={m.id}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-foreground hover:bg-muted transition-colors"
                                        onClick={() => { updateTask(task.id, { assigneeId: m.id }); setOpenAssignee(null); }}
                                      >
                                        <Avatar member={m} size="sm" showName />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* 期日 */}
                              <div className="flex-shrink-0 relative overflow-hidden px-2 py-1.5 border-r border-border/20" style={{ width: COL_W }}>
                                <button
                                  onClick={e => { e.stopPropagation(); setOpenDatePicker(openDatePicker === task.id ? null : task.id); }}
                                  className={`flex items-center gap-1 text-[13px] px-2 py-0.5 rounded hover:bg-muted transition-colors ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                                >
                                  <Calendar size={10} className="flex-shrink-0" />
                                  {formatDateRange(task.startDate, task.endDate)}
                                </button>
                                {openDatePicker === task.id && (
                                  <DateRangePicker
                                    startDate={task.startDate}
                                    endDate={task.endDate}
                                    onChange={(s, e) => updateTask(task.id, { startDate: s, endDate: e })}
                                    onClose={() => setOpenDatePicker(null)}
                                  />
                                )}
                              </div>

                              {/* ステータス */}
                              <div className="flex-shrink-0 overflow-hidden px-2 py-1.5 border-r border-border/20" style={{ width: COL_W }}>
                                <select
                                  value={task.status}
                                  onChange={e => { e.stopPropagation(); updateTaskStatus(task.id, e.target.value as Status); }}
                                  onClick={e => e.stopPropagation()}
                                  className={`text-[13px] px-1.5 py-0.5 rounded-full border font-medium cursor-pointer outline-none appearance-none ${STATUS_CONFIG[task.status].color} ${STATUS_CONFIG[task.status].bg} ${STATUS_CONFIG[task.status].border}`}
                                >
                                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                  ))}
                                </select>
                              </div>
                              {/* 備考 */}
                              <div className="flex-shrink-0 overflow-hidden px-2 py-1.5" style={{ width: COL_W }} onClick={e => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={task.note}
                                  onChange={e => updateTask(task.id, { note: e.target.value })}
                                  onClick={e => e.stopPropagation()}
                                  placeholder="メモを入力..."
                                  className="w-full text-[13px] px-2 py-0.5 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent focus:bg-card transition-colors placeholder-muted-foreground/50"
                                />
                              </div>
                              <div className="w-8 flex justify-end flex-shrink-0">
                                <button
                                  onClick={e => e.stopPropagation()}
                                  className="p-1 rounded text-transparent group-hover:text-muted-foreground hover:bg-muted transition-colors"
                                >
                                  <MoreHorizontal size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Add task in section */}
                        {!isCollapsed && (
                          <button
                            onClick={() => { setNewTaskSection(section); setShowAddTask(true); }}
                            className="flex items-center gap-2 px-6 py-2 text-[13px] text-muted-foreground hover:text-primary transition-colors w-full text-left"
                          >
                            <Plus size={12} />タスクを追加
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* その他案件：案件（セクション）追加ボタン */}
                  {selectedProjectId === OTHER_PROJECT_ID && (
                    <div className="px-6 py-3 border-t border-border/50">
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus size={12} />案件（セクション）を追加
                      </button>
                    </div>
                  )}

                  {filteredTasks.length === 0 && selectedProjectId !== OTHER_PROJECT_ID && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <CheckCircle2 size={40} className="mb-3 opacity-30" />
                      <p className="text-[15px]">タスクがありません</p>
                    </div>
                  )}

                  {filteredTasks.length === 0 && selectedProjectId === OTHER_PROJECT_ID && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <CheckCircle2 size={40} className="mb-3 opacity-30" />
                      <p className="text-[15px] mb-2">案件がありません</p>
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="text-[13px] text-primary hover:underline"
                      >
                        ＋ 案件を追加する
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Board View */}
              {view === "board" && (
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                  <div className="flex gap-4 p-6 h-full min-w-max">
                    {BOARD_COLUMNS.map(col => {
                      const colTasks = filteredTasks.filter(t => t.status === col.key);
                      return (
                        <div key={col.key} className="flex flex-col w-64 flex-shrink-0">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                            <span className="text-[13px] font-medium text-foreground">{col.label}</span>
                            <span className="text-[13px] text-muted-foreground ml-auto">{colTasks.length}</span>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-2 pb-2">
                            {colTasks.map(task => {
                              const assignee = MEMBERS.find(m => m.id === task.assigneeId);
                              const overdue = isOverdue(task.endDate) && !task.completed;
                              return (
                                <div
                                  key={task.id}
                                  onClick={() => setSelectedTaskId(task.id)}
                                  className={`bg-card rounded-lg p-3 border border-border cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all group ${selectedTaskId === task.id ? "border-primary/50 shadow-sm" : ""}`}
                                >
                                  <div className="flex items-start mb-2">
                                    <span className="text-[13px] font-medium leading-snug flex-1 text-foreground">
                                      {task.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      {task.subtasks.length > 0 && (
                                        <span className="text-[13px] text-muted-foreground">
                                          {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {(task.startDate || task.endDate) && (
                                        <span className={`text-[13px] ${overdue ? "text-red-500" : "text-muted-foreground"}`}>
                                          {formatDateRange(task.startDate, task.endDate)}
                                        </span>
                                      )}
                                      {assignee && <Avatar member={assignee} size="sm" />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <button
                              onClick={() => { setNewTaskSection(col.label); setShowAddTask(true); }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-[13px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                            >
                              <Plus size={12} />追加
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Task Detail Panel */}
            {selectedTask && (
              <div className="w-96 flex-shrink-0 border-l border-border bg-card overflow-y-auto flex flex-col">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTask.status}
                      onChange={e => updateTaskStatus(selectedTask.id, e.target.value as Status)}
                      className={`text-[13px] px-2 py-1 rounded-full border font-medium cursor-pointer outline-none ${STATUS_CONFIG[selectedTask.status].color} ${STATUS_CONFIG[selectedTask.status].bg} ${STATUS_CONFIG[selectedTask.status].border}`}
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                    <button
                      onClick={() => setSelectedTaskId(null)}
                      className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-5 overflow-y-auto">
                  {/* Task name */}
                  <div>
                    <h2 className="text-base font-medium text-foreground leading-snug">{selectedTask.name}</h2>
                  </div>

                  {/* Meta info */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-muted-foreground w-16 flex-shrink-0">担当者</span>
                      {(() => {
                        const assignee = MEMBERS.find(m => m.id === selectedTask.assigneeId);
                        return assignee ? (
                          <Avatar member={assignee} size="sm" showName />
                        ) : (
                          <span className="text-[13px] text-muted-foreground">未割り当て</span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-muted-foreground w-16 flex-shrink-0">期日</span>
                      <div className="relative">
                        <button
                          onClick={() => setOpenDatePicker(openDatePicker === selectedTask.id + "_panel" ? null : selectedTask.id + "_panel")}
                          className={`flex items-center gap-1 text-[13px] px-2 py-0.5 rounded hover:bg-muted transition-colors ${isOverdue(selectedTask.endDate) && !selectedTask.completed ? "text-red-500 font-medium" : "text-foreground"}`}
                        >
                          <Calendar size={10} />
                          {formatDateRange(selectedTask.startDate, selectedTask.endDate)}
                        </button>
                        {openDatePicker === selectedTask.id + "_panel" && (
                          <DateRangePicker
                            startDate={selectedTask.startDate}
                            endDate={selectedTask.endDate}
                            onChange={(s, e) => updateTask(selectedTask.id, { startDate: s, endDate: e })}
                            onClose={() => setOpenDatePicker(null)}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-muted-foreground w-16 flex-shrink-0">セクション</span>
                      <span className="text-[13px] text-foreground">{selectedTask.section}</span>
                    </div>
                    {selectedTask.tags.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="text-[13px] text-muted-foreground w-16 flex-shrink-0 mt-0.5">タグ</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedTask.tags.map(tag => (
                            <span key={tag} className="text-[13px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedTask.description && (
                    <div>
                      <div className="text-[13px] font-medium text-muted-foreground mb-1.5">説明</div>
                      <p className="text-[15px] text-foreground leading-relaxed">{selectedTask.description}</p>
                    </div>
                  )}

                  {/* Subtasks */}
                  {selectedTask.subtasks.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[13px] font-medium text-muted-foreground">サブタスク</div>
                        <span className="text-[13px] text-muted-foreground">
                          {selectedTask.subtasks.filter(s => s.done).length}/{selectedTask.subtasks.length}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {selectedTask.subtasks.map(subtask => (
                          <label key={subtask.id} className="flex items-center gap-2 cursor-pointer group/sub">
                            <input
                              type="checkbox"
                              checked={subtask.done}
                              onChange={() => toggleSubtask(selectedTask.id, subtask.id)}
                              className="rounded w-3.5 h-3.5 accent-primary"
                            />
                            <span className={`text-[13px] ${subtask.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {subtask.name}
                            </span>
                          </label>
                        ))}
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(selectedTask.subtasks.filter(s => s.done).length / selectedTask.subtasks.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div>
                    <div className="text-[13px] font-medium text-muted-foreground mb-3">コメント</div>
                    <div className="space-y-3">
                      {selectedTask.comments.map(comment => {
                        const author = MEMBERS.find(m => m.id === comment.authorId);
                        return (
                          <div key={comment.id} className="flex gap-2">
                            {author && <Avatar member={author} size="sm" />}
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[13px] font-medium text-foreground">{author?.name}</span>
                                <span className="text-[13px] text-muted-foreground">{comment.time}</span>
                              </div>
                              <div className="bg-muted rounded-lg px-3 py-2 text-[13px] text-foreground">
                                {comment.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Comment input */}
                    <div className="flex gap-2 mt-3">
                      <Avatar member={MEMBERS[0]} size="sm" />
                      <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                        <input
                          className="flex-1 bg-transparent text-[13px] text-foreground placeholder-muted-foreground outline-none"
                          placeholder="コメントを追加..."
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addComment()}
                        />
                        <button
                          onClick={addComment}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* My Tasks View */}
        {activeNav === "mytasks" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ヘッダー行 */}
            <div className="flex items-center px-6 py-2 border-b border-border bg-muted/50 text-[13px] font-medium text-muted-foreground sticky top-0 z-10 flex-shrink-0">
              <div className="w-52 flex-shrink-0">プロジェクト</div>
              <div className="flex-1 min-w-0">タスク名</div>
              <div className="flex-shrink-0" style={{ width: COL_W }}>
                期日
              </div>
              <div className="flex-shrink-0" style={{ width: COL_W }}>
                ステータス
              </div>
              <div className="flex-shrink-0" style={{ width: COL_W }}>
                備考
              </div>
              <div className="w-8 flex-shrink-0" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {myTasks.map(task => {
                const project = projects.find(p => p.id === task.projectId);
                const overdue = isOverdue(task.endDate) && !task.completed;
                const isEditingName = editingTaskName?.id === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedProjectId(task.projectId); setActiveNav("project"); setSelectedTaskId(task.id); }}
                    className={`flex items-center px-6 py-1.5 border-b border-border/50 hover:bg-card cursor-pointer group transition-colors ${selectedTaskId === task.id ? "bg-accent/50" : ""}`}
                  >
                    {/* プロジェクト */}
                    <div className="w-52 flex-shrink-0 pr-3">
                      {project && (
                        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground truncate">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                          {project.id === OTHER_PROJECT_ID ? task.section : project.name}
                        </span>
                      )}
                    </div>
                    {/* タスク名 */}
                    <div className="flex-1 min-w-0 pr-2">
                      {isEditingName ? (
                        <input
                          autoFocus
                          className="w-full text-foreground bg-transparent outline-none border-b border-primary font-medium" style={{ fontSize: "15px" }}
                          value={editingTaskName.value}
                          onChange={e => setEditingTaskName({ id: task.id, value: e.target.value })}
                          onBlur={() => { updateTask(task.id, { name: editingTaskName.value }); setEditingTaskName(null); }}
                          onKeyDown={e => { if (e.key === "Enter") { updateTask(task.id, { name: editingTaskName.value }); setEditingTaskName(null); } e.stopPropagation(); }}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="text-foreground hover:underline decoration-dotted underline-offset-2 cursor-text font-medium" style={{ fontSize: "15px" }}
                          onClick={e => { e.stopPropagation(); setEditingTaskName({ id: task.id, value: task.name }); }}
                        >
                          {task.name}
                        </span>
                      )}
                    </div>
                    {/* 期日 */}
                    <div className="flex-shrink-0 relative overflow-hidden" style={{ width: COL_W }}>
                      <button
                        onClick={e => { e.stopPropagation(); setOpenDatePicker(openDatePicker === task.id ? null : task.id); }}
                        className={`flex items-center gap-1 text-[13px] px-2 py-0.5 rounded hover:bg-muted transition-colors ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                      >
                        <Calendar size={10} className="flex-shrink-0" />
                        {formatDateRange(task.startDate, task.endDate)}
                      </button>
                      {openDatePicker === task.id && (
                        <DateRangePicker startDate={task.startDate} endDate={task.endDate} onChange={(s, e) => updateTask(task.id, { startDate: s, endDate: e })} onClose={() => setOpenDatePicker(null)} />
                      )}
                    </div>
                    {/* ステータス */}
                    <div className="flex-shrink-0 overflow-hidden" style={{ width: COL_W }}>
                      <select
                        value={task.status}
                        onChange={e => { e.stopPropagation(); updateTaskStatus(task.id, e.target.value as Status); }}
                        onClick={e => e.stopPropagation()}
                        className={`text-[13px] px-1.5 py-0.5 rounded-full border font-medium cursor-pointer outline-none appearance-none ${STATUS_CONFIG[task.status].color} ${STATUS_CONFIG[task.status].bg} ${STATUS_CONFIG[task.status].border}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* 備考 */}
                    <div className="flex-shrink-0 overflow-hidden" style={{ width: COL_W }} onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={task.note}
                        onChange={e => updateTask(task.id, { note: e.target.value })}
                        onClick={e => e.stopPropagation()}
                        placeholder="メモを入力..."
                        className="w-full text-[13px] px-2 py-0.5 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent focus:bg-card transition-colors placeholder-muted-foreground/50"
                      />
                    </div>
                    <div className="w-8 flex justify-end flex-shrink-0">
                      <button onClick={e => e.stopPropagation()} className="p-1 rounded text-transparent group-hover:text-muted-foreground hover:bg-muted transition-colors">
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {myTasks.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-[15px]">すべてのタスクが完了しています！</p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Members page */}
      {activeNav === "members" && (
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[15px] text-muted-foreground">{members.length}名のメンバー</p>
              <button
                onClick={() => { setNewMember({ name: "", initials: "", color: "#3b82f6", role: "", avatarUrl: "" }); setShowAddMember(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus size={13} />メンバーを追加
              </button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-[15px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[13px] text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">名前</th>
                    <th className="w-20 px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, i) => (
                    <tr key={member.id} className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar member={member} size="md" />
                          <div className="font-medium text-foreground text-[15px]">{member.name}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setEditingMember({ ...member })}
                            className="px-2.5 py-1 text-[13px] rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => setMembers(prev => prev.filter(m => m.id !== member.id))}
                            className="px-2.5 py-1 text-[13px] rounded-md border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors text-muted-foreground"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Member Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditingMember(null)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-medium text-foreground">メンバーを編集</h3>
              <button onClick={() => setEditingMember(null)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors"><X size={14} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1">名前</label>
                <input className="w-full text-[15px] border border-border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary" value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground block mb-2">プロフィール画像</label>
                <ImageDropZone value={editingMember.avatarUrl} onChange={url => setEditingMember({ ...editingMember, avatarUrl: url })} />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1">カラー</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="w-8 h-8 rounded cursor-pointer border border-border" value={editingMember.color} onChange={e => setEditingMember({ ...editingMember, color: e.target.value })} />
                  <span className="text-[13px] text-muted-foreground">{editingMember.color}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditingMember(null)} className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">キャンセル</button>
              <button
                onClick={() => { setMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m)); setEditingMember(null); }}
                className="flex-1 text-[13px] px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Member Add Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddMember(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-medium text-foreground">メンバーを追加</h3>
              <button onClick={() => setShowAddMember(false)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors"><X size={14} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1">名前</label>
                <input className="w-full text-[15px] border border-border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} placeholder="例）山田 太郎" />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground block mb-2">プロフィール画像（任意）</label>
                <ImageDropZone value={newMember.avatarUrl} onChange={url => setNewMember({ ...newMember, avatarUrl: url })} />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1">カラー</label>
                <input type="color" className="w-8 h-8 rounded cursor-pointer border border-border" value={newMember.color} onChange={e => setNewMember({ ...newMember, color: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowAddMember(false)} className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">キャンセル</button>
              <button
                disabled={!newMember.name.trim()}
                onClick={() => {
                  if (!newMember.name.trim()) return;
                  setMembers(prev => [...prev, { ...newMember, id: `m${Date.now()}` }]);
                  setShowAddMember(false);
                }}
                className="flex-1 text-[13px] px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-40"
              >追加</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddTask(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-foreground">新しいタスク</h3>
              <button onClick={() => setShowAddTask(false)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors">
                <X size={14} />
              </button>
            </div>
            <input
              autoFocus
              className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-3 placeholder-muted-foreground"
              placeholder="タスク名を入力..."
              value={newTaskName}
              onChange={e => setNewTaskName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
            />
            <div className="flex items-center gap-2 mb-4">
              <select
                value={newTaskSection}
                onChange={e => setNewTaskSection(e.target.value)}
                className="text-[13px] bg-muted text-foreground rounded-md px-2 py-1.5 outline-none border-0"
              >
                <option value="">セクション選択</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddTask(false)}
                className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={addTask}
                disabled={!newTaskName.trim()}
                className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                タスクを追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新規Webプロジェクト作成モーダル */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNewProject(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-foreground">Webサイト制作プロジェクトを追加</h3>
              <button onClick={() => setShowNewProject(false)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors">
                <X size={14} />
              </button>
            </div>
            <input
              autoFocus
              className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-3 placeholder-muted-foreground"
              placeholder="例：株式会社○○ コーポレートサイト"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addWebProject()}
            />
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-[13px] text-muted-foreground mb-2">以下のセクション・タスクが自動で作成されます：</p>
              {WEB_TEMPLATE.map(s => (
                <div key={s.section} className="mb-1.5">
                  <span className="text-[13px] font-medium text-foreground">{s.section}</span>
                  <span className="text-[13px] text-muted-foreground ml-2">{s.tasks.join("・")}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewProject(false)} className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                キャンセル
              </button>
              <button
                onClick={addWebProject}
                disabled={!newProjectName.trim()}
                className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                作成する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* その他案件：案件（セクション）追加モーダル */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddSection(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-foreground">案件を追加</h3>
              <button onClick={() => setShowAddSection(false)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors">
                <X size={14} />
              </button>
            </div>
            <input
              autoFocus
              className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-4 placeholder-muted-foreground"
              placeholder="例：ロゴ制作、チラシデザイン..."
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addOtherSection()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddSection(false)} className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                キャンセル
              </button>
              <button
                onClick={addOtherSection}
                disabled={!newSectionName.trim()}
                className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
