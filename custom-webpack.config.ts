import { DefinePlugin } from 'webpack';
import { config } from 'dotenv';
import * as path from 'path';

// Load .env from project root (same folder as this file). Relying on cwd() alone often leaves vars empty under ng serve / IDEs.
config({ path: path.resolve(__dirname, '.env') });

// Helper to safely get environment variable
const getEnv = (key: string, defaultValue: string = ''): string => {
    return process.env[key] || defaultValue;
};

const gamificacaoApiUrl =
    getEnv('GAMIFICACAO_API_URL') ||
    getEnv('gamificacao_api_url') ||
    '';
const gamificacaoApiToken =
    getEnv('GAMIFICACAO_API_TOKEN') ||
    getEnv('gamificacao_api_token') ||
    '';

const defaultBackendBase = 'https://g4u-api-bwa.onrender.com/api';

const rawBackendFromEnv =
    getEnv('G4U_API_BASE') ||
    getEnv('g4u_api_base') ||
    getEnv('BACKEND_URL_BASE') ||
    getEnv('backend_url_base') ||
    '';

/** API base injetada no bundle (DefinePlugin); fallback alinhado a `defaultBackendBase`. */
const backendUrlBase = (rawBackendFromEnv.trim() || defaultBackendBase).replace(/\/+$/, '');

if (!gamificacaoApiToken && process.env['NODE_ENV'] !== 'production') {
    console.warn(
        '[webpack] GAMIFICACAO_API_TOKEN is empty after loading .env — expected GAMIFICACAO_API_TOKEN or gamificacao_api_token in .env next to custom-webpack.config.ts'
    );
}

module.exports = {
    plugins: [
        new DefinePlugin({
            // Define process.env for browser compatibility
            // This replaces process.env references at build time
            'process.env': JSON.stringify({
                // Uppercase (standard convention)
                BACKEND_URL_BASE: backendUrlBase,
                G4U_API_BASE: backendUrlBase,
                CLIENT_ID: getEnv('CLIENT_ID'),
                LOGO_URL: getEnv('LOGO_URL'),
                SUPERVISOR_TEAM_CODE: getEnv('SUPERVISOR_TEAM_CODE'),
                GESTOR_TEAM_CODE: getEnv('GESTOR_TEAM_CODE'),
                DIRETOR_TEAM_CODE: getEnv('DIRETOR_TEAM_CODE'),
                // Supabase (Carteira / companies) — publishable or legacy anon JWT
                SUPABASE_URL: getEnv('SUPABASE_URL'),
                SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY'),
                SUPABASE_PROJECT_ID: getEnv('SUPABASE_PROJECT_ID'),
                SUPABASE_COMPANIES_TABLE: getEnv('SUPABASE_COMPANIES_TABLE', 'companies'),
                SUPABASE_DB_SCHEMA: getEnv('SUPABASE_DB_SCHEMA', 'public'),
                SUPABASE_USE_MOCK: getEnv('SUPABASE_USE_MOCK', ''),
                // Sem esta linha a flag NAO existe no bundle: o DefinePlugin
                // substitui `process.env` por este objeto literal, entao
                // qualquer chave ausente vira `undefined` e o valor do .env e
                // ignorado em silencio.
                ORG_HIERARCHY_TAG_DRILLDOWN: getEnv('ORG_HIERARCHY_TAG_DRILLDOWN', ''),
                SUPABASE_MOCK_FEED_ALL_USERS: getEnv('SUPABASE_MOCK_FEED_ALL_USERS', ''),
                // Chaves que environment*.ts LE e que faltavam nesta lista, ou
                // seja: liam `undefined` em todos os builds e o valor do .env
                // era ignorado em silencio. ORG_HIERARCHY_ASYNC_EXPORT estava
                // documentado como desligavel e nao era. GAME4U_USE_API tem o
                // default `true`, portanto nao havia forma nenhuma de o
                // desligar. Auditado com um diff entre as chaves lidas em
                // src/environments e as declaradas aqui — repetir esse diff
                // sempre que se acrescentar uma flag.
                ORG_HIERARCHY_ASYNC_EXPORT: getEnv('ORG_HIERARCHY_ASYNC_EXPORT', ''),
                SHOW_MAINTENANCE_BANNER: getEnv('SHOW_MAINTENANCE_BANNER', ''),
                GAME4U_USE_API: getEnv('GAME4U_USE_API', ''),
                GAME4U_SUPABASE_FALLBACK: getEnv('GAME4U_SUPABASE_FALLBACK', ''),
                SUPABASE_GAME_USER_ACTIONS_TABLE: getEnv('SUPABASE_GAME_USER_ACTIONS_TABLE', ''),
                SUPABASE_GAME_DELIVERIES_TABLE: getEnv('SUPABASE_GAME_DELIVERIES_TABLE', ''),
                SUPABASE_GAME_TEAM_FILTER_COLUMN: getEnv('SUPABASE_GAME_TEAM_FILTER_COLUMN', ''),
                SUPABASE_GAME_USER_EMAIL_COLUMN: getEnv('SUPABASE_GAME_USER_EMAIL_COLUMN', ''),
                // Flags do sprint/moco-01, ambas false por defeito enquanto os
                // dados forem fixture. Ver environment.ts.
                SLA_GOALS_MARKERS: getEnv('SLA_GOALS_MARKERS', ''),
                ORG_ECONOMY_CARDS: getEnv('ORG_ECONOMY_CARDS', ''),
                // NAO acrescentar SUPABASE_SERVICE_ROLE_KEY nem
                // SUPABASE_SERVICE_ROLE_SECRET. environment.ts le-as, mas uma
                // service-role key ignora RLS e este bundle vai inteiro para o
                // browser. Faltarem desta lista e a unica coisa que hoje as
                // impede de ser publicadas — a ausencia e a protecao.
                // Lowercase (Vercel compatibility)
                backend_url_base: backendUrlBase,
                g4u_api_base: backendUrlBase,
                client_id: getEnv('client_id'),
                logo_url: getEnv('logo_url'),
                supervisor_team_code: getEnv('supervisor_team_code'),
                gestor_team_code: getEnv('gestor_team_code'),
                diretor_team_code: getEnv('diretor_team_code'),
                supabase_url: getEnv('supabase_url'),
                supabase_anon_key: getEnv('supabase_anon_key'),
                supabase_project_id: getEnv('supabase_project_id'),
                supabase_companies_table: getEnv('supabase_companies_table', 'companies'),
                supabase_db_schema: getEnv('supabase_db_schema', 'public'),
                supabase_use_mock: getEnv('supabase_use_mock', ''),
                supabase_mock_feed_all_users: getEnv('supabase_mock_feed_all_users', ''),
                // Variantes minusculas das chaves acima. environment*.ts le
                // ambas as caixas; declarar so uma deixava metade do contrato
                // por cumprir no caminho Vercel.
                org_hierarchy_tag_drilldown: getEnv('org_hierarchy_tag_drilldown', ''),
                org_hierarchy_async_export: getEnv('org_hierarchy_async_export', ''),
                show_maintenance_banner: getEnv('show_maintenance_banner', ''),
                game4u_use_api: getEnv('game4u_use_api', ''),
                game4u_supabase_fallback: getEnv('game4u_supabase_fallback', ''),
                supabase_game_user_actions_table: getEnv('supabase_game_user_actions_table', ''),
                supabase_game_deliveries_table: getEnv('supabase_game_deliveries_table', ''),
                supabase_game_team_filter_column: getEnv('supabase_game_team_filter_column', ''),
                supabase_game_user_email_column: getEnv('supabase_game_user_email_column', ''),
                sla_goals_markers: getEnv('sla_goals_markers', ''),
                org_economy_cards: getEnv('org_economy_cards', ''),
                // Same values on all keys so bracket/dot access and CI mirrors all resolve.
                GAMIFICACAO_API_URL: gamificacaoApiUrl,
                GAMIFICACAO_API_TOKEN: gamificacaoApiToken,
                gamificacao_api_url: gamificacaoApiUrl,
                gamificacao_api_token: gamificacaoApiToken
            })
        }),
        // Webpack often fails to fold process.env['KEY'] from the object above; these literals fix runtime reads.
        new DefinePlugin({
            'process.env.GAMIFICACAO_API_URL': JSON.stringify(gamificacaoApiUrl),
            'process.env.GAMIFICACAO_API_TOKEN': JSON.stringify(gamificacaoApiToken),
            'process.env.gamificacao_api_url': JSON.stringify(gamificacaoApiUrl),
            'process.env.gamificacao_api_token': JSON.stringify(gamificacaoApiToken),
            'process.env.BACKEND_URL_BASE': JSON.stringify(backendUrlBase),
            'process.env.G4U_API_BASE': JSON.stringify(backendUrlBase),
            'process.env.backend_url_base': JSON.stringify(backendUrlBase),
            'process.env.g4u_api_base': JSON.stringify(backendUrlBase)
        })
    ]
};
