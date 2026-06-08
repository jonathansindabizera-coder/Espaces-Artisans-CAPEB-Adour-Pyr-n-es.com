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
      absences: {
        Row: {
          created_at: string
          date_debut: string
          date_fin: string
          employe_id: string
          id: string
          motif: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_debut: string
          date_fin: string
          employe_id: string
          id?: string
          motif?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_debut?: string
          date_fin?: string
          employe_id?: string
          id?: string
          motif?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affectations: {
        Row: {
          chantier_id: string
          created_at: string
          date: string
          demi_journee: Database["public"]["Enums"]["demi_journee_type"]
          employe_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chantier_id: string
          created_at?: string
          date: string
          demi_journee?: Database["public"]["Enums"]["demi_journee_type"]
          employe_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chantier_id?: string
          created_at?: string
          date?: string
          demi_journee?: Database["public"]["Enums"]["demi_journee_type"]
          employe_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chantiers: {
        Row: {
          client_id: string
          date_creation: string
          duree_estimee: string | null
          id: string
          montant_estime: number | null
          nature_travaux: string
          statut: Database["public"]["Enums"]["chantier_statut"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          date_creation?: string
          duree_estimee?: string | null
          id?: string
          montant_estime?: number | null
          nature_travaux: string
          statut?: Database["public"]["Enums"]["chantier_statut"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          date_creation?: string
          duree_estimee?: string | null
          id?: string
          montant_estime?: number | null
          nature_travaux?: string
          statut?: Database["public"]["Enums"]["chantier_statut"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chantiers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          adresse: string | null
          created_at: string
          email: string | null
          id: string
          nom: string
          telephone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom: string
          telephone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adresse?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          telephone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      employes: {
        Row: {
          actif: boolean
          couleur: string
          created_at: string
          id: string
          nom: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actif?: boolean
          couleur?: string
          created_at?: string
          id?: string
          nom: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actif?: boolean
          couleur?: string
          created_at?: string
          id?: string
          nom?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          adresse: string | null
          created_at: string
          email: string | null
          entreprise: string
          id: string
          nom: string
          telephone: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          email?: string | null
          entreprise?: string
          id: string
          nom?: string
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          created_at?: string
          email?: string | null
          entreprise?: string
          id?: string
          nom?: string
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pv: {
        Row: {
          chantier_id: string
          created_at: string
          date_effet: string | null
          date_signature: string | null
          id: string
          lieu: string | null
          reserves_delai: string | null
          reserves_nature: string | null
          reserves_travaux: string | null
          signature_client_data: string | null
          signature_entreprise_data: string | null
          signe_client: boolean
          signe_entreprise: boolean
          statut: Database["public"]["Enums"]["pv_statut"]
          type_reception: Database["public"]["Enums"]["pv_type_reception"]
          updated_at: string
          user_id: string
        }
        Insert: {
          chantier_id: string
          created_at?: string
          date_effet?: string | null
          date_signature?: string | null
          id?: string
          lieu?: string | null
          reserves_delai?: string | null
          reserves_nature?: string | null
          reserves_travaux?: string | null
          signature_client_data?: string | null
          signature_entreprise_data?: string | null
          signe_client?: boolean
          signe_entreprise?: boolean
          statut?: Database["public"]["Enums"]["pv_statut"]
          type_reception?: Database["public"]["Enums"]["pv_type_reception"]
          updated_at?: string
          user_id: string
        }
        Update: {
          chantier_id?: string
          created_at?: string
          date_effet?: string | null
          date_signature?: string | null
          id?: string
          lieu?: string | null
          reserves_delai?: string | null
          reserves_nature?: string | null
          reserves_travaux?: string | null
          signature_client_data?: string | null
          signature_entreprise_data?: string | null
          signe_client?: boolean
          signe_entreprise?: boolean
          statut?: Database["public"]["Enums"]["pv_statut"]
          type_reception?: Database["public"]["Enums"]["pv_type_reception"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pv_chantier_id_fkey"
            columns: ["chantier_id"]
            isOneToOne: false
            referencedRelation: "chantiers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      chantier_statut:
        | "devis_a_faire"
        | "devis_envoye"
        | "devis_signe"
        | "travaux_en_cours"
        | "pv_a_signer"
        | "termine"
      demi_journee_type: "matin" | "apres_midi" | "journee"
      pv_statut: "brouillon" | "signe"
      pv_type_reception: "sans_reserve" | "avec_reserve"
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
      chantier_statut: [
        "devis_a_faire",
        "devis_envoye",
        "devis_signe",
        "travaux_en_cours",
        "pv_a_signer",
        "termine",
      ],
      demi_journee_type: ["matin", "apres_midi", "journee"],
      pv_statut: ["brouillon", "signe"],
      pv_type_reception: ["sans_reserve", "avec_reserve"],
    },
  },
} as const
