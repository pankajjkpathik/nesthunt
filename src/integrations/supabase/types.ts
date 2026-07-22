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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      builders: {
        Row: {
          created_at: string
          decision: Json
          featured: boolean
          headquarters: string
          id: string
          metrics: Json
          name: string
          slug: string
          strengths: string[]
          summary: string
          timeline: Json
          updated_at: string
          watch_outs: string[]
          years_active: number
        }
        Insert: {
          created_at?: string
          decision?: Json
          featured?: boolean
          headquarters: string
          id?: string
          metrics?: Json
          name: string
          slug: string
          strengths?: string[]
          summary: string
          timeline?: Json
          updated_at?: string
          watch_outs?: string[]
          years_active?: number
        }
        Update: {
          created_at?: string
          decision?: Json
          featured?: boolean
          headquarters?: string
          id?: string
          metrics?: Json
          name?: string
          slug?: string
          strengths?: string[]
          summary?: string
          timeline?: Json
          updated_at?: string
          watch_outs?: string[]
          years_active?: number
        }
        Relationships: []
      }
      entity_documents: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          kind: string
          sort_order: number
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          kind?: string
          sort_order?: number
          title: string
          url: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          kind?: string
          sort_order?: number
          title?: string
          url?: string
        }
        Relationships: []
      }
      entity_images: {
        Row: {
          alt: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt?: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: []
      }
      entity_scores: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          label: string
          scale: number
          score: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          label: string
          scale?: number
          score: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          label?: string
          scale?: number
          score?: number
          sort_order?: number
        }
        Relationships: []
      }
      places: {
        Row: {
          created_at: string
          decision: Json
          education: string[]
          executive_summary: string
          featured: boolean
          growth_drivers: string[]
          healthcare: string[]
          hero: Json
          highlights: string[]
          id: string
          lifestyle: string[]
          metrics: Json
          name: string
          opportunities: string[]
          region: string
          risks: string[]
          seo: Json
          slug: string
          status: string
          summary: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decision?: Json
          education?: string[]
          executive_summary?: string
          featured?: boolean
          growth_drivers?: string[]
          healthcare?: string[]
          hero?: Json
          highlights?: string[]
          id?: string
          lifestyle?: string[]
          metrics?: Json
          name: string
          opportunities?: string[]
          region: string
          risks?: string[]
          seo?: Json
          slug: string
          status?: string
          summary: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decision?: Json
          education?: string[]
          executive_summary?: string
          featured?: boolean
          growth_drivers?: string[]
          healthcare?: string[]
          hero?: Json
          highlights?: string[]
          id?: string
          lifestyle?: string[]
          metrics?: Json
          name?: string
          opportunities?: string[]
          region?: string
          risks?: string[]
          seo?: Json
          slug?: string
          status?: string
          summary?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          builder_id: string | null
          created_at: string
          featured: boolean
          id: string
          legal: string[]
          less_suitable_for: string[]
          metrics: Json
          name: string
          place_id: string | null
          progress: string[]
          risks: string[]
          slug: string
          status: string
          strengths: string[]
          suitable_for: string[]
          summary: string
          updated_at: string
        }
        Insert: {
          builder_id?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          legal?: string[]
          less_suitable_for?: string[]
          metrics?: Json
          name: string
          place_id?: string | null
          progress?: string[]
          risks?: string[]
          slug: string
          status: string
          strengths?: string[]
          suitable_for?: string[]
          summary: string
          updated_at?: string
        }
        Update: {
          builder_id?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          legal?: string[]
          less_suitable_for?: string[]
          metrics?: Json
          name?: string
          place_id?: string | null
          progress?: string[]
          risks?: string[]
          slug?: string
          status?: string
          strengths?: string[]
          suitable_for?: string[]
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_builder_id_fkey"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "builders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
