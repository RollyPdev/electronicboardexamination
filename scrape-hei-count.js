const https = require('https');
const { JSDOM } = require('jsdom');

const url = 'https://unifast.gov.ph/hei-list.html';

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const dom = new JSDOM(data);
    const document = dom.window.document;
    
    // Look for table rows or list items containing school data
    const rows = document.querySelectorAll('table tr');
    const listItems = document.querySelectorAll('li');
    
    let count = 0;
    
    // Try counting table rows (excluding header)
    if (rows.length > 1) {
      count = rows.length - 1; // Subtract header row
    } else if (listItems.length > 0) {
      count = listItems.length;
    }
    
    console.log(`Number of Higher Education Institutions: ${count}`);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});