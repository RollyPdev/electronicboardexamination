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
    
    // Try different selectors
    let rows = document.querySelectorAll('table tbody tr');
    if (rows.length === 0) {
      rows = document.querySelectorAll('table tr');
    }
    if (rows.length === 0) {
      rows = document.querySelectorAll('tr');
    }
    
    const heiData = [];
    const heiTypes = new Set();
    const regions = new Set();
    
    console.log(`Found ${rows.length} rows`);
    
    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td, th');
      console.log(`Row ${index}: ${cells.length} cells`);
      
      if (cells.length >= 3 && index > 0) { // Skip header row
        const name = cells[0]?.textContent?.trim();
        const type = cells[1]?.textContent?.trim();
        const region = cells[2]?.textContent?.trim();
        
        console.log(`Name: ${name}, Type: ${type}, Region: ${region}`);
        
        if (name && type && region) {
          heiData.push({ name, type, region });
          heiTypes.add(type);
          regions.add(region);
        }
      }
    });
    
    console.log('=== HEI TYPES ===');
    Array.from(heiTypes).sort().forEach(type => {
      console.log(`- ${type}`);
    });
    
    console.log('\n=== REGIONS ===');
    Array.from(regions).sort().forEach(region => {
      console.log(`- ${region}`);
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total HEIs: ${heiData.length}`);
    console.log(`Unique HEI Types: ${heiTypes.size}`);
    console.log(`Regions: ${regions.size}`);
    
    console.log('\n=== HEI COUNT BY TYPE ===');
    const typeCount = {};
    heiData.forEach(hei => {
      typeCount[hei.type] = (typeCount[hei.type] || 0) + 1;
    });
    
    Object.entries(typeCount).sort().forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });
    
    console.log('\n=== HEI COUNT BY REGION ===');
    const regionCount = {};
    heiData.forEach(hei => {
      regionCount[hei.region] = (regionCount[hei.region] || 0) + 1;
    });
    
    Object.entries(regionCount).sort().forEach(([region, count]) => {
      console.log(`${region}: ${count}`);
    });
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});