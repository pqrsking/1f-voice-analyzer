import ConstellationBadge from "@/components/child/ConstellationBadge";

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sprout-bg to-sprout-bgalt font-child">
      <ConstellationBadge />
      {children}
    </div>
  );
}
