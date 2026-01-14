import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Send, 
  Phone, 
  Calendar as CalendarIcon, 
  Loader2,
  MessageSquare,
  Clock,
  User,
  Mail,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ConsultationTicket } from "@/hooks/useConsultationTickets";

interface TicketReplyDialogProps {
  ticket: ConsultationTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitReply: (ticketId: string, reply: string) => Promise<boolean>;
  onScheduleCall: (ticketId: string, date: Date, notes: string) => Promise<boolean>;
}

export const TicketReplyDialog = ({
  ticket,
  open,
  onOpenChange,
  onSubmitReply,
  onScheduleCall,
}: TicketReplyDialogProps) => {
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callDate, setCallDate] = useState<Date | undefined>();
  const [callTime, setCallTime] = useState("10:00");
  const [callNotes, setCallNotes] = useState("");

  const handleSubmitReply = async () => {
    if (!ticket || !reply.trim()) return;
    
    setIsSubmitting(true);
    const success = await onSubmitReply(ticket.id, reply);
    if (success) {
      setReply("");
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  const handleScheduleCall = async () => {
    if (!ticket || !callDate) return;
    
    setIsSubmitting(true);
    // Combine date and time
    const [hours, minutes] = callTime.split(":").map(Number);
    const scheduledDate = new Date(callDate);
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    const success = await onScheduleCall(ticket.id, scheduledDate, callNotes);
    if (success) {
      setCallDate(undefined);
      setCallTime("10:00");
      setCallNotes("");
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Respond to Consultation Request
          </DialogTitle>
          <DialogDescription>
            Review the request and provide expert guidance or schedule a call.
          </DialogDescription>
        </DialogHeader>

        {/* Ticket Details */}
        <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{ticket.user_name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{ticket.user_email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{format(new Date(ticket.created_at), "MMM d, yyyy")}</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground">{ticket.subject}</h4>
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {ticket.ai_context && (
            <div className="border-t border-border/50 pt-3 mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">AI Chat Context:</p>
              <p className="text-sm text-foreground/70">{ticket.ai_context}</p>
            </div>
          )}

          {(ticket as any).attachments?.length > 0 && (
            <div className="border-t border-border/50 pt-3 mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {((ticket as any).attachments as string[]).map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded"
                  >
                    <FileText className="w-3 h-3" />
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Response Options */}
        <Tabs defaultValue="reply" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reply" className="gap-2">
              <Send className="w-4 h-4" />
              Written Reply
            </TabsTrigger>
            <TabsTrigger value="call" className="gap-2">
              <Phone className="w-4 h-4" />
              Schedule Call
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reply" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Your Expert Response</Label>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Provide detailed guidance, recommendations, and next steps for the user..."
                rows={8}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground text-right">{reply.length}/5000</p>
            </div>

            <Button
              variant="hero"
              className="w-full"
              onClick={handleSubmitReply}
              disabled={isSubmitting || !reply.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Reply & Notify User
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="call" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !callDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {callDate ? format(callDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={callDate}
                      onSelect={setCallDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Select Time</Label>
                <Input
                  type="time"
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Call Notes (optional)</Label>
              <Textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Any preparation notes or topics to discuss..."
                rows={3}
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <Phone className="w-4 h-4 inline mr-2" />
                The user will receive an email with the scheduled call details and your contact information.
              </p>
            </div>

            <Button
              variant="hero"
              className="w-full"
              onClick={handleScheduleCall}
              disabled={isSubmitting || !callDate}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Schedule Call & Notify User
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
