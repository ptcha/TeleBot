# Google Apps Script Setup for Registration Form

To connect your registration form to the Google Sheet, you need to create and deploy a Google Apps Script web app. Follow these steps:

## Step 1: Create Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Replace the default code with the following:

```javascript
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    const firstName = data.firstName;
    const lastName = data.lastName;
    const email = data.email;
    
    // Open the Google Sheet
    const sheetId = '1KI4xQPFpKKG5jloqyCArMNH0a5BgrgNZR_Q-3qbcOHE'; // Your sheet ID
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Данные регистрации');
    
    // Get the next available row
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    
    // Generate a unique ID for registration
    const idReg = 'REG_' + Date.now(); // Using timestamp as unique ID
    const idMasterclass = 'MC_001'; // You can customize this
    
    // Write data to the sheet
    sheet.getRange(nextRow, 1).setValue(idReg); // A: ID_reg
    sheet.getRange(nextRow, 2).setValue(idMasterclass); // B: ID_masterclass
    sheet.getRange(nextRow, 3).setValue(firstName); // C: Имя
    sheet.getRange(nextRow, 4).setValue(lastName); // D: Фамилия
    sheet.getRange(nextRow, 5).setValue(email); // E: Почта
    sheet.getRange(nextRow, 6).setValue('Записан'); // F: Статус
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({result: 'success', message: 'Data saved successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Error processing data:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({result: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: doGet function for testing
function doGet(e) {
  return HtmlService.createHtmlOutput('<h1>Registration API is running!</h1>');
}
```

## Step 2: Deploy the Web App

1. Click "Deploy" in the top menu
2. Select "New deployment"
3. Choose "Web app" as the deployment type
4. Fill in the description (e.g., "Registration Handler")
5. For "Execute as", select "Me"
6. For "Who has access", select "Anyone" (or "Anyone with Google" if you prefer more security)
7. Click "Deploy"
8. Copy the deployment URL (it will look like `https://script.google.com/macros/s/.../exec`)

## Step 3: Update Your HTML File

Replace `YOUR_SCRIPT_ID` in your HTML file with the actual script ID from the deployment URL.

For example, if your deployment URL is:
`https://script.google.com/macros/s/abcdefghijklmnopqrstuvwxyz/exec`

Then replace in your HTML:
```javascript
const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
```

With:
```javascript
const response = await fetch('https://script.google.com/macros/s/abcdefghijklmnopqrstuvwxyz/exec', {
```

## Important Notes

- Make sure your Google Sheet has the correct permissions (at least "Anyone with the link can view" if using "Anyone" access in the script)
- The Google Apps Script project must be associated with the same Google account that has access to the Google Sheet
- The sheet name in the script must match exactly with your sheet name ("Данные регистрации")
- The script will automatically add new rows to the sheet with the specified format
- Each registration will have a unique ID generated using the timestamp
- The status will be automatically set to "Записан"

## Testing

After deployment, you can test the API endpoint by visiting the deployment URL in your browser to see if it returns the test message. You can also test the form submission to see if data appears in your Google Sheet.