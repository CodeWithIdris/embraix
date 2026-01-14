import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ConsultationTicket {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  subject: string;
  description: string;
  ai_context: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  expert_reply: string | null;
  expert_reply_at: string | null;
  expert_id: string | null;
  attachments: string[];
  phone_number: string | null;
  call_scheduled_at: string | null;
  call_notes: string | null;
}

export const useConsultationTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<ConsultationTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTicketCount, setNewTicketCount] = useState(0);

  const loadTickets = async (): Promise<ConsultationTicket[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("consultation_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ticketsData = (data || []).map(t => ({
        ...t,
        attachments: t.attachments || [],
      })) as ConsultationTicket[];

      setTickets(ticketsData);
      setNewTicketCount(ticketsData.filter(t => t.status === "open").length);
      return ticketsData;
    } catch (err) {
      console.error("Error loading tickets:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (
    userId: string,
    userEmail: string,
    userName: string | null,
    subject: string,
    description: string,
    aiContext?: string,
    attachments?: string[],
    phoneNumber?: string
  ): Promise<ConsultationTicket | null> => {
    try {
      const { data, error } = await supabase
        .from("consultation_tickets")
        .insert({
          user_id: userId,
          user_email: userEmail,
          user_name: userName,
          subject,
          description,
          ai_context: aiContext || null,
          status: "open",
          priority: "normal",
          attachments: attachments || [],
          phone_number: phoneNumber || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "An expert will contact you shortly",
      });

      return { ...data, attachments: data.attachments || [] } as ConsultationTicket;
    } catch (err) {
      console.error("Error creating ticket:", err);
      toast({
        title: "Error",
        description: "Failed to submit consultation request",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string): Promise<boolean> => {
    try {
      const updates: Record<string, unknown> = { status };
      if (status === "resolved") {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("consultation_tickets")
        .update(updates)
        .eq("id", ticketId);

      if (error) throw error;

      toast({
        title: "Updated",
        description: `Ticket status changed to ${status}`,
      });

      return true;
    } catch (err) {
      console.error("Error updating ticket:", err);
      return false;
    }
  };

  const submitExpertReply = async (
    ticketId: string,
    expertId: string,
    reply: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("consultation_tickets")
        .update({
          expert_reply: reply,
          expert_reply_at: new Date().toISOString(),
          expert_id: expertId,
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (error) throw error;

      toast({
        title: "Reply Sent",
        description: "The user will be notified of your response",
      });

      return true;
    } catch (err) {
      console.error("Error submitting reply:", err);
      toast({
        title: "Error",
        description: "Failed to submit reply",
        variant: "destructive",
      });
      return false;
    }
  };

  const scheduleCall = async (
    ticketId: string,
    expertId: string,
    scheduledAt: Date,
    notes: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("consultation_tickets")
        .update({
          call_scheduled_at: scheduledAt.toISOString(),
          call_notes: notes,
          expert_id: expertId,
          status: "in_progress",
        })
        .eq("id", ticketId);

      if (error) throw error;

      toast({
        title: "Call Scheduled",
        description: "The user will be notified of the scheduled call",
      });

      return true;
    } catch (err) {
      console.error("Error scheduling call:", err);
      toast({
        title: "Error",
        description: "Failed to schedule call",
        variant: "destructive",
      });
      return false;
    }
  };

  const subscribeToNewTickets = (callback: (ticket: ConsultationTicket) => void) => {
    const channel = supabase
      .channel("consultation_tickets_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "consultation_tickets",
        },
        (payload) => {
          const newTicket = { ...payload.new, attachments: payload.new.attachments || [] } as ConsultationTicket;
          setTickets(prev => [newTicket, ...prev]);
          setNewTicketCount(prev => prev + 1);
          callback(newTicket);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    tickets,
    loading,
    newTicketCount,
    loadTickets,
    createTicket,
    updateTicketStatus,
    submitExpertReply,
    scheduleCall,
    subscribeToNewTickets,
  };
};
