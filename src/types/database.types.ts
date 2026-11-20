// TypeScript Definitions derived directly from B-Zooginer PostgreSQL Schema
// Project: B-Zooginer Pre-Order Platform

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoleType = 'master_admin' | 'group_admin';
export type PoStatusType = 'open' | 'coming_soon' | 'closed';
export type OrderSourceType = 'master_admin' | 'group_admin' | 'public';
export type PaymentMethodType = 'cash' | 'transfer';
export type PaymentStatusType = 'unpaid' | 'paid';
export type OrderStatusType = 'new' | 'confirmed' | 'cancelled' | 'completed';

export interface VariantDimension {
  name: string;
  options: string[];
}

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          poster_url: string | null;
          is_published: boolean;
          po_status: PoStatusType;
          sort_order: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          poster_url?: string | null;
          is_published?: boolean;
          po_status?: PoStatusType;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          poster_url?: string | null;
          is_published?: boolean;
          po_status?: PoStatusType;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          role: RoleType;
          group_id: string | null;
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: RoleType;
          group_id?: string | null;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: RoleType;
          group_id?: string | null;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          base_price: number;
          variant_dimensions: VariantDimension[];
          has_variants: boolean;
          track_stock: boolean;
          max_po_qty: number | null;
          is_active: boolean;
          is_featured: boolean;
          po_open_at: string | null;
          po_close_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          base_price: number;
          variant_dimensions?: VariantDimension[];
          has_variants?: boolean;
          track_stock?: boolean;
          max_po_qty?: number | null;
          is_active?: boolean;
          is_featured?: boolean;
          po_open_at?: string | null;
          po_close_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          base_price?: number;
          variant_dimensions?: VariantDimension[];
          has_variants?: boolean;
          track_stock?: boolean;
          max_po_qty?: number | null;
          is_active?: boolean;
          is_featured?: boolean;
          po_open_at?: string | null;
          po_close_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          title: string;
          attributes: Record<string, string>;
          sku: string | null;
          price_adjustment: number;
          stock: number | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          title: string;
          attributes?: Record<string, string>;
          sku?: string | null;
          price_adjustment?: number;
          stock?: number | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          title?: string;
          attributes?: Record<string, string>;
          sku?: string | null;
          price_adjustment?: number;
          stock?: number | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_code: string;
          access_token: string;
          group_id: string;
          buyer_name: string;
          buyer_class: string;
          whatsapp: string | null;
          source: OrderSourceType;
          order_date: string;
          payment_method: PaymentMethodType;
          payment_status: PaymentStatusType;
          order_status: OrderStatusType;
          total: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_code?: string;
          access_token?: string;
          group_id: string;
          buyer_name: string;
          buyer_class: string;
          whatsapp?: string | null;
          source?: OrderSourceType;
          order_date?: string;
          payment_method: PaymentMethodType;
          payment_status?: PaymentStatusType;
          order_status?: OrderStatusType;
          total: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_code?: string;
          access_token?: string;
          group_id?: string;
          buyer_name?: string;
          buyer_class?: string;
          whatsapp?: string | null;
          source?: OrderSourceType;
          order_date?: string;
          payment_method?: PaymentMethodType;
          payment_status?: PaymentStatusType;
          order_status?: OrderStatusType;
          total?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          product_name_snapshot: string;
          variant_snapshot: string | null;
          variant_attributes_snapshot: Record<string, string>;
          unit_price_snapshot: number;
          quantity: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id?: string | null;
          product_name_snapshot: string;
          variant_snapshot?: string | null;
          variant_attributes_snapshot?: Record<string, string>;
          unit_price_snapshot: number;
          quantity: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          variant_id?: string | null;
          product_name_snapshot?: string;
          variant_snapshot?: string | null;
          variant_attributes_snapshot?: Record<string, string>;
          unit_price_snapshot?: number;
          quantity?: number;
          subtotal?: number;
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: number;
          hero_title: string;
          hero_subtitle: string;
          hero_image_url: string | null;
          featured_group_ids: string[];
          announcement_text: string | null;
          is_announcement_active: boolean;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: number;
          hero_title?: string;
          hero_subtitle?: string;
          hero_image_url?: string | null;
          featured_group_ids?: string[];
          announcement_text?: string | null;
          is_announcement_active?: boolean;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: number;
          hero_title?: string;
          hero_subtitle?: string;
          hero_image_url?: string | null;
          featured_group_ids?: string[];
          announcement_text?: string | null;
          is_announcement_active?: boolean;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
    };
    Functions: {
      is_master_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: RoleType;
      };
      get_my_group_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      generate_order_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      deduct_variant_stock: {
        Args: {
          p_variant_id: string;
          p_quantity: number;
        };
        Returns: number | null;
      };
      restore_variant_stock: {
        Args: {
          p_variant_id: string;
          p_quantity: number;
        };
        Returns: number | null;
      };
      get_order_confirmation: {
        Args: {
          p_order_code: string;
          p_access_token: string;
        };
        Returns: {
          order_code: string;
          buyer_name: string;
          buyer_class: string;
          whatsapp: string | null;
          group_name: string;
          order_status: OrderStatusType;
          payment_status: PaymentStatusType;
          payment_method: PaymentMethodType;
          total: number;
          order_date: string;
          items: Json;
        }[];
      };
      submit_public_order: {
        Args: {
          p_group_id: string;
          p_buyer_name: string;
          p_buyer_class: string;
          p_whatsapp: string | null;
          p_payment_method: PaymentMethodType;
          p_notes: string | null;
          p_items: Json;
        };
        Returns: {
          order_code: string;
          access_token: string;
          total: number;
        }[];
      };
      bootstrap_master_admin: {
        Args: {
          p_user_id: string;
          p_full_name: string;
        };
        Returns: boolean;
      };
      create_group_admin_profile: {
        Args: {
          p_user_id: string;
          p_full_name: string;
          p_group_id: string;
        };
        Returns: boolean;
      };
    };
  };
}

// Convenient type aliases
export type GroupRow = Database['public']['Tables']['groups']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProductRow = Database['public']['Tables']['products']['Row'];
export type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
export type ActivityLogRow = Database['public']['Tables']['activity_logs']['Row'];
export type SiteSettingsRow = Database['public']['Tables']['site_settings']['Row'];
