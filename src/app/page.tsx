"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { MOCK_LEADS, Lead } from "@/lib/mock-data";
import { sortLeadsByStatus } from "@/lib/scoring";

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardLeads();
  }, []);

  async function fetchDashboardLeads() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setLeads(sortLeadsByStatus(MOCK_LEADS));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*');

      if (error || !data || data.length === 0) {
        setLeads(sortLeadsByStatus(MOCK_LEADS));
      } else {
        setLeads(sortLeadsByStatus(data));
      }
    } catch {
      setLeads(sortLeadsByStatus(MOCK_LEADS));
    } finally {
      setLoading(false);
    }
  }

  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.status === "HOT").length;
  const todayFollowUps = leads.filter((l) => l.status === "HOT" || l.status === "WARM").length;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Good morning! Here are your follow-ups for today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Active Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-light tracking-tight">{loading ? "-" : totalLeads}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
              Hot Leads 🔥
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-light tracking-tight text-red-600 dark:text-red-400">{loading ? "-" : hotLeads}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Follow-ups Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-light tracking-tight">{loading ? "-" : todayFollowUps}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
          <CardTitle className="text-lg">Today&apos;s Follow-ups</CardTitle>
          <CardDescription className="text-xs mt-1">
            Leads that need your attention today based on activity and scoring.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-b-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider h-10">Status</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider h-10">Lead</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider h-10">Property / Req</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider h-10">Last Contact</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider h-10">Notes</TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider h-10">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading follow-ups...</TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No active follow-ups for today.</TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      {lead.status === "HOT" && <Badge variant="destructive">🔥 HOT</Badge>}
                      {lead.status === "WARM" && <Badge className="bg-orange-500 hover:bg-orange-600 text-white">🟠 WARM</Badge>}
                      {lead.status === "COLD" && <Badge variant="secondary">⚪ COLD</Badge>}
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      {lead.property_type || '-'}
                      <div className="text-xs text-muted-foreground">
                        {lead.budget ? (lead.purpose === 'rental' ? `$${lead.budget}/mo` : `$${lead.budget.toLocaleString()}`) : ''} 
                        {lead.timeline ? ` • ${lead.timeline}` : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{lead.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Draft Reply
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
