const { google } = require('googleapis');

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

async function appendToSheet(sheetName, values) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] },
  });
}

async function findStatus(invoice) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: `${process.env.PRODUKSI_SHEET_NAME}!A2:D`,
  });

  const rows = res.data.values;
  const match = rows?.find(row => row[0].toUpperCase() === invoice.toUpperCase());
  if (match) {
    return `📦 ${match[0]} - ${match[3]} oleh ${match[1]} pada ${match[2]}`;
  }
  return `❌ Invoice ${invoice} tidak ditemukan.`;
}

module.exports = { appendToSheet, findStatus };
