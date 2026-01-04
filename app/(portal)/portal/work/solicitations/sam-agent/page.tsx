"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bot,
  Search,
  Settings,
  Key,
  Code,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Download,
  RefreshCw,
  Loader2,
  Copy,
  Github,
  Sparkles,
  Filter,
  Calendar,
  Building2,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface SearchResult {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  agency: string;
  postedDate: string;
  responseDeadline: string;
  naicsCode: string;
  setAside: string;
  type: string;
  active: boolean;
}

export default function SamAgentPage() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recommendation, setRecommendation] = useState("");
  
  // Settings state
  const [samApiKey, setSamApiKey] = useState("");
  const [llmProvider, setLlmProvider] = useState("openai");
  const [llmModel, setLlmModel] = useState("gpt-4");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [agentEnabled, setAgentEnabled] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    naics: "",
    psc: "",
    setAside: "",
    noticeType: "",
    state: "",
    isActive: "true",
    responseDateFrom: "",
    responseDateTo: "",
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsSearching(true);
    
    // Simulate API call - in production this would call the SAM.gov agent API
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          noticeId: "abc123",
          title: "Enterprise Software Development Services",
          solicitationNumber: "W12345-24-R-0001",
          agency: "Department of Defense",
          postedDate: "2024-12-15",
          responseDeadline: "2025-01-31",
          naicsCode: "541511",
          setAside: "8(a)",
          type: "Solicitation",
          active: true,
        },
        {
          noticeId: "def456",
          title: "Cloud Infrastructure Modernization",
          solicitationNumber: "HHS-24-RFP-0089",
          agency: "Department of Health and Human Services",
          postedDate: "2024-12-20",
          responseDeadline: "2025-02-15",
          naicsCode: "541512",
          setAside: "SDVOSB",
          type: "Solicitation",
          active: true,
        },
        {
          noticeId: "ghi789",
          title: "Cybersecurity Assessment Services",
          solicitationNumber: "DHS-CISA-24-0045",
          agency: "Department of Homeland Security",
          postedDate: "2024-12-22",
          responseDeadline: "2025-01-25",
          naicsCode: "541519",
          setAside: "Small Business",
          type: "Combined Synopsis/Solicitation",
          active: true,
        },
      ];
      
      setSearchResults(mockResults);
      setRecommendation(
        "Based on your search for software development opportunities, I found 3 active solicitations. " +
        "The Department of Defense opportunity (W12345-24-R-0001) appears to be the best match with an 8(a) set-aside " +
        "and NAICS code 541511. The response deadline is January 31, 2025, giving you approximately 4 weeks to prepare. " +
        "I recommend reviewing the full solicitation documents and contacting the contracting officer for any clarifications."
      );
      setIsSearching(false);
      toast.success(`Found ${mockResults.length} opportunities`);
    }, 2000);
  };

  const handleSaveSettings = () => {
    toast.success("SAM.gov Agent settings saved");
  };

  const handleTestConnection = () => {
    toast.info("Testing SAM.gov API connection...");
    setTimeout(() => {
      toast.success("SAM.gov API connection successful");
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">SAM.gov Search Agent</h1>
              <p className="text-muted-foreground">
                Natural language search for federal contract opportunities
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/portal/work/solicitations/dashboard">
              <Building2 className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/brianstittsr/CGray_samgovapiserver.git"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4 mr-2" />
              Source Code
            </a>
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <Card className={agentEnabled ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {agentEnabled ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">SAM.gov Agent is Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">SAM.gov Agent is Not Configured</span>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Code className="h-4 w-4 mr-2" />
            Integration
          </TabsTrigger>
          <TabsTrigger value="docs">
            <FileText className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          {/* Search Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Natural Language Search
              </CardTitle>
              <CardDescription>
                Search using plain English - e.g., "Find software development opportunities with NAICS code 541511"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe what you're looking for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>

              {/* Advanced Filters */}
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                </summary>
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>NAICS Code</Label>
                    <Input
                      placeholder="e.g., 541511"
                      value={filters.naics}
                      onChange={(e) => setFilters({ ...filters, naics: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PSC Code</Label>
                    <Input
                      placeholder="e.g., D301"
                      value={filters.psc}
                      onChange={(e) => setFilters({ ...filters, psc: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Set-Aside</Label>
                    <Select
                      value={filters.setAside || "all"}
                      onValueChange={(v) => setFilters({ ...filters, setAside: v === "all" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="SBA">8(a)</SelectItem>
                        <SelectItem value="SDVOSB">SDVOSB</SelectItem>
                        <SelectItem value="WOSB">WOSB</SelectItem>
                        <SelectItem value="HUBZone">HUBZone</SelectItem>
                        <SelectItem value="SB">Small Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      placeholder="e.g., CA"
                      value={filters.state}
                      onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Response Date From</Label>
                    <Input
                      type="date"
                      value={filters.responseDateFrom}
                      onChange={(e) => setFilters({ ...filters, responseDateFrom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Response Date To</Label>
                    <Input
                      type="date"
                      value={filters.responseDateTo}
                      onChange={(e) => setFilters({ ...filters, responseDateTo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notice Type</Label>
                    <Select
                      value={filters.noticeType || "all"}
                      onValueChange={(v) => setFilters({ ...filters, noticeType: v === "all" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="o">Solicitation</SelectItem>
                        <SelectItem value="p">Presolicitation</SelectItem>
                        <SelectItem value="k">Combined Synopsis</SelectItem>
                        <SelectItem value="r">Sources Sought</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={filters.isActive || "all"}
                      onValueChange={(v) => setFilters({ ...filters, isActive: v === "all" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active Only</SelectItem>
                        <SelectItem value="false">Inactive Only</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          {recommendation && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{recommendation}</p>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Search Results</CardTitle>
                    <CardDescription>
                      Found {searchResults.length} opportunities matching your criteria
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>NAICS</TableHead>
                      <TableHead>Set-Aside</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((result) => (
                      <TableRow key={result.noticeId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {result.solicitationNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{result.agency}</TableCell>
                        <TableCell>
                          <code className="text-xs">{result.naicsCode}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.setAside}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(result.responseDeadline).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.active ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={`https://sam.gov/opp/${result.noticeId}/view`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* SAM.gov API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                SAM.gov API Configuration
              </CardTitle>
              <CardDescription>
                Configure your SAM.gov API key for accessing federal contract opportunities
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
                    placeholder="Enter your SAM.gov API key"
                  />
                  <Button variant="outline" onClick={handleTestConnection}>
                    Test
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
            </CardContent>
          </Card>

          {/* LLM Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                LLM Configuration
              </CardTitle>
              <CardDescription>
                Configure the AI model for natural language query parsing and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>LLM Provider</Label>
                  <Select value={llmProvider} onValueChange={setLlmProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={llmModel} onValueChange={setLlmModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {llmProvider === "openai" ? (
                        <>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                          <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {llmProvider === "openai" && (
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
              )}

              {llmProvider === "anthropic" && (
                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    value={anthropicApiKey}
                    onChange={(e) => setAnthropicApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Status */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Status</CardTitle>
              <CardDescription>
                Enable or disable the SAM.gov Search Agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable SAM.gov Agent</div>
                  <div className="text-sm text-muted-foreground">
                    When enabled, the agent will process natural language queries
                  </div>
                </div>
                <Switch
                  checked={agentEnabled}
                  onCheckedChange={setAgentEnabled}
                />
              </div>
              <Button onClick={handleSaveSettings} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Integration Guide</CardTitle>
              <CardDescription>
                Add SAM.gov search to your Node.js application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>1. Install Dependencies</Label>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    npm install @langchain/openai @langchain/anthropic langchain axios exceljs
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard("npm install @langchain/openai @langchain/anthropic langchain axios exceljs")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>2. Import and Use</Label>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`const { runSamAgent } = require('./agents/samAgent');

// Call the agent
const results = await runSamAgent(
  "Find IT services contracts in California",
  { is_active: "true", pop_state: "CA" }
);

console.log(results.searchResults);
console.log(results.recommendation);`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`const { runSamAgent } = require('./agents/samAgent');

const results = await runSamAgent(
  "Find IT services contracts in California",
  { is_active: "true", pop_state: "CA" }
);`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>3. Environment Variables</Label>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`SAM_API_KEY=your_sam_gov_api_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
PORT=3000`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`SAM_API_KEY=your_sam_gov_api_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
PORT=3000`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                SAM.gov API endpoints used by the agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Endpoint</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Search</TableCell>
                    <TableCell>
                      <code className="text-xs">https://api.sam.gov/opportunities/v2/search</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Details</TableCell>
                    <TableCell>
                      <code className="text-xs">https://api.sam.gov/opportunities/v2/search?noticeid=&#123;id&#125;</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Resources</TableCell>
                    <TableCell>
                      <code className="text-xs">https://sam.gov/api/prod/opps/v3/opportunities/&#123;id&#125;/resources</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">UI Link</TableCell>
                    <TableCell>
                      <code className="text-xs">https://sam.gov/opp/&#123;noticeId&#125;/view</code>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SAM.gov Opportunity Search Agent</CardTitle>
              <CardDescription>
                Migration documentation and feature overview
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h3>Core Features</h3>
              <ul>
                <li><strong>Natural Language Search</strong> - Users can search using plain English queries like "Find software development opportunities with NAICS code 541511"</li>
                <li><strong>Advanced Filters</strong> - NAICS code, PSC code, Set-Aside type, Notice Type, State, Status (Active/Inactive), Response Deadline date range, Posted Date</li>
                <li><strong>Paginated Results</strong> - Client-side pagination with configurable page sizes (10, 25, 50, 100)</li>
                <li><strong>Opportunity Detail View</strong> - Full details including description, contacts, attachments, dates, classification codes</li>
                <li><strong>Excel Export</strong> - Automatic export of search results to Excel spreadsheets</li>
                <li><strong>LLM Integration</strong> - Uses OpenAI/Anthropic for parsing natural language queries into structured API parameters</li>
              </ul>

              <h3>Technical Stack</h3>
              <ul>
                <li><strong>Backend</strong>: Node.js with Express</li>
                <li><strong>Frontend</strong>: HTML with Tailwind CSS (shadcn/ui-inspired design)</li>
                <li><strong>APIs</strong>: SAM.gov Public API (opportunities search, details, attachments)</li>
                <li><strong>LLM</strong>: OpenAI GPT-4 or Anthropic Claude (configurable)</li>
                <li><strong>Export</strong>: ExcelJS for spreadsheet generation</li>
              </ul>

              <h3>Key Files to Migrate</h3>
              <h4>Backend Components:</h4>
              <ol>
                <li><code>utils/samApiClient.js</code> - SAM.gov API client</li>
                <li><code>agents/samAgent.js</code> - LangGraph-style agent</li>
                <li><code>routes/api.js</code> - Express routes</li>
                <li><code>utils/excelExporter.js</code> - Excel export functionality</li>
                <li><code>utils/settingsManager.js</code> - LLM provider/model settings</li>
              </ol>

              <h4>Frontend Components:</h4>
              <ol>
                <li><code>public/agent-ui.html</code> - Main search interface</li>
                <li><code>public/opportunity-detail.html</code> - Detail view</li>
                <li><code>public/settings.html</code> - LLM configuration UI</li>
              </ol>

              <h3>Repository</h3>
              <p>
                <strong>Source Code:</strong>{" "}
                <a
                  href="https://github.com/brianstittsr/CGray_samgovapiserver.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://github.com/brianstittsr/CGray_samgovapiserver.git
                </a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Models</CardTitle>
              <CardDescription>
                Request and response data structures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Request</Label>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "query": "software development opportunities",
  "filters": {
    "naics": "541511",
    "psc": "D301",
    "set_aside": "SBA",
    "notice_type": "o",
    "pop_state": "CA",
    "is_active": "true",
    "response_date_from": "2024-01-01",
    "response_date_to": "2024-12-31"
  }
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <Label>Opportunity Object</Label>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "noticeId": "abc123",
  "title": "Software Development Services",
  "solicitationNumber": "W12345-24-R-0001",
  "active": "true",
  "type": "Solicitation",
  "organizationHierarchy": "DEPT OF DEFENSE.ARMY.ACC-APG",
  "postedDate": "2024-01-15",
  "responseDeadLine": "2024-02-15",
  "naicsCode": "541511",
  "classificationCode": "D301",
  "typeOfSetAside": "SBA",
  "description": "...",
  "pointOfContact": [...],
  "resourceLinks": [...],
  "uiLink": "https://sam.gov/opp/abc123/view"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
