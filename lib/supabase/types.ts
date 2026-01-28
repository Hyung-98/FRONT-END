export type CommentStatus = 'published' | 'pending' | 'hidden' | 'blocked'
export type ReactionType = 'like' | 'dislike'
export type ReportReason =
  | 'spam'
  | 'offensive'
  | 'harassment'
  | 'misinformation'
  | 'violence'
  | 'hate_speech'
  | 'other'
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed'

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          slug: string
          title: string
          subtitle: string
          content: string
          category: string
          date: string
          reading_time: string
          hero_image: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          subtitle: string
          content: string
          category: string
          date: string
          reading_time: string
          hero_image: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          subtitle?: string
          content?: string
          category?: string
          date?: string
          reading_time?: string
          hero_image?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          parent_id: string | null
          author_id: string | null
          content: string
          status: CommentStatus
          is_deleted: boolean
          deleted_at: string | null
          deleted_by: string | null
          is_edited: boolean
          edited_at: string | null
          moderated_by: string | null
          moderated_at: string | null
          moderation_reason: string | null
          author_ip: string | null
          user_agent: string | null
          spam_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          parent_id?: string | null
          author_id?: string | null
          content: string
          status?: CommentStatus
          is_deleted?: boolean
          deleted_at?: string | null
          deleted_by?: string | null
          is_edited?: boolean
          edited_at?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_reason?: string | null
          author_ip?: string | null
          user_agent?: string | null
          spam_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          parent_id?: string | null
          author_id?: string | null
          content?: string
          status?: CommentStatus
          is_deleted?: boolean
          deleted_at?: string | null
          deleted_by?: string | null
          is_edited?: boolean
          edited_at?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_reason?: string | null
          author_ip?: string | null
          user_agent?: string | null
          spam_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      comment_reactions: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          reaction_type: ReactionType
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          reaction_type: ReactionType
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          reaction_type?: ReactionType
          created_at?: string
        }
      }
      comment_reports: {
        Row: {
          id: string
          comment_id: string
          reporter_id: string
          reason: ReportReason
          description: string | null
          status: ReportStatus
          reviewed_by: string | null
          reviewed_at: string | null
          resolution_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          reporter_id: string
          reason: ReportReason
          description?: string | null
          status?: ReportStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          resolution_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          reporter_id?: string
          reason?: ReportReason
          description?: string | null
          status?: ReportStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          resolution_note?: string | null
          created_at?: string
        }
      }
      comment_edit_history: {
        Row: {
          id: string
          comment_id: string
          previous_content: string
          edited_by: string
          edit_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          previous_content: string
          edited_by: string
          edit_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          previous_content?: string
          edited_by?: string
          edit_reason?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      create_comment: {
        Args: {
          p_post_id: string
          p_parent_id?: string | null
          p_content?: string | null
          p_actor_ip?: string | null
          p_user_agent?: string | null
          p_fingerprint?: string | null
        }
        Returns: Database['public']['Tables']['comments']['Row']
      }
      update_comment: {
        Args: {
          p_comment_id: string
          p_content: string
          p_edit_reason?: string | null
        }
        Returns: Database['public']['Tables']['comments']['Row']
      }
      delete_comment: {
        Args: {
          p_comment_id: string
        }
        Returns: boolean
      }
      toggle_reaction: {
        Args: {
          p_comment_id: string
          p_reaction_type: ReactionType
        }
        Returns: {
          action: 'added' | 'removed' | 'changed'
          reaction: ReactionType
          from?: ReactionType
          to?: ReactionType
        }
      }
      report_comment: {
        Args: {
          p_comment_id: string
          p_reason: ReportReason
          p_description?: string | null
        }
        Returns: Database['public']['Tables']['comment_reports']['Row']
      }
      get_comment_tree: {
        Args: {
          p_post_id: string
          p_max_depth?: number
          p_limit?: number
        }
        Returns: {
          id: string
          post_id: string
          parent_id: string | null
          author_id: string | null
          author_name: string
          author_avatar_url: string | null
          content: string
          status: CommentStatus
          is_deleted: boolean
          is_edited: boolean
          like_count: number
          dislike_count: number
          reply_count: number
          created_at: string
          depth: number
          path: string
        }[]
      }
    }
  }
}
