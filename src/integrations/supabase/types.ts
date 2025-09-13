export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_dismissed: boolean | null
          potential_savings: number | null
          priority_score: number | null
          recommendation_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_dismissed?: boolean | null
          potential_savings?: number | null
          priority_score?: number | null
          recommendation_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_dismissed?: boolean | null
          potential_savings?: number | null
          priority_score?: number | null
          recommendation_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      bank_connections: {
        Row: {
          access_token_encrypted: string | null
          created_at: string | null
          id: string
          institution_name: string
          is_active: boolean | null
          last_sync: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string | null
          id?: string
          institution_name: string
          is_active?: boolean | null
          last_sync?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string | null
          id?: string
          institution_name?: string
          is_active?: boolean | null
          last_sync?: string | null
          user_id?: string
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          allocated_amount: number
          category_type: string
          created_at: string | null
          id: string
          name: string
          spent_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allocated_amount: number
          category_type: string
          created_at?: string | null
          id?: string
          name: string
          spent_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allocated_amount?: number
          category_type?: string
          created_at?: string | null
          id?: string
          name?: string
          spent_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          amount: number
          blockchain_id: string | null
          created_at: string | null
          current_balance: number | null
          days_past_due: number | null
          debt_type: Database["public"]["Enums"]["debt_type"] | null
          details: Json | null
          due_date: string | null
          id: string
          interest_rate: number | null
          is_active: boolean | null
          is_high_priority: boolean | null
          is_tax_deductible: boolean | null
          is_variable_rate: boolean | null
          lender: string | null
          minimum_payment: number | null
          name: string
          notes: string | null
          payment_frequency: string | null
          principal_amount: number | null
          remaining_term_months: number | null
          source: string
          type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          blockchain_id?: string | null
          created_at?: string | null
          current_balance?: number | null
          days_past_due?: number | null
          debt_type?: Database["public"]["Enums"]["debt_type"] | null
          details?: Json | null
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          is_high_priority?: boolean | null
          is_tax_deductible?: boolean | null
          is_variable_rate?: boolean | null
          lender?: string | null
          minimum_payment?: number | null
          name: string
          notes?: string | null
          payment_frequency?: string | null
          principal_amount?: number | null
          remaining_term_months?: number | null
          source: string
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          blockchain_id?: string | null
          created_at?: string | null
          current_balance?: number | null
          days_past_due?: number | null
          debt_type?: Database["public"]["Enums"]["debt_type"] | null
          details?: Json | null
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          is_high_priority?: boolean | null
          is_tax_deductible?: boolean | null
          is_variable_rate?: boolean | null
          lender?: string | null
          minimum_payment?: number | null
          name?: string
          notes?: string | null
          payment_frequency?: string | null
          principal_amount?: number | null
          remaining_term_months?: number | null
          source?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dids: {
        Row: {
          created_at: string | null
          did: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          did: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          did?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          read: boolean | null
          read_at: string | null
          title: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          blockchain_id: string | null
          created_at: string | null
          date: string | null
          debt_id: string
          id: string
          interest_portion: number | null
          notes: string | null
          payment_date: string | null
          principal_portion: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          blockchain_id?: string | null
          created_at?: string | null
          date?: string | null
          debt_id: string
          id?: string
          interest_portion?: number | null
          notes?: string | null
          payment_date?: string | null
          principal_portion?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          blockchain_id?: string | null
          created_at?: string | null
          date?: string | null
          debt_id?: string
          id?: string
          interest_portion?: number | null
          notes?: string | null
          payment_date?: string | null
          principal_portion?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          monthly_income: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          monthly_income?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          monthly_income?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      repayment_plans: {
        Row: {
          blockchain_id: string | null
          created_at: string | null
          debt_order: Json
          expected_completion_date: string | null
          id: string
          is_active: boolean | null
          monthly_payment_amount: number | null
          payment_schedule: Json | null
          strategy: string | null
          total_interest_saved: number | null
          user_id: string
        }
        Insert: {
          blockchain_id?: string | null
          created_at?: string | null
          debt_order: Json
          expected_completion_date?: string | null
          id?: string
          is_active?: boolean | null
          monthly_payment_amount?: number | null
          payment_schedule?: Json | null
          strategy?: string | null
          total_interest_saved?: number | null
          user_id: string
        }
        Update: {
          blockchain_id?: string | null
          created_at?: string | null
          debt_order?: Json
          expected_completion_date?: string | null
          id?: string
          is_active?: boolean | null
          monthly_payment_amount?: number | null
          payment_schedule?: Json | null
          strategy?: string | null
          total_interest_saved?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repayment_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_check_in: string | null
          longest_streak: number | null
          milestones_achieved: string[] | null
          total_payments_logged: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_check_in?: string | null
          longest_streak?: number | null
          milestones_achieved?: string[] | null
          total_payments_logged?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_check_in?: string | null
          longest_streak?: number | null
          milestones_achieved?: string[] | null
          total_payments_logged?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          hashed_password: string
          id: string
          is_verified: boolean | null
          notification_preferences: Json | null
          phone_number: string | null
          plaid_access_token: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          hashed_password: string
          id?: string
          is_verified?: boolean | null
          notification_preferences?: Json | null
          phone_number?: string | null
          plaid_access_token?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          hashed_password?: string
          id?: string
          is_verified?: boolean | null
          notification_preferences?: Json | null
          phone_number?: string | null
          plaid_access_token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      verifiable_credentials: {
        Row: {
          debt_id: string | null
          id: string
          issued_at: string | null
          revoked_at: string | null
          status: string | null
          type: string | null
          user_id: string
          vc_jwt: string | null
        }
        Insert: {
          debt_id?: string | null
          id?: string
          issued_at?: string | null
          revoked_at?: string | null
          status?: string | null
          type?: string | null
          user_id: string
          vc_jwt?: string | null
        }
        Update: {
          debt_id?: string | null
          id?: string
          issued_at?: string | null
          revoked_at?: string | null
          status?: string | null
          type?: string | null
          user_id?: string
          vc_jwt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifiable_credentials_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifiable_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_debt_metrics: {
        Args: { user_uuid: string }
        Returns: {
          total_debt: number
          total_minimum_payments: number
          debt_count: number
          high_priority_count: number
          average_interest_rate: number
        }[]
      }
    }
    Enums: {
      debt_type:
        | "credit_card"
        | "student_loan"
        | "mortgage"
        | "personal_loan"
        | "auto_loan"
        | "family_loan"
        | "other"
      payment_frequency: "weekly" | "biweekly" | "monthly" | "quarterly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      debt_type: [
        "credit_card",
        "student_loan",
        "mortgage",
        "personal_loan",
        "auto_loan",
        "family_loan",
        "other",
      ],
      payment_frequency: ["weekly", "biweekly", "monthly", "quarterly"],
    },
  },
} as const
