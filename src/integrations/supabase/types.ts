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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_email: string | null
          admin_uid: string
          created_at: string
          details: string | null
          id: string
          target: string | null
        }
        Insert: {
          action: string
          admin_email?: string | null
          admin_uid: string
          created_at?: string
          details?: string | null
          id?: string
          target?: string | null
        }
        Update: {
          action?: string
          admin_email?: string | null
          admin_uid?: string
          created_at?: string
          details?: string | null
          id?: string
          target?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          expires_at: string | null
          id: string
          is_blinking: boolean
          is_published: boolean
          priority: string
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          action_url?: string | null
          body?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_blinking?: boolean
          is_published?: boolean
          priority?: string
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_blinking?: boolean
          is_published?: boolean
          priority?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          allowed_domains: string[]
          apk_release_date: string | null
          apk_url: string | null
          apk_whats_new: string | null
          app_logo: string | null
          app_name: string
          app_tagline: string
          app_version: string | null
          banner_enabled: boolean
          banner_interval_ms: number
          id: string
          maintenance_enabled: boolean
          maintenance_message: string
          pwa_install_enabled: boolean
          splash_enabled: boolean
          splash_image: string | null
          telegram_enabled: boolean
          telegram_icon: string | null
          telegram_join_text: string
          telegram_label: string
          telegram_message: string
          telegram_url: string
          theme_primary: string | null
          theme_vip: string | null
          updated_at: string
        }
        Insert: {
          allowed_domains?: string[]
          apk_release_date?: string | null
          apk_url?: string | null
          apk_whats_new?: string | null
          app_logo?: string | null
          app_name?: string
          app_tagline?: string
          app_version?: string | null
          banner_enabled?: boolean
          banner_interval_ms?: number
          id?: string
          maintenance_enabled?: boolean
          maintenance_message?: string
          pwa_install_enabled?: boolean
          splash_enabled?: boolean
          splash_image?: string | null
          telegram_enabled?: boolean
          telegram_icon?: string | null
          telegram_join_text?: string
          telegram_label?: string
          telegram_message?: string
          telegram_url?: string
          theme_primary?: string | null
          theme_vip?: string | null
          updated_at?: string
        }
        Update: {
          allowed_domains?: string[]
          apk_release_date?: string | null
          apk_url?: string | null
          apk_whats_new?: string | null
          app_logo?: string | null
          app_name?: string
          app_tagline?: string
          app_version?: string | null
          banner_enabled?: boolean
          banner_interval_ms?: number
          id?: string
          maintenance_enabled?: boolean
          maintenance_message?: string
          pwa_install_enabled?: boolean
          splash_enabled?: boolean
          splash_image?: string | null
          telegram_enabled?: boolean
          telegram_icon?: string | null
          telegram_join_text?: string
          telegram_label?: string
          telegram_message?: string
          telegram_url?: string
          theme_primary?: string | null
          theme_vip?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      apps: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          display_order: number
          id: string
          is_featured: boolean
          is_new: boolean
          is_popular: boolean
          is_published: boolean
          is_updated: boolean
          is_vip: boolean
          kind: string
          logo_url: string | null
          name: string
          update_notes: string | null
          updated_at: string
          version: string | null
          website_url: string
          webview_mode: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          is_new?: boolean
          is_popular?: boolean
          is_published?: boolean
          is_updated?: boolean
          is_vip?: boolean
          kind?: string
          logo_url?: string | null
          name: string
          update_notes?: string | null
          updated_at?: string
          version?: string | null
          website_url: string
          webview_mode?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          is_new?: boolean
          is_popular?: boolean
          is_published?: boolean
          is_updated?: boolean
          is_vip?: boolean
          kind?: string
          logo_url?: string | null
          name?: string
          update_notes?: string | null
          updated_at?: string
          version?: string | null
          website_url?: string
          webview_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "apps_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_published: boolean
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_published?: boolean
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_published?: boolean
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string
          id: string
          is_published: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          is_published?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          is_published?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          success: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          success: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      owner_profile: {
        Row: {
          about: string
          contact_links: Json
          id: string
          name: string
          photo_url: string | null
          social_links: Json
          tagline: string | null
          updated_at: string
        }
        Insert: {
          about?: string
          contact_links?: Json
          id?: string
          name?: string
          photo_url?: string | null
          social_links?: Json
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          about?: string
          contact_links?: Json
          id?: string
          name?: string
          photo_url?: string | null
          social_links?: Json
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      upcoming_apps: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          is_published: boolean
          logo_url: string | null
          name: string
          notify_count: number
          notify_enabled: boolean
          notify_url: string | null
          progress: number | null
          release_date: string | null
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name: string
          notify_count?: number
          notify_enabled?: boolean
          notify_url?: string | null
          progress?: number | null
          release_date?: string | null
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name?: string
          notify_count?: number
          notify_enabled?: boolean
          notify_url?: string | null
          progress?: number | null
          release_date?: string | null
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          first_seen: string
          last_seen: string
          session_id: string
          views: number
        }
        Insert: {
          first_seen?: string
          last_seen?: string
          session_id: string
          views?: number
        }
        Update: {
          first_seen?: string
          last_seen?: string
          session_id?: string
          views?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      launch_upcoming: {
        Args: { p_category_id?: string; p_id: string; p_website_url: string }
        Returns: string
      }
      notify_upcoming: { Args: { p_id: string }; Returns: number }
      record_admin_login: { Args: never; Returns: boolean }
      track_visit: { Args: { p_session: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
