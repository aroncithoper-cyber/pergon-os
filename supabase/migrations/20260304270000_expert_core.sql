-- PerGon OS — PerGon Expert (knowledge, conversations, RAG, quotas, feedback)
-- Admin manages knowledge; Web/Admin consume ask APIs. RLS fail-closed.

create extension if not exists pgcrypto;

create table if not exists public.expert_knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  slug text not null,
  title text not null,
  domain text not null check (
    domain in (
      'products',
      'dilutions',
      'datasheets',
      'safety_sheets',
      'compatibilities',
      'cleaning_processes',
      'passport',
      'qr',
      'academy',
      'faq',
      'general_pergon'
    )
  ),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  source_type text not null default 'manual' check (
    source_type in ('manual', 'catalog', 'passport', 'academy', 'upload', 'system')
  ),
  source_ref text,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  unique (organization_id, slug)
);

create index if not exists expert_knowledge_org_status_idx
  on public.expert_knowledge_documents (organization_id, status)
  where deleted_at is null;

-- embedding_json prepared for RAG; pgvector can replace later without breaking schema consumers
create table if not exists public.expert_knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  document_id uuid not null references public.expert_knowledge_documents (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_estimate integer,
  embedding_json jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create index if not exists expert_chunks_document_idx
  on public.expert_knowledge_chunks (document_id);

create table if not exists public.expert_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  user_id uuid,
  anonymous_key text,
  channel text not null default 'web' check (channel in ('web', 'admin', 'api')),
  status text not null default 'open' check (status in ('open', 'closed', 'escalated')),
  title text,
  context_product_slug text,
  context_passport_id text,
  context_qr_code text,
  context jsonb not null default '{}'::jsonb,
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create index if not exists expert_conversations_user_idx
  on public.expert_conversations (user_id, created_at desc);

create index if not exists expert_conversations_anon_idx
  on public.expert_conversations (anonymous_key, created_at desc);

create table if not exists public.expert_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.expert_conversations (id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant', 'tool')),
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  provider_id text,
  model text,
  retrieval_ids uuid[] default '{}',
  refusal_reason text,
  created_at timestamptz not null default now()
);

create index if not exists expert_messages_conversation_idx
  on public.expert_messages (conversation_id, created_at);

create table if not exists public.expert_feedback (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.expert_conversations (id) on delete cascade,
  message_id uuid not null references public.expert_messages (id) on delete cascade,
  rating text not null check (rating in ('up', 'down')),
  comment text,
  created_by uuid,
  anonymous_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists expert_feedback_message_actor_uidx
  on public.expert_feedback (message_id, created_by)
  where created_by is not null;

create unique index if not exists expert_feedback_message_actor_anon_uidx
  on public.expert_feedback (message_id, anonymous_key)
  where anonymous_key is not null;

create table if not exists public.expert_escalations (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.expert_conversations (id) on delete cascade,
  organization_id uuid,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_by uuid,
  anonymous_key text,
  assigned_to uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.expert_usage_daily (
  id uuid primary key default gen_random_uuid(),
  usage_date date not null,
  organization_id uuid,
  user_id uuid,
  anonymous_key text,
  ask_count integer not null default 0,
  token_estimate integer not null default 0
);

create unique index if not exists expert_usage_daily_user_uidx
  on public.expert_usage_daily (usage_date, user_id)
  where user_id is not null;

create unique index if not exists expert_usage_daily_anon_uidx
  on public.expert_usage_daily (usage_date, anonymous_key)
  where anonymous_key is not null;

alter table public.expert_knowledge_documents enable row level security;
alter table public.expert_knowledge_chunks enable row level security;
alter table public.expert_conversations enable row level security;
alter table public.expert_messages enable row level security;
alter table public.expert_feedback enable row level security;
alter table public.expert_escalations enable row level security;
alter table public.expert_usage_daily enable row level security;
