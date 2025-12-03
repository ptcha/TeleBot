function doPost(e) {
  try {
    // Handle both JSON and form data
    let data;
    
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      // Form data received
      data = {
        firstName: e.parameter.firstName || '',
        lastName: e.parameter.lastName || '',
        email: e.parameter.email || ''
      };
    } else if (e.postData) {
      // JSON data received
      const jsonString = e.postData.contents;
      data = JSON.parse(jsonString);
    }
    
    // Extract the form data
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const email = data.email || '';
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return ContentService
        .createTextOutput(JSON.stringify({result: 'error', message: 'Missing required fields'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Use Google Sheets API directly to add data
    // Replace with your actual spreadsheet ID
    const sheetId = '1KI4xQPFpKKG5jloqyCArMNH0a5BgrgNZR_Q-3qbcOHE';
    
    // Check if the sheet exists and create if needed
    let sheet = getOrCreateSheet(sheetId, 'Данные регистрации');
    
    // Generate a unique registration ID
    const registrationId = 'REG-' + new Date().getTime();
    const masterclassId = 'MC-' + new Date().getTime(); // You can customize this
    
    // Prepare the row data
    const rowData = [
      registrationId,  // Column A: ID_reg
      masterclassId,   // Column B: ID_masterclass
      firstName,       // Column C: Имя
      lastName,        // Column D: Фамилия
      email,           // Column E: Почта
      'Записан'        // Column F: Статус
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({result: 'success', message: 'Data saved successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Log the error for debugging
    console.error('Error in doPost function:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({result: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to get or create a sheet
function getOrCreateSheet(sheetId, sheetName) {
  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName(sheetName);
  
  // Check if sheet exists, create if it doesn't
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Add headers to the new sheet
    sheet.getRange(1, 1, 1, 6).setValues([['ID_reg', 'ID_masterclass', 'Имя', 'Фамилия', 'Почта', 'Статус']]);
  }
  
  // Check if headers exist, add if they don't
  const headerRow = sheet.getRange(1, 1, 1, 6).getValues()[0];
  if (headerRow[0] !== 'ID_reg') {
    sheet.getRange(1, 1, 1, 6).setValues([['ID_reg', 'ID_masterclass', 'Имя', 'Фамилия', 'Почта', 'Статус']]);
  }
  
  return sheet;
}

// Optional: doGet function for testing
function doGet(e) {
  return HtmlService.createHtmlOutput('<h1>Registration API is working!</h1><p>This Google Apps Script endpoint receives registration data and saves it to Google Sheets.</p>');
}