# TeleBot
Telegram-bot for master-class registration

## Registration Form Integration

The registration form on the website has been updated to connect directly to a Google Sheet instead of using Formspree.

### Changes Made:
- Removed Formspree form action from index.html
- Added JavaScript to handle form submission and send data to Google Sheets
- Created a setup guide for Google Apps Script integration

### Data Flow:
1. User fills out the registration form (name, surname, email)
2. JavaScript captures the form data and sends it to a Google Apps Script web app
3. The script writes the data to the Google Sheet with the following mapping:
   - Name → Column C (Имя)
   - Surname → Column D (Фамилия) 
   - Email → Column E (Почта)
   - Status → Column F (Статус) - automatically set to "Записан"
   - Unique registration ID → Column A (ID_reg)
   - Masterclass ID → Column B (ID_masterclass)

### Setup Required:
To complete the integration, you need to:
1. Create and deploy a Google Apps Script web app (see `google-apps-script-setup.md` for detailed instructions)
2. Update the script URL in the HTML file with your deployed script ID
3. Test the integration using the test script provided in `test-script.html`

### Testing the Integration:
Before using the registration form, use the test script (`test-script.html`) to verify that your Google Apps Script is properly configured and can successfully write data to your Google Sheet.
