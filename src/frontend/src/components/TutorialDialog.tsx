import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Globe, Package, Paintbrush, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const TUTORIAL_KEY = "web2app_tutorial_seen";

const steps = [
  {
    icon: Globe,
    title: "Enter Your Website URL",
    description:
      "Paste any website URL — a blog, portfolio, e-commerce store, or web app. We validate it instantly and show you a live preview.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Paintbrush,
    title: "Customize Your App Identity",
    description:
      "Give your app a name, unique package ID, custom icon, and a splash screen color. This is what users see on their home screen.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "Enable Smart Features",
    description:
      "Toggle Pull-to-Refresh, Push Notifications, and File Upload. Pick the minimum Android version your app should support.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Package,
    title: "Pick Your Output Format",
    description:
      "Choose APK for direct device installation and testing, AAB for Google Play Store publishing, or both to cover all use cases.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Download,
    title: "Download & Build Your App",
    description:
      "Download the complete Android project ZIP. Open it in Android Studio, run the build command, and your app is ready!",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export default function TutorialDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_KEY)) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function handleClose() {
    localStorage.setItem(TUTORIAL_KEY, "1");
    setOpen(false);
    setStep(0);
  }

  const current = steps[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent data-ocid="tutorial.dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Welcome to Web2App Builder 🚀
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-1.5 mb-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div
              className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${current.bg}`}
            >
              <Icon className={`w-7 h-7 ${current.color}`} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg mb-1">
                Step {step + 1}: {current.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {current.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {step + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            <Button
              data-ocid="tutorial.close_button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              Skip
            </Button>
            <Button
              data-ocid="tutorial.next_button"
              size="sm"
              onClick={() =>
                step < steps.length - 1 ? setStep((s) => s + 1) : handleClose()
              }
            >
              {step < steps.length - 1 ? "Next →" : "Got it!"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
