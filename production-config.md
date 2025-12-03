# Production Configuration for Registration Form

## How to Configure Real Google Apps Script Endpoint

To make the registration form work with a real Google Apps Script endpoint and send data to Google Sheets without any errors:

### Step 1: Deploy Your Google Apps Script
1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy the code from `Code.gs` in this repository
4. Deploy it as a web application with "Anyone" access

### Step 2: Get Your Script ID
After deployment, you'll get a URL like:
`https://script.google.com/macros/s/abcdefghijklmnopqrstuvwxyz/exec`

The script ID is the part between `/s/` and `/exec`: `abcdefghijklmnopqrstuvwxyz`

### Step 3: Update the HTML File
Replace the placeholder in `index.html`:

**Before:**
```javascript
const scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

**After:**
```javascript
const scriptUrl = 'https://script.google.com/macros/s/abcdefghijklmnopqrstuvwxyz/exec';
```

### Step 4: Test Your Configuration
Use the test script in `test-script.html` to verify your Google Apps Script is working correctly before using the registration form in production.

## Error Prevention
With a properly configured script ID:
- No "Failed to fetch" errors will occur
- Data will be sent directly to your Google Sheet
- Users will receive confirmation messages
- The system will still maintain localStorage backup as a safety measure