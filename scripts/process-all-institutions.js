const fs = require('fs');
const path = require('path');

function processInstitutionsFile() {
  // Read the raw data file
  const rawDataPath = path.join(__dirname, '..', 'data', 'raw-institutions.txt');
  
  if (!fs.existsSync(rawDataPath)) {
    console.error('Raw institutions file not found. Please create data/raw-institutions.txt with all your institution data.');
    return;
  }
  
  const rawData = fs.readFileSync(rawDataPath, 'utf8');
  const lines = rawData.trim().split('\n');
  const institutions = [];
  
  lines.forEach((line, index) => {
    const parts = line.split('\t');
    if (parts.length >= 3) {
      const region = parts[0].trim();
      const name = parts[1].trim()
        .replace(/&amp;#39;/g, "'")
        .replace(/&amp;amp;/g, "&")
        .replace(/&amp;quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      const type = parts[2].trim();
      
      institutions.push({
        id: index + 1,
        region,
        name,
        type
      });
    }
  });
  
  // Save the processed JSON
  const outputPath = path.join(__dirname, '..', 'data', 'philippine-institutions.json');
  fs.writeFileSync(outputPath, JSON.stringify(institutions, null, 2));
  
  console.log(`✅ Generated ${institutions.length} institutions`);
  console.log(`📁 File saved to: ${outputPath}`);
  
  // Show summary statistics
  const regionCounts = {};
  const typeCounts = {};
  
  institutions.forEach(inst => {
    regionCounts[inst.region] = (regionCounts[inst.region] || 0) + 1;
    typeCounts[inst.type] = (typeCounts[inst.type] || 0) + 1;
  });
  
  console.log('\n📊 Institutions by region:');
  Object.entries(regionCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([region, count]) => {
      console.log(`   ${region}: ${count}`);
    });
  
  console.log('\n🏫 Institutions by type:');
  Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
  
  return institutions;
}

// Run the script
processInstitutionsFile();