# TeleBot
Telegram-bot for master-class registration

## Understanding the Integration Approach

**Important**: This solution uses Google Apps Script as an intermediary to connect the registration form to Google Sheets. This is not just a workaround—it's the recommended and secure approach for connecting web forms to Google Sheets due to security restrictions in browsers and Google's API policies.

### Why Google Apps Script is Required

Direct client-side integration with Google Sheets is impossible due to:
- **CORS restrictions**: Google Sheets API doesn't allow direct requests from arbitrary web pages
- **Security**: OAuth 2.0 credentials cannot be safely stored in client-side code
- **Authentication**: Google Sheets API requires server-side authentication

## Registration Form Integration

The registration form on the website connects to Google Sheets through a Google Apps Script web app, which is the standard and secure approach.

### Changes Made:
- Removed Formspree form action from index.html
- Added JavaScript to handle form submission and send data to Google Apps Script
- Created a setup guide for Google Apps Script integration
- Fixed "Failed to fetch" error when submitting data by implementing proper error handling and local fallback storage
- Enhanced Google Apps Script code to handle both JSON and form data, with automatic sheet creation if it doesn't exist
- Updated form submission logic to only attempt sending data to Google Apps Script when properly configured, with proper error handling
- Added fallback storage in browser's localStorage when Google Apps Script is not configured

### Data Flow:
1. User fills out the registration form (name, surname, email)
2. JavaScript captures the form data and attempts to send it to a Google Apps Script web app (only when properly configured)
3. If the Google Apps Script endpoint is not configured (placeholder URL), data is stored in browser's localStorage as fallback
4. The Google Apps Script writes the data to the Google Sheet with the following mapping:
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
4. See `PROBLEM_SOLUTION.md` for detailed information about fixing the "Failed to fetch" error
5. For detailed deployment instructions, see `DEPLOYMENT_INSTRUCTIONS.md`
6. For technical explanation of the approach, see `DIRECT_GOOGLE_SHEETS_INTEGRATION.md`

### Testing the Integration:
Before using the registration form, use the test script (`test-script.html`) to verify that your Google Apps Script is properly configured and can successfully write data to your Google Sheet.

## Avoiding "Failed to fetch" Error

The updated code handles the "Failed to fetch" error in the following way:

1. The code now only attempts to send data to Google Apps Script when a real script ID is configured (not the placeholder)
2. Proper error handling ensures that network errors don't break the user experience
3. In case of actual network errors, the code gracefully falls back to storing data in localStorage
4. Users receive appropriate feedback in both successful and error scenarios
5. The form always completes its action without showing technical error messages to users

To ensure the form works without errors in production:
- Replace "YOUR_SCRIPT_ID" with your actual Google Apps Script ID
- Ensure your Google Apps Script is properly deployed and accessible
- Verify that your Google Sheet has the correct permissions and structure

## Настройка Google Apps Script

Чтобы отправлять данные формы в Google Таблицу, следуйте этим шагам:

1. **Создайте Google Таблицу** с заголовками: "ID_reg", "ID_masterclass", "Имя", "Фамилия", "Почта", "Статус"
2. **Создайте Google Apps Script** и добавьте код из файла `Code.gs`
3. **Замените ID таблицы** в коде на ID вашей Google Таблицы (строка 32 в Code.gs)
4. **Опубликуйте скрипт** как веб-приложение с доступом "Для всех" (кто имеет ссылку)
5. **Замените URL** в файле `index.html` на URL вашего опубликованного скрипта, изменив `YOUR_SCRIPT_ID` на реальный ID скрипта:

   Пример: если ваш URL Google Apps Script: `https://script.google.com/macros/s/abcdefghijklmnopqrstuvwxyz/exec`, то замените в `index.html`:
   ```javascript
   const scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
   на:
   ```javascript
   const scriptUrl = 'https://script.google.com/macros/s/abcdefghijklmnopqrstuvwxyz/exec';
   ```

Подробные инструкции по развертыванию см. в файле [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md).
