
-- Create expert_chats table
CREATE TABLE public.expert_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expertise_area text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

-- Create expert_chat_messages table
CREATE TABLE public.expert_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.expert_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_expert_chats_client ON public.expert_chats(client_id);
CREATE INDEX idx_expert_chats_expert ON public.expert_chats(expert_id);
CREATE INDEX idx_expert_chats_status ON public.expert_chats(status);
CREATE INDEX idx_expert_chat_messages_chat ON public.expert_chat_messages(chat_id, created_at);

-- Enable RLS
ALTER TABLE public.expert_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS for expert_chats
CREATE POLICY "Clients can view own chats"
  ON public.expert_chats FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Experts can view assigned and waiting chats"
  ON public.expert_chats FOR SELECT
  USING (
    has_role(auth.uid(), 'expert') AND (
      expert_id = auth.uid() OR status = 'waiting'
    )
  );

CREATE POLICY "Admins can view all chats"
  ON public.expert_chats FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can create chats"
  ON public.expert_chats FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Experts can claim waiting chats"
  ON public.expert_chats FOR UPDATE
  USING (
    has_role(auth.uid(), 'expert') AND (
      status = 'waiting' OR expert_id = auth.uid()
    )
  );

CREATE POLICY "Clients can close own chats"
  ON public.expert_chats FOR UPDATE
  USING (auth.uid() = client_id);

-- RLS for expert_chat_messages
CREATE POLICY "Chat participants can view messages"
  ON public.expert_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.expert_chats
      WHERE id = expert_chat_messages.chat_id
      AND (client_id = auth.uid() OR expert_id = auth.uid())
    )
  );

CREATE POLICY "Admins can view all messages"
  ON public.expert_chat_messages FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Chat participants can send messages"
  ON public.expert_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.expert_chats
      WHERE id = expert_chat_messages.chat_id
      AND (client_id = auth.uid() OR expert_id = auth.uid())
      AND status IN ('waiting', 'active')
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.expert_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expert_chat_messages;

-- Trigger for updated_at
CREATE TRIGGER update_expert_chats_updated_at
  BEFORE UPDATE ON public.expert_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
