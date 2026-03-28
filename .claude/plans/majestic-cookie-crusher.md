# Final Implementation Plan: Email Verification & Onboarding Setup

## Decisions Confirmed
- ✅ Use nodemailer (Gmail SMTP) for email service
- ✅ Google OAuth users auto-verified (emailVerified: true)
- ✅ Users can skip bank linking - setupComplete not required for dashboard access
- ✅ No need to handle existing users (will be cleaned from DB)

**Important**: Since users can skip setup, the only requirement is email verification for regular signups. Google OAuth bypasses verification entirely.

---

## Implementation Steps

### Phase 1: Backend

#### Step 1.1: Update User Model (`server/models/User.js`)
Add schema fields:
```javascript
emailVerified: { type: Boolean, default: false },
verificationToken: String,
verificationTokenExpires: Date
// setupComplete not needed since skipping is allowed
```

#### Step 1.2: Create Email Service (`server/utils/emailService.js`)
- Configure nodemailer transporter using SMTP credentials from .env
- Export `sendVerificationEmail(user, verificationToken)` function
- Compose email with verification link pointing to frontend: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`

#### Step 1.3: Update Auth Routes (`server/routes/authRoutes.js`)

**POST /auth/signup** (modified):
- Generate `verificationToken` using crypto.randomBytes(32).toString('hex')
- Set `verificationTokenExpires` to Date.now() + 24 hours
- Save user with `emailVerified: false`
- Call `sendVerificationEmail(newUser, verificationToken)`
- Return `{ message: "Account created. Please verify your email." }` (NO token)

**POST /auth/resend-verification** (new):
- Find user by email
- If exists and not verified: generate new token, send email, return success
- Else: return appropriate message

**GET /auth/verify-email/:token** (new):
- Find user by token
- Check if token exists and not expired
- If valid: set `emailVerified: true`, clear token fields, save
- Return redirect to frontend setup page: `${process.env.FRONTEND_URL}/setup` (or /dashboard if setup skipped?)
- If invalid/expired: return error JSON with message

**POST /auth/google** (modified):
- Find/create user
- If user created: set `emailVerified: true` (Google verified)
- Return JWT token as usual

**POST /auth/signin** (modified):
- After password verification:
  - Check if `user.emailVerified === false`
  - If not verified: return 403 with `{ emailNotVerified: true, message: "Please verify your email first" }`
  - If verified: return JWT token as usual

**NEW: GET /auth/me** (optional but recommended):
- `verifyToken` middleware
- Return current user data (emailVerified flag)
- Used by frontend to check verification status after login

#### Step 1.4: Enhance verifyToken Middleware (`server/middleware/auth.js`) (Optional)
- After verifying token, fetch full user from DB
- Attach `user.emailVerified` and `user.setupComplete` to `req.user`
- (Decision: Might not be strictly necessary if frontend checks separately)

---

### Phase 2: Frontend

#### Step 2.1: Create Verify Email Page
**`src/pages/verify_email/VerifyEmail.jsx`**
- Displays message: "Check your inbox to verify your email address"
- Shows: Resend verification button (with countdown/cooldown)
- Automatically checks verification status on mount (using /auth/me)
- If user already verified (e.g., clicked link), redirect to /setup or /dashboard

**`src/pages/verify_email/VerifyEmail.module.css`**
- Styling for the verification page

#### Step 2.2: Create Setup Page (Required after verification)
**`src/pages/setup/Setup.jsx`**
- Displays: "Let's set up your account"
- Shows Plaid link button (use existing code from Dashboard)
- Option to "Skip for now" - redirects to /dashboard
- After successful Plaid link: mark setup complete (call backend API)
  - Can use `PATCH /auth/setup-complete` endpoint to mark user.setupComplete = true
- Redirect to /dashboard

**`src/pages/setup/Setup.module.css`**
- Styling for setup page

**NEW: PATCH /auth/setup-complete** (backend)
- `verifyToken` middleware
- Set user.setupComplete = true, save
- Return success

#### Step 2.3: Create Profile API (or use /auth/me)
**GET /auth/me** (backend - add if not created)
- Returns: `{ id, email, firstName, lastName, emailVerified }`
- Protected by verifyToken

**Frontend helper**: Call `/auth/me` after login to get user flags

#### Step 2.4: Update ProtectedRoute (`src/components/protected_rote/ProtectedRoute.jsx`)
Modify to check user flags from localStorage:
```javascript
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("finely-user") || "{}");

if (!token) return <Navigate to="/signin" />;
if (!user.emailVerified) return <Navigate to="/verify-email" />;
// setupComplete check removed since skipping allowed

return <Outlet />;
```

#### Step 2.5: Update SignUp Page (`src/pages/sign_up/SignUp.jsx`)
- After successful signup API call:
  - Show success message: "Account created! Please check your email to verify your account."
  - Optionally redirect to /verify-email page after a few seconds
  - Clear form
- Do NOT store token or navigate to dashboard

#### Step 2.6: Update SignIn Page (`src/pages/sign_in/SignIn.jsx`)
- After successful signin:
  - Get `user` from response (already parsed from JWT)
  - Store `finely-user` with emailVerified flag (need to fetch full user!)
  - Call `/auth/me` to get latest user data including emailVerified
  - If `emailVerified === false`: redirect to /verify-email
  - If `emailVerified === true`: redirect to /setup (or dashboard if setup is skipped)
  - Store user data in localStorage

- Modified flow:
  ```javascript
  const response = await api.post("/auth/signin", {...});
  const { token } = response.data;
  localStorage.setItem("token", token);

  const { data: user } = await api.get("/auth/me");
  localStorage.setItem("finely-user", JSON.stringify(user));

  if (!user.emailVerified) {
    navigate("/verify-email");
  } else {
    navigate("/setup"); // or dashboard if skipping setup
  }
  ```

#### Step 2.7: Update Google OAuth Flow (SignIn.jsx & SignUp.jsx)
- After successful Google auth:
  - Store token
  - Fetch `/auth/me` to get user (already verified)
  - Store user in localStorage
  - Since emailVerified = true, navigate to /setup (or /dashboard)

#### Step 2.8: Add New Routes to App.jsx
```javascript
<Routes>
  <Route path="/verify-email" element={<VerifyEmail />} />
  <Route path="/setup" element={<Setup />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <!-- other protected routes -->
  </Route>
</Routes>
```

---

## API Endpoints Summary

**New:**
- POST `/auth/resend-verification` - Resend verification email
- GET `/auth/verify-email/:token` - Verify token and activate account
- GET `/auth/me` - Get current user profile (including emailVerified)
- PATCH `/auth/setup-complete` - Mark setup as done

**Modified:**
- POST `/auth/signup` - Returns message only, sends verification email
- POST `/auth/signin` - Returns 403 if email not verified
- POST `/auth/google` - Sets emailVerified: true

---

## Testing Flow

1. **Signup (email/password)**:
   - Fill form → submit → success message
   - Check email (or mock SMTP) → click verification link
   - Redirected to /setup page
   - Click "Skip for now" → redirected to /dashboard
   - Can access dashboard

2. **Signin (email/password)**:
   - If not verified: blocked with message, redirect to /verify-email
   - If verified: redirected to /setup (first time) or /dashboard (if already completed setup)

3. **Google OAuth**:
   - Click Google → sign in → auto-verified
   - Redirected to /setup (first time) or /dashboard
   - No email verification step

4. **Resend Verification**:
   - From /verify-email page, click resend
   - New email sent, button disabled for 60 seconds

5. **Expired Token**:
   - Try to verify with expired token → error message with resend option

---

## Email Configuration

Add to `.env` (frontend) and `server/.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

**Note**: For Gmail, use an App Password if 2FA is enabled.

---

## Order of Implementation

1. Backend: User model → email service → auth routes
2. Frontend: verify-email page → setup page → ProtectedRoute → SignIn/SignUp updates
3. Add routes to App.jsx
4. Test end-to-end

Start implementing now.
