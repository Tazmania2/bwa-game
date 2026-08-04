import { readBackendUrlBaseFromProcessEnv } from './backend-url';

/** Treats common “off” spellings; dotenv values are always strings at build time. */
function supabaseMockExplicitlyDisabled(
  a: string | undefined,
  b: string | undefined
): boolean {
  const isOff = (v: string | undefined): boolean => {
    const s = String(v ?? '').trim().toLowerCase();
    return s === 'false' || s === '0' || s === 'no' || s === 'off';
  };
  return isOff(a) || isOff(b);
}

export const environment = {
  production: false,
  // client_id: 'cidadania4u',
  client_id: process.env['CLIENT_ID'] || process.env['client_id'],
  // backend_url_base: 'https://integrador-n8n.grupo4u.com.br/webhook/game4u/taxall',
  backend_url_base: readBackendUrlBaseFromProcessEnv(),
  // backend_url_base: 'https://g4u-mvp-api.onrender.com',
  // backend_url_base: 'https://g4u-mvp-api-staging.onrender.com',
  // backend_url_base: 'https://g4u-mvp-api-1.onrender.com',
  // backend_url_base: 'http://194.163.158.136:1935'
  
  // Cache Configuration
  cacheTimeout: 300000, // 5 minutes in milliseconds
  
  // Feature Flags
  enableAnalytics: false,
  /**
   * Tenta `POST .../hierarchy-report/exports` + polling antes do GET síncrono legado.
   * Desligar: ORG_HIERARCHY_ASYNC_EXPORT=false
   */
  orgHierarchyAsyncExport:
    String(process.env['ORG_HIERARCHY_ASYNC_EXPORT'] ?? process.env['org_hierarchy_async_export'] ?? 'true')
      .trim()
      .toLowerCase() !== 'false',
  
  /**
   * Drill-down por tag (G4 / Onboarding / Risco de churn) e por "Clientes
   * atendidos" no dashboard organizacional.
   *
   * PADRAO `false`, e isso NAO e conservadorismo gratuito: o drill-down foi
   * desligado de proposito por performance. O relatorio hierarquico e servido
   * do Snowflake DENTRO do request — medido em producao 2026-08-03 em 12.558 ms
   * com depth=1, a chamada mais leve possivel. Ligar isto antes de o espelho em
   * Postgres estar no ar (g4u-mvp-api, branch feat/org-hierarchy-postgres-cache-master)
   * reintroduz exatamente a lentidao que motivou o desligamento.
   *
   * Ligar com ORG_HIERARCHY_TAG_DRILLDOWN=true depois que o espelho estiver
   * deployado e medido.
   */
  orgHierarchyTagDrilldown:
    String(process.env['ORG_HIERARCHY_TAG_DRILLDOWN'] ?? process.env['org_hierarchy_tag_drilldown'] ?? 'false')
      .trim()
      .toLowerCase() === 'true',

  /**
   * Marcadores de SLA por tipo de empresa critica (feature 5).
   *
   * PADRAO `false` porque os valores vem de `assets/mock/sla-goals.json` — nao
   * existe fonte real de meta por segmento, nem na API nem nos marts 12/13. Um
   * medidor de "% no prazo" com numero inventado num painel de gestao e lido
   * como medicao, nao como maquete.
   *
   * Ligar so quando `SlaGoalsService.loadConfig()` deixar de ler o fixture.
   */
  slaGoalsMarkers:
    String(process.env['SLA_GOALS_MARKERS'] ?? process.env['sla_goals_markers'] ?? 'false')
      .trim()
      .toLowerCase() === 'true',

  /**
   * Cartoes de economia do dashboard organizacional (feature 10).
   *
   * PADRAO `false` pela mesma razao, agravada: nao existe NENHUMA coluna de
   * custo no data lake (varredura aos transforms Mozart em 2026-08-03), entao
   * "custo por entrega" e um numero sem procedencia nenhuma. O selo "dados
   * simulados" avisa quem repara nele; a flag protege quem nao repara.
   *
   * Ligar so quando `EconomyIndicatorsService.load()` tiver fonte real.
   */
  orgEconomyCards:
    String(process.env['ORG_ECONOMY_CARDS'] ?? process.env['org_economy_cards'] ?? 'false')
      .trim()
      .toLowerCase() === 'true',

  // Logo Configuration
  logoUrl: '', // Empty string means use default logo
  
  // Team Code Configuration (hardcoded defaults for development)
  supervisorTeamCode: 'Fkmdmko',
  gestorTeamCode: 'FkmdnFU',
  diretorTeamCode: 'FkmdhZ9',
  logo_url: 'https://i.ibb.co/Fk92q8hv/Logo-Revisa-Prev-removebg-preview.png',

  // Supabase: URL não vem de variável de ambiente (evita chamadas PostgREST acidentais no bundle).
  supabaseUrl: '',
  supabaseAnonKey: process.env['SUPABASE_ANON_KEY'] || process.env['supabase_anon_key'] || '',
  /**
   * Opcional. Preferir RLS + anon no browser; service role no bundle = risco (ignora RLS).
   * Aceita SUPABASE_SERVICE_ROLE_SECRET (nome pedido no projeto) ou KEY.
   */
  supabaseServiceRoleKey: (
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ||
    process.env['supabase_service_role_key'] ||
    process.env['SUPABASE_SERVICE_ROLE_SECRET'] ||
    process.env['supabase_service_role_secret'] ||
    ''
  ).trim(),

  /** Tabelas PostgREST para fallback de `/game/actions` e `/game/stats` (agregação no cliente). */
  supabaseGameUserActionsTable:
    process.env['SUPABASE_GAME_USER_ACTIONS_TABLE'] ||
    process.env['supabase_game_user_actions_table'] ||
    'user_actions',
  supabaseGameDeliveriesTable:
    process.env['SUPABASE_GAME_DELIVERIES_TABLE'] ||
    process.env['supabase_game_deliveries_table'] ||
    'deliveries',
  /** Coluna para filtrar time em fallback (ex.: team_id ou team_name). */
  supabaseGameTeamFilterColumn:
    process.env['SUPABASE_GAME_TEAM_FILTER_COLUMN'] ||
    process.env['supabase_game_team_filter_column'] ||
    'team_id',
  /** Coluna do email do utilizador nas tabelas de jogo (ex.: user_email). */
  supabaseGameUserEmailColumn:
    process.env['SUPABASE_GAME_USER_EMAIL_COLUMN'] ||
    process.env['supabase_game_user_email_column'] ||
    'user_email',
  supabaseProjectId: process.env['SUPABASE_PROJECT_ID'] || process.env['supabase_project_id'] || '',
  supabaseCompaniesTable:
    process.env['SUPABASE_COMPANIES_TABLE'] || process.env['supabase_companies_table'] || 'companies',

  /** PostgREST schema (e.g. public, game4you). Exposed tables must live in this schema. */
  supabaseDbSchema:
    process.env['SUPABASE_DB_SCHEMA'] || process.env['supabase_db_schema'] || 'public',

  /** Default mock until SUPABASE_USE_MOCK is explicitly false (any case) / 0 / no / off */
  supabaseUseMock: !supabaseMockExplicitlyDisabled(
    process.env['SUPABASE_USE_MOCK'],
    process.env['supabase_use_mock']
  ),

  /** Mock: return all companies to every user (temporary dev UX) */
  supabaseMockFeedAllUsers:
    process.env['SUPABASE_MOCK_FEED_ALL_USERS'] !== 'false' &&
    process.env['supabase_mock_feed_all_users'] !== 'false',

  /** BWA gamificação hook — KPI por empresa (carteira / participação) */
  gamificacaoApiUrl:
    (process.env.GAMIFICACAO_API_URL || process.env.gamificacao_api_url || '')
      .trim() || 'https://hook.bwa.global:3334/gamificacao',
  gamificacaoApiToken: (
    process.env.GAMIFICACAO_API_TOKEN ||
    process.env.gamificacao_api_token ||
    ''
  ).trim(),

  /** Com `backend_url_base` definido: rotas `/game/*` (Game4uApiService, mes-atual, etc.). Se true, dados de gamificação vêm desta API em vez do Funifier/action_log. */
  useGame4uApi:
    String(process.env['GAME4U_USE_API'] ?? process.env['game4u_use_api'] ?? 'true').toLowerCase() !==
    'false',

  /**
   * Só com `true` explícito: leitura Supabase **apenas quando não há** `backend_url_base`
   * (sem API `/game/*`). Com API definida, o `Game4uApiService` não usa PostgREST para `/game/*`.
   */
  useGame4uSupabaseFallback:
    String(
      process.env['GAME4U_SUPABASE_FALLBACK'] ?? process.env['game4u_supabase_fallback'] ?? ''
    ).toLowerCase() === 'true',

  /**
   * Aviso fixo de manutenção (canto inferior direito, estilo toast).
   * Desligar no build: SHOW_MAINTENANCE_BANNER=false
   */
  showMaintenanceBanner:
    String(
      process.env['SHOW_MAINTENANCE_BANNER'] ?? process.env['show_maintenance_banner'] ?? 'true'
    )
      .trim()
      .toLowerCase() !== 'false'
};
