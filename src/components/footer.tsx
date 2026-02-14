import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-card-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted">
            SafetyScore — AI safety ratings for everyone.
          </p>
          <nav className="flex gap-6">
            <Link
              href="/about"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Methodology
            </Link>
          </nav>
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Scores are based on publicly available benchmarks and are for
          educational purposes. They do not constitute endorsements or guarantees
          of safety.
        </p>
      </div>
    </footer>
  );
}
