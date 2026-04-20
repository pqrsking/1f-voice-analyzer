interface Props {
  emotionDriver: string;
  imaginedUser: string;
  magicMoment: string;
  childsExactWords?: string | null;
}

export default function EmpathyHeart({ emotionDriver, imaginedUser, magicMoment, childsExactWords }: Props) {
  return (
    <section
      className="rounded-2xl p-6 border-l-4"
      style={{ background: "#FFF8E1", borderColor: "#F6AD55" }}
    >
      <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-700 mb-4">
        <span>💛</span>
        <span>Child&apos;s Heart</span>
        <span className="text-sm font-normal text-amber-500">— Read this before you claim</span>
      </h3>

      <div className="space-y-4 text-gray-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-1">
            What drove this idea
          </p>
          <p className="text-base leading-relaxed">{emotionDriver}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-1">
            Who they imagine using it
          </p>
          <p className="text-base leading-relaxed">{imaginedUser}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-1">
            The magic moment they dream of
          </p>
          <p className="text-base leading-relaxed">{magicMoment}</p>
        </div>

        {childsExactWords && (
          <blockquote className="border-l-2 border-amber-400 pl-4 italic text-amber-800 text-base">
            &ldquo;{childsExactWords}&rdquo;
          </blockquote>
        )}
      </div>
    </section>
  );
}
