export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          slug: string;
          title: string;
          platforms: string[];
          genres: string[];
          description: string;
          short_description: string;
          developer: string;
          publisher: string;
          release_date: string;
          rating: number;
          cover_image: string;
          hero_image: string;
          screenshots: string[];
          featured: boolean;
          popular: boolean;
          badges: string[];
          searchable_tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          title: string;
          platforms: string[];
          genres: string[];
          description?: string;
          short_description?: string;
          developer?: string;
          publisher?: string;
          release_date?: string;
          rating?: number;
          cover_image?: string;
          hero_image?: string;
          screenshots?: string[];
          featured?: boolean;
          popular?: boolean;
          badges?: string[];
          searchable_tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['games']['Insert']>;
      };
      enquiries: {
        Row: {
          id: string;
          reference_code: string;
          game_id: string;
          game_slug: string;
          game_title: string;
          platform: string;
          customer_name: string;
          contact_method: string;
          contact_value: string;
          message: string;
          status: 'NEW' | 'CONTACTED' | 'COMPLETED' | 'CANCELLED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          reference_code: string;
          game_id: string;
          game_slug: string;
          game_title: string;
          platform: string;
          customer_name: string;
          contact_method: string;
          contact_value: string;
          message?: string;
          status?: 'NEW' | 'CONTACTED' | 'COMPLETED' | 'CANCELLED';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['enquiries']['Insert']>;
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>;
      };
      admin_audit_logs: {
        Row: {
          id: string;
          admin_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          details?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['admin_audit_logs']['Insert']>;
      };
    };
  };
}
