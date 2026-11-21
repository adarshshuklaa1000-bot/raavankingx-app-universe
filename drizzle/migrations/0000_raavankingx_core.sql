
-- ROLES
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.assign_owner_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) in ('adarshshuklaa1000@gmail.com', 'adarshshukla100a@gmail.com') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_assign_admin
after insert on auth.users for each row execute function public.assign_owner_admin();

insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users
where lower(email) in ('adarshshuklaa1000@gmail.com', 'adarshshukla100a@gmail.com')
on conflict do nothing;

-- UPDATED_AT
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '✦',
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Public reads published categories" on public.categories for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins insert categories" on public.categories for insert to authenticated with check (public.is_admin());
create policy "Admins update categories" on public.categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete categories" on public.categories for delete to authenticated using (public.is_admin());
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();

-- APPS & WEBSITES
create table public.apps (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'app' check (kind in ('app', 'website')),
  name text not null,
  logo_url text,
  website_url text not null,
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  is_vip boolean not null default false,
  is_new boolean not null default false,
  is_popular boolean not null default false,
  is_updated boolean not null default false,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  display_order int not null default 0,
  version text,
  update_notes text,
  webview_mode text not null default 'compatible' check (webview_mode in ('compatible', 'restricted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.apps to anon;
grant select, insert, update, delete on public.apps to authenticated;
grant all on public.apps to service_role;
alter table public.apps enable row level security;
create policy "Public reads published apps" on public.apps for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins insert apps" on public.apps for insert to authenticated with check (public.is_admin());
create policy "Admins update apps" on public.apps for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete apps" on public.apps for delete to authenticated using (public.is_admin());
create trigger apps_touch before update on public.apps for each row execute function public.touch_updated_at();
create index apps_order_idx on public.apps (is_published, display_order);

-- UPCOMING
create table public.upcoming_apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  description text not null default '',
  website_url text,
  release_date date,
  status text not null default 'coming_soon' check (status in ('coming_soon', 'in_development', 'testing', 'launching_soon')),
  progress int check (progress is null or (progress between 0 and 100)),
  notify_enabled boolean not null default true,
  notify_url text,
  notify_count int not null default 0,
  is_published boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.upcoming_apps to anon;
grant select, insert, update, delete on public.upcoming_apps to authenticated;
grant all on public.upcoming_apps to service_role;
alter table public.upcoming_apps enable row level security;
create policy "Public reads published upcoming" on public.upcoming_apps for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins insert upcoming" on public.upcoming_apps for insert to authenticated with check (public.is_admin());
create policy "Admins update upcoming" on public.upcoming_apps for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete upcoming" on public.upcoming_apps for delete to authenticated using (public.is_admin());
create trigger upcoming_touch before update on public.upcoming_apps for each row execute function public.touch_updated_at();

-- BANNERS
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  subtitle text,
  action_label text,
  action_url text,
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.banners to anon;
grant select, insert, update, delete on public.banners to authenticated;
grant all on public.banners to service_role;
alter table public.banners enable row level security;
create policy "Public reads published banners" on public.banners for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins insert banners" on public.banners for insert to authenticated with check (public.is_admin());
create policy "Admins update banners" on public.banners for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete banners" on public.banners for delete to authenticated using (public.is_admin());
create trigger banners_touch before update on public.banners for each row execute function public.touch_updated_at();

-- ANNOUNCEMENTS
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  priority text not null default 'normal' check (priority in ('normal', 'urgent')),
  is_blinking boolean not null default false,
  action_url text,
  starts_at timestamptz,
  expires_at timestamptz,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.announcements to anon;
grant select, insert, update, delete on public.announcements to authenticated;
grant all on public.announcements to service_role;
alter table public.announcements enable row level security;
create policy "Public reads published announcements" on public.announcements for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins insert announcements" on public.announcements for insert to authenticated with check (public.is_admin());
create policy "Admins update announcements" on public.announcements for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete announcements" on public.announcements for delete to authenticated using (public.is_admin());
create trigger announcements_touch before update on public.announcements for each row execute function public.touch_updated_at();

-- GLOBAL CONFIG
create table public.app_config (
  id text primary key default 'global',
  app_name text not null default 'RAAVANKINGX',
  app_tagline text not null default 'ALL YOUR APPS IN ONE PLACE',
  app_logo text,
  splash_enabled boolean not null default true,
  splash_image text,
  theme_primary text,
  theme_vip text,
  telegram_enabled boolean not null default true,
  telegram_url text not null default 'https://t.me/Raavan_kingX',
  telegram_icon text,
  telegram_label text not null default 'TELEGRAM',
  telegram_join_text text not null default 'JOIN NOW',
  telegram_message text not null default 'Join RaavanKingX on Telegram for new apps every week!',
  banner_enabled boolean not null default true,
  banner_interval_ms int not null default 4500,
  maintenance_enabled boolean not null default false,
  maintenance_message text not null default 'We are upgrading RaavanKingX. Back soon!',
  pwa_install_enabled boolean not null default true,
  apk_url text,
  app_version text,
  apk_release_date date,
  apk_whats_new text,
  allowed_domains text[] not null default '{}',
  updated_at timestamptz not null default now()
);
grant select on public.app_config to anon;
grant select, insert, update on public.app_config to authenticated;
grant all on public.app_config to service_role;
alter table public.app_config enable row level security;
create policy "Anyone reads config" on public.app_config for select to anon, authenticated using (true);
create policy "Admins insert config" on public.app_config for insert to authenticated with check (public.is_admin());
create policy "Admins update config" on public.app_config for update to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger config_touch before update on public.app_config for each row execute function public.touch_updated_at();

-- OWNER PROFILE
create table public.owner_profile (
  id text primary key default 'main',
  name text not null default 'RaavanKingX',
  photo_url text,
  tagline text,
  about text not null default '',
  contact_links jsonb not null default '[]'::jsonb,
  social_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.owner_profile to anon;
grant select, insert, update on public.owner_profile to authenticated;
grant all on public.owner_profile to service_role;
alter table public.owner_profile enable row level security;
create policy "Anyone reads owner" on public.owner_profile for select to anon, authenticated using (true);
create policy "Admins insert owner" on public.owner_profile for insert to authenticated with check (public.is_admin());
create policy "Admins update owner" on public.owner_profile for update to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger owner_touch before update on public.owner_profile for each row execute function public.touch_updated_at();

-- ADMIN LOGS
create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_uid uuid not null,
  admin_email text,
  action text not null,
  target text,
  details text,
  created_at timestamptz not null default now()
);
grant select, insert on public.admin_logs to authenticated;
grant all on public.admin_logs to service_role;
alter table public.admin_logs enable row level security;
create policy "Admins read logs" on public.admin_logs for select to authenticated using (public.is_admin());
create policy "Admins write own logs" on public.admin_logs for insert to authenticated with check (public.is_admin() and admin_uid = auth.uid());

-- LOGIN ATTEMPTS
create table public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  success boolean not null,
  created_at timestamptz not null default now()
);
grant select on public.login_attempts to authenticated;
grant all on public.login_attempts to service_role;
alter table public.login_attempts enable row level security;
create policy "Admins read login attempts" on public.login_attempts for select to authenticated using (public.is_admin());

create or replace function public.record_admin_login()
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  if auth.uid() is null then return false; end if;
  ok := public.has_role(auth.uid(), 'admin');
  insert into public.login_attempts (user_id, email, success)
  values (auth.uid(), (auth.jwt() ->> 'email'), ok);
  return ok;
end;
$$;
revoke execute on function public.record_admin_login() from public, anon;
grant execute on function public.record_admin_login() to authenticated;

-- VISITS
create table public.visits (
  session_id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  views int not null default 1
);
grant select on public.visits to authenticated;
grant all on public.visits to service_role;
alter table public.visits enable row level security;
create policy "Admins read visits" on public.visits for select to authenticated using (public.is_admin());

create or replace function public.track_visit(p_session text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_session is null or length(p_session) < 8 or length(p_session) > 64 then return; end if;
  insert into public.visits (session_id) values (p_session)
  on conflict (session_id) do update set last_seen = now(), views = public.visits.views + 1;
end;
$$;
grant execute on function public.track_visit(text) to anon, authenticated;

-- NOTIFY ME
create or replace function public.notify_upcoming(p_id uuid)
returns int language plpgsql security definer set search_path = public as $$
declare c int;
begin
  update public.upcoming_apps set notify_count = notify_count + 1
  where id = p_id and is_published and notify_enabled
  returning notify_count into c;
  return coalesce(c, 0);
end;
$$;
grant execute on function public.notify_upcoming(uuid) to anon, authenticated;

-- LAUNCH UPCOMING -> LIVE
create or replace function public.launch_upcoming(p_id uuid, p_website_url text, p_category_id uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare u public.upcoming_apps; new_id uuid;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  if p_website_url is null or p_website_url !~ '^https://' then raise exception 'A valid https URL is required'; end if;
  select * into u from public.upcoming_apps where id = p_id;
  if not found then raise exception 'upcoming app not found'; end if;
  insert into public.apps (name, logo_url, website_url, description, category_id, is_new, is_published, display_order)
  values (u.name, u.logo_url, p_website_url, u.description, p_category_id, true, true, 0)
  returning id into new_id;
  delete from public.upcoming_apps where id = p_id;
  insert into public.admin_logs (admin_uid, admin_email, action, target, details)
  values (auth.uid(), auth.jwt() ->> 'email', 'launch_upcoming', u.name, 'Moved to live apps');
  return new_id;
end;
$$;
revoke execute on function public.launch_upcoming(uuid, text, uuid) from public, anon;
grant execute on function public.launch_upcoming(uuid, text, uuid) to authenticated;

-- REALTIME
alter publication supabase_realtime add table public.apps, public.upcoming_apps, public.banners, public.categories, public.announcements, public.app_config, public.owner_profile;

-- SEED
insert into public.app_config (id) values ('global');
insert into public.owner_profile (id, name, tagline, about, contact_links, social_links) values (
  'main', 'Adarsh Shukla', 'Founder, RaavanKingX',
  'RaavanKingX brings the best study platforms, tools and web apps together in one premium app — open everything in one place, without jumping between browsers.',
  '[{"label":"Email","url":"mailto:adarshshuklaa1000@gmail.com"}]'::jsonb,
  '[{"label":"Telegram","url":"https://t.me/Raavan_kingX"}]'::jsonb
);

insert into public.categories (id, name, icon, display_order) values
  ('11111111-1111-4111-8111-111111111111', 'Education', '🎓', 1),
  ('22222222-2222-4222-8222-222222222222', 'Study Tools', '🧮', 2),
  ('33333333-3333-4333-8333-333333333333', 'Resources', '📚', 3);

insert into public.apps (name, logo_url, website_url, description, category_id, is_vip, is_new, is_popular, is_featured, display_order) values
  ('Physics W', 'https://www.google.com/s2/favicons?domain=pw.live&sz=128', 'https://www.pw.live', 'Live classes, batches and test series for JEE & NEET.', '11111111-1111-4111-8111-111111111111', true, false, true, true, 1),
  ('Khan Academy', 'https://www.google.com/s2/favicons?domain=khanacademy.org&sz=128', 'https://www.khanacademy.org', 'Free lessons in maths, science and more.', '11111111-1111-4111-8111-111111111111', true, false, false, false, 2),
  ('Desmos', 'https://www.google.com/s2/favicons?domain=desmos.com&sz=128', 'https://www.desmos.com/calculator', 'Powerful graphing calculator in your pocket.', '22222222-2222-4222-8222-222222222222', true, true, false, false, 3),
  ('Wolfram Alpha', 'https://www.google.com/s2/favicons?domain=wolframalpha.com&sz=128', 'https://www.wolframalpha.com', 'Step-by-step answers for maths and science.', '22222222-2222-4222-8222-222222222222', true, false, false, false, 4),
  ('NCERT Books', 'https://www.google.com/s2/favicons?domain=ncert.nic.in&sz=128', 'https://ncert.nic.in/textbook.php', 'Official NCERT textbooks for every class.', '33333333-3333-4333-8333-333333333333', true, false, true, false, 5),
  ('Wikipedia', 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=128', 'https://www.wikipedia.org', 'The free encyclopedia for quick research.', '33333333-3333-4333-8333-333333333333', true, false, false, false, 6);

insert into public.banners (image_url, title, subtitle, action_label, action_url, display_order) values
  ('/images/banner-default.webp', 'JOIN RAAVANKINGX TODAY', 'NEW APPS EVERY WEEK', 'JOIN TELEGRAM', 'https://t.me/Raavan_kingX', 1);

insert into public.upcoming_apps (name, logo_url, description, release_date, status, progress, notify_url, display_order) values
  ('RaavanKingX Notes', '/icons/icon-192.png', 'Handwritten-style notes for every chapter, synced across devices.', current_date + 30, 'in_development', 60, 'https://t.me/Raavan_kingX', 1),
  ('Quiz Arena', '/icons/icon-192.png', 'Daily rank-based quizzes with live leaderboards.', current_date + 14, 'testing', 85, 'https://t.me/Raavan_kingX', 2);

insert into public.announcements (title, body, priority, is_blinking, action_url) values
  ('Welcome to RaavanKingX', 'All your apps in one place — new apps are added every week.', 'normal', false, null);
