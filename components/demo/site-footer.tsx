export function SiteFooter() {
  return (
    <footer className="mt-6 flex flex-col items-center gap-2 border-t border-border/30 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-[10px] text-muted-foreground sm:text-left">
        © 2026 AetherGate Flip-Board. Authorized personnel only.
      </p>
      <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Crafted by</span>
        <span className="font-semibold tracking-wide text-primary">
          William Bond
        </span>
      </p>
    </footer>
  );
}
