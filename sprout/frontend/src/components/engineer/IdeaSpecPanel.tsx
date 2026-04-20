import EmpathyHeart from "./EmpathyHeart";

interface Requirement {
  id: string;
  priority: "must" | "should" | "could";
  text: string;
}

interface Spec {
  idea_id: string;
  language: string;
  problem_statement: string;
  core_requirements: Requirement[];
  suggested_tech: string[];
  complexity_level: string;
  estimated_hours?: number | null;
  open_questions: string[];
  emotion_driver: string;
  imagined_user: string;
  magic_moment: string;
  childs_exact_words?: string | null;
}

interface Props {
  spec: Spec;
  onClaim?: () => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  must: "bg-red-100 text-red-700",
  should: "bg-yellow-100 text-yellow-700",
  could: "bg-green-100 text-green-700",
};

const COMPLEXITY_LABEL: Record<string, string> = {
  beginner: "🟢 Beginner",
  intermediate: "🟡 Intermediate",
  advanced: "🔴 Advanced",
  research: "🔬 Research",
};

export default function IdeaSpecPanel({ spec, onClaim }: Props) {
  return (
    <article className="space-y-8 font-engineer max-w-3xl">
      {/* Problem Statement */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Problem Statement</h2>
        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
          {spec.problem_statement}
        </div>
      </section>

      {/* Core Requirements */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Core Requirements</h2>
        <ol className="space-y-3">
          {spec.core_requirements.map((req) => (
            <li key={req.id} className="flex gap-3 items-start">
              <span className={`text-xs font-bold px-2 py-1 rounded mt-0.5 shrink-0 ${PRIORITY_STYLES[req.priority] ?? ""}`}>
                {req.priority.toUpperCase()}
              </span>
              <span className="text-gray-700">{req.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Suggested Tech */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Suggested Technology</h2>
        <div className="flex flex-wrap gap-2">
          {spec.suggested_tech.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Complexity */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Complexity & Effort</h2>
        <div className="flex gap-4 items-center">
          <span className="text-lg font-semibold">
            {COMPLEXITY_LABEL[spec.complexity_level] ?? spec.complexity_level}
          </span>
          {spec.estimated_hours && (
            <span className="text-gray-500 text-sm">~{spec.estimated_hours} hours estimated</span>
          )}
        </div>
      </section>

      {/* Open Questions */}
      {spec.open_questions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Open Questions</h2>
          <ul className="space-y-2">
            {spec.open_questions.map((q, i) => (
              <li key={i} className="flex gap-2 text-gray-600 italic">
                <span className="text-gray-400 shrink-0">?</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Child's Heart — placed last, just before claim */}
      <EmpathyHeart
        emotionDriver={spec.emotion_driver}
        imaginedUser={spec.imagined_user}
        magicMoment={spec.magic_moment}
        childsExactWords={spec.childs_exact_words}
      />

      {/* Claim CTA */}
      {onClaim && (
        <div className="sticky bottom-0 bg-white/90 backdrop-blur pt-4 pb-6 -mx-4 px-4 border-t border-gray-100">
          <button
            onClick={onClaim}
            className="w-full bg-engineer-accent text-white font-semibold text-lg py-4 rounded-2xl hover:bg-indigo-700 transition-colors"
          >
            🚀 Claim This Idea — Start Building
          </button>
        </div>
      )}
    </article>
  );
}
