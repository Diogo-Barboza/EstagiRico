import {
  LayoutDashboard,
  Plus,
  Users,
  Settings,
  ArrowLeftRight,
} from "lucide-react";
import type { Category, View } from "./types";
import { Label } from "recharts";

export const CATEGORIES: Category[] = [
  "Food",
  "Fuel",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  Food: "Alimentação",
  Fuel: "Combustível",
  Shopping: "Compras",
  Entertainment: "Lazer",
  Health: "Saúde",
  Other: "Outros",
};

export const CATEGORY_META: Record<
  Category,
  { color: string; icon: string; bg: string; darkColor: string }
> = {
  Food: { color: "#E8924A", icon: "🍔", bg: "#FFF4E8", darkColor: "#F2A65A" },
  Fuel: { color: "#3D9E8C", icon: "⛽", bg: "#E8F7F4", darkColor: "#6BAE9E" },
  Shopping: {
    color: "#6B5FD8",
    icon: "🛍️",
    bg: "#EDEBFC",
    darkColor: "#8C82E3",
  },
  Entertainment: {
    color: "#D85F5F",
    icon: "🎬",
    bg: "#FCEAEA",
    darkColor: "#E8736A",
  },
  Health: { color: "#3D9E6E", icon: "💊", bg: "#E8F7EF", darkColor: "#5BAD8C" },
  Other: { color: "#6B7280", icon: "📦", bg: "#F3F4F6", darkColor: "#9BA3AF" },
};

export const PERSON_COLORS = [
  "#6B5FD8",
  "#D85F5F",
  "#3D9E8C",
  "#E8924A",
  "#3D9E6E",
  "#C97BB8",
  "#4A8FD4",
  "#8B7355",
];

export const NAV_TABS = [
  { id: "dashboard" as View, icon: LayoutDashboard, label: "Início" },
  { id: "add" as View, icon: Plus, label: "Novo" },
  { id: "people" as View, icon: Users, label: "Pessoas" },
  { id: "expenses" as View, icon: ArrowLeftRight, label: "Transações" },
  { id: "settings" as View, icon: Settings, label: "Config." },
] as const;

export const today = new Date();
export const todayStr = today.toISOString().split("T")[0];
