import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Globe, Smartphone, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function LoginCard() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-4 overflow-hidden">
            <img
              src="/assets/generated/web2app-logo-transparent.dim_120x120.png"
              alt="Web2App Builder"
              className="w-14 h-14 object-contain"
            />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Web2App Builder
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Convert any website into a native Android application
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {(
            [
              { icon: Globe, label: "Any Website" },
              { icon: Smartphone, label: "APK & AAB" },
              { icon: Zap, label: "Instant Build" },
            ] as const
          ).map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <h2 className="font-display text-xl font-semibold mb-2">
            Sign in to continue
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in securely to save your projects, download history, and
            customize your Android apps.
          </p>
          <Button
            data-ocid="auth.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-11 text-base font-semibold"
          >
            {isLoggingIn ? "Connecting..." : "Sign In"}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Powered by Internet Identity — no password required
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
