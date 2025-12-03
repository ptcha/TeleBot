function doPost(e) {
  try {
    // Parse the incoming data
    const jsonString = e.postData.contents;
    const data = JSON.parse(jsonString);
    
    // Extract the form data
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const email = data.email || '';
    
    // Open the Google Sheet
    // Replace with your actual spreadsheet ID
    const sheetId = '1KI4xQPFpKKG5jloqyCArMNH0a5BgrgNZR_Q-3qbcOHE';
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Данные регистрации');
    
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

// Optional: doGet function for testing
function doGet(e) {
  return HtmlService.createHtmlOutput('<h1>Registration API is working!</h1>');
}