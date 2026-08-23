"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

function parseBudgetInput(input: string): number | null {
  const normalized = input.trim().toLowerCase().replace(/,/g, '');
  if (!normalized) return null;

  let multiplier = 1;
  if (normalized.endsWith('m')) multiplier = 1_000_000;
  else if (normalized.endsWith('k')) multiplier = 1_000;
  else if (normalized.endsWith('b')) multiplier = 1_000_000_000;

  const numericPart = parseFloat(normalized.replace(/[mkb]/, ''));
  if (isNaN(numericPart)) return null;

  return numericPart * multiplier;
}

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    property_type: "",
    budget: "",
    purpose: "own_stay",
    timeline: "",
    notes: "",
    initial_conversation: ""
  });

  const [recentProperties, setRecentProperties] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProperties() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
      const { data } = await supabase
        .from('leads')
        .select('property_type')
        .order('created_at', { ascending: false });
      
      if (data) {
        // Extract unique truthy property types, keeping most recent order
        const unique = Array.from(new Set(data.map(l => l.property_type).filter(Boolean)));
        setRecentProperties(unique as string[]);
      }
    }
    fetchProperties();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setError("Lead name is required.");
      setLoading(false);
      return;
    }

    try {
      const budgetNum = parseBudgetInput(formData.budget);
      let aiPayload: any = { status: "COLD" }; // default if no conversation

      // 1. Analyze the initial conversation if provided
      if (formData.initial_conversation.trim()) {
        const res = await fetch('/api/extract-signals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            leadId: "", // Empty string means it won't update DB in the API route
            conversation: formData.initial_conversation,
            propertyContext: `Property: ${formData.property_type}, Budget: ${formData.budget}, Purpose: ${formData.purpose}`
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          aiPayload = data; // contains status, scores, extracted_signals, etc.
        } else {
          console.error("Failed to extract signals from conversation");
        }
      }

      // 2. Insert into database
      const { data, error: insertError } = await supabase
        .from('leads')
        .insert([
          {
            name: formData.name,
            phone: formData.phone,
            property_type: formData.property_type,
            budget: budgetNum,
            purpose: formData.purpose,
            timeline: formData.timeline,
            notes: formData.notes,
            status: aiPayload.status,
            buying_intent_score: aiPayload.buying_intent_score,
            property_fit_score: aiPayload.property_fit_score,
            extracted_signals: aiPayload.extracted_signals,
            score_explanation: aiPayload.score_explanation,
            next_action: aiPayload.next_action,
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      router.push('/leads');
      router.refresh();
    } catch (err: any) {
      console.error("Error creating lead:", err);
      setError(err.message || "Failed to create lead. Please check your Supabase RLS policies.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <Link
        href="/leads"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-4 mb-2" })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
      </Link>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Add New Lead</CardTitle>
          <CardDescription>
            Enter the prospect details and paste their first message to automatically calculate their lead score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Lead Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone / WhatsApp</Label>
                <Input
                  id="phone"
                  placeholder="e.g. +65 9123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_type">Property / Requirement</Label>
                <Input
                  id="property_type"
                  placeholder="e.g. 3BR Condo D15"
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  list="recent-properties"
                />
                <datalist id="recent-properties">
                  {recentProperties.map((prop, idx) => (
                    <option key={idx} value={prop} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="text"
                  placeholder="e.g. 2.6M, 500k"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
                {formData.budget && parseBudgetInput(formData.budget) !== null && (
                  <p className="text-xs text-muted-foreground">
                    Parsed: ${parseBudgetInput(formData.budget)?.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <select
                  id="purpose"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                >
                  <option value="own_stay">Own Stay</option>
                  <option value="investment">Investment</option>
                  <option value="rental">Rental</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  placeholder="e.g. End 2026"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Internal Requirements</Label>
              <Textarea
                id="notes"
                placeholder="e.g. Viewed 3BR yesterday. Hasn't replied to Saturday viewing slots."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="space-y-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Label htmlFor="initial_conversation" className="flex items-center text-primary">
                <Sparkles className="h-4 w-4 mr-2" />
                Initial Conversation (AI Scoring)
              </Label>
              <p className="text-xs text-muted-foreground pb-1">
                Paste the initial chat or email here. The AI will analyze it to determine the urgency status (Hot/Warm/Cold) and calculate the initial Lead Score.
              </p>
              <Textarea
                id="initial_conversation"
                placeholder="e.g. Hi, is this 3BR still available? Looking to move by December, budget is around $2m."
                value={formData.initial_conversation}
                onChange={(e) => setFormData({ ...formData, initial_conversation: e.target.value })}
                rows={3}
                className="bg-background"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Link
                href="/leads"
                className={buttonVariants({ variant: "outline" })}
              >
                Cancel
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Analyzing & Saving..." : "Create Lead"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
