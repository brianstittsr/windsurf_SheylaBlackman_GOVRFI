"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  BarChart3,
  TrendingUp,
  DollarSign,
  Building2,
  Calendar,
  Download,
  Filter,
  Search,
  Settings,
  Bot,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function SolicitationDashboardPage() {
  const topAgencies = [
    { name: "Department of Defense", count: 1234, amount: "$45.2B", trend: "+12%" },
    { name: "Department of Homeland Security", count: 892, amount: "$12.8B", trend: "+8%" },
    { name: "Department of Health and Human Services", count: 756, amount: "$18.5B", trend: "+15%" },
    { name: "General Services Administration", count: 645, amount: "$8.3B", trend: "+5%" },
    { name: "Department of Veterans Affairs", count: 534, amount: "$9.7B", trend: "+10%" },
  ];

  const topNAICS = [
    { code: "541512", description: "Computer Systems Design Services", count: 2345, amount: "$28.5B" },
    { code: "541511", description: "Custom Computer Programming Services", count: 1876, amount: "$22.1B" },
    { code: "541519", description: "Other Computer Related Services", count: 1234, amount: "$15.8B" },
    { code: "541618", description: "Other Management Consulting Services", count: 987, amount: "$12.3B" },
    { code: "541990", description: "All Other Professional Services", count: 756, amount: "$9.4B" },
  ];

  const recentAwards = [
    {
      id: "1",
      title: "Enterprise Cloud Infrastructure Modernization",
      agency: "HUD",
      awardee: "Tech Solutions Inc.",
      amount: "$12,500,000",
      date: "2024-12-28",
      naics: "541512",
    },
    {
      id: "2",
      title: "Cybersecurity Operations Center Services",
      agency: "DHS",
      awardee: "SecureNet Corp.",
      amount: "$8,750,000",
      date: "2024-12-27",
      naics: "541512",
    },
    {
      id: "3",
      title: "Data Analytics Platform Implementation",
      agency: "DOD",
      awardee: "DataViz Solutions",
      amount: "$15,200,000",
      date: "2024-12-26",
      naics: "541511",
    },
    {
      id: "4",
      title: "IT Portfolio Management Consulting",
      agency: "VA",
      awardee: "ITMC Solutions",
      amount: "$3,500,000",
      date: "2024-12-25",
      naics: "541618",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solicitation Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Follow the money - analyze government contract spending and opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/portal/work/solicitations/search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/portal/work/solicitations/sam-agent">
              <Bot className="h-4 w-4 mr-2" />
              AI Agent
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/portal/work/solicitations/config">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Link>
          </Button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Time Period:</span>
        </div>
        <Select defaultValue="30days">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
            <SelectItem value="fy2024">FY 2024</SelectItem>
            <SelectItem value="fy2023">FY 2023</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$94.5B</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.3%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,456</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+234</span> new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agencies Tracked</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              Federal and state agencies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Agencies by Spending */}
        <Card>
          <CardHeader>
            <CardTitle>Top Agencies by Contract Value</CardTitle>
            <CardDescription>
              Agencies with highest total contract spending (Last 30 Days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAgencies.map((agency, index) => (
                <div key={agency.name} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{agency.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {agency.count} contracts
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{agency.amount}</div>
                    <div className="text-sm text-green-600">{agency.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top NAICS Codes */}
        <Card>
          <CardHeader>
            <CardTitle>Top NAICS Codes</CardTitle>
            <CardDescription>
              Most active industry categories by contract value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topNAICS.map((naics, index) => (
                <div key={naics.code} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{naics.code}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {naics.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{naics.amount}</div>
                    <div className="text-sm text-muted-foreground">{naics.count} contracts</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Awards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Contract Awards</CardTitle>
              <CardDescription>
                Latest contract awards from tracked agencies
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Title</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Awardee</TableHead>
                <TableHead>NAICS</TableHead>
                <TableHead>Award Amount</TableHead>
                <TableHead>Award Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAwards.map((award) => (
                <TableRow key={award.id}>
                  <TableCell>
                    <div className="font-medium max-w-md">{award.title}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{award.agency}</Badge>
                  </TableCell>
                  <TableCell>{award.awardee}</TableCell>
                  <TableCell>
                    <code className="text-xs">{award.naics}</code>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-green-600">{award.amount}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {award.date}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Spending Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Trends</CardTitle>
          <CardDescription>
            Contract award values by month (FY 2024)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chart visualization will be displayed here</p>
              <p className="text-sm">Showing spending trends across fiscal year</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set-Aside Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Set-Aside Distribution</CardTitle>
            <CardDescription>
              Contract opportunities by set-aside type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">8(a) Small Business</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "35%" }} />
                  </div>
                  <span className="text-sm font-medium">35%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Service-Disabled Veteran-Owned</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: "25%" }} />
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Woman-Owned Small Business</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: "20%" }} />
                  </div>
                  <span className="text-sm font-medium">20%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">HUBZone</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: "12%" }} />
                  </div>
                  <span className="text-sm font-medium">12%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">No Set-Aside</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400" style={{ width: "8%" }} />
                  </div>
                  <span className="text-sm font-medium">8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common dashboard actions and reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/portal/work/solicitations/search">
                <Search className="h-4 w-4 mr-2" />
                Search New Opportunities
              </Link>
            </Button>
            <Button className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20" asChild>
              <Link href="/portal/work/solicitations/sam-agent">
                <Bot className="h-4 w-4 mr-2" />
                <span className="flex-1 text-left">SAM.gov AI Agent</span>
                <Sparkles className="h-3 w-3" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Full Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Custom Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/portal/work/solicitations/config">
                <Settings className="h-4 w-4 mr-2" />
                Configure Data Sources
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
