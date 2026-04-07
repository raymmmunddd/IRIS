'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pin, Edit, Trash2 } from "lucide-react";

const mockAnnouncements = [
  {
    id: 1,
    title: "System Maintenance Notice",
    content: "IRIS will undergo maintenance on March 15, 2026 from 12:00 AM to 6:00 AM.",
    author: "Admin",
    date: "02/20/2026",
    isPinned: true,
  },
  {
    id: 2,
    title: "New Reporting Categories Added",
    content: "The system now includes Environmental Concerns and Community Safety categories.",
    author: "Admin",
    date: "02/15/2026",
    isPinned: false,
  },
];

export function AnnouncementsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="rounded-lg bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" /> Create Announcement
        </Button>
      </div>
      
      <div className="grid gap-4">
        {mockAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="border-[var(--iris-border)] bg-[var(--iris-surface)]/95 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    {announcement.isPinned && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        <Pin className="mr-1 h-3 w-3" /> Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{announcement.content}</p>
                  <p className="text-sm text-muted-foreground pt-2">
                    By {announcement.author} • {announcement.date}
                  </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
