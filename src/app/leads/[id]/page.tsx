"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Sparkles, Activity, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { MOCK_LEADS, Lead } from "@/lib/mock-data";

export default function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  
  // AI Drafter State
  const [instructions, setInstructions] = useState("");
  const [draftedReply, setDraftedReply] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Extraction State
  const [conversationToLog, setConversationToLog] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [unwrappedParams.id]);

  async function fetchLead() {
    const id = unwrappedParams.id;
    const mockLead = MOCK_LEADS.find((l) => l.id === id) || MOCK_LEADS[0];

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setLead(mockLead);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setLead(mockLead);
      } else {
        setLead(data);
      }
    } catch {
      setLead(mockLead);
    } finally {
      setLoading(false);
    }
  }

  async function handleDraftReply() {
    if (!lead) return;
    setIsDrafting(true);
    setDraftedReply("");
    setCopied(false);

    try {
      const res = await fetch('/api/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, instructions })
      });
      
      const data = await res.json();
      if (data.reply) {
        setDraftedReply(data.reply);
      } else {
        setDraftedReply("Error generating reply.");
      }
    } catch (err) {
      console.error(err);
      setDraftedReply("Error generating reply.");
    } finally {
      setIsDrafting(false);
    }
  }

  async function handleLogConversation() {
    if (!lead || !conversationToLog.trim()) return;
    setIsExtracting(true);

    try {
      const res = await fetch('/api/extract-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadId: lead.id, 
          conversation: conversationToLog,
          propertyContext: `Selling a ${lead.property_type || 'property'} for ${lead.purpose || 'own stay'}, budget: ${lead.budget || 'unknown'}`
        })
      });
      
      const data = await res.json();
      if (data && data.buying_intent_score !== undefined) {
        // Update local state with new scores
        setLead({ ...lead, ...data });
        setConversationToLog("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(draftedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!lead) return <div className="p-8">Lead not found</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href="/leads"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-4 mb-4" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
            <p className="text-muted-foreground">{lead.phone}</p>
          </div>
          <div>
            {lead.status === "HOT" && <Badge variant="destructive" className="text-sm">🔥 HOT</Badge>}
            {lead.status === "WARM" && <Badge className="bg-orange-500 hover:bg-orange-600 text-sm text-white">🟠 WARM</Badge>}
            {lead.status === "COLD" && <Badge variant="secondary" className="text-sm">⚪ COLD</Badge>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Score & Lead Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60 bg-muted/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Activity className="mr-2 h-4 w-4 text-primary" />
                AI Lead Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background rounded-lg p-6 border border-border/50 text-center flex flex-col items-center justify-center">
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2 font-medium">Overall Score</div>
                <div className="text-5xl font-light tracking-tight text-primary">
                  {lead.buying_intent_score !== undefined && lead.buying_intent_score !== null 
                    ? lead.buying_intent_score 
                    : '-'}
                </div>
              </div>
              
              {lead.score_explanation && (
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Why</Label>
                  <p className="text-sm mt-1 leading-relaxed">{lead.score_explanation}</p>
                </div>
              )}
              
              {lead.next_action && (
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Next Action</Label>
                  <p className="text-sm font-medium mt-1 text-primary">{lead.next_action}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Property</Label>
                <div className="font-medium text-sm mt-1">{lead.property_type || '-'}</div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Budget</Label>
                <div className="font-medium text-sm mt-1">${lead.budget?.toLocaleString() || '-'}</div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Timeline</Label>
                <div className="font-medium text-sm mt-1">{lead.timeline || '-'}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle/Right Column: Conversations & Drafting */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                Log Conversation
              </CardTitle>
              <CardDescription className="text-xs">
                Paste the messy conversation here. AI will extract signals and recalculate the lead score deterministically.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <Textarea 
                placeholder="E.g. Client: 'Hi, looking for a 3BR. Can go up to 2m.' Agent: 'When are you moving?' Client: 'No rush, maybe next year.'"
                value={conversationToLog}
                onChange={(e) => setConversationToLog(e.target.value)}
                className="h-24 resize-none text-sm"
              />
              <Button 
                onClick={handleLogConversation} 
                disabled={isExtracting || !conversationToLog.trim()}
                variant="secondary"
              >
                {isExtracting ? "Extracting Signals..." : "Analyze & Score"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-primary/20 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] bg-gradient-to-b from-background to-muted/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary/10"></div>
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                AI Reply Drafter
              </CardTitle>
              <CardDescription className="text-xs">
                Provide some quick context, and AI will draft a professional WhatsApp message.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>Instructions for AI</Label>
                <Textarea 
                  placeholder="E.g. Tell him there is a viewing available this Saturday at 2pm."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="resize-none"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleDraftReply} 
                disabled={isDrafting || !instructions.trim()}
              >
                {isDrafting ? "Drafting..." : "Draft WhatsApp Reply"}
              </Button>

              {draftedReply && (
                <div className="mt-4 space-y-2 animate-in fade-in-0 duration-300">
                  <Label>Drafted Message</Label>
                  <div className="relative">
                    <Textarea 
                      value={draftedReply}
                      readOnly
                      className="h-36 bg-background shadow-inner border-border/50 resize-none pr-12 text-sm leading-relaxed"
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleCopy}
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && <p className="text-xs text-green-600 font-medium">Copied to clipboard!</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
