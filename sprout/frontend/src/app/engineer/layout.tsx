import Link from "next/link";

export default function EngineerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-engineer-bg font-engineer">
      <nav className="bg-white border-b border-engineer-border px-6 py-4 flex items-center gap-6">
        <Link href="/engineer" className="flex items-center gap-2 font-bold text-engineer-accent text-lg">
          🌱 <span>SPROUT</span>
          <span className="text-xs font-normal text-gray-400 ml-1">Engineer Portal</span>
        </Link>
        <div className="flex gap-4 ml-auto text-sm text-gray-600">
          <Link href="/engineer" className="hover:text-engineer-accent">Ideas</Link>
          <Link href="/engineer/radar" className="hover:text-engineer-accent">Need Radar</Link>
          <Link href="/" className="hover:text-gray-900">← Switch to Child Mode</Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
