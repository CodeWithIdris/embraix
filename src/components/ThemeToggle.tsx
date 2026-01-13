import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  variant?: "icon" | "menu";
  className?: string;
}

export const ThemeToggle = ({ variant = "icon", className }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  if (variant === "menu") {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground ${className}`}
      >
        {theme === "dark" ? (
          <>
            <Sun className="w-4 h-4" />
            Light Mode
          </>
        ) : (
          <>
            <Moon className="w-4 h-4" />
            Dark Mode
          </>
        )}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={className}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
};
