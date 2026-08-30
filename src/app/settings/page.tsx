"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your Proptimiser account and preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information and contact details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" defaultValue="Agent Name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john@example.com" defaultValue="agent@proptimiser.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+65 9123 4567" defaultValue="+65 9123 4567" />
            </div>
            <Button className="mt-2">Save Profile</Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>AI Preferences</CardTitle>
            <CardDescription>Configure how the AI agent behaves and drafts messages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tone">Default Message Tone</Label>
              <select
                id="tone"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="professional">Professional & Polite</option>
                <option value="friendly">Friendly & Casual</option>
                <option value="direct">Direct & Concise</option>
              </select>
            </div>
            <Button className="mt-2">Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
