import {
  CheckCircle2,
  Download,
  Globe,
  Package,
  Paintbrush,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    num: 1,
    icon: Globe,
    title: "Enter Your Website URL",
    description:
      "Paste any website URL — a blog, portfolio, e-commerce store, or web app. We validate it instantly and show a live preview so you can confirm you have the right site.",
    tip: "Tip: Make sure your site works on mobile browsers for the best app experience.",
  },
  {
    num: 2,
    icon: Paintbrush,
    title: "Customize Your App Identity",
    description:
      "Give your app a name, a unique package ID (like com.yourname.appname), an app icon, and a splash screen color. These will be what users see on their Android home screen.",
    tip: "Tip: Use a 512×512px PNG icon for best quality across all screen densities.",
  },
  {
    num: 3,
    icon: Zap,
    title: "Enable Smart Features",
    description:
      "Toggle on Pull-to-Refresh so users can refresh with a swipe, Push Notifications for engagement, and File Upload & Download if your site handles files. Pick the minimum Android version to maximize compatibility.",
    tip: "Tip: Android 8.0 (API 26) covers ~95% of active devices.",
  },
  {
    num: 4,
    icon: Package,
    title: "Pick Your Output Format",
    description:
      "APK is an installable file you can send directly to testers. AAB is the Google Play Store format that uses optimized delivery. Choose Both to cover all scenarios.",
    tip: "Tip: Always use AAB when submitting to the Google Play Store.",
  },
  {
    num: 5,
    icon: Download,
    title: "Download & Build Your Android App",
    description:
      "Click Generate to download the complete Android Studio project as a ZIP file. Open it in Android Studio, run the build command, and your app is ready!",
    tip: "Tip: Read the included README.md for detailed signing and publishing instructions.",
  },
];

export default function Tutorial() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Beginner Tutorial</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Learn how to convert any website into a full Android app in 5 steps.
        </p>
      </div>
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-2 min-h-[24px]" />
                )}
              </div>
              <div className="pb-6 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    Step {step.num}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-base mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {step.description}
                </p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 border border-border">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-accent-foreground">{step.tip}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
