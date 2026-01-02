import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Video,
  Calendar,
  Clock,
  Users,
  FileText,
  Play,
  CheckSquare,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Meetings",
  description: "View and manage meetings with AI-extracted insights",
};

// Meetings will be loaded from Firebase/Calendar integration
const upcomingMeetings: any[] = [];

const pastMeetings: any[] = [];

function getMeetingTypeBadge(type: string) {
  const types: Record<string, { label: string; className: string }> = {
    discovery: { label: "Discovery", className: "bg-blue-100 text-blue-800" },
    "follow-up": { label: "Follow-up", className: "bg-purple-100 text-purple-800" },
    project: { label: "Project", className: "bg-green-100 text-green-800" },
    internal: { label: "Internal", className: "bg-gray-100 text-gray-800" },
  };
  const config = types[type] || { label: type, className: "bg-gray-100 text-gray-800" };
  return <Badge className={config.className}>{config.label}</Badge>;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">
            Schedule meetings and access AI-extracted insights
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/meetings/new">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Meetings</TabsTrigger>
        </TabsList>

        {/* Upcoming Meetings */}
        <TabsContent value="upcoming" className="space-y-4 mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No upcoming meetings</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Schedule your first meeting to start tracking appointments and AI-extracted insights.
              </p>
              <Button asChild>
                <Link href="/portal/meetings/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Past Meetings */}
        <TabsContent value="past" className="space-y-4 mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No past meetings</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Past meetings with transcripts and AI-extracted insights will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
