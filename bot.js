// Конфигурация Telegram-бота для регистрации на мастер-класс
// Этот файл предназначен для развертывания на Google Apps Script

// Токен вашего Telegram-бота (замените на реальный токен)
const TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN";

// URL для взаимодействия с Telegram API
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// ID Google-таблицы для хранения регистраций
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";

// Имя листа в таблице
const SHEET_NAME = "Registrations";

/**
 * Основная функция для обработки вебхука от Telegram
 * @param {Object} e - Объект запроса
 * @return {Object} - Результат обработки
 */
function doPost(e) {
  try {
    const update = JSON.parse(e.postData.contents);
    handleUpdate(update);
    return ContentService
      .createTextOutput(JSON.stringify({status: "ok"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error processing webhook:", error);
    return ContentService
      .createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Функция для обработки обновлений от Telegram
 * @param {Object} update - Объект обновления от Telegram
 */
function handleUpdate(update) {
  if (update.message) {
    handleMessage(update.message);
  } else if (update.callback_query) {
    handleCallbackQuery(update.callback_query);
  }
}

/**
 * Обработка текстовых сообщений
 * @param {Object} msg - Объект сообщения
 */
function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const firstName = msg.chat.first_name || '';
  
  // Получаем состояние пользователя
  const userState = getUserState(chatId);
  
  if (text === '/start') {
    sendWelcomeMessage(chatId, firstName);
    showMainMenu(chatId);
  } else if (text === '📝 Зарегистрироваться') {
    showWorkshopSelection(chatId);
  } else if (userState && userState.step === 'waiting_for_full_name') {
    // Сохраняем ФИО и запрашиваем email
    setUserState(chatId, {
      step: 'waiting_for_email',
      workshop: userState.workshop,
      date: userState.date,
      fullName: text
    });
    sendMessage(chatId, 'Введите ваш email:');
  } else if (userState && userState.step === 'waiting_for_email') {
    // Сохраняем email и запрашиваем телефон
    setUserState(chatId, {
      step: 'waiting_for_phone',
      workshop: userState.workshop,
      date: userState.date,
      fullName: userState.fullName,
      email: text
    });
    sendMessage(chatId, 'Введите ваш номер телефона:');
  } else if (userState && userState.step === 'waiting_for_phone') {
    // Сохраняем телефон и завершаем регистрацию
    completeRegistration(chatId, {
      workshop: userState.workshop,
      date: userState.date,
      fullName: userState.fullName,
      email: userState.email,
      phone: text
    });
  } else {
    sendMessage(chatId, 'Я бот для регистрации на мастер-классы. Выберите действие:', getMainMenuKeyboard());
  }
}

/**
 * Обработка callback-запросов (нажатия на inline-кнопки)
 * @param {Object} callbackQuery - Объект callback-запроса
 */
function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  if (data.startsWith('workshop_')) {
    const workshop = data.substring(9); // Убираем 'workshop_' из строки
    // Запрашиваем дату мастер-класса
    setUserState(chatId, {
      step: 'waiting_for_date',
      workshop: workshop
    });
    sendMessage(chatId, `Вы выбрали мастер-класс: ${getWorkshopName(workshop)}\n\nВведите дату проведения (в формате ГГГГ-ММ-ДД):`);
  } else if (data === 'register') {
    showWorkshopSelection(chatId);
  }
  
  // Отвечаем на callback, чтобы убрать "часики" в боте
  UrlFetchApp.fetch(`${TELEGRAM_API_URL}/answerCallbackQuery?callback_query_id=${callbackQuery.id}`);
}

/**
 * Отправка приветственного сообщения
 * @param {Number} chatId - ID чата
 * @param {String} firstName - Имя пользователя
 */
function sendWelcomeMessage(chatId, firstName) {
  const welcomeMessage = `Привет, ${firstName || 'пользователь'}! 👋\n\nДобро пожаловать в бот регистрации на мастер-классы!\n\nС помощью этого бота вы можете зарегистрироваться на интересующий вас мастер-класс.`;
  sendMessage(chatId, welcomeMessage);
}

/**
 * Отображение главного меню
 * @param {Number} chatId - ID чата
 */
function showMainMenu(chatId) {
  sendMessage(chatId, 'Выберите действие:', getMainMenuKeyboard());
}

/**
 * Отображение выбора мастер-класса
 * @param {Number} chatId - ID чата
 */
function showWorkshopSelection(chatId) {
  sendMessage(chatId, 'Выберите мастер-класс:', getWorkshopSelectionKeyboard());
}

/**
 * Завершение регистрации
 * @param {Number} chatId - ID чата
 * @param {Object} registrationData - Данные регистрации
 */
function completeRegistration(chatId, registrationData) {
  try {
    // Сохраняем данные в Google Таблицы
    saveToSpreadsheet(registrationData);
    
    // Очищаем состояние пользователя
    clearUserState(chatId);
    
    // Отправляем подтверждение
    const confirmationMessage = 
      `✅ Регистрация прошла успешно!\n\n` +
      `Детали регистрации:\n` +
      `Мастер-класс: ${getWorkshopName(registrationData.workshop)}\n` +
      `Дата: ${registrationData.date}\n` +
      `ФИО: ${registrationData.fullName}\n` +
      `Email: ${registrationData.email}\n` +
      `Телефон: ${registrationData.phone}`;
    
    sendMessage(chatId, confirmationMessage);
    showMainMenu(chatId);
  } catch (error) {
    console.error("Error completing registration:", error);
    sendMessage(chatId, 'Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз или обратитесь к администратору.');
  }
}

/**
 * Отправка сообщения пользователю
 * @param {Number} chatId - ID чата
 * @param {String} text - Текст сообщения
 * @param {Object} keyboard - Клавиатура (опционально)
 */
function sendMessage(chatId, text, keyboard = null) {
  const url = `${TELEGRAM_API_URL}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };
  
  if (keyboard) {
    payload.reply_markup = JSON.stringify(keyboard);
  }
  
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    payload: payload
  });
  
  return response;
}

/**
 * Получение главной клавиатуры
 * @return {Object} - Объект клавиатуры
 */
function getMainMenuKeyboard() {
  return {
    keyboard: [
      [{text: '📝 Зарегистрироваться'}],
      [{text: 'ℹ️ Информация о мастер-классах'}, {text: '❓ Помощь'}]
    ],
    resize_keyboard: true
  };
}

/**
 * Получение клавиатуры с выбором мастер-классов
 * @return {Object} - Объект inline-клавиатуры
 */
function getWorkshopSelectionKeyboard() {
  return {
    inline_keyboard: [
      [{text: 'Креативное письмо', callback_data: 'workshop_creative_writing'}],
      [{text: 'Цифровое искусство', callback_data: 'workshop_digital_art'}],
      [{text: 'Кулинария', callback_data: 'workshop_cooking'}],
      [{text: 'Фотография', callback_data: 'workshop_photography'}]
    ]
  };
}

/**
 * Получение названия мастер-класса по ключу
 * @param {String} key - Ключ мастер-класса
 * @return {String} - Название мастер-класса
 */
function getWorkshopName(key) {
  const workshops = {
    'creative_writing': 'Креативное письмо',
    'digital_art': 'Цифровое искусство',
    'cooking': 'Кулинария',
    'photography': 'Фотография'
  };
  
  return workshops[key] || key;
}

/**
 * Сохранение данных в Google Таблицы
 * @param {Object} data - Данные для сохранения
 */
function saveToSpreadsheet(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  
  // Добавляем новую строку с данными регистрации
  sheet.appendRow([
    new Date(), // Дата и время регистрации
    data.fullName,
    data.email,
    data.phone,
    getWorkshopName(data.workshop),
    data.date,
    'Новая' // Статус регистрации
  ]);
}

/**
 * Получение состояния пользователя
 * @param {Number} chatId - ID чата
 * @return {Object} - Объект состояния пользователя
 */
function getUserState(chatId) {
  const key = `user_state_${chatId}`;
  const storedState = PropertiesService.getUserProperties().getProperty(key);
  return storedState ? JSON.parse(storedState) : null;
}

/**
 * Установка состояния пользователя
 * @param {Number} chatId - ID чата
 * @param {Object} state - Объект состояния
 */
function setUserState(chatId, state) {
  const key = `user_state_${chatId}`;
  PropertiesService.getUserProperties().setProperty(key, JSON.stringify(state));
}

/**
 * Очистка состояния пользователя
 * @param {Number} chatId - ID чата
 */
function clearUserState(chatId) {
  const key = `user_state_${chatId}`;
  PropertiesService.getUserProperties().deleteProperty(key);
}

/**
 * Функция для тестирования
 */
function test() {
  console.log('Bot is working!');
}

/**
 * Функция doGet для обработки GET-запросов (например, для проверки работоспособности)
 */
function doGet() {
  return HtmlService.createHtmlOutput('<h1>Telegram Bot for Workshop Registration is running!</h1>');
}