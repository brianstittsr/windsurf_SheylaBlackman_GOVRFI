"use client";

import { useState } from "react";
import { useUserProfile, ViewableRole } from "@/contexts/user-profile-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Shield,
  UserCog,
  Users,
  User,
  Building,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const roleOptions: { value: ViewableRole; label: string; icon: React.ElementType; description: string }[] = [
  { value: "superadmin", label: "SuperAdmin", icon: Shield, description: "Full system access" },
  { value: "admin", label: "Admin", icon: UserCog, description: "Administrative access" },
  { value: "team_member", label: "Team Member", icon: Users, description: "Standard team access" },
  { value: "affiliate", label: "Affiliate", icon: User, description: "Affiliate partner view" },
  { value: "customer", label: "Customer", icon: Building, description: "Customer portal view" },
  { value: "viewer", label: "Viewer", icon: Eye, description: "Read-only access" },
];

export function RoleSwitcher() {
  const { isSuperAdmin, viewAsRole, setViewAsRole, getEffectiveRole, isViewingAsOtherRole, profile } = useUserProfile();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show for SuperAdmin users
  if (!isSuperAdmin()) {
    return null;
  }

  const effectiveRole = getEffectiveRole();
  const currentRoleOption = roleOptions.find(r => r.value === effectiveRole);

  const handleRoleChange = (role: string) => {
    if (role === "superadmin" || role === profile.role) {
      setViewAsRole(null);
    } else {
      setViewAsRole(role as ViewableRole);
    }
  };

  const handleReset = () => {
    setViewAsRole(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed View */}
      {!isExpanded && (
        <Button
          onClick={() => setIsExpanded(true)}
          variant={isViewingAsOtherRole ? "default" : "outline"}
          size="sm"
          className={cn(
            "shadow-lg border-2 gap-2",
            isViewingAsOtherRole 
              ? "bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-600" 
              : "bg-background border-purple-500/50 hover:border-purple-500"
          )}
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isViewingAsOtherRole ? `Viewing as ${currentRoleOption?.label}` : "Role Switcher"}
          </span>
          <ChevronUp className="h-3 w-3" />
        </Button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-background border-2 border-purple-500/50 rounded-lg shadow-2xl p-4 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <span className="font-semibold text-sm">SuperAdmin View</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Warning Banner when viewing as other role */}
          {isViewingAsOtherRole && (
            <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded-md">
              <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                <EyeOff className="h-3 w-3" />
                <span>Viewing as <strong>{currentRoleOption?.label}</strong></span>
              </div>
            </div>
          )}

          {/* Role Selector */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">View portal as:</label>
            <Select value={effectiveRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role to view as" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  return (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span>{role.label}</span>
                        </div>
                        {role.value === profile.role && (
                          <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">
                            Your Role
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Role Description */}
          {currentRoleOption && (
            <p className="mt-2 text-xs text-muted-foreground">
              {currentRoleOption.description}
            </p>
          )}

          {/* Reset Button */}
          {isViewingAsOtherRole && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 text-xs"
              onClick={handleReset}
            >
              <X className="h-3 w-3 mr-1" />
              Reset to SuperAdmin
            </Button>
          )}

          {/* Info */}
          <p className="mt-3 text-[10px] text-muted-foreground/70 text-center">
            This allows you to preview how other roles see the portal.
          </p>
        </div>
      )}
    </div>
  );
}
