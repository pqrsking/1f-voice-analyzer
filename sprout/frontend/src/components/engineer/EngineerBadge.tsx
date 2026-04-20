const BADGE_META: Record<string, { icon: string; name: string; description: string }> = {
  nebula_builder:   { icon: "🌌", name: "Nebula Builder",    description: "Completed first build" },
  binary_star:      { icon: "⭐", name: "Binary Star",       description: "Built for 2+ categories" },
  pulsar:           { icon: "💫", name: "Pulsar",            description: "3 builds in 90 days" },
  galaxy_architect: { icon: "🌠", name: "Galaxy Architect",  description: "5 completed builds" },
  deep_field:       { icon: "🔭", name: "Deep Field",        description: "Built for a highly-wanted idea" },
  first_light:      { icon: "✨", name: "First Light",       description: "First to claim a new idea" },
  cosmic_web:       { icon: "🕸️",  name: "Cosmic Web",        description: "10+ builds across 4+ categories" },
};

interface Props {
  badgeIds: string[];
}

export default function EngineerBadge({ badgeIds }: Props) {
  if (!badgeIds.length) {
    return <p className="text-sm text-gray-400">No badges yet — claim your first idea to start!</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {badgeIds.map((id) => {
        const meta = BADGE_META[id];
        if (!meta) return null;
        return (
          <div
            key={id}
            title={meta.description}
            className="flex flex-col items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 cursor-default hover:bg-indigo-100 transition"
          >
            <span className="text-3xl">{meta.icon}</span>
            <span className="text-xs font-semibold text-indigo-700">{meta.name}</span>
          </div>
        );
      })}
    </div>
  );
}
