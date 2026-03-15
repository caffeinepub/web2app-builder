import { generateAndroidProject } from "@/androidProjectGenerator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useAddDownloadRecord,
  useCreateProject,
  useUpdateProject,
} from "@/hooks/useQueries";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  Download,
  FolderOpen,
  Globe,
  Loader2,
  Package,
  Paintbrush,
  RefreshCw,
  Smartphone,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Project } from "../backend.d";

type OutputFormat = "apk" | "aab" | "both";

interface BuilderProps {
  editProject?: Project | null;
  onSaved?: () => void;
}

const SDK_OPTIONS = [
  { label: "Android 7.0 (API 24)", value: 24 },
  { label: "Android 8.0 (API 26)", value: 26 },
  { label: "Android 9.0 (API 28)", value: 28 },
  { label: "Android 10 (API 29)", value: 29 },
  { label: "Android 11 (API 30)", value: 30 },
];

const STEPS = [
  { label: "Website URL", icon: Globe },
  { label: "Customize", icon: Paintbrush },
  { label: "Output Format", icon: Package },
  { label: "Generate", icon: Download },
];

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function toPackageName(appName: string) {
  const safe = appName.toLowerCase().replace(/[^a-z0-9]/g, "") || "app";
  return `com.example.${safe}`;
}

function GeneratingProgress() {
  const [progress, setProgress] = useState(0);
  useState(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const p = Math.min(((Date.now() - start) / 2000) * 95, 95);
      setProgress(p);
      if (p >= 95) clearInterval(iv);
    }, 50);
    return () => clearInterval(iv);
  });
  return <Progress value={progress} className="h-2" />;
}

export default function Builder({ editProject, onSaved }: BuilderProps) {
  const [step, setStep] = useState(0);
  const [url, setUrl] = useState(editProject?.websiteUrl ?? "");
  const [appName, setAppName] = useState(editProject?.appName ?? "");
  const [packageName, setPackageName] = useState(
    editProject?.packageName ?? "",
  );
  const [splashColor, setSplashColor] = useState(
    editProject?.splashColor ?? "#3DDC84",
  );
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(
    (editProject?.outputFormat as OutputFormat) ?? "apk",
  );
  const [minSdk, setMinSdk] = useState(
    editProject ? Number(editProject.minSdk) : 26,
  );
  const [iconDataUrl, setIconDataUrl] = useState<string | undefined>();
  const [features, setFeatures] = useState({
    pullToRefresh: editProject?.features.pullToRefresh ?? false,
    pushNotifications: editProject?.features.pushNotifications ?? false,
    fileUpload: editProject?.features.fileUpload ?? false,
  });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(
    editProject?.id ?? null,
  );

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const addDownloadRecord = useAddDownloadRecord();

  const urlValid = isValidUrl(url);

  const handleAppNameChange = useCallback(
    (value: string) => {
      setAppName(value);
      if (!editProject) setPackageName(toPackageName(value));
    },
    [editProject],
  );

  function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setIconDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSaveProject() {
    const args = {
      appName,
      websiteUrl: url,
      packageName,
      splashColor,
      outputFormat,
      minSdk: BigInt(minSdk),
      features,
      iconKey: null as string | null,
    };
    try {
      if (savedProjectId) {
        await updateProject.mutateAsync({ id: savedProjectId, ...args });
        toast.success("Project updated!");
      } else {
        const p = await createProject.mutateAsync(args);
        setSavedProjectId(p.id);
        toast.success("Project saved!");
      }
      onSaved?.();
    } catch {
      toast.error("Failed to save project");
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenerated(false);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      await generateAndroidProject({
        appName,
        packageName,
        websiteUrl: url,
        splashColor,
        features,
        outputFormat,
        minSdk,
        iconDataUrl,
      });
      setGenerated(true);
      if (savedProjectId)
        await addDownloadRecord.mutateAsync({
          projectId: savedProjectId,
          format: outputFormat,
        });
      toast.success("Android project downloaded!");
    } catch {
      toast.error("Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.label} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-4 h-px ${isDone ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-2xl font-bold mb-1">
                Enter Website URL
              </h2>
              <p className="text-muted-foreground text-sm">
                The website you want to convert into an Android app.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                data-ocid="step1.input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-website.com"
                className="h-11 text-base"
              />
              {url && !urlValid && (
                <p className="text-destructive text-xs">
                  Please enter a valid URL starting with https://
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Live Preview
              </Label>
              <div
                className="rounded-xl border border-border overflow-hidden bg-muted"
                style={{ height: 300 }}
              >
                {urlValid ? (
                  <iframe
                    src={url}
                    className="w-full h-full"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    title="Website Preview"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Globe className="w-10 h-10 opacity-30" />
                    <p className="text-sm">
                      {url ? "Invalid URL" : "Enter a URL to see a preview"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                data-ocid="step1.primary_button"
                onClick={() => setStep(1)}
                disabled={!urlValid}
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-2xl font-bold mb-1">
                Customize Your App
              </h2>
              <p className="text-muted-foreground text-sm">
                Give your app a name, icon, and identity.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name *</Label>
                <Input
                  id="appName"
                  data-ocid="step2.input"
                  value={appName}
                  onChange={(e) => handleAppNameChange(e.target.value)}
                  placeholder="My Awesome App"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg">Package Name</Label>
                <Input
                  id="pkg"
                  data-ocid="step2.package_input"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="com.example.myapp"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>App Icon</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {iconDataUrl ? (
                    <img
                      src={iconDataUrl}
                      alt="icon"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Smartphone className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <label
                    data-ocid="step2.upload_button"
                    htmlFor="icon-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Upload Icon
                  </label>
                  <input
                    id="icon-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIconUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG or JPG, 512×512px recommended
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Splash Screen Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={splashColor}
                  onChange={(e) => setSplashColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <Input
                  value={splashColor}
                  onChange={(e) => setSplashColor(e.target.value)}
                  className="font-mono w-36 text-sm"
                  placeholder="#3DDC84"
                />
                <div
                  className="w-10 h-10 rounded-lg border border-border"
                  style={{ backgroundColor: splashColor }}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Features</Label>
              {[
                {
                  key: "pullToRefresh" as const,
                  icon: RefreshCw,
                  label: "Pull to Refresh",
                  ocid: "step2.pulltorefresh.switch",
                },
                {
                  key: "pushNotifications" as const,
                  icon: Bell,
                  label: "Push Notifications",
                  ocid: "step2.notifications.switch",
                },
                {
                  key: "fileUpload" as const,
                  icon: FolderOpen,
                  label: "File Upload & Download",
                  ocid: "step2.fileupload.switch",
                },
              ].map(({ key, icon: Icon, label, ocid }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <Switch
                    data-ocid={ocid}
                    checked={features[key]}
                    onCheckedChange={(v) =>
                      setFeatures((f) => ({ ...f, [key]: v }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Minimum Android Version</Label>
              <Select
                value={String(minSdk)}
                onValueChange={(v) => setMinSdk(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SDK_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                data-ocid="step2.primary_button"
                onClick={() => setStep(2)}
                disabled={!appName.trim() || !packageName.trim()}
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-2xl font-bold mb-1">
                Output Format
              </h2>
              <p className="text-muted-foreground text-sm">
                Choose how to package your Android app.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: "apk" as const,
                  title: "APK",
                  badge: "Direct Install",
                  desc: "Installable file for direct testing and sideloading.",
                  ocid: "step3.apk.toggle",
                },
                {
                  id: "aab" as const,
                  title: "AAB",
                  badge: "Play Store",
                  desc: "Android App Bundle required for Google Play publishing.",
                  ocid: "step3.aab.toggle",
                },
                {
                  id: "both" as const,
                  title: "Both",
                  badge: "Recommended",
                  desc: "Generates both APK and AAB for all use cases.",
                  ocid: "step3.both.toggle",
                },
              ].map((fmt) => (
                <button
                  type="button"
                  key={fmt.id}
                  data-ocid={fmt.ocid}
                  onClick={() => setOutputFormat(fmt.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    outputFormat === fmt.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-display font-bold text-lg">
                      {fmt.title}
                    </span>
                    <Badge
                      variant={
                        outputFormat === fmt.id ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {fmt.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {fmt.desc}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                data-ocid="step3.primary_button"
                onClick={() => setStep(3)}
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="s4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-2xl font-bold mb-1">
                Generate & Download
              </h2>
              <p className="text-muted-foreground text-sm">
                Review your configuration and download your Android project.
              </p>
            </div>
            <Card>
              <CardContent className="pt-4 space-y-0">
                <h3 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">
                  Configuration Summary
                </h3>
                {(
                  [
                    ["Website URL", url],
                    ["App Name", appName],
                    ["Package Name", packageName],
                    ["Output Format", outputFormat.toUpperCase()],
                    [
                      "Min Android SDK",
                      SDK_OPTIONS.find((o) => o.value === minSdk)?.label ??
                        minSdk,
                    ],
                    ["Splash Color", splashColor],
                    [
                      "Pull to Refresh",
                      features.pullToRefresh ? "Enabled" : "Disabled",
                    ],
                    [
                      "Push Notifications",
                      features.pushNotifications ? "Enabled" : "Disabled",
                    ],
                    [
                      "File Upload",
                      features.fileUpload ? "Enabled" : "Disabled",
                    ],
                  ] as [string, unknown][]
                ).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0"
                  >
                    <span className="text-xs text-muted-foreground shrink-0">
                      {k}
                    </span>
                    <span className="text-xs font-medium text-right truncate max-w-xs">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            {generating && (
              <div data-ocid="step4.loading_state" className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Android project...</span>
                </div>
                <GeneratingProgress />
              </div>
            )}
            {generated && !generating && (
              <motion.div
                data-ocid="step4.success_state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Project generated! Check your Downloads folder.</span>
              </motion.div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                data-ocid="step4.save_button"
                variant="outline"
                onClick={handleSaveProject}
                disabled={createProject.isPending || updateProject.isPending}
                className="sm:flex-1"
              >
                {(createProject.isPending || updateProject.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Project
              </Button>
              <Button
                data-ocid="step4.primary_button"
                onClick={handleGenerate}
                disabled={generating}
                className="sm:flex-1"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Generate & Download ZIP
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
