-- Correções da revisão de segurança da Fase 1. Rode uma vez no SQL Editor de cada projeto
-- do Supabase (app e teste), depois do 0001.

-- 1. Funções security definer só para quem precisa.
-- Por padrão, qualquer um (até sem login) pode chamar uma função pela API (/rpc/...).
-- A minha_assistencia_id só é usada pelas regras de Row Level Security e pelo default de
-- ordens_servico, sempre com o dono logado. A do gatilho é chamada só pelo próprio gatilho,
-- que não precisa dessa permissão para disparar.
revoke execute on function public.minha_assistencia_id() from public, anon;
grant execute on function public.minha_assistencia_id() to authenticated;

revoke execute on function public.criar_assistencia_do_dono() from public, anon, authenticated;

-- 2. Dígitos verificadores do CNPJ conferidos também no banco, igual ao validateAgencySignUp
-- (src/services.ts): quem cria a conta direto pela API, sem a tela, também é barrado.
-- Cada caractere vale o código ASCII menos 48, o que cobre o CNPJ alfanumérico.
create function public.cnpj_digito(base text)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  soma integer := 0;
  peso integer := 2;
  resto integer;
begin
  for i in reverse length(base)..1 loop
    soma := soma + (ascii(substr(base, i, 1)) - 48) * peso;
    peso := case when peso = 9 then 2 else peso + 1 end;
  end loop;

  resto := soma % 11;
  return case when resto < 2 then 0 else 11 - resto end;
end;
$$;

-- Dígitos todos iguais (00000000000000) fecham a conta, mas não são CNPJ de verdade.
create function public.cnpj_valido(cnpj text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  primeiro integer;
  segundo integer;
begin
  if cnpj is null or cnpj !~ '^[0-9A-Z]{12}[0-9]{2}$' or cnpj ~ '^(.)\1+$' then
    return false;
  end if;

  primeiro := public.cnpj_digito(substr(cnpj, 1, 12));
  segundo := public.cnpj_digito(substr(cnpj, 1, 12) || primeiro::text);
  return substr(cnpj, 13, 2) = primeiro::text || segundo::text;
end;
$$;

alter table public.assistencias
  add constraint assistencias_cnpj_valido check (public.cnpj_valido(cnpj));
