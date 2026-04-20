"use client";
import Link from "next/link";

export default function ChildHome() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="text-8xl mb-6 animate-float inline-block">🌱</div>
      <h1 className="text-4xl font-extrabold text-sprout-green mb-3">
        きみのアイデアが<br/>世界を変える！
      </h1>
      <p className="text-lg text-gray-500 max-w-md mb-10 leading-relaxed">
        「こんなのあったらいいな」と思ったこと、Sproutに話してみよう。
        世界中の技術者さんが、きみのアイデアを本当のものにするかもしれないよ！
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/child/idea"
          className="bg-sprout-green text-white text-2xl font-bold py-5 rounded-3xl shadow-lg hover:scale-105 transition-transform text-center"
        >
          💡 アイデアを話す
        </Link>
        <Link
          href="/child/wall"
          className="bg-white border-2 border-sprout-green text-sprout-green text-lg font-semibold py-4 rounded-3xl hover:scale-105 transition-transform text-center"
        >
          🌍 世界のアイデアを見る
        </Link>
      </div>

      <p className="mt-10 text-sm text-gray-300 max-w-xs">
        名前もメールアドレスも教えなくていいよ。<br/>
        きみのプライバシーをしっかり守ってるよ🔒
      </p>
    </main>
  );
}
