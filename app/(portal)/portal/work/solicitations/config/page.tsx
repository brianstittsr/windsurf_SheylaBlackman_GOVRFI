"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Globe,
  CheckCircle,
  XCircle,
  Settings,
  Key,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Bot,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DataSource {
  id: string;
  name: string;
  description: string;
  url: string;
  enabled: boolean;
  requiresAuth: boolean;
  apiKeyConfigured: boolean;
  status: "active" | "inactive" | "error";
  lastSync?: string;
  recordCount?: number;
}

export default function SolicitationConfigPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: "sam-gov",
      name: "SAM.gov",
      description: "System for Award Management - Federal contract opportunities",
      url: "https://sam.gov",
      enabled: true,
      requiresAuth: true,
      apiKeyConfigured: true,
      status: "active",
      lastSync: "2024-12-30T10:30:00Z",
      recordCount: 15234,
    },
    {
      id: "fpds",
      name: "FPDS.gov",
      description: "Federal Procurement Data System - Contract awards and modifications",
      url: "https://www.fpds.gov",
      enabled: true,
      requiresAuth: false,
      apiKeyConfigured: true,
      status: "active",
      lastSync: "2024-12-30T09:15:00Z",
      recordCount: 45678,
    },
    {
      id: "dc-contracts",
      name: "DC Contracts",
      description: "Washington DC government contract opportunities",
      url: "https://contracts.ocp.dc.gov",
      enabled: true,
      requiresAuth: false,
      apiKeyConfigured: true,
      status: "active",
      lastSync: "2024-12-30T08:45:00Z",
      recordCount: 892,
    },
    {
      id: "grants-gov",
      name: "Grants.gov",
      description: "Federal grant opportunities",
      url: "https://grants.gov",
      enabled: false,
      requiresAuth: true,
      apiKeyConfigured: false,
      status: "inactive",
    },
    {
      id: "usaspending",
      name: "USAspending.gov",
      description: "Federal spending data and contract awards",
      url: "https://usaspending.gov",
      enabled: false,
      requiresAuth: true,
      apiKeyConfigured: false,
      status: "inactive",
    },
  ]);

  const [samApiKey, setSamApiKey] = useState("••••••••••••••••");
  const [dcApiKey, setDcApiKey] = useState("");
  
  // SAM.gov Agent settings
  const [samAgentEnabled, setSamAgentEnabled] = useState(false);
  const [samAgentApiKey, setSamAgentApiKey] = useState("");
  const [llmProvider, setLlmProvider] = useState("openai");

  const handleToggleSource = (id: string) => {
    setDataSources((prev) =>
      prev.map((source) =>
        source.id === id
          ? { ...source, enabled: !source.enabled, status: !source.enabled ? "active" : "inactive" }
          : source
      )
    );
    toast.success("Data source updated");
  };

  const handleTestConnection = (source: DataSource) => {
    toast.info(`Testing connection to ${source.name}...`);
    setTimeout(() => {
      toast.success(`${source.name} connection successful`);
    }, 1500);
  };

  const handleSyncNow = (source: DataSource) => {
    toast.info(`Syncing data from ${source.name}...`);
    setTimeout(() => {
      setDataSources((prev) =>
        prev.map((s) =>
          s.id === source.id
            ? { ...s, lastSync: new Date().toISOString() }
            : s
        )
      );
      toast.success(`${source.name} sync complete`);
    }, 2000);
  };

  const enabledCount = dataSources.filter((s) => s.enabled).length;
  const activeCount = dataSources.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Solicitation Data Sources</h1>
        <p className="text-muted-foreground mt-2">
          Configure and manage government contract and grant data sources for analysis
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataSources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataSources
                .reduce((sum, s) => sum + (s.recordCount || 0), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys & Authentication
          </CardTitle>
          <CardDescription>
            Configure API keys for data sources that require authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sam-api-key">SAM.gov API Key</Label>
            <div className="flex gap-2">
              <Input
                id="sam-api-key"
                type="password"
                value={samApiKey}
                onChange={(e) => setSamApiKey(e.target.value)}
                placeholder="Enter SAM.gov API key"
              />
              <Button variant="outline" onClick={() => toast.success("API key saved")}>
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://sam.gov/data-services"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                SAM.gov Data Services
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dc-api-key">DC Contracts API Key (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="dc-api-key"
                type="password"
                value={dcApiKey}
                onChange={(e) => setDcApiKey(e.target.value)}
                placeholder="Enter DC Contracts API key"
              />
              <Button variant="outline" onClick={() => toast.success("API key saved")}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SAM.gov Agent Configuration */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            SAM.gov Search Agent
            <Badge variant="outline" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </CardTitle>
          <CardDescription>
            Natural language search for federal contract opportunities using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">Enable SAM.gov Agent</div>
              <div className="text-sm text-muted-foreground">
                Use AI to parse natural language queries and search SAM.gov
              </div>
            </div>
            <Switch
              checked={samAgentEnabled}
              onCheckedChange={setSamAgentEnabled}
            />
          </div>
          
          {samAgentEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sam-agent-api-key">SAM.gov API Key (for Agent)</Label>
                <div className="flex gap-2">
                  <Input
                    id="sam-agent-api-key"
                    type="password"
                    value={samAgentApiKey}
                    onChange={(e) => setSamAgentApiKey(e.target.value)}
                    placeholder="Enter SAM.gov API key for agent"
                  />
                  <Button variant="outline" onClick={() => toast.success("API key saved")}>
                    Save
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>LLM Provider</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={llmProvider}
                  onChange={(e) => setLlmProvider(e.target.value)}
                >
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                </select>
              </div>
            </>
          )}
          
          <Button variant="outline" className="w-full" asChild>
            <Link href="/portal/work/solicitations/sam-agent">
              <Settings className="h-4 w-4 mr-2" />
              Open SAM.gov Agent Settings
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Data Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Data Sources</CardTitle>
          <CardDescription>
            Enable or disable data sources and manage synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auth Required</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {source.description}
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        {source.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    {source.status === "active" && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    {source.status === "inactive" && (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    {source.status === "error" && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {source.requiresAuth ? (
                      source.apiKeyConfigured ? (
                        <Badge variant="outline" className="bg-green-50">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                          Configured
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50">
                          <AlertCircle className="h-3 w-3 mr-1 text-yellow-600" />
                          Required
                        </Badge>
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {source.lastSync ? (
                      <span className="text-sm">
                        {new Date(source.lastSync).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {source.recordCount ? (
                      <span className="font-medium">
                        {source.recordCount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={() => handleToggleSource(source.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestConnection(source)}
                        disabled={!source.enabled}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSyncNow(source)}
                        disabled={!source.enabled}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sync Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Synchronization Schedule</CardTitle>
          <CardDescription>
            Configure automatic data synchronization intervals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Automatic Sync</div>
              <div className="text-sm text-muted-foreground">
                Automatically sync data from enabled sources
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label>Sync Frequency</Label>
            <select className="w-full border rounded-md p-2">
              <option>Every 6 hours</option>
              <option>Every 12 hours</option>
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          <Button className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All Sources Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
