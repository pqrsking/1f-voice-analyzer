"use client";

interface Filters {
  category: string;
  complexity: string;
  status: string;
  lang: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
}

const CATEGORIES = ["all", "environment", "health", "accessibility", "play", "safety", "other"];
const COMPLEXITIES = ["all", "beginner", "intermediate", "advanced", "research"];
const STATUSES = ["specced", "claimed", "building", "deployed", "all"];
const LANGS = [
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
];

export default function FilterSidebar({ filters, onChange }: Props) {
  return (
    <aside className="w-56 shrink-0 font-engineer space-y-6">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="w-full border border-engineer-border rounded-lg px-3 py-2 text-sm bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Complexity
        </label>
        <select
          value={filters.complexity}
          onChange={(e) => onChange({ complexity: e.target.value })}
          className="w-full border border-engineer-border rounded-lg px-3 py-2 text-sm bg-white"
        >
          {COMPLEXITIES.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All levels" : c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="w-full border border-engineer-border rounded-lg px-3 py-2 text-sm bg-white"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Spec language
        </label>
        <select
          value={filters.lang}
          onChange={(e) => onChange({ lang: e.target.value })}
          className="w-full border border-engineer-border rounded-lg px-3 py-2 text-sm bg-white"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>
    </aside>
  );
}
