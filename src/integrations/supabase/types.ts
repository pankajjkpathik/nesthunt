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
      amenities: {
        Row: {
          category: string
          created_at: string
          description: string | null
          featured: boolean
          icon: string | null
          id: string
          illustration_id: string | null
          name: string
          seo: Json
          slug: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          icon?: string | null
          id?: string
          illustration_id?: string | null
          name: string
          seo?: Json
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          icon?: string | null
          id?: string
          illustration_id?: string | null
          name?: string
          seo?: Json
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "amenities_illustration_id_fkey"
            columns: ["illustration_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amenities_illustration_id_fkey"
            columns: ["illustration_id"]
            isOneToOne: false
            referencedRelation: "media_assets_with_usage"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_places: {
        Row: {
          builder_id: string
          created_at: string
          place_id: string
        }
        Insert: {
          builder_id: string
          created_at?: string
          place_id: string
        }
        Update: {
          builder_id?: string
          created_at?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_places_builder_id_fkey"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "builders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      builders: {
        Row: {
          awards: Json
          builder_type: string
          certifications: Json
          city: string
          company_registration: string
          country: string
          created_at: string
          decision: Json
          description: string
          email: string
          employee_count: string
          featured: boolean
          gst: string
          head_office: string
          headquarters: string
          hero: Json
          id: string
          leadership: Json
          metrics: Json
          name: string
          organization_type: string
          pan: string
          phone: string
          rera: Json
          seo: Json
          slug: string
          state: string
          status: string
          strengths: string[]
          summary: string
          tagline: string
          timeline: Json
          trust_breakdown: Json
          trust_score: number | null
          updated_at: string
          verified: boolean
          watch_outs: string[]
          website: string
          year_established: number | null
          years_active: number
        }
        Insert: {
          awards?: Json
          builder_type?: string
          certifications?: Json
          city?: string
          company_registration?: string
          country?: string
          created_at?: string
          decision?: Json
          description?: string
          email?: string
          employee_count?: string
          featured?: boolean
          gst?: string
          head_office?: string
          headquarters: string
          hero?: Json
          id?: string
          leadership?: Json
          metrics?: Json
          name: string
          organization_type?: string
          pan?: string
          phone?: string
          rera?: Json
          seo?: Json
          slug: string
          state?: string
          status?: string
          strengths?: string[]
          summary: string
          tagline?: string
          timeline?: Json
          trust_breakdown?: Json
          trust_score?: number | null
          updated_at?: string
          verified?: boolean
          watch_outs?: string[]
          website?: string
          year_established?: number | null
          years_active?: number
        }
        Update: {
          awards?: Json
          builder_type?: string
          certifications?: Json
          city?: string
          company_registration?: string
          country?: string
          created_at?: string
          decision?: Json
          description?: string
          email?: string
          employee_count?: string
          featured?: boolean
          gst?: string
          head_office?: string
          headquarters?: string
          hero?: Json
          id?: string
          leadership?: Json
          metrics?: Json
          name?: string
          organization_type?: string
          pan?: string
          phone?: string
          rera?: Json
          seo?: Json
          slug?: string
          state?: string
          status?: string
          strengths?: string[]
          summary?: string
          tagline?: string
          timeline?: Json
          trust_breakdown?: Json
          trust_score?: number | null
          updated_at?: string
          verified?: boolean
          watch_outs?: string[]
          website?: string
          year_established?: number | null
          years_active?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          featured_image_id: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          seo: Json
          slug: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          featured_image_id?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          seo?: Json
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          featured_image_id?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          seo?: Json
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_featured_image_id_fkey"
            columns: ["featured_image_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_featured_image_id_fkey"
            columns: ["featured_image_id"]
            isOneToOne: false
            referencedRelation: "media_assets_with_usage"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      entity_relationships: {
        Row: {
          created_at: string
          from_id: string
          from_type: string
          id: string
          kind: string
          meta: Json
          sort_order: number
          to_id: string
          to_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_id: string
          from_type: string
          id?: string
          kind: string
          meta?: Json
          sort_order?: number
          to_id: string
          to_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_id?: string
          from_type?: string
          id?: string
          kind?: string
          meta?: Json
          sort_order?: number
          to_id?: string
          to_type?: string
          updated_at?: string
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
      infrastructure_items: {
        Row: {
          address: string | null
          category: string
          city: string | null
          created_at: string
          description: string | null
          hours: string | null
          id: string
          image_id: string | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          slug: string
          state: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          city?: string | null
          created_at?: string
          description?: string | null
          hours?: string | null
          id?: string
          image_id?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          slug: string
          state?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          created_at?: string
          description?: string | null
          hours?: string | null
          id?: string
          image_id?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          slug?: string
          state?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_items_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "infrastructure_items_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "media_assets_with_usage"
            referencedColumns: ["id"]
          },
        ]
      }
      infrastructure_links: {
        Row: {
          created_at: string
          distance_km: number | null
          entity_id: string
          entity_type: string
          id: string
          infrastructure_id: string
          notes: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          distance_km?: number | null
          entity_id: string
          entity_type: string
          id?: string
          infrastructure_id: string
          notes?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          distance_km?: number | null
          entity_id?: string
          entity_type?: string
          id?: string
          infrastructure_id?: string
          notes?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_links_infrastructure_id_fkey"
            columns: ["infrastructure_id"]
            isOneToOne: false
            referencedRelation: "infrastructure_items"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt: string
          archived: boolean
          caption: string
          copyright: string
          created_at: string
          credit: string
          description: string
          featured: boolean
          file_name: string
          file_size: number
          folder: string
          height: number | null
          id: string
          license: string
          mime_type: string
          photographer: string
          storage_path: string
          tags: string[]
          title: string
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt?: string
          archived?: boolean
          caption?: string
          copyright?: string
          created_at?: string
          credit?: string
          description?: string
          featured?: boolean
          file_name: string
          file_size?: number
          folder?: string
          height?: number | null
          id?: string
          license?: string
          mime_type: string
          photographer?: string
          storage_path: string
          tags?: string[]
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt?: string
          archived?: boolean
          caption?: string
          copyright?: string
          created_at?: string
          credit?: string
          description?: string
          featured?: boolean
          file_name?: string
          file_size?: number
          folder?: string
          height?: number | null
          id?: string
          license?: string
          mime_type?: string
          photographer?: string
          storage_path?: string
          tags?: string[]
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      media_usages: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          field: string
          id: string
          media_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          field?: string
          id?: string
          media_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          field?: string
          id?: string
          media_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "media_usages_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_usages_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets_with_usage"
            referencedColumns: ["id"]
          },
        ]
      }
      place_evidence: {
        Row: {
          category: string
          confidence_level: string
          created_at: string
          created_by: string | null
          description: string | null
          evidence_type: string
          id: string
          place_id: string
          publication_date: string | null
          review_date: string | null
          sort_order: number
          source_name: string | null
          source_url: string | null
          title: string
          updated_at: string
          uploaded_document_media_id: string | null
          verification_status: string
          verified_by: string | null
        }
        Insert: {
          category?: string
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          evidence_type?: string
          id?: string
          place_id: string
          publication_date?: string | null
          review_date?: string | null
          sort_order?: number
          source_name?: string | null
          source_url?: string | null
          title: string
          updated_at?: string
          uploaded_document_media_id?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Update: {
          category?: string
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          evidence_type?: string
          id?: string
          place_id?: string
          publication_date?: string | null
          review_date?: string | null
          sort_order?: number
          source_name?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string
          uploaded_document_media_id?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_evidence_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_evidence_uploaded_document_media_id_fkey"
            columns: ["uploaded_document_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_evidence_uploaded_document_media_id_fkey"
            columns: ["uploaded_document_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets_with_usage"
            referencedColumns: ["id"]
          },
        ]
      }
      place_promises: {
        Row: {
          announced_by: string | null
          announcement_date: string | null
          created_at: string
          created_by: string | null
          current_status: string
          evidence: string | null
          expected_completion: string | null
          id: string
          last_verified: string | null
          place_id: string
          promise: string
          remarks: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          announced_by?: string | null
          announcement_date?: string | null
          created_at?: string
          created_by?: string | null
          current_status?: string
          evidence?: string | null
          expected_completion?: string | null
          id?: string
          last_verified?: string | null
          place_id: string
          promise: string
          remarks?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          announced_by?: string | null
          announcement_date?: string | null
          created_at?: string
          created_by?: string | null
          current_status?: string
          evidence?: string | null
          expected_completion?: string | null
          id?: string
          last_verified?: string | null
          place_id?: string
          promise?: string
          remarks?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_promises_evidence_fkey"
            columns: ["evidence"]
            isOneToOne: false
            referencedRelation: "place_evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_promises_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_risks: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          evidence_reference: string | null
          id: string
          mitigation: string | null
          place_id: string
          probability: string
          review_cycle: string
          severity: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          evidence_reference?: string | null
          id?: string
          mitigation?: string | null
          place_id: string
          probability?: string
          review_cycle?: string
          severity?: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          evidence_reference?: string | null
          id?: string
          mitigation?: string | null
          place_id?: string
          probability?: string
          review_cycle?: string
          severity?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_risks_evidence_reference_fkey"
            columns: ["evidence_reference"]
            isOneToOne: false
            referencedRelation: "place_evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_risks_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          absorption_rate: number | null
          alternate_names: string[]
          average_price: number | null
          city: string
          connectivity_summary: string | null
          country: string
          created_at: string
          decision: Json
          development_stage: string | null
          education: string[]
          education_summary: string | null
          employment_summary: string | null
          executive_summary: string
          featured: boolean
          growth_drivers: string[]
          growth_outlook: string | null
          healthcare: string[]
          healthcare_summary: string | null
          hero: Json
          highlights: string[]
          id: string
          investment_category: string | null
          investment_outlook: string | null
          latitude: number | null
          lifestyle: string[]
          lifestyle_tags: string[]
          livability_outlook: string | null
          locality_type: string | null
          longitude: number | null
          market_segment: string | null
          metrics: Json
          name: string
          official_name: string | null
          opportunities: string[]
          pin_codes: string[]
          polygon: Json | null
          price_max: number | null
          price_min: number | null
          recommendation: string | null
          region: string
          rental_yield: number | null
          risks: string[]
          seo: Json
          slug: string
          state: string
          status: string
          summary: string
          updated_at: string
          vacancy_rate: number | null
          weaknesses: string[]
        }
        Insert: {
          absorption_rate?: number | null
          alternate_names?: string[]
          average_price?: number | null
          city?: string
          connectivity_summary?: string | null
          country?: string
          created_at?: string
          decision?: Json
          development_stage?: string | null
          education?: string[]
          education_summary?: string | null
          employment_summary?: string | null
          executive_summary?: string
          featured?: boolean
          growth_drivers?: string[]
          growth_outlook?: string | null
          healthcare?: string[]
          healthcare_summary?: string | null
          hero?: Json
          highlights?: string[]
          id?: string
          investment_category?: string | null
          investment_outlook?: string | null
          latitude?: number | null
          lifestyle?: string[]
          lifestyle_tags?: string[]
          livability_outlook?: string | null
          locality_type?: string | null
          longitude?: number | null
          market_segment?: string | null
          metrics?: Json
          name: string
          official_name?: string | null
          opportunities?: string[]
          pin_codes?: string[]
          polygon?: Json | null
          price_max?: number | null
          price_min?: number | null
          recommendation?: string | null
          region: string
          rental_yield?: number | null
          risks?: string[]
          seo?: Json
          slug: string
          state?: string
          status?: string
          summary: string
          updated_at?: string
          vacancy_rate?: number | null
          weaknesses?: string[]
        }
        Update: {
          absorption_rate?: number | null
          alternate_names?: string[]
          average_price?: number | null
          city?: string
          connectivity_summary?: string | null
          country?: string
          created_at?: string
          decision?: Json
          development_stage?: string | null
          education?: string[]
          education_summary?: string | null
          employment_summary?: string | null
          executive_summary?: string
          featured?: boolean
          growth_drivers?: string[]
          growth_outlook?: string | null
          healthcare?: string[]
          healthcare_summary?: string | null
          hero?: Json
          highlights?: string[]
          id?: string
          investment_category?: string | null
          investment_outlook?: string | null
          latitude?: number | null
          lifestyle?: string[]
          lifestyle_tags?: string[]
          livability_outlook?: string | null
          locality_type?: string | null
          longitude?: number | null
          market_segment?: string | null
          metrics?: Json
          name?: string
          official_name?: string | null
          opportunities?: string[]
          pin_codes?: string[]
          polygon?: Json | null
          price_max?: number | null
          price_min?: number | null
          recommendation?: string | null
          region?: string
          rental_yield?: number | null
          risks?: string[]
          seo?: Json
          slug?: string
          state?: string
          status?: string
          summary?: string
          updated_at?: string
          vacancy_rate?: number | null
          weaknesses?: string[]
        }
        Relationships: []
      }
      projects: {
        Row: {
          amenities: Json
          booking_amount: number | null
          builder_id: string | null
          completion_date: string | null
          completion_percentage: number | null
          construction_status: string | null
          created_at: string
          executive_summary: string | null
          featured: boolean
          hero: Json
          id: string
          investment: Json
          launch_date: string | null
          legal: string[]
          less_suitable_for: string[]
          maintenance_charges: string | null
          max_price: number | null
          metrics: Json
          name: string
          nearby: Json
          place_id: string | null
          possession_date: string | null
          price_per_sqft: number | null
          progress: string[]
          property_type: string | null
          publish_status: string
          rera: Json
          rera_number: string | null
          risks: string[]
          seo: Json
          short_description: string | null
          slug: string
          starting_price: number | null
          status: string
          strengths: string[]
          suitable_for: string[]
          summary: string
          tagline: string | null
          unit_types: Json
          updated_at: string
          verified: boolean
        }
        Insert: {
          amenities?: Json
          booking_amount?: number | null
          builder_id?: string | null
          completion_date?: string | null
          completion_percentage?: number | null
          construction_status?: string | null
          created_at?: string
          executive_summary?: string | null
          featured?: boolean
          hero?: Json
          id?: string
          investment?: Json
          launch_date?: string | null
          legal?: string[]
          less_suitable_for?: string[]
          maintenance_charges?: string | null
          max_price?: number | null
          metrics?: Json
          name: string
          nearby?: Json
          place_id?: string | null
          possession_date?: string | null
          price_per_sqft?: number | null
          progress?: string[]
          property_type?: string | null
          publish_status?: string
          rera?: Json
          rera_number?: string | null
          risks?: string[]
          seo?: Json
          short_description?: string | null
          slug: string
          starting_price?: number | null
          status?: string
          strengths?: string[]
          suitable_for?: string[]
          summary?: string
          tagline?: string | null
          unit_types?: Json
          updated_at?: string
          verified?: boolean
        }
        Update: {
          amenities?: Json
          booking_amount?: number | null
          builder_id?: string | null
          completion_date?: string | null
          completion_percentage?: number | null
          construction_status?: string | null
          created_at?: string
          executive_summary?: string | null
          featured?: boolean
          hero?: Json
          id?: string
          investment?: Json
          launch_date?: string | null
          legal?: string[]
          less_suitable_for?: string[]
          maintenance_charges?: string | null
          max_price?: number | null
          metrics?: Json
          name?: string
          nearby?: Json
          place_id?: string | null
          possession_date?: string | null
          price_per_sqft?: number | null
          progress?: string[]
          property_type?: string | null
          publish_status?: string
          rera?: Json
          rera_number?: string | null
          risks?: string[]
          seo?: Json
          short_description?: string | null
          slug?: string
          starting_price?: number | null
          status?: string
          strengths?: string[]
          suitable_for?: string[]
          summary?: string
          tagline?: string | null
          unit_types?: Json
          updated_at?: string
          verified?: boolean
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
      unit_types: {
        Row: {
          balconies: number | null
          bathrooms: number | null
          bedrooms: number | null
          carpet_area_max: number | null
          carpet_area_min: number | null
          category: string
          created_at: string
          description: string | null
          facing: string | null
          floor_plan_id: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          status: string
          super_area_max: number | null
          super_area_min: number | null
          updated_at: string
        }
        Insert: {
          balconies?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          carpet_area_max?: number | null
          carpet_area_min?: number | null
          category?: string
          created_at?: string
          description?: string | null
          facing?: string | null
          floor_plan_id?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          status?: string
          super_area_max?: number | null
          super_area_min?: number | null
          updated_at?: string
        }
        Update: {
          balconies?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          carpet_area_max?: number | null
          carpet_area_min?: number | null
          category?: string
          created_at?: string
          description?: string | null
          facing?: string | null
          floor_plan_id?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          status?: string
          super_area_max?: number | null
          super_area_min?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_types_floor_plan_id_fkey"
            columns: ["floor_plan_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_types_floor_plan_id_fkey"
            columns: ["floor_plan_id"]
            isOneToOne: false
            referencedRelation: "media_assets_with_usage"
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
      media_assets_with_usage: {
        Row: {
          alt: string | null
          archived: boolean | null
          caption: string | null
          copyright: string | null
          created_at: string | null
          credit: string | null
          description: string | null
          featured: boolean | null
          file_name: string | null
          file_size: number | null
          folder: string | null
          height: number | null
          id: string | null
          license: string | null
          mime_type: string | null
          photographer: string | null
          storage_path: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
          usage_count: number | null
          width: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      bootstrap_admin: { Args: never; Returns: boolean }
      check_relationship_valid: {
        Args: {
          _from_id: string
          _from_type: string
          _kind: string
          _to_id: string
          _to_type: string
        }
        Returns: boolean
      }
      content_unused_amenities: {
        Args: never
        Returns: {
          id: string
          name: string
          slug: string
        }[]
      }
      content_unused_categories: {
        Args: never
        Returns: {
          id: string
          name: string
          slug: string
        }[]
      }
      content_unused_infrastructure: {
        Args: never
        Returns: {
          id: string
          name: string
          slug: string
        }[]
      }
      content_unused_unit_types: {
        Args: never
        Returns: {
          id: string
          name: string
          slug: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_entity_published: {
        Args: { _entity_id: string; _entity_type: string }
        Returns: boolean
      }
      rel_builders_without_projects: {
        Args: never
        Returns: {
          id: string
          name: string
          slug: string
        }[]
      }
      rel_orphaned_projects: {
        Args: never
        Returns: {
          id: string
          missing: string
          name: string
          slug: string
        }[]
      }
      rel_places_without_builders: {
        Args: never
        Returns: {
          id: string
          name: string
          slug: string
        }[]
      }
      rel_places_without_projects: {
        Args: never
        Returns: {
          id: string
          name: string
          slug: string
        }[]
      }
      rel_unlinked_media: {
        Args: never
        Returns: {
          file_name: string
          folder: string
          id: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
