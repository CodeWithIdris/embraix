import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const WaitlistBanner = () => {
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();

  if (!visible) return null;

  const text = "Join Our Waitlist → Get early access to AI insights, expert consultations, energy reports and new tools.";

  return (
    <div
      className="relative w-full h-10 bg-primary text-primary-foreground overflow-hidden flex items-center z-[60]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`flex whitespace-nowrap ${paused ? "" : "animate-ticker"}`}
        style={{ willChange: "transform" }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className="inline-flex items-center gap-4 px-8 text-sm font-medium">
            {text}
            <button
              onClick={() => navigate("/waitlist")}
              className="ml-2 px-3 py-0.5 rounded-full bg-primary-foreground text-primary text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Join Waitlist
            </button>
          </span>
        ))}
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary-foreground/20 rounded transition-colors"
        aria-label="Close banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default WaitlistBanner;
