"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Deal stages
const dealStages = [
  { id: "referral", name: "Referral Made", color: "bg-gray-500", commission: 7 },
  { id: "qualified", name: "Lead Qualified", color: "bg-blue-500", commission: 7 },
  { id: "proposal", name: "Proposal Sent", color: "bg-yellow-500", commission: 12 },
  { id: "negotiation", name: "In Negotiation", color: "bg-orange-500", commission: 12 },
  { id: "closed-won", name: "Closed Won", color: "bg-green-500", commission: 17 },
  { id: "closed-lost", name: "Closed Lost", color: "bg-red-500", commission: 0 },
];

// Commission tiers
const commissionTiers = [
  { level: "referral", name: "Referral Only", rate: 7, description: "Simple introduction" },
  { level: "assist", name: "Assist Sales", rate: 12, description: "Help warm the lead" },
  { level: "co-sell", name: "Co-Sell & Close", rate: 17, description: "Support sales process" },
];

// Deals will be loaded from Firebase
const mockDeals: any[] = [];

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<typeof mockDeals[0] | null>(null);
  const [newDeal, setNewDeal] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    value: "",
    commissionTier: "referral",
    services: "",
    notes: "",
  });

  const filteredDeals = mockDeals;

  const totalPipelineValue = 0;
  const totalWonValue = 0;
  const totalCommissionEarned = 0;
  const potentialCommission = 0;

  const getStageInfo = (stageId: string) => {
    return dealStages.find((s) => s.id === stageId) || dealStages[0];
  };

  const getCommissionTier = (tierId: string) => {
    return commissionTiers.find((t) => t.level === tierId) || commissionTiers[0];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const submitNewDeal = () => {
    console.log("Creating new deal:", newDeal);
    setIsNewDealOpen(false);
    setNewDeal({
      companyName: "",
      contactName: "",
      contactEmail: "",
      value: "",
      commissionTier: "referral",
      services: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deal Tracking</h1>
          <p className="text-muted-foreground">
            Track referrals and commissions with affiliates
          </p>
        </div>
        <Button onClick={() => setIsNewDealOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Referral
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</div>
            <p className="text-xs text-muted-foreground">Active deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Closed Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalWonValue)}
            </div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commission Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalCommissionEarned)}
            </div>
            <p className="text-xs text-muted-foreground">Paid out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Potential Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(potentialCommission)}
            </div>
            <p className="text-xs text-muted-foreground">If all close</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Tiers Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Commission Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {commissionTiers.map((tier) => (
              <div
                key={tier.level}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{tier.name}</p>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                <Badge variant="secondary" className="text-lg">
                  {tier.rate}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={stageFilter || "all"}
          onValueChange={(v) => setStageFilter(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {dealStages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No deals yet</h3>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            Create your first referral to start tracking deals and commissions with affiliates.
          </p>
          <Button onClick={() => setIsNewDealOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Referral
          </Button>
        </CardContent>
      </Card>

      {/* New Deal Dialog */}
      <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Referral</DialogTitle>
            <DialogDescription>
              Add a new referral to track commissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter company name"
                value={newDeal.companyName}
                onChange={(e) => setNewDeal({ ...newDeal, companyName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  placeholder="Contact name"
                  value={newDeal.contactName}
                  onChange={(e) => setNewDeal({ ...newDeal, contactName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="email@company.com"
                  value={newDeal.contactEmail}
                  onChange={(e) => setNewDeal({ ...newDeal, contactEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Estimated Value</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="$0"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier">Commission Tier</Label>
                <Select
                  value={newDeal.commissionTier}
                  onValueChange={(v) => setNewDeal({ ...newDeal, commissionTier: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {commissionTiers.map((tier) => (
                      <SelectItem key={tier.level} value={tier.level}>
                        {tier.name} ({tier.rate}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services Interested In</Label>
              <Input
                id="services"
                placeholder="e.g., ISO 9001, Lean Manufacturing"
                value={newDeal.services}
                onChange={(e) => setNewDeal({ ...newDeal, services: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional details about the referral..."
                value={newDeal.notes}
                onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDealOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitNewDeal}>
              <Plus className="mr-2 h-4 w-4" />
              Create Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deal Details Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="max-w-lg">
          {selectedDeal && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDeal.companyName}</DialogTitle>
                <DialogDescription>
                  Deal details and activity
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Contact</Label>
                    <p className="font-medium">{selectedDeal.contactName}</p>
                    <p className="text-sm text-muted-foreground">{selectedDeal.contactEmail}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Stage</Label>
                    <Badge
                      variant="secondary"
                      className={cn("text-white mt-1", getStageInfo(selectedDeal.stage).color)}
                    >
                      {getStageInfo(selectedDeal.stage).name}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Deal Value</Label>
                    <p className="text-xl font-bold">{formatCurrency(selectedDeal.value)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Your Commission</Label>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(
                        (selectedDeal.value * getCommissionTier(selectedDeal.commissionTier).rate) / 100
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getCommissionTier(selectedDeal.commissionTier).rate}% - {getCommissionTier(selectedDeal.commissionTier).name}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Services</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedDeal.services.map((service: string) => (
                      <Badge key={service} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1">{selectedDeal.notes}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p>{new Date(selectedDeal.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Activity</Label>
                    <p>{new Date(selectedDeal.lastActivity).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedDeal(null)}>
                  Close
                </Button>
                <Button>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Deal
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
