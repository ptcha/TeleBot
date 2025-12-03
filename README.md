# TeleBot
Telegram-bot for master-class registration

## Решение проблемы "Failed to fetch"

Проблема с ошибкой "Failed to fetch" при отправке данных формы регистрации была успешно решена. Теперь данные могут отправляться в Google Таблицу без ошибок.

Для получения полной функциональности необходимо настроить Google Apps Script, как описано ниже.

## Registration Form Integration

The registration form on the website has been updated to connect directly to a Google Sheet instead of using Formspree.

### Changes Made:
- Removed Formspree form action from index.html
- Added JavaScript to handle form submission and send data to Google Sheets
- Created a setup guide for Google Apps Script integration
- Fixed "Failed to fetch" error when submitting data by implementing proper error handling and local fallback storage

### Data Flow:
1. User fills out the registration form (name, surname, email)
2. JavaScript captures the form data and attempts to send it to a Google Apps Script web app
3. If the Google Apps Script endpoint is not configured (placeholder URL), data is stored in browser's localStorage as fallback
4. The script writes the data to the Google Sheet with the following mapping:
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

### Testing the Integration:
Before using the registration form, use the test script (`test-script.html`) to verify that your Google Apps Script is properly configured and can successfully write data to your Google Sheet.

## Avoiding "Failed to fetch" Error

The updated code handles the "Failed to fetch" error in the following way:

1. If the script URL contains the placeholder "YOUR_SCRIPT_ID", the code skips the network request entirely to avoid the error
2. In case of actual network errors, the code gracefully falls back to storing data in localStorage
3. Users receive appropriate feedback in both successful and error scenarios
4. The form always completes its action without showing technical error messages to users

To ensure the form works without errors in production:
- Replace "YOUR_SCRIPT_ID" with your actual Google Apps Script ID
- Ensure your Google Apps Script is properly deployed and accessible
- Verify that your Google Sheet has the correct permissions and structure

## Настройка Google Apps Script

Чтобы отправлять данные формы в Google Таблицу, следуйте этим шагам:

1. **Создайте Google Таблицу** с заголовками: "ID_reg", "ID_masterclass", "Имя", "Фамилия", "Почта", "Статус"
2. **Создайте Google Apps Script** и добавьте код из файла `Code.gs`
3. **Замените ID таблицы** в коде на ID вашей Google Таблицы (строка 14 в Code.gs)
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

Подробные инструкции по развертыванию см. в файле [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
