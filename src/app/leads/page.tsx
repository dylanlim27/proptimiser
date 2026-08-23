"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { MOCK_LEADS, Lead } from "@/lib/mock-data";
import { sortLeadsByStatus } from "@/lib/scoring";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
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

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-2">Manage all your property leads.</p>
        </div>
        <Link href="/leads/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Link>
      </div>

      <div className="border border-border/50 rounded-xl bg-card shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wider h-10">Status</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider h-10">Name</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider h-10">Property / Budget</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider h-10">Purpose</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider h-10">Last Contacted</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider h-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No leads found. Please ensure Supabase is connected or add a new lead.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    {lead.status === "HOT" && <Badge variant="destructive">🔥 HOT</Badge>}
                    {lead.status === "WARM" && <Badge className="bg-orange-500 hover:bg-orange-600">🟠 WARM</Badge>}
                    {lead.status === "COLD" && <Badge variant="secondary">⚪ COLD</Badge>}
                  </TableCell>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    {lead.property_type}
                    <div className="text-xs text-muted-foreground">Budget: ${lead.budget?.toLocaleString()}</div>
                  </TableCell>
                  <TableCell className="capitalize">{lead.purpose?.replace('_', ' ')}</TableCell>
                  <TableCell>{new Date(lead.last_contacted_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/leads/${lead.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
