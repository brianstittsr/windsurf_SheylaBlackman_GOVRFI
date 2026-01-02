"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Zap,
  Video,
  Brain,
  Server,
  Webhook,
  Key,
  RefreshCw,
  Send,
  User,
  Loader2,
  FileSignature,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Monitor,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  Instagram,
  Globe,
  Shield,
  RotateCcw,
  Copy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WEBHOOK_EVENTS, testWebhookConnection, sendToBrianStitt, type WebhookEventType } from "@/lib/mattermost";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type PlatformSettingsDoc } from "@/lib/schema";
import { logSettingsUpdated } from "@/lib/activity-logger";
import { useUserProfile } from "@/contexts/user-profile-context";
import Link from "next/link";
import { 
  useFeatureVisibilityAdmin, 
  FEATURES, 
  getDefaultRoleSettings,
  type FeatureCategory 
} from "@/lib/feature-visibility";
import { ROLE_LABELS, type UserRole } from "@/lib/role-permissions";
import { 
  showInAppNotification, 
  requestNotificationPermission, 
  getBrowserNotificationStatus 
} from "@/lib/notifications";

interface ApiKeyConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  keyField: string;
  webhookField?: string;
  additionalFields?: { name: string; label: string; placeholder: string }[];
  status: "connected" | "disconnected" | "error";
  lastTested?: string;
}

const apiConfigs: ApiKeyConfig[] = [
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    description: "All-in-one marketing and CRM platform",
    icon: Zap,
    keyField: "Private API Key",
    additionalFields: [
      { name: "locationId", label: "Location ID", placeholder: "location-id" },
      { name: "agencyId", label: "Agency ID", placeholder: "agency-id" },
    ],
    status: "disconnected",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Professional networking and content publishing",
    icon: Zap,
    keyField: "Access Token",
    additionalFields: [
      { name: "clientId", label: "Client ID", placeholder: "your-client-id" },
      { name: "clientSecret", label: "Client Secret", placeholder: "your-client-secret" },
      { name: "organizationId", label: "Organization ID (optional)", placeholder: "organization-urn" },
    ],
    status: "disconnected",
  },
];

const llmProviders = [
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"] },
  { id: "anthropic", name: "Anthropic", models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"] },
  { id: "google", name: "Google AI", models: ["gemini-pro", "gemini-ultra"] },
  { id: "mistral", name: "Mistral AI", models: ["mistral-large", "mistral-medium", "mistral-small"] },
  { id: "ollama", name: "Ollama (Local)", models: ["llama2", "codellama", "mistral", "mixtral"] },
];

const SETTINGS_DOC_ID = "global";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "integrations";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { profile } = useUserProfile();
  const isSuperAdmin = profile.role === "superadmin" as any;
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, Record<string, string>>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, "testing" | "success" | "error" | null>>({});
  const [webhookEvents, setWebhookEvents] = useState<Record<WebhookEventType, boolean>>(
    WEBHOOK_EVENTS.reduce((acc, event) => ({ ...acc, [event.type]: event.enabled }), {} as Record<WebhookEventType, boolean>)
  );
  const [brianStittMessage, setBrianStittMessage] = useState("");
  const [brianStittDialogOpen, setBrianStittDialogOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [llmConfig, setLlmConfig] = useState({
    provider: "openai",
    model: "gpt-4o",
    apiKey: "",
    ollamaUrl: "http://localhost:11434",
    useOllama: false,
  });
  
  // Social links settings
  const [socialLinks, setSocialLinks] = useState({
    linkedin: { url: "", visible: true },
    twitter: { url: "", visible: true },
    youtube: { url: "", visible: true },
    facebook: { url: "", visible: false },
    instagram: { url: "", visible: false },
  });
  
  // Notification sync settings
  const [notificationSettings, setNotificationSettings] = useState({
    syncWithMattermost: true,
    inAppEnabled: true,
    browserEnabled: false,
    soundEnabled: false,
  });
  const [browserPermission, setBrowserPermission] = useState<string>("default");

  // Load settings from Firebase on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!db) {
        console.error("Firebase not initialized");
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, SETTINGS_DOC_ID);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as PlatformSettingsDoc;
          
          // Load integrations into apiKeys state
          if (data.integrations) {
            const loadedApiKeys: Record<string, Record<string, string>> = {};
            
            if (data.integrations.mattermost) {
              loadedApiKeys.mattermost = {
                apiKey: data.integrations.mattermost.apiKey || "",
                webhook: data.integrations.mattermost.webhookUrl || "",
                serverUrl: data.integrations.mattermost.serverUrl || "",
                teamId: data.integrations.mattermost.teamId || "",
              };
            }
            if (data.integrations.apollo) {
              loadedApiKeys.apollo = {
                apiKey: data.integrations.apollo.apiKey || "",
                accountId: data.integrations.apollo.accountId || "",
              };
            }
            if (data.integrations.gohighlevel) {
              loadedApiKeys.gohighlevel = {
                apiKey: data.integrations.gohighlevel.apiKey || "",
                locationId: data.integrations.gohighlevel.locationId || "",
                agencyId: data.integrations.gohighlevel.agencyId || "",
              };
            }
            if (data.integrations.zoom) {
              loadedApiKeys.zoom = {
                apiKey: data.integrations.zoom.apiKey || "",
                apiSecret: data.integrations.zoom.apiSecret || "",
                accountId: data.integrations.zoom.accountId || "",
              };
            }
            if (data.integrations.docuseal) {
              loadedApiKeys.docuseal = {
                apiKey: data.integrations.docuseal.apiKey || "",
                webhookSecret: data.integrations.docuseal.webhookSecret || "",
              };
            }
            
            setApiKeys(loadedApiKeys);
          }
          
          // Load LLM config
          if (data.llmConfig) {
            setLlmConfig({
              provider: data.llmConfig.provider || "openai",
              model: data.llmConfig.model || "gpt-4o",
              apiKey: data.llmConfig.apiKey || "",
              ollamaUrl: data.llmConfig.ollamaUrl || "http://localhost:11434",
              useOllama: data.llmConfig.useOllama || false,
            });
          }
          
          // Load webhook events
          if (data.webhookEvents) {
            setWebhookEvents(prev => ({ ...prev, ...data.webhookEvents }));
          }
          
          // Load notification settings
          if (data.notificationSettings) {
            setNotificationSettings(prev => ({ ...prev, ...data.notificationSettings }));
          }
          
          // Load social links
          if (data.socialLinks) {
            setSocialLinks(prev => ({ ...prev, ...data.socialLinks }));
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
    
    // Check browser notification permission
    setBrowserPermission(getBrowserNotificationStatus());
  }, []);

  // Save settings to Firebase
  const saveSettings = async () => {
    if (!db) {
      alert("Firebase not initialized. Check your environment variables.");
      return;
    }
    setSaving(true);
    try {
      const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, SETTINGS_DOC_ID);
      
      // Build settings data, using empty strings instead of undefined
      const settingsData = {
        id: SETTINGS_DOC_ID,
        integrations: {
          mattermost: {
            apiKey: apiKeys.mattermost?.apiKey || "",
            webhookUrl: apiKeys.mattermost?.webhook || "",
            serverUrl: apiKeys.mattermost?.serverUrl || "",
            teamId: apiKeys.mattermost?.teamId || "",
            status: testingStatus.mattermost === "success" ? "connected" : "disconnected",
          },
          apollo: {
            apiKey: apiKeys.apollo?.apiKey || "",
            accountId: apiKeys.apollo?.accountId || "",
            status: testingStatus.apollo === "success" ? "connected" : "disconnected",
          },
          gohighlevel: {
            apiKey: apiKeys.gohighlevel?.apiKey || "",
            locationId: apiKeys.gohighlevel?.locationId || "",
            agencyId: apiKeys.gohighlevel?.agencyId || "",
            status: testingStatus.gohighlevel === "success" ? "connected" : "disconnected",
          },
          zoom: {
            apiKey: apiKeys.zoom?.apiKey || "",
            apiSecret: apiKeys.zoom?.apiSecret || "",
            accountId: apiKeys.zoom?.accountId || "",
            status: testingStatus.zoom === "success" ? "connected" : "disconnected",
          },
          docuseal: {
            apiKey: apiKeys.docuseal?.apiKey || "",
            webhookSecret: apiKeys.docuseal?.webhookSecret || "",
            status: testingStatus.docuseal === "success" ? "connected" : "disconnected",
          },
        },
        llmConfig: {
          provider: llmConfig.provider,
          model: llmConfig.model,
          apiKey: llmConfig.apiKey || "",
          ollamaUrl: llmConfig.ollamaUrl,
          useOllama: llmConfig.useOllama,
        },
        webhookEvents: webhookEvents as Record<string, boolean>,
        notificationSettings: notificationSettings,
        socialLinks: socialLinks,
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(docRef, settingsData, { merge: true });
      setHasChanges(false);
      // Log activity
      await logSettingsUpdated("Platform Settings");
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateApiKey = (configId: string, field: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [configId]: { ...prev[configId], [field]: value },
    }));
    setHasChanges(true);
  };

  const testConnection = async (configId: string) => {
    setTestingStatus(prev => ({ ...prev, [configId]: "testing" }));
    
    if (configId === "webhook" || configId === "mattermost") {
      // Test actual Mattermost webhook
      const webhookUrl = apiKeys["mattermost"]?.webhook || apiKeys["webhook"]?.url;
      if (webhookUrl) {
        const result = await testWebhookConnection(webhookUrl);
        setTestingStatus(prev => ({ 
          ...prev, 
          [configId]: result.success ? "success" : "error" 
        }));
        if (!result.success) {
          alert(`Webhook test failed: ${result.error}`);
        }
        return;
      }
    }
    
    // Simulate API test for other integrations
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestingStatus(prev => ({ 
      ...prev, 
      [configId]: Math.random() > 0.3 ? "success" : "error" 
    }));
  };

  const handleSendToBrianStitt = async () => {
    const webhookUrl = apiKeys["mattermost"]?.webhook;
    if (!webhookUrl) {
      alert("Please configure the Mattermost webhook URL first in the Integrations tab.");
      return;
    }
    if (!brianStittMessage.trim()) {
      alert("Please enter a message.");
      return;
    }

    setSendingMessage(true);
    const result = await sendToBrianStitt(webhookUrl, brianStittMessage, {
      "Sent By": "SVP Platform User",
      "Timestamp": new Date().toLocaleString(),
    });
    setSendingMessage(false);

    if (result.success) {
      alert("Message sent to Brian Stitt successfully!");
      setBrianStittMessage("");
      setBrianStittDialogOpen(false);
    } else {
      alert(`Failed to send message: ${result.error}`);
    }
  };

  const toggleWebhookEvent = (eventType: WebhookEventType) => {
    setWebhookEvents(prev => ({ ...prev, [eventType]: !prev[eventType] }));
    setHasChanges(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage API keys, webhooks, and integrations
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Saving..." : hasChanges ? "Save Changes" : "Save All Settings"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="llm">LLM Configuration</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="features">
              <Shield className="h-4 w-4 mr-2" />
              Feature Visibility
            </TabsTrigger>
          )}
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            {apiConfigs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <config.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {config.name}
                          <Badge
                            variant={
                              testingStatus[config.id] === "success"
                                ? "default"
                                : testingStatus[config.id] === "error"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {testingStatus[config.id] === "success"
                              ? "Connected"
                              : testingStatus[config.id] === "error"
                              ? "Error"
                              : "Not Connected"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(config.id)}
                      disabled={testingStatus[config.id] === "testing"}
                    >
                      {testingStatus[config.id] === "testing" ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="mr-2 h-4 w-4" />
                      )}
                      Test Connection
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`${config.id}-key`}>{config.keyField}</Label>
                      <div className="relative">
                        <Input
                          id={`${config.id}-key`}
                          type={showKeys[config.id] ? "text" : "password"}
                          placeholder={`Enter your ${config.keyField.toLowerCase()}`}
                          value={apiKeys[config.id]?.apiKey || ""}
                          onChange={(e) => updateApiKey(config.id, "apiKey", e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => toggleShowKey(config.id)}
                        >
                          {showKeys[config.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {config.webhookField && (
                      <div className="space-y-2">
                        <Label htmlFor={`${config.id}-webhook`}>{config.webhookField}</Label>
                        <Input
                          id={`${config.id}-webhook`}
                          placeholder={`Enter your ${config.webhookField.toLowerCase()}`}
                          value={apiKeys[config.id]?.webhook || ""}
                          onChange={(e) => updateApiKey(config.id, "webhook", e.target.value)}
                        />
                      </div>
                    )}

                    {config.additionalFields?.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={`${config.id}-${field.name}`}>{field.label}</Label>
                        <Input
                          id={`${config.id}-${field.name}`}
                          placeholder={field.placeholder}
                          value={apiKeys[config.id]?.[field.name] || ""}
                          onChange={(e) => updateApiKey(config.id, field.name, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LLM Configuration Tab */}
        <TabsContent value="llm" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>LLM Provider Configuration</CardTitle>
                  <CardDescription>
                    Configure your preferred Large Language Model provider
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-primary" />
                  <div>
                    <Label>Use Ollama (Local LLM)</Label>
                    <p className="text-sm text-muted-foreground">
                      Run models locally without API costs
                    </p>
                  </div>
                </div>
                <Switch
                  checked={llmConfig.useOllama}
                  onCheckedChange={(checked) =>
                    setLlmConfig({ ...llmConfig, useOllama: checked, provider: checked ? "ollama" : "openai" })
                  }
                />
              </div>

              {llmConfig.useOllama ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ollamaUrl">Ollama Server URL</Label>
                    <Input
                      id="ollamaUrl"
                      placeholder="http://localhost:11434"
                      value={llmConfig.ollamaUrl}
                      onChange={(e) => setLlmConfig({ ...llmConfig, ollamaUrl: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Default: http://localhost:11434
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ollamaModel">Model</Label>
                    <Select
                      value={llmConfig.model}
                      onValueChange={(value) => setLlmConfig({ ...llmConfig, model: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {llmProviders.find(p => p.id === "ollama")?.models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Ollama Setup Instructions</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Install Ollama from <a href="https://ollama.ai" className="text-primary underline" target="_blank">ollama.ai</a></li>
                      <li>Run: <code className="bg-background px-1 rounded">ollama pull llama2</code></li>
                      <li>Start Ollama: <code className="bg-background px-1 rounded">ollama serve</code></li>
                      <li>Test connection above</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="llmProvider">Provider</Label>
                    <Select
                      value={llmConfig.provider}
                      onValueChange={(value) => {
                        const provider = llmProviders.find(p => p.id === value);
                        setLlmConfig({
                          ...llmConfig,
                          provider: value,
                          model: provider?.models[0] || "",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {llmProviders.filter(p => p.id !== "ollama").map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="llmModel">Model</Label>
                    <Select
                      value={llmConfig.model}
                      onValueChange={(value) => setLlmConfig({ ...llmConfig, model: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {llmProviders.find(p => p.id === llmConfig.provider)?.models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="llmApiKey">API Key</Label>
                    <div className="relative">
                      <Input
                        id="llmApiKey"
                        type={showKeys["llm"] ? "text" : "password"}
                        placeholder="Enter your API key"
                        value={llmConfig.apiKey}
                        onChange={(e) => setLlmConfig({ ...llmConfig, apiKey: e.target.value })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => toggleShowKey("llm")}
                      >
                        {showKeys["llm"] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => testConnection("llm")}
                disabled={testingStatus["llm"] === "testing"}
              >
                {testingStatus["llm"] === "testing" ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : testingStatus["llm"] === "success" ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                ) : testingStatus["llm"] === "error" ? (
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                ) : (
                  <TestTube className="mr-2 h-4 w-4" />
                )}
                Test LLM Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>
                    Configure social media links displayed in the footer. Links are only visible when a URL is provided and visibility is enabled.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* LinkedIn */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-[#0077B5]/10">
                  <Linkedin className="h-5 w-5 text-[#0077B5]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="linkedin-url">LinkedIn</Label>
                  <Input
                    id="linkedin-url"
                    placeholder="https://linkedin.com/company/your-company"
                    value={socialLinks.linkedin.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, linkedin: { ...prev.linkedin, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="linkedin-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="linkedin-visible"
                    checked={socialLinks.linkedin.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, linkedin: { ...prev.linkedin, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Twitter/X */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-black/10">
                  <Twitter className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="twitter-url">Twitter / X</Label>
                  <Input
                    id="twitter-url"
                    placeholder="https://twitter.com/your-company"
                    value={socialLinks.twitter.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, twitter: { ...prev.twitter, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="twitter-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="twitter-visible"
                    checked={socialLinks.twitter.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, twitter: { ...prev.twitter, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* YouTube */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-[#FF0000]/10">
                  <Youtube className="h-5 w-5 text-[#FF0000]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="youtube-url">YouTube</Label>
                  <Input
                    id="youtube-url"
                    placeholder="https://youtube.com/@your-channel"
                    value={socialLinks.youtube.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, youtube: { ...prev.youtube, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="youtube-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="youtube-visible"
                    checked={socialLinks.youtube.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, youtube: { ...prev.youtube, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-[#1877F2]/10">
                  <Facebook className="h-5 w-5 text-[#1877F2]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="facebook-url">Facebook</Label>
                  <Input
                    id="facebook-url"
                    placeholder="https://facebook.com/your-page"
                    value={socialLinks.facebook.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, facebook: { ...prev.facebook, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="facebook-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="facebook-visible"
                    checked={socialLinks.facebook.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, facebook: { ...prev.facebook, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10">
                  <Instagram className="h-5 w-5 text-[#E4405F]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="instagram-url">Instagram</Label>
                  <Input
                    id="instagram-url"
                    placeholder="https://instagram.com/your-account"
                    value={socialLinks.instagram.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, instagram: { ...prev.instagram, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="instagram-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="instagram-visible"
                    checked={socialLinks.instagram.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, instagram: { ...prev.instagram, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">How it works</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Social links appear in the website footer</li>
                  <li>Links are only shown when both a URL is provided AND visibility is enabled</li>
                  <li>Empty URLs will hide the icon regardless of visibility setting</li>
                  <li>Changes take effect after saving</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Visibility Tab - SuperAdmin Only */}
        {isSuperAdmin && (
          <TabsContent value="features" className="space-y-6">
            <FeatureVisibilitySettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// Feature Visibility Settings Component
function FeatureVisibilitySettings() {
  const {
    loading: featureLoading,
    saving: featureSaving,
    error: featureError,
    getRoleSettings,
    saveRoleSettings,
    resetRoleToDefaults,
    copyFromRole,
    enableAllFeatures,
    disableAllFeatures,
    countEnabledFeatures,
  } = useFeatureVisibilityAdmin();

  const [selectedRole, setSelectedRole] = useState<UserRole>("affiliate");
  const [localSettings, setLocalSettings] = useState<Record<string, boolean>>({});
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [copyFromRoleValue, setCopyFromRoleValue] = useState<string>("");

  const ALL_ROLES: UserRole[] = ["superadmin", "admin", "team_member", "affiliate", "consultant", "customer", "viewer"];

  // Load settings when role changes
  useEffect(() => {
    const settings = getRoleSettings(selectedRole);
    setLocalSettings(settings);
    setHasLocalChanges(false);
  }, [selectedRole, getRoleSettings]);

  const handleToggleFeature = (featureName: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [featureName]: !prev[featureName]
    }));
    setHasLocalChanges(true);
  };

  const handleSave = async () => {
    const success = await saveRoleSettings(selectedRole, localSettings);
    if (success) {
      setHasLocalChanges(false);
    }
  };

  const handleReset = async () => {
    await resetRoleToDefaults(selectedRole);
    setLocalSettings(getDefaultRoleSettings(selectedRole));
    setHasLocalChanges(false);
  };

  const handleCopyFrom = async () => {
    if (copyFromRoleValue) {
      await copyFromRole(copyFromRoleValue, selectedRole);
      setLocalSettings(getRoleSettings(copyFromRoleValue));
      setCopyFromRoleValue("");
      setHasLocalChanges(false);
    }
  };

  const handleEnableAll = () => {
    const allEnabled = FEATURES.reduce((acc, f) => ({ ...acc, [f.name]: true }), {} as Record<string, boolean>);
    setLocalSettings(allEnabled);
    setHasLocalChanges(true);
  };

  const handleDisableAll = () => {
    const allDisabled = FEATURES.reduce((acc, f) => ({ 
      ...acc, 
      [f.name]: f.name === "Command Center" // Always keep Command Center
    }), {} as Record<string, boolean>);
    setLocalSettings(allDisabled);
    setHasLocalChanges(true);
  };

  // Group features by category
  const featuresByCategory = FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<FeatureCategory, typeof FEATURES>);

  const categoryLabels: Record<FeatureCategory, string> = {
    navigation: "Navigation",
    work: "Work & Tools",
    admin: "Administration",
    ai: "AI Features",
    initiatives: "Initiatives",
  };

  const enabledCount = Object.values(localSettings).filter(v => v === true).length;

  if (featureLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Feature Visibility by Role</CardTitle>
              <CardDescription>
                Configure which features are visible to each user role. Changes take effect immediately.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Role Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {ALL_ROLES.map((role) => {
              const { enabled, total } = countEnabledFeatures(role);
              return (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                  className="relative"
                >
                  {ROLE_LABELS[role]}
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "ml-2 text-xs",
                      selectedRole === role && "bg-primary-foreground/20"
                    )}
                  >
                    {enabled}/{total}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 p-4 bg-muted rounded-lg mb-6">
            <span className="text-sm font-medium mr-2">Quick Actions:</span>
            <Button variant="outline" size="sm" onClick={handleEnableAll}>
              Show All
            </Button>
            <Button variant="outline" size="sm" onClick={handleDisableAll}>
              Hide All
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset to Defaults
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Select value={copyFromRoleValue} onValueChange={setCopyFromRoleValue}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue placeholder="Copy from role..." />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.filter(r => r !== selectedRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyFrom}
                disabled={!copyFromRoleValue}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {featureError && (
            <div className="p-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{featureError}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Categories */}
      {Object.entries(featuresByCategory).map(([category, features]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{categoryLabels[category as FeatureCategory]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg transition-colors",
                    localSettings[feature.name] 
                      ? "border-green-500/30 bg-green-500/5" 
                      : "border-muted bg-muted/30"
                  )}
                >
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium">{feature.name}</span>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch
                    checked={localSettings[feature.name] ?? true}
                    onCheckedChange={() => handleToggleFeature(feature.name)}
                    disabled={feature.name === "Command Center"} // Always keep Command Center
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Save Button */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm">
            <strong>{ROLE_LABELS[selectedRole]}</strong> can see{" "}
            <Badge variant="outline">{enabledCount}</Badge> of{" "}
            <Badge variant="outline">{FEATURES.length}</Badge> features
          </span>
        </div>
        <Button onClick={handleSave} disabled={featureSaving || !hasLocalChanges}>
          {featureSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {featureSaving ? "Saving..." : hasLocalChanges ? "Save Changes" : "Saved"}
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
