# Fun Survey

A 3D stacked-card survey you can embed in Webflow, with an admin area for editing questions, illustrations and colors and for watching responses come in live.

- **Survey:** `/`
- **Admin:** `/admin`

Stack: React + Vite + Motion, Supabase (database, auth, image storage) and Vercel (hosting).

## Run locally

```bash
npm install
npm run dev
```

Without a `.env` file the survey runs in **demo mode** with sample questions, and nothing is saved.

## One-time setup

### 1. Supabase
1. Create a **new project** at supabase.com.
2. **SQL Editor → New query**: paste all of `supabase/schema.sql` and click **Run**. This creates the tables, security rules, image bucket and 5 starter questions.
   *(If you ran it before the red & yellow theme was added, also run `supabase/theme-update.sql`.)*
3. **Authentication → Users → Add user → Create new user**: enter your email and a password, and tick *Auto Confirm User*.
4. Make yourself an admin. In the SQL Editor run:
   ```sql
   insert into admins (user_id)
   select id from auth.users where email = 'YOUR_EMAIL_HERE';
   ```
5. **SQL Editor → New query**: paste all of `supabase/roles.sql` and click **Run**. This adds the Owner/Editor roles and the Team tab.
6. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up" so nobody else can create an account.
7. **Project Settings → API**: copy the **Project URL** and the **anon / publishable key**.

### 2. Local env
Copy `.env.example` to `.env` and paste in the two values.

### 3. GitHub
Create a new empty repo, then:
```bash
git init && git add . && git commit -m "Fun survey"
git branch -M main
git remote add origin https://github.com/YOU/fun-survey.git
git push -u origin main
```

### 4. Vercel
1. **Add New → Project**, then import the GitHub repo. Vercel detects Vite automatically.
2. Under **Environment Variables** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Deploy. From then on, every push to `main` redeploys.

### 5. Webflow
Sign in to the admin, open the **Embed** tab and copy the code into a Webflow **Embed** element (a paid Site plan is needed for custom code). One embed holds both the survey and the admin: the **Admin login** button under the welcome card opens it, and the frame grows to full screen while the admin is open.

Put the Webflow page address in `src/lib/site.js` (`PAGE_URL`), and in Supabase set **Authentication → URL Configuration → Site URL** to that page (also add it under **Redirect URLs**). Invite and password-reset emails then land on the Webflow page, and the embed passes the sign-in on to the admin.

## Admin guide
- **Team (owner only):** add an editor's email, then send them an invite from **Supabase → Authentication → Users → Add user → Send invitation**. The email link opens the admin, where they pick a password. Before inviting anyone, set **Authentication → URL Configuration → Site URL** to your Vercel URL. Editors can do everything below except manage the team and delete responses.
- **Questions:** add, duplicate, delete, drag to reorder (⋮⋮), and toggle to hide. Each question has a type (pick one, pick many, emoji rating, 0–10 slider, free text), helper text, an illustration (15 built-in, or upload your own PNG/SVG/GIF/WebP) and a card color. A live preview updates as you type.
- **Intro & Thanks:** edit the first and last cards.
- **Responses:** live counter, per-question charts, full table and CSV export.

Each response stores the question text alongside the answer, so editing or deleting a question later doesn't scramble old data.

## Survey interactions
- Drag the illustration area left to go forward, or right to go back.
- The card tilts in 3D and shines as the mouse moves over it.
- Keyboard: `1–9` pick options, `Enter` or `→` go next, `←` go back.
- Single-choice and rating questions move on automatically after you answer.
- Small confetti bursts on picks, and a big celebration at the end.
- Respects the "reduce motion" accessibility setting.
