"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { useUserProfile, ViewableRole } from "@/contexts/user-profile-context";
import { useFeatureVisibility } from "@/lib/feature-visibility";
import { ROLE_LABELS } from "@/lib/role-permissions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Factory,
  LayoutDashboard,
  Target,
  FolderKanban,
  Users,
  Building,
  FileText,
  Calendar,
  CalendarDays,
  CheckSquare,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Handshake,
  DollarSign,
  User,
  ImageIcon,
  Shield,
  Rocket,
  Battery,
  UserCog,
  Building2,
  Search,
  Linkedin,
  FileSignature,
  Bot,
  Plug,
  Bug,
  Heart,
  Phone,
  CalendarClock,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mainNavItems = [
  {
    title: "Command Center",
    href: "/portal/command-center",
    icon: LayoutDashboard,
  },
  {
    title: "Opportunities",
    href: "/portal/opportunities",
    icon: Target,
    badge: "5",
  },
  {
    title: "Projects",
    href: "/portal/projects",
    icon: FolderKanban,
    badge: "3",
  },
  {
    title: "Affiliates",
    href: "/portal/affiliates",
    icon: Users,
  },
  {
    title: "Customers",
    href: "/portal/customers",
    icon: Building,
  },
];

const workItems = [
  {
    title: "Gov Solicitations",
    href: "/portal/work/solicitations/dashboard",
    icon: Search,
    badge: "NEW",
    subItems: [
      {
        title: "Dashboard",
        href: "/portal/work/solicitations/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Search",
        href: "/portal/work/solicitations/search",
        icon: Search,
      },
      {
        title: "Configuration",
        href: "/portal/work/solicitations/config",
        icon: Settings,
      },
    ],
  },
  {
    title: "FPDS Search",
    href: "/fpds-search",
    icon: Search,
    badge: "GOV",
  },
  {
    title: "Apollo Search",
    href: "/portal/apollo-search",
    icon: Search,
    badge: "AI",
    adminOnly: true,
  },
  {
    title: "Supplier Search",
    href: "/portal/supplier-search",
    icon: Factory,
    badge: "AI",
    adminOnly: true,
  },
  {
    title: "Documents",
    href: "/portal/documents",
    icon: FileText,
  },
  {
    title: "Calendar",
    href: "/portal/calendar",
    icon: Calendar,
  },
  {
    title: "Availability",
    href: "/portal/availability",
    icon: CalendarDays,
  },
  {
    title: "Meetings",
    href: "/portal/meetings",
    icon: Users,
  },
  {
    title: "Rocks",
    href: "/portal/rocks",
    icon: CheckSquare,
    adminOnly: true,
  },
  {
    title: "Networking",
    href: "/portal/networking",
    icon: Handshake,
  },
  {
    title: "Deals",
    href: "/portal/deals",
    icon: DollarSign,
  },
  {
    title: "LinkedIn Content",
    href: "/portal/linkedin-content",
    icon: Linkedin,
    badge: "AI",
  },
  {
    title: "EOS2 Dashboard",
    href: "/portal/eos2",
    icon: Target,
    badge: "EOS",
    adminOnly: true,
  },
  {
    title: "DocuSeal",
    href: "/portal/docuseal",
    icon: FileSignature,
  },
  {
    title: "AI Workforce",
    href: "/portal/ai-workforce",
    icon: Bot,
    badge: "AI",
  },
  {
    title: "Proposal Creator",
    href: "/portal/proposals",
    icon: FileText,
    badge: "AI",
  },
  {
    title: "GoHighLevel",
    href: "/portal/gohighlevel",
    icon: Plug,
    badge: "CRM",
    adminOnly: true,
  },
  {
    title: "Bug Tracker",
    href: "/portal/bug-tracker",
    icon: Bug,
  },
  {
    title: "ITMC Tools",
    href: "/portal/svp-tools",
    icon: Sparkles,
    badge: "AI",
  },
];

const adminItems = [
  {
    title: "Team Members",
    href: "/portal/admin/team-members",
    icon: UserCog,
  },
  {
    title: "Strategic Partners",
    href: "/portal/admin/strategic-partners",
    icon: Building2,
  },
  {
    title: "Marketing Pages",
    href: "/portal/admin/marketing-pages",
    icon: FileText,
  },
  {
    title: "Hero Management",
    href: "/portal/admin/hero",
    icon: ImageIcon,
  },
  {
    title: "Contact Popup",
    href: "/portal/admin/popup",
    icon: MessageSquare,
  },
  {
    title: "Events",
    href: "/portal/admin/events",
    icon: CalendarClock,
  },
  {
    title: "Government Solicitations",
    href: "/portal/admin/government-solicitations",
    icon: FileText,
  },
];

const initiativeItems = [
  {
    title: "Initiatives",
    href: "/portal/admin/initiatives",
    icon: Rocket,
  },
  {
    title: "TBMNC Suppliers",
    href: "/portal/admin/initiatives/tbmnc",
    icon: Battery,
  },
];

const aiItems = [
  {
    title: "Ask IntellEDGE",
    href: "/portal/ask",
    icon: Sparkles,
  },
];

// Available roles for the role switcher
const VIEWABLE_ROLES: ViewableRole[] = [
  "superadmin",
  "admin",
  "team_member",
  "affiliate",
  "customer",
  "viewer",
];

export function PortalSidebar() {
  const pathname = usePathname();
  const { 
    getDisplayName, 
    getInitials, 
    profile, 
    isAdmin, 
    isSuperAdmin, 
    signOut, 
    getEffectiveRole, 
    isViewingAsOtherRole,
    viewAsRole,
    setViewAsRole,
  } = useUserProfile();
  const [bookCallLeadsCount, setBookCallLeadsCount] = useState(0);
  
  // Get effective role for feature visibility
  const effectiveRole = getEffectiveRole();
  const { isFeatureVisible, loading: featureVisibilityLoading } = useFeatureVisibility(effectiveRole);

  // Subscribe to BookCallLeads count (new leads only)
  useEffect(() => {
    if (!db) return;
    
    const q = query(
      collection(db, COLLECTIONS.BOOK_CALL_LEADS),
      where("status", "==", "new")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookCallLeadsCount(snapshot.size);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Collapsible state for each section
  const [openSections, setOpenSections] = useState({
    navigation: true,
    work: true,
    intelligence: true,
    admin: false,
    initiatives: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/portal" className="flex items-center gap-2 px-2 py-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">ITMC Solutions</span>
            <span className="text-xs text-sidebar-foreground/60">Business Portal</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <Collapsible open={openSections.navigation} onOpenChange={() => toggleSection("navigation")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span>Navigation</span>
                {openSections.navigation ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNavItems
                    .filter((item) => isFeatureVisible(item.title))
                    .map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Work Items */}
        <Collapsible open={openSections.work} onOpenChange={() => toggleSection("work")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span>Work</span>
                {openSections.work ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {workItems
                    .filter((item) => {
                      // First check feature visibility
                      if (!isFeatureVisible(item.title)) return false;
                      // Then check admin-only items
                      const effectiveIsAdmin = effectiveRole === "admin" || effectiveRole === "superadmin";
                      return !item.adminOnly || effectiveIsAdmin;
                    })
                    .map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* AI */}
        <Collapsible open={openSections.intelligence} onOpenChange={() => toggleSection("intelligence")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span>Intelligence</span>
                {openSections.intelligence ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {aiItems
                    .filter((item) => isFeatureVisible(item.title))
                    .map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Admin - Only show for admin users (respects role switching) */}
        {(effectiveRole === "admin" || effectiveRole === "superadmin") && (
        <Collapsible open={openSections.admin} onOpenChange={() => toggleSection("admin")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span>Admin</span>
                {openSections.admin ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Book Call Leads - with dynamic count */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/portal/admin/book-call-leads"}
                      tooltip="Book Call Leads"
                    >
                      <Link href="/portal/admin/book-call-leads">
                        <Phone className="h-4 w-4" />
                        <span>Book Call Leads</span>
                      </Link>
                    </SidebarMenuButton>
                    {bookCallLeadsCount > 0 && (
                      <SidebarMenuBadge className="bg-red-500 text-white">
                        {bookCallLeadsCount}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(item.href)}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        )}

        {/* Initiatives */}
        <Collapsible open={openSections.initiatives} onOpenChange={() => toggleSection("initiatives")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span>Initiatives</span>
                {openSections.initiatives ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {initiativeItems
                    .filter((item) => isFeatureVisible(item.title))
                    .map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {/* Role Switcher - Only visible to SuperAdmin */}
        {isSuperAdmin() && (
          <div className="px-3 py-2 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-sidebar-foreground/60" />
              <span className="text-xs font-medium text-sidebar-foreground/60">View As Role</span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={viewAsRole || "superadmin"}
                onValueChange={(value) => {
                  if (value === "superadmin") {
                    setViewAsRole(null);
                  } else {
                    setViewAsRole(value as ViewableRole);
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIEWABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role} className="text-xs">
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isViewingAsOtherRole && (
                <button
                  onClick={() => setViewAsRole(null)}
                  className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  title="Reset to SuperAdmin"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>
            {isViewingAsOtherRole && (
              <Badge variant="outline" className="mt-2 w-full justify-center text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                <EyeOff className="h-3 w-3 mr-1" />
                Viewing as {ROLE_LABELS[viewAsRole!]}
              </Badge>
            )}
          </div>
        )}
        
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{getDisplayName()}</span>
                    <span className="text-xs text-sidebar-foreground/60 capitalize">
                      {isViewingAsOtherRole ? (
                        <span className="text-amber-600">Viewing as {ROLE_LABELS[viewAsRole!]}</span>
                      ) : (
                        profile.role.replace("_", " ")
                      )}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/portal/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings?tab=notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
