import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex items-center justify-between gap-4 flex-wrap mb-6 sm:mb-8">
      <div>
        <h1 
          className="text-2xl font-semibold tracking-tight text-foreground"
          data-testid="text-app-title"
        >
          Aligned
        </h1>
        <p className="text-sm text-muted-foreground">
          Live your calling with clarity, peace, and structure.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p 
            className="text-xs uppercase tracking-wide text-muted-foreground font-medium"
            data-testid="text-current-date"
          >
            {formattedDate}
          </p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
