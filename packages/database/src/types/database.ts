export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type PassportState =
  | "CREATED"
  | "PRINTED"
  | "FILLED"
  | "QUALITY_CHECK"
  | "READY"
  | "SOLD"
  | "DELIVERED"
  | "ACTIVE"
  | "RETURNED"
  | "WASHING"
  | "REFILLED"
  | "RETIRED"
  | "BLOCKED";

export type CustodyStage = "production" | "distribution" | "customer" | "returned" | "retired";

export type QrStatus = "PENDING" | "ACTIVE" | "ROTATED" | "SUSPENDED" | "REVOKED" | "EXPIRED";

type Timestamps = {
  created_at: string;
  updated_at: string;
};

type SoftDelete = {
  deleted_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: string;
          metadata: Json;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          organization_id: string;
          sku: string;
          name: string;
          status: string;
          metadata: Json;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          organization_id: string;
          sku: string;
          name: string;
          status?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      batches: {
        Row: {
          id: string;
          organization_id: string;
          product_id: string;
          code: string;
          status: string;
          manufactured_at: string | null;
          expires_at: string | null;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          organization_id: string;
          product_id: string;
          code: string;
          status?: string;
          manufactured_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["batches"]["Insert"]>;
        Relationships: [];
      };
      passports: {
        Row: {
          id: string;
          organization_id: string;
          public_id: string;
          product_id: string;
          batch_id: string | null;
          state: PassportState;
          custody_stage: CustodyStage;
          version: number;
          event_seq: number;
          issued_at: string | null;
          expires_at: string | null;
          metadata: Json;
          created_by: string | null;
          updated_by: string | null;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          organization_id: string;
          public_id: string;
          product_id: string;
          batch_id?: string | null;
          state?: PassportState;
          custody_stage?: CustodyStage;
          version?: number;
          event_seq?: number;
          issued_at?: string | null;
          expires_at?: string | null;
          metadata?: Json;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["passports"]["Insert"]>;
        Relationships: [];
      };
      passport_versions: {
        Row: {
          id: string;
          passport_id: string;
          version_number: number;
          snapshot: Json;
          change_reason: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          passport_id: string;
          version_number: number;
          snapshot: Json;
          change_reason: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["passport_versions"]["Insert"]>;
        Relationships: [];
      };
      passport_events: {
        Row: {
          id: string;
          organization_id: string;
          passport_id: string;
          seq: number;
          type: string;
          occurred_at: string;
          actor_type: string;
          actor_id: string | null;
          payload: Json;
          correlation_id: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          passport_id: string;
          seq: number;
          type: string;
          occurred_at?: string;
          actor_type: string;
          actor_id?: string | null;
          payload?: Json;
          correlation_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["passport_events"]["Insert"]>;
        Relationships: [];
      };
      qr_codes: {
        Row: {
          id: string;
          organization_id: string;
          passport_id: string;
          public_code: string;
          status: QrStatus;
          version: number;
          rotated_from_id: string | null;
          activated_at: string | null;
          expires_at: string | null;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          organization_id: string;
          passport_id: string;
          public_code: string;
          status?: QrStatus;
          version?: number;
          rotated_from_id?: string | null;
          activated_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["qr_codes"]["Insert"]>;
        Relationships: [];
      };
      scan_events: {
        Row: {
          id: string;
          organization_id: string | null;
          qr_code_id: string | null;
          passport_id: string | null;
          public_code_attempt: string;
          result: string;
          channel: string;
          ip_hash: string | null;
          user_agent: string | null;
          geo: Json | null;
          risk_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          qr_code_id?: string | null;
          passport_id?: string | null;
          public_code_attempt: string;
          result: string;
          channel: string;
          ip_hash?: string | null;
          user_agent?: string | null;
          geo?: Json | null;
          risk_score?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["scan_events"]["Insert"]>;
        Relationships: [];
      };
      passport_recharges: {
        Row: {
          id: string;
          organization_id: string;
          passport_id: string;
          from_expires_at: string | null;
          to_expires_at: string | null;
          from_state: PassportState | null;
          to_state: PassportState | null;
          idempotency_key: string;
          reason: string;
          actor_type: string;
          actor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          passport_id: string;
          from_expires_at?: string | null;
          to_expires_at?: string | null;
          from_state?: PassportState | null;
          to_state?: PassportState | null;
          idempotency_key: string;
          reason: string;
          actor_type: string;
          actor_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["passport_recharges"]["Insert"]>;
        Relationships: [];
      };
      trust_signals: {
        Row: {
          id: string;
          organization_id: string;
          passport_id: string | null;
          qr_code_id: string | null;
          type: string;
          severity: string;
          status: string;
          payload: Json;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          passport_id?: string | null;
          qr_code_id?: string | null;
          type: string;
          severity: string;
          status?: string;
          payload?: Json;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["trust_signals"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          actor_type: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          before: Json | null;
          after: Json | null;
          request_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          actor_type: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          before?: Json | null;
          after?: Json | null;
          request_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          status: string;
          password_hash: string;
          mfa_enabled: boolean;
          mfa_secret_encrypted: string | null;
          locale: string;
          last_login_at: string | null;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          status?: string;
          password_hash: string;
          mfa_enabled?: boolean;
          mfa_secret_encrypted?: string | null;
          locale?: string;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          status: string;
          default_org_unit_id: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          status?: string;
          default_org_unit_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["memberships"]["Insert"]>;
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          organization_id: string | null;
          key: string;
          name: string;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          key: string;
          name: string;
          is_system?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          key: string;
          module: string;
          description: string;
        };
        Insert: {
          id?: string;
          key: string;
          module: string;
          description?: string;
        };
        Update: Partial<Database["public"]["Tables"]["permissions"]["Insert"]>;
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["role_permissions"]["Insert"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          organization_id: string;
          org_unit_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          organization_id: string;
          org_unit_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          status: string;
          refresh_token_hash: string;
          access_token_jti: string;
          ip_hash: string | null;
          user_agent: string | null;
          expires_at: string;
          refresh_expires_at: string;
          revoked_at: string | null;
          mfa_verified_at: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          status?: string;
          refresh_token_hash: string;
          access_token_jti: string;
          ip_hash?: string | null;
          user_agent?: string | null;
          expires_at: string;
          refresh_expires_at: string;
          revoked_at?: string | null;
          mfa_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          role_keys: Json;
          token_hash: string;
          status: string;
          invited_by: string | null;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          role_keys?: Json;
          token_hash: string;
          status?: string;
          invited_by?: string | null;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invitations"]["Insert"]>;
        Relationships: [];
      };
      password_resets: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["password_resets"]["Insert"]>;
        Relationships: [];
      };
      mfa_challenges: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          status: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          status?: string;
          expires_at: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mfa_challenges"]["Insert"]>;
        Relationships: [];
      };
      auth_audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json;
          request_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json;
          request_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["auth_audit_logs"]["Insert"]>;
        Relationships: [];
      };
      ops_products: {
        Row: {
          id: string;
          organization_id: string;
          sku: string;
          name: string;
          status: string;
          description: string | null;
          metadata: Json;
          version: number;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          organization_id: string;
          sku: string;
          name: string;
          status?: string;
          description?: string | null;
          metadata?: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ops_products"]["Insert"]>;
        Relationships: [];
      };
      ops_customers: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          name: string;
          email: string | null;
          phone: string | null;
          status: string;
          segment: string | null;
          distributor_id: string | null;
          metadata: Json;
          version: number;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          status?: string;
          segment?: string | null;
          distributor_id?: string | null;
          metadata?: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ops_customers"]["Insert"]>;
        Relationships: [];
      };
      ops_distributors: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          name: string;
          email: string | null;
          territory: string | null;
          status: string;
          metadata: Json;
          version: number;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          name: string;
          email?: string | null;
          territory?: string | null;
          status?: string;
          metadata?: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ops_distributors"]["Insert"]>;
        Relationships: [];
      };
      ops_warehouses: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          name: string;
          status: string;
        } & Timestamps;
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          name: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_warehouses"]["Insert"]>;
        Relationships: [];
      };
      ops_inventory_levels: {
        Row: {
          id: string;
          organization_id: string;
          warehouse_id: string;
          product_id: string;
          batch_id: string | null;
          quantity: number;
          reserved: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          warehouse_id: string;
          product_id: string;
          batch_id?: string | null;
          quantity?: number;
          reserved?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_inventory_levels"]["Insert"]>;
        Relationships: [];
      };
      ops_stock_moves: {
        Row: {
          id: string;
          organization_id: string;
          type: string;
          warehouse_id: string;
          to_warehouse_id: string | null;
          product_id: string;
          batch_id: string | null;
          quantity: number;
          reason: string;
          idempotency_key: string;
          actor_type: string;
          actor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          type: string;
          warehouse_id: string;
          to_warehouse_id?: string | null;
          product_id: string;
          batch_id?: string | null;
          quantity: number;
          reason: string;
          idempotency_key: string;
          actor_type: string;
          actor_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_stock_moves"]["Insert"]>;
        Relationships: [];
      };
      ops_production_orders: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          product_id: string;
          warehouse_id: string;
          planned_qty: number;
          produced_qty: number;
          status: string;
          batch_id: string | null;
          metadata: Json;
          version: number;
        } & Timestamps;
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          product_id: string;
          warehouse_id: string;
          planned_qty: number;
          produced_qty?: number;
          status?: string;
          batch_id?: string | null;
          metadata?: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_production_orders"]["Insert"]>;
        Relationships: [];
      };
      ops_batches: {
        Row: {
          id: string;
          organization_id: string;
          product_id: string;
          code: string;
          status: string;
          manufactured_at: string | null;
          expires_at: string | null;
          production_order_id: string | null;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          organization_id: string;
          product_id: string;
          code: string;
          status?: string;
          manufactured_at?: string | null;
          expires_at?: string | null;
          production_order_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ops_batches"]["Insert"]>;
        Relationships: [];
      };
      ops_automations: {
        Row: {
          id: string;
          organization_id: string;
          key: string;
          name: string;
          status: string;
          trigger: string;
          cron: string | null;
          event_type: string | null;
          conditions: Json;
          actions: Json;
          version: number;
        } & Timestamps;
        Insert: {
          id?: string;
          organization_id: string;
          key: string;
          name: string;
          status?: string;
          trigger: string;
          cron?: string | null;
          event_type?: string | null;
          conditions?: Json;
          actions?: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_automations"]["Insert"]>;
        Relationships: [];
      };
      ops_automation_runs: {
        Row: {
          id: string;
          organization_id: string;
          automation_id: string;
          status: string;
          idempotency_key: string;
          input: Json;
          output: Json | null;
          error: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          automation_id: string;
          status?: string;
          idempotency_key: string;
          input?: Json;
          output?: Json | null;
          error?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_automation_runs"]["Insert"]>;
        Relationships: [];
      };
      ops_ai_sessions: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          status: string;
          purpose: string;
          messages: Json;
          tool_invocations: Json;
        } & Timestamps;
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          status?: string;
          purpose: string;
          messages?: Json;
          tool_invocations?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_ai_sessions"]["Insert"]>;
        Relationships: [];
      };
      ops_report_definitions: {
        Row: {
          id: string;
          organization_id: string;
          key: string;
          name: string;
          kind: string;
          parameters_schema: Json;
        } & Timestamps;
        Insert: {
          id?: string;
          organization_id: string;
          key: string;
          name: string;
          kind: string;
          parameters_schema?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_report_definitions"]["Insert"]>;
        Relationships: [];
      };
      ops_report_jobs: {
        Row: {
          id: string;
          organization_id: string;
          definition_id: string;
          status: string;
          parameters: Json;
          artifact_url: string | null;
          error: string | null;
          requested_by: string;
          created_at: string;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          definition_id: string;
          status?: string;
          parameters?: Json;
          artifact_url?: string | null;
          error?: string | null;
          requested_by: string;
          created_at?: string;
          finished_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ops_report_jobs"]["Insert"]>;
        Relationships: [];
      };
      ops_settings: {
        Row: {
          id: string;
          organization_id: string;
          key: string;
          value: Json | null;
          updated_by: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          organization_id: string;
          key: string;
          value?: Json | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_settings"]["Insert"]>;
        Relationships: [];
      };
      ops_audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          actor_type: string;
          actor_id: string | null;
          action: string;
          module: string;
          entity_type: string;
          entity_id: string;
          before: Json | null;
          after: Json | null;
          request_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          actor_type: string;
          actor_id?: string | null;
          action: string;
          module: string;
          entity_type: string;
          entity_id: string;
          before?: Json | null;
          after?: Json | null;
          request_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_audit_logs"]["Insert"]>;
        Relationships: [];
      };
      ops_notifications: {
        Row: {
          id: string;
          organization_id: string;
          channel: string;
          status: string;
          recipient_user_id: string | null;
          recipient_address: string | null;
          title: string;
          body: string;
          deep_link: string | null;
          metadata: Json;
          created_at: string;
          sent_at: string | null;
          read_at: string | null;
          error: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          channel: string;
          status?: string;
          recipient_user_id?: string | null;
          recipient_address?: string | null;
          title: string;
          body: string;
          deep_link?: string | null;
          metadata?: Json;
          created_at?: string;
          sent_at?: string | null;
          read_at?: string | null;
          error?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ops_notifications"]["Insert"]>;
        Relationships: [];
      };
      ops_notification_outbox: {
        Row: {
          id: string;
          organization_id: string;
          notification_id: string;
          channel: string;
          payload: Json;
          attempts: number;
          next_attempt_at: string;
          locked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          notification_id: string;
          channel: string;
          payload?: Json;
          attempts?: number;
          next_attempt_at?: string;
          locked_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_notification_outbox"]["Insert"]>;
        Relationships: [];
      };
      ops_saved_views: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          module: string;
          name: string;
          query: Json;
          is_default: boolean;
        } & Timestamps;
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          module: string;
          name: string;
          query?: Json;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_saved_views"]["Insert"]>;
        Relationships: [];
      };
      ops_dashboard_layouts: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          role_key: string | null;
          name: string;
          widgets: Json;
        } & Timestamps;
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          role_key?: string | null;
          name: string;
          widgets?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_dashboard_layouts"]["Insert"]>;
        Relationships: [];
      };
      ops_alerts: {
        Row: {
          id: string;
          organization_id: string;
          type: string;
          severity: string;
          status: string;
          title: string;
          message: string;
          module: string;
          entity_type: string | null;
          entity_id: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          type: string;
          severity: string;
          status?: string;
          title: string;
          message: string;
          module: string;
          entity_type?: string | null;
          entity_id?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ops_alerts"]["Insert"]>;
        Relationships: [];
      };
      ops_domain_events: {
        Row: {
          id: string;
          organization_id: string;
          module: string;
          type: string;
          entity_type: string;
          entity_id: string;
          payload: Json;
          actor_type: string;
          actor_id: string | null;
          correlation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          module: string;
          type: string;
          entity_type: string;
          entity_id: string;
          payload?: Json;
          actor_type: string;
          actor_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ops_domain_events"]["Insert"]>;
        Relationships: [];
      };
      cms_home_documents: {
        Row: {
          id: string;
          organization_id: string;
          locale: string;
          status: string;
          working_payload: Json;
          published_payload: Json | null;
          published_version: number;
          publish_at: string | null;
          unpublish_at: string | null;
          working_version: number;
          last_published_at: string | null;
          last_published_by: string | null;
          metadata: Json;
          created_by: string | null;
          updated_by: string | null;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          organization_id: string;
          locale?: string;
          status?: string;
          working_payload?: Json;
          published_payload?: Json | null;
          published_version?: number;
          publish_at?: string | null;
          unpublish_at?: string | null;
          working_version?: number;
          last_published_at?: string | null;
          last_published_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cms_home_documents"]["Insert"]>;
        Relationships: [];
      };
      cms_home_versions: {
        Row: {
          id: string;
          document_id: string;
          organization_id: string;
          version_number: number;
          kind: string;
          payload: Json;
          note: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          organization_id: string;
          version_number: number;
          kind: string;
          payload: Json;
          note?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cms_home_versions"]["Insert"]>;
        Relationships: [];
      };
      cms_home_preview_tokens: {
        Row: {
          id: string;
          document_id: string;
          organization_id: string;
          token_hash: string;
          expires_at: string;
          source: string;
          version_id: string | null;
          created_at: string;
          created_by: string | null;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          organization_id: string;
          token_hash: string;
          expires_at: string;
          source?: string;
          version_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          revoked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cms_home_preview_tokens"]["Insert"]>;
        Relationships: [];
      };
      cms_media_assets: {
        Row: {
          id: string;
          organization_id: string;
          kind: string;
          video_provider: string | null;
          logo_variant: string | null;
          source: string;
          name: string;
          description: string | null;
          alt_text: string | null;
          category: string | null;
          tags: string[];
          url: string;
          storage_bucket: string | null;
          storage_path: string | null;
          mime_type: string | null;
          file_size_bytes: number | null;
          width: number | null;
          height: number | null;
          is_favorite: boolean;
          last_used_at: string | null;
          metadata: Json;
          created_by: string | null;
          updated_by: string | null;
        } & Timestamps &
          SoftDelete;
        Insert: {
          id?: string;
          organization_id: string;
          kind: string;
          video_provider?: string | null;
          logo_variant?: string | null;
          source?: string;
          name: string;
          description?: string | null;
          alt_text?: string | null;
          category?: string | null;
          tags?: string[];
          url: string;
          storage_bucket?: string | null;
          storage_path?: string | null;
          mime_type?: string | null;
          file_size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          is_favorite?: boolean;
          last_used_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cms_media_assets"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      passport_state: PassportState;
      custody_stage: CustodyStage;
      qr_status: QrStatus;
    };
  };
};
