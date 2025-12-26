# Troubleshooting Guide

## Environment Variable Issues

### Problem: "Receipt upload is not configured yet. Please set VITE_RECEIPT_PRESIGN_URL"

This error occurs when the application cannot find the `VITE_RECEIPT_PRESIGN_URL` environment variable.

#### Quick Fix Checklist:

1. **Check if `.env` file exists in project root**
   ```bash
   ls -la .env
   ```
   Expected output: Should show the `.env` file

2. **Verify `.env` file contents**
   ```bash
   cat .env
   ```
   Expected content:
   ```
   VITE_RECEIPT_PRESIGN_URL=https://placeholder.execute-api.ap-southeast-1.amazonaws.com/prod/presign
   ```

3. **Restart the development server** ⚠️ IMPORTANT
   ```bash
   # Stop the current dev server (Ctrl+C)
   # Then restart it
   npm run dev
   ```

   **Why?** Vite only reads `.env` files when the server starts. Changes to `.env` require a restart.

4. **Clear Vite cache and restart**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

5. **Check if variable is being loaded**
   - Open the app in your browser
   - Look at the bottom-right corner for the **Environment Debug Panel** (green text on black background)
   - Verify that `VITE_RECEIPT_PRESIGN_URL` is listed with the correct value

#### Common Mistakes:

❌ **Using quotes in .env file**
```bash
# WRONG
VITE_RECEIPT_PRESIGN_URL="https://..."

# CORRECT
VITE_RECEIPT_PRESIGN_URL=https://...
```

❌ **Wrong file location**
```bash
# WRONG - .env is inside src/ folder
src/.env

# CORRECT - .env is in project root
.env
```

❌ **Variable doesn't start with VITE_**
```bash
# WRONG - Vite won't expose this
RECEIPT_PRESIGN_URL=https://...

# CORRECT - Must start with VITE_
VITE_RECEIPT_PRESIGN_URL=https://...
```

❌ **Forgot to restart dev server**
- Always restart after creating or modifying `.env`

---

## Debug Panel

The application includes a built-in debug panel that appears in development mode:

### Features:
- ✅ Shows all `VITE_*` environment variables
- ✅ Displays variable values and status
- ✅ Provides troubleshooting tips
- ✅ Only visible in development mode

### Location:
Bottom-right corner of the screen (fixed position)

### How to use:
1. Start dev server: `npm run dev`
2. Open app in browser
3. Look for green text panel in bottom-right
4. Verify `VITE_RECEIPT_PRESIGN_URL` is listed

### To remove the debug panel:
Edit `src/App.jsx` and remove:
```jsx
{import.meta.env.DEV && <EnvDebug />}
```

---

## Testing Environment Variables

### Test 1: Check in Browser Console

Open browser DevTools (F12) and run:
```javascript
console.log(import.meta.env.VITE_RECEIPT_PRESIGN_URL);
```

**Expected output:** `https://placeholder.execute-api.ap-southeast-1.amazonaws.com/prod/presign`

### Test 2: Add Temporary Log

Add this to `src/components/CorporateFormSteps.jsx` (line ~228):
```javascript
console.log('Presign URL:', import.meta.env.VITE_RECEIPT_PRESIGN_URL);
const presignEndpoint = import.meta.env.VITE_RECEIPT_PRESIGN_URL;
```

Check browser console for output.

---

## Advanced Troubleshooting

### Issue: Variable shows as undefined in production build

**Cause:** Vite environment variables are embedded at build time.

**Solution:**
1. Ensure `.env` exists before building
2. Rebuild the application:
   ```bash
   npm run build
   ```

### Issue: Different environments need different URLs

**Solution:** Use environment-specific files:

```bash
# Development
.env.development
VITE_RECEIPT_PRESIGN_URL=https://dev-api.example.com

# Production
.env.production
VITE_RECEIPT_PRESIGN_URL=https://prod-api.example.com
```

Vite automatically loads the correct file based on mode.

### Issue: Variable works locally but not in deployment

**Causes:**
1. CI/CD platform doesn't have `.env` file (intentional - it's in `.gitignore`)
2. Need to set environment variables in deployment platform

**Solutions:**

**For Vercel:**
```bash
# Add to Vercel project settings -> Environment Variables
VITE_RECEIPT_PRESIGN_URL=https://your-api-url
```

**For Netlify:**
```bash
# Add to Netlify site settings -> Build & deploy -> Environment
VITE_RECEIPT_PRESIGN_URL=https://your-api-url
```

**For AWS Amplify:**
```bash
# Add to Amplify Console -> App settings -> Environment variables
VITE_RECEIPT_PRESIGN_URL=https://your-api-url
```

---

## Complete Setup Process

### Step-by-Step Guide:

1. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

2. **Verify file contents**
   ```bash
   cat .env
   ```
   Should show:
   ```
   VITE_RECEIPT_PRESIGN_URL=https://placeholder.execute-api.ap-southeast-1.amazonaws.com/prod/presign
   ```

3. **Install dependencies** (if not done)
   ```bash
   npm install
   ```

4. **Start dev server**
   ```bash
   npm run dev
   ```

5. **Verify in browser**
   - Open http://localhost:5173
   - Check debug panel (bottom-right)
   - Confirm variable is loaded

6. **Test the form**
   - Navigate to partnership application
   - Go through form steps
   - At Step 3 (Payment & Receipt), try uploading a file
   - You should see: "Receipt upload is not configured yet" is GONE
   - Instead you'll get a network error (expected - the API isn't deployed yet)

---

## Expected Behavior

### ✅ When properly configured:

1. `.env` file exists with `VITE_RECEIPT_PRESIGN_URL` set
2. Dev server shows no errors on start
3. Debug panel shows the variable with green checkmark
4. Form doesn't show "Please set VITE_RECEIPT_PRESIGN_URL" alert
5. Upload attempt makes network request (will fail gracefully if API not deployed)

### ❌ When NOT configured:

1. No `.env` file OR variable not set
2. Debug panel shows "Not Set" in red
3. Form shows alert: "Receipt upload is not configured yet"
4. Cannot proceed past Step 3 if trying to upload

---

## Need More Help?

1. **Check the debug panel** - It shows real-time variable status
2. **Review QUICKSTART.md** - Basic setup instructions
3. **Check API_ROUTES.md** - API endpoint documentation
4. **Review backend/README_S3_SETUP.md** - Full AWS setup guide

---

## Quick Command Reference

```bash
# View .env file
cat .env

# Copy example .env
cp .env.example .env

# Restart dev server
# Stop with Ctrl+C, then:
npm run dev

# Clear cache and restart
rm -rf node_modules/.vite && npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Still Not Working?

If you've tried everything above and it's still not working:

1. **Delete and recreate `.env`**
   ```bash
   rm .env
   cp .env.example .env
   ```

2. **Clear all caches**
   ```bash
   rm -rf node_modules/.vite
   rm -rf dist
   npm run dev
   ```

3. **Check for syntax errors in `.env`**
   - No spaces around `=`
   - No quotes around URL
   - No trailing spaces
   - Unix line endings (LF, not CRLF)

4. **Verify Vite version**
   ```bash
   npm list vite
   ```
   Should be 5.x or higher

5. **Check vite.config.js**
   Make sure it's not overriding environment variables

---

## Environment Variable Debugging Script

Create a file `debug-env.js` in project root:

```javascript
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

console.log('=== Environment Debug ===');
console.log('Working Directory:', process.cwd());
console.log('VITE_RECEIPT_PRESIGN_URL:', process.env.VITE_RECEIPT_PRESIGN_URL);
console.log('All VITE_ vars:',
  Object.keys(process.env)
    .filter(key => key.startsWith('VITE_'))
    .reduce((obj, key) => ({ ...obj, [key]: process.env[key] }), {})
);
```

Run with:
```bash
node debug-env.js
```
