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
      avaliacoes: {
        Row: {
          assunto_tpu: string | null
          avaliador_id: string
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao_assunto_faltante: string | null
          descricao_situacao_arquivamento: string | null
          destinacao_permanente: string | null
          divergencia_classificacao: string | null
          divergencia_hierarquia: string | null
          documento_duplicado: boolean | null
          documento_nao_localizado: boolean | null
          erro_tecnico: boolean | null
          hierarquia_correta: string | null
          id: string
          inconsistencia_prazo: string | null
          observacoes_gerais: string | null
          observacoes_pecas: string | null
          ocorrencias_outro_detalhe: string | null
          pecas_combinado: string | null
          pecas_ids: string | null
          pecas_tipos: string | null
          processo_id: string
          processo_vazio: boolean | null
          tipo_informado_sistema: string | null
          tipo_real_identificado: string | null
          updated_at: string
        }
        Insert: {
          assunto_tpu?: string | null
          avaliador_id: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao_assunto_faltante?: string | null
          descricao_situacao_arquivamento?: string | null
          destinacao_permanente?: string | null
          divergencia_classificacao?: string | null
          divergencia_hierarquia?: string | null
          documento_duplicado?: boolean | null
          documento_nao_localizado?: boolean | null
          erro_tecnico?: boolean | null
          hierarquia_correta?: string | null
          id?: string
          inconsistencia_prazo?: string | null
          observacoes_gerais?: string | null
          observacoes_pecas?: string | null
          ocorrencias_outro_detalhe?: string | null
          pecas_combinado?: string | null
          pecas_ids?: string | null
          pecas_tipos?: string | null
          processo_id: string
          processo_vazio?: boolean | null
          tipo_informado_sistema?: string | null
          tipo_real_identificado?: string | null
          updated_at?: string
        }
        Update: {
          assunto_tpu?: string | null
          avaliador_id?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao_assunto_faltante?: string | null
          descricao_situacao_arquivamento?: string | null
          destinacao_permanente?: string | null
          divergencia_classificacao?: string | null
          divergencia_hierarquia?: string | null
          documento_duplicado?: boolean | null
          documento_nao_localizado?: boolean | null
          erro_tecnico?: boolean | null
          hierarquia_correta?: string | null
          id?: string
          inconsistencia_prazo?: string | null
          observacoes_gerais?: string | null
          observacoes_pecas?: string | null
          ocorrencias_outro_detalhe?: string | null
          pecas_combinado?: string | null
          pecas_ids?: string | null
          pecas_tipos?: string | null
          processo_id?: string
          processo_vazio?: boolean | null
          tipo_informado_sistema?: string | null
          tipo_real_identificado?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos_fila"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes_importacao: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          importado_por: string
          nome: string | null
          total_processos: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          importado_por: string
          nome?: string | null
          total_processos?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          importado_por?: string
          nome?: string | null
          total_processos?: number
        }
        Relationships: [
          {
            foreignKeyName: "lotes_importacao_importado_por_fkey"
            columns: ["importado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      processos_fila: {
        Row: {
          assunto_principal: string | null
          codigo_processo: string
          created_at: string
          data_arquivamento_def: string | null
          data_distribuicao: string | null
          data_fim_avaliacao: string | null
          data_inicio_avaliacao: string | null
          id: string
          lote_id: string
          numero_cnj: string
          possui_assunto: string | null
          possui_mov_arquivado: string | null
          prazo_5_anos_completo: string | null
          responsavel_avaliacao: string | null
          status_avaliacao: string
          updated_at: string
        }
        Insert: {
          assunto_principal?: string | null
          codigo_processo: string
          created_at?: string
          data_arquivamento_def?: string | null
          data_distribuicao?: string | null
          data_fim_avaliacao?: string | null
          data_inicio_avaliacao?: string | null
          id?: string
          lote_id: string
          numero_cnj: string
          possui_assunto?: string | null
          possui_mov_arquivado?: string | null
          prazo_5_anos_completo?: string | null
          responsavel_avaliacao?: string | null
          status_avaliacao?: string
          updated_at?: string
        }
        Update: {
          assunto_principal?: string | null
          codigo_processo?: string
          created_at?: string
          data_arquivamento_def?: string | null
          data_distribuicao?: string | null
          data_fim_avaliacao?: string | null
          data_inicio_avaliacao?: string | null
          id?: string
          lote_id?: string
          numero_cnj?: string
          possui_assunto?: string | null
          possui_mov_arquivado?: string | null
          prazo_5_anos_completo?: string | null
          responsavel_avaliacao?: string | null
          status_avaliacao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lote"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes_importacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_fila_responsavel_avaliacao_fkey"
            columns: ["responsavel_avaliacao"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      capturar_processo: {
        Args: {
          p_codigo_processo: string
          p_lote_id: string
          p_profile_id: string
        }
        Returns: Json
      }
      capturar_proximo_processo: {
        Args: { p_lote_id: string; p_profile_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      liberar_processo: {
        Args: {
          p_codigo_processo: string
          p_lote_id: string
          p_profile_id: string
        }
        Returns: Json
      }
      liberar_processos_inativos: { Args: never; Returns: Json }
      liberar_processos_usuario: {
        Args: { p_lote_id: string; p_profile_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "avaliador"
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
      app_role: ["admin", "supervisor", "avaliador"],
    },
  },
} as const
