# Grind Tracker — Deploy Instructions

## Step 1: Supabase (database)

1. Go to https://supabase.com and sign in
2. Click "New Project", name it `grind-tracker`
3. Once created, go to the **SQL Editor** and run this:

```sql
create table workout_history (
  id uuid default gen_random_uuid() primary key,
  device_id text not null,
  session_data jsonb not null,
  created_at timestamp with time zone default now()
);

create table body_weights (
  id uuid default gen_random_uuid() primary key,
  device_id text not null,
  date text not null,
  weight numeric not null,
  created_at timestamp with time zone default now()
);

alter table workout_history enable row level security;
alter table body_weights enable row level security;

create policy "Allow all" on workout_history for all using (true) with check (true);
create policy "Allow all" on body_weights for all using (true) with check (true);
```

4. Go to **Project Settings > API**
5. Copy:
   - **Project URL** (looks like https://xxxx.supabase.co)
   - **anon / public key**

---

## Step 2: GitHub

1. Go to https://github.com/new
2. Create a new repo called `grind-tracker` (private is fine)
3. Upload all the files from this folder into it

---

## Step 3: Netlify

1. Go to https://netlify.com and sign in
2. Click "Add new site" > "Import an existing project" > pick GitHub
3. Select the `grind-tracker` repo
4. Build settings should auto-fill (Vite). If not:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Before deploying, go to **Site settings > Environment variables** and add:
   - `VITE_SUPABASE_URL` = your Project URL from Step 1
   - `VITE_SUPABASE_ANON_KEY` = your anon key from Step 1
6. Hit **Deploy**

Done! Your app will be live at a `.netlify.app` URL in ~2 minutes.
