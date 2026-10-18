
import { useTheme } from "./ThemeContext";
import "./ThemeToggle.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-container">
      <span>{theme === "light" ? "Light" : "Dark"}</span>

      <button
        type="button"
        className={`theme-switch ${theme === "dark" ? "active" : ""}`}
        onClick={toggleTheme}
        aria-label="Toggle theme"
        aria-pressed={theme === "dark"}
      >
        <span className="theme-switch-circle">
          {theme === "light" ? "☀️" : "🌙"}
        </span>
      </button>
    </div>
  );
}

export default ThemeToggle;
