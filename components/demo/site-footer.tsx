import { footerCopy } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="mt-6 flex flex-col items-center gap-2 border-t border-border/30 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-[10px] leading-relaxed text-muted-foreground sm:text-left sm:text-xs">
        {footerCopy.line}
      </p>
      <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs">
        <span>{footerCopy.craftedBy}</span>
        <span className="font-semibold tracking-wide text-primary">
          {footerCopy.author}
        </span>
      </p>
    </footer>
  );
}
