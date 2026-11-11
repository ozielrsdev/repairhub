-- Fase 1: conta da assistência e ordens de serviço salvas, separadas por assistência
-- (ADR 0001 e 0002). Rode uma vez no SQL Editor do projeto do Supabase.

-- Assistência: criada junto com a conta do dono, pelo gatilho no fim deste arquivo.
create table public.assistencias (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null unique references auth.users (id) on delete cascade,
  nome_fantasia text not null check (length(trim(nome_fantasia)) > 0),
  razao_social text not null check (length(trim(razao_social)) > 0),
  -- Sem pontuação, em maiúsculas: 12 letras ou números e 2 dígitos verificadores.
  -- Aqui só o formato; os dígitos verificadores são conferidos no banco pela migração 0002
  -- e na tela pelo validateAgencySignUp (src/services.ts).
  cnpj text not null unique check (cnpj ~ '^[0-9A-Z]{12}[0-9]{2}$'),
  telefone text not null default '',
  criado_em timestamptz not null default now()
);

-- A assistência do dono logado (ou null, sem login). Security definer para as regras de
-- Row Level Security das outras tabelas poderem consultar assistencias sem recursão.
create function public.minha_assistencia_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.assistencias where dono_id = auth.uid()
$$;

-- Ordem de Serviço: mesmos campos do Service de hoje (src/types.ts), mais a assistência.
create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  assistencia_id uuid not null default public.minha_assistencia_id()
    references public.assistencias (id) on delete cascade,
  cliente text not null check (length(trim(cliente)) > 0),
  equipamento text not null check (length(trim(equipamento)) > 0),
  problema text not null check (length(trim(problema)) > 0),
  diagnostico text not null default '',
  servico_realizado text not null default '',
  orcamento numeric(12, 2) check (orcamento > 0),
  urgencia text not null default 'Média'
    check (urgencia in ('Baixa', 'Média', 'Alta', 'Crítica')),
  status text not null default 'Recebido'
    check (status in ('Recebido', 'Em análise', 'Em manutenção', 'Concluído')),
  criado_em timestamptz not null default now()
);

create index ordens_servico_assistencia_idx on public.ordens_servico (assistencia_id, criado_em);

-- Row Level Security: cada dono só lê e altera a própria assistência e as OS dela.
-- Sem regra de insert em assistencias (só o gatilho cria) e sem regra de delete em
-- nenhuma das duas: o que não tem regra, o banco nega.
alter table public.assistencias enable row level security;
alter table public.ordens_servico enable row level security;

create policy "dono lê a própria assistência"
  on public.assistencias for select to authenticated
  using (dono_id = auth.uid());

create policy "dono altera a própria assistência"
  on public.assistencias for update to authenticated
  using (dono_id = auth.uid())
  with check (dono_id = auth.uid());

create policy "dono lê as OS da própria assistência"
  on public.ordens_servico for select to authenticated
  using (assistencia_id = public.minha_assistencia_id());

create policy "dono cria OS na própria assistência"
  on public.ordens_servico for insert to authenticated
  with check (assistencia_id = public.minha_assistencia_id());

create policy "dono altera as OS da própria assistência"
  on public.ordens_servico for update to authenticated
  using (assistencia_id = public.minha_assistencia_id())
  with check (assistencia_id = public.minha_assistencia_id());

-- Cria a assistência junto com a conta, com os dados enviados no cadastro
-- (options.data do signUp). Se o insert falhar (CNPJ fora do formato, já em uso ou, com
-- a 0002, com dígito verificador errado), a conta também não é criada.
create function public.criar_assistencia_do_dono()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.assistencias (dono_id, nome_fantasia, razao_social, cnpj, telefone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome_fantasia',
    new.raw_user_meta_data ->> 'razao_social',
    new.raw_user_meta_data ->> 'cnpj',
    coalesce(new.raw_user_meta_data ->> 'telefone', '')
  );
  return new;
end;
$$;

create trigger criar_assistencia_ao_criar_conta
  after insert on auth.users
  for each row execute function public.criar_assistencia_do_dono();
