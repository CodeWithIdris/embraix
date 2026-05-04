export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          endpoint: string
          id: string
          requested_at: string
          user_id: string
        }
        Insert: {
          endpoint: string
          id?: string
          requested_at?: string
          user_id: string
        }
        Update: {
          endpoint?: string
          id?: string
          requested_at?: string
          user_id?: string
        }
        Relationships: []
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          author_name: string | null
          category: string | null
          content: string | null
          created_at: string
          documentation_urls: string[] | null
          excerpt: string | null
          featured_image: string | null
          id: string
          images: string[] | null
          impact: string | null
          implementation: string | null
          location: string | null
          organization: string | null
          problem: string | null
          project_date: string | null
          published_at: string | null
          slug: string
          solution: string | null
          status: string
          story_type: Database["public"]["Enums"]["story_type"]
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          documentation_urls?: string[] | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          images?: string[] | null
          impact?: string | null
          implementation?: string | null
          location?: string | null
          organization?: string | null
          problem?: string | null
          project_date?: string | null
          published_at?: string | null
          slug: string
          solution?: string | null
          status?: string
          story_type?: Database["public"]["Enums"]["story_type"]
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          documentation_urls?: string[] | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          images?: string[] | null
          impact?: string | null
          implementation?: string | null
          location?: string | null
          organization?: string | null
          problem?: string | null
          project_date?: string | null
          published_at?: string | null
          slug?: string
          solution?: string | null
          status?: string
          story_type?: Database["public"]["Enums"]["story_type"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_message_feedback: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_positive: boolean
          message_id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_positive: boolean
          message_id: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_positive?: boolean
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_requests: {
        Row: {
          created_at: string
          expert_id: string
          expert_response: string | null
          id: string
          message: string
          preferred_date: string | null
          preferred_time: string | null
          responded_at: string | null
          status: string
          topic: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          expert_response?: string | null
          id?: string
          message: string
          preferred_date?: string | null
          preferred_time?: string | null
          responded_at?: string | null
          status?: string
          topic: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          expert_response?: string | null
          id?: string
          message?: string
          preferred_date?: string | null
          preferred_time?: string | null
          responded_at?: string | null
          status?: string
          topic?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_requests_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_tickets: {
        Row: {
          ai_context: string | null
          assigned_to: string | null
          attachments: string[] | null
          call_notes: string | null
          call_scheduled_at: string | null
          created_at: string | null
          description: string
          expert_id: string | null
          expert_reply: string | null
          expert_reply_at: string | null
          id: string
          phone_number: string | null
          priority: string | null
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string | null
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          ai_context?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          call_notes?: string | null
          call_scheduled_at?: string | null
          created_at?: string | null
          description: string
          expert_id?: string | null
          expert_reply?: string | null
          expert_reply_at?: string | null
          id?: string
          phone_number?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          ai_context?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          call_notes?: string | null
          call_scheduled_at?: string | null
          created_at?: string | null
          description?: string
          expert_id?: string | null
          expert_reply?: string | null
          expert_reply_at?: string | null
          id?: string
          phone_number?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_email?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_tickets_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_tickets_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_applications: {
        Row: {
          admin_notes: string | null
          bio: string | null
          created_at: string
          email: string
          experience_summary: string
          experience_years: number | null
          expertise_areas: string[]
          full_name: string
          id: string
          linkedin: string | null
          phone: string | null
          portfolio: string | null
          qualifications: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          bio?: string | null
          created_at?: string
          email: string
          experience_summary: string
          experience_years?: number | null
          expertise_areas?: string[]
          full_name: string
          id?: string
          linkedin?: string | null
          phone?: string | null
          portfolio?: string | null
          qualifications?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          experience_summary?: string
          experience_years?: number | null
          expertise_areas?: string[]
          full_name?: string
          id?: string
          linkedin?: string | null
          phone?: string | null
          portfolio?: string | null
          qualifications?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expert_chat_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "expert_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_chats: {
        Row: {
          client_id: string
          closed_at: string | null
          created_at: string
          expert_id: string | null
          expertise_area: string
          id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          client_id: string
          closed_at?: string | null
          created_at?: string
          expert_id?: string | null
          expertise_area: string
          id?: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          closed_at?: string | null
          created_at?: string
          expert_id?: string | null
          expertise_area?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      expert_documents: {
        Row: {
          application_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "expert_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_profiles: {
        Row: {
          application_id: string | null
          avatar_url: string | null
          badges: string[] | null
          bio: string | null
          certifications: string[] | null
          city: string | null
          consultation_count: number | null
          country: string | null
          created_at: string
          email: string
          experience_years: number | null
          expertise_areas: string[]
          full_name: string
          hourly_rate: string | null
          id: string
          is_available: boolean | null
          languages: string[] | null
          linkedin: string | null
          location: string | null
          phone: string | null
          portfolio: string | null
          professional_title: string | null
          rating: number | null
          review_count: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          consultation_count?: number | null
          country?: string | null
          created_at?: string
          email: string
          experience_years?: number | null
          expertise_areas?: string[]
          full_name: string
          hourly_rate?: string | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          linkedin?: string | null
          location?: string | null
          phone?: string | null
          portfolio?: string | null
          professional_title?: string | null
          rating?: number | null
          review_count?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          consultation_count?: number | null
          country?: string | null
          created_at?: string
          email?: string
          experience_years?: number | null
          expertise_areas?: string[]
          full_name?: string
          hourly_rate?: string | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          linkedin?: string | null
          location?: string | null
          phone?: string | null
          portfolio?: string | null
          professional_title?: string | null
          rating?: number | null
          review_count?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "expert_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      installers: {
        Row: {
          assigned_count: number | null
          availability_status: string
          bio: string | null
          certifications: string[] | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          location: string | null
          phone: string | null
          portfolio_images: string[] | null
          specializations: string[]
          status: string
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          assigned_count?: number | null
          availability_status?: string
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          location?: string | null
          phone?: string | null
          portfolio_images?: string[] | null
          specializations?: string[]
          status?: string
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          assigned_count?: number | null
          availability_status?: string
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          location?: string | null
          phone?: string | null
          portfolio_images?: string[] | null
          specializations?: string[]
          status?: string
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          rejection_reason: string | null
          scheduled_at: string | null
          status: string
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          scheduled_at?: string | null
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          scheduled_at?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "post_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string | null
          subscribed_at: string
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      post_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "news_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "news_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_votes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
          vote_type: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
          vote_type: number
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "news_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          gps_location: string | null
          id: string
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gps_location?: string | null
          id: string
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gps_location?: string | null
          id?: string
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          project_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          project_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          project_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          content: string | null
          created_at: string
          created_by: string
          description: string | null
          featured_image: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          featured_image?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          featured_image?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_projects: {
        Row: {
          client_name: string | null
          completion_date: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location: string | null
          provider_id: string
          title: string
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          provider_id: string
          title: string
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          provider_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_projects_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          provider_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "waitlist_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "waitlist_users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_downloads: {
        Row: {
          downloaded_at: string
          id: string
          report_title: string
          report_type: string | null
          report_url: string | null
          user_id: string
        }
        Insert: {
          downloaded_at?: string
          id?: string
          report_title: string
          report_type?: string | null
          report_url?: string | null
          user_id: string
        }
        Update: {
          downloaded_at?: string
          id?: string
          report_title?: string
          report_type?: string | null
          report_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      research_submissions: {
        Row: {
          abstract: string
          admin_notes: string | null
          author_name: string
          category: string
          created_at: string
          email: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          institution: string | null
          published_at: string | null
          rejection_reason: string | null
          status: string
          supporting_images: string[] | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          abstract: string
          admin_notes?: string | null
          author_name: string
          category: string
          created_at?: string
          email: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          institution?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          status?: string
          supporting_images?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          abstract?: string
          admin_notes?: string | null
          author_name?: string
          category?: string
          created_at?: string
          email?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          institution?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          status?: string
          supporting_images?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_products: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
        ]
      }
      service_listings: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          price_range: string | null
          provider_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          price_range?: string | null
          provider_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          price_range?: string | null
          provider_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_listings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          parent_id: string | null
          provider_id: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          parent_id?: string | null
          provider_id?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          parent_id?: string | null
          provider_id?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_messages_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          address: string | null
          business_name: string
          business_type: string
          categories: Database["public"]["Enums"]["service_category"][]
          city: string | null
          country: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          email: string
          id: string
          is_verified: boolean | null
          logo_url: string | null
          paystack_customer_id: string | null
          paystack_subscription_code: string | null
          phone: string | null
          rating: number | null
          review_count: number | null
          state: string | null
          status: Database["public"]["Enums"]["provider_status"]
          subscription_expires_at: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          business_type?: string
          categories?: Database["public"]["Enums"]["service_category"][]
          city?: string | null
          country?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          email: string
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          paystack_customer_id?: string | null
          paystack_subscription_code?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["provider_status"]
          subscription_expires_at?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          business_type?: string
          categories?: Database["public"]["Enums"]["service_category"][]
          city?: string | null
          country?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          paystack_customer_id?: string | null
          paystack_subscription_code?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["provider_status"]
          subscription_expires_at?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          admin_notes: string | null
          assigned_expert_id: string | null
          assigned_installer_id: string | null
          attachments: string[] | null
          created_at: string
          description: string
          id: string
          location: string | null
          phone: string | null
          project_size: string | null
          service_type: string
          status: string
          updated_at: string
          user_email: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_expert_id?: string | null
          assigned_installer_id?: string | null
          attachments?: string[] | null
          created_at?: string
          description: string
          id?: string
          location?: string | null
          phone?: string | null
          project_size?: string | null
          service_type: string
          status?: string
          updated_at?: string
          user_email: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          admin_notes?: string | null
          assigned_expert_id?: string | null
          assigned_installer_id?: string | null
          attachments?: string[] | null
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          phone?: string | null
          project_size?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_assigned_expert_id_fkey"
            columns: ["assigned_expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_assigned_installer_id_fkey"
            columns: ["assigned_installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          battery_capacity: string | null
          best_for: string | null
          brand: string | null
          category: Database["public"]["Enums"]["store_product_category"]
          created_at: string
          currency: string
          description: string | null
          features: string[] | null
          id: string
          images: string[] | null
          installation_required: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          manufacturer_price: number | null
          markup_percent: number
          model: string | null
          name: string
          power_capacity: string | null
          price: number
          recommended_usage: string | null
          short_description: string | null
          sku: string | null
          slug: string
          source: string | null
          source_url: string | null
          specifications: Json | null
          status: string
          stock_quantity: number | null
          system_type: string | null
          tags: string[]
          updated_at: string
          warranty_years: number | null
        }
        Insert: {
          battery_capacity?: string | null
          best_for?: string | null
          brand?: string | null
          category: Database["public"]["Enums"]["store_product_category"]
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          installation_required?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          manufacturer_price?: number | null
          markup_percent?: number
          model?: string | null
          name: string
          power_capacity?: string | null
          price?: number
          recommended_usage?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          source?: string | null
          source_url?: string | null
          specifications?: Json | null
          status?: string
          stock_quantity?: number | null
          system_type?: string | null
          tags?: string[]
          updated_at?: string
          warranty_years?: number | null
        }
        Update: {
          battery_capacity?: string | null
          best_for?: string | null
          brand?: string | null
          category?: Database["public"]["Enums"]["store_product_category"]
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          installation_required?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          manufacturer_price?: number | null
          markup_percent?: number
          model?: string | null
          name?: string
          power_capacity?: string | null
          price?: number
          recommended_usage?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          source?: string | null
          source_url?: string | null
          specifications?: Json | null
          status?: string
          stock_quantity?: number | null
          system_type?: string | null
          tags?: string[]
          updated_at?: string
          warranty_years?: number | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_ai_preferences: {
        Row: {
          additional_notes: string | null
          budget_range: string | null
          created_at: string
          current_setup: string | null
          energy_goals: string[] | null
          grid_reliability: string | null
          home_size: string | null
          household_size: number | null
          id: string
          location: string | null
          property_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          budget_range?: string | null
          created_at?: string
          current_setup?: string | null
          energy_goals?: string[] | null
          grid_reliability?: string | null
          home_size?: string | null
          household_size?: number | null
          id?: string
          location?: string | null
          property_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          budget_range?: string | null
          created_at?: string
          current_setup?: string | null
          energy_goals?: string[] | null
          grid_reliability?: string | null
          home_size?: string | null
          household_size?: number | null
          id?: string
          location?: string | null
          property_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_users: {
        Row: {
          country: string | null
          created_at: string
          email: string
          id: string
          name: string
          preferences: Json | null
          referral_code: string | null
          referred_by: string | null
          status: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          preferences?: Json | null
          referral_code?: string | null
          referred_by?: string | null
          status?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          preferences?: Json | null
          referral_code?: string | null
          referred_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "waitlist_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_assign_expert: { Args: { p_chat_id: string }; Returns: string }
      auto_assign_installer: { Args: { p_request_id: string }; Returns: string }
      cleanup_old_analytics: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_writer: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "writer" | "user" | "expert"
      provider_status: "pending" | "active" | "suspended" | "expired"
      service_category:
        | "consultation"
        | "installation"
        | "repair"
        | "sales"
        | "maintenance"
        | "training"
        | "audit"
        | "other"
      store_product_category:
        | "solar_panels"
        | "batteries"
        | "inverters"
        | "ev_chargers"
        | "smart_devices"
        | "accessories"
        | "bundles"
        | "clean_cooking"
      story_type:
        | "community_story"
        | "case_study"
        | "energy_project"
        | "impact_story"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "writer", "user", "expert"],
      provider_status: ["pending", "active", "suspended", "expired"],
      service_category: [
        "consultation",
        "installation",
        "repair",
        "sales",
        "maintenance",
        "training",
        "audit",
        "other",
      ],
      store_product_category: [
        "solar_panels",
        "batteries",
        "inverters",
        "ev_chargers",
        "smart_devices",
        "accessories",
        "bundles",
        "clean_cooking",
      ],
      story_type: [
        "community_story",
        "case_study",
        "energy_project",
        "impact_story",
      ],
    },
  },
} as const
