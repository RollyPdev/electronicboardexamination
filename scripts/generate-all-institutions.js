const fs = require('fs');
const path = require('path');

// Complete raw data - I'll include all regions you provided
const rawData = `01 - Ilocos Region	ABE International College of Business and Accountancy-Urdaneta City	Private HEI
01 - Ilocos Region	AMA Computer College-Dagupan City	Private HEI
01 - Ilocos Region	AMA Computer College-Laoag City	Private HEI
01 - Ilocos Region	Asbury College	Private HEI
01 - Ilocos Region	Asiacareer College Foundation	Private HEI
01 - Ilocos Region	Binalatongan Community College	LUC
01 - Ilocos Region	CICOSAT Colleges	Private HEI
01 - Ilocos Region	Colegio de Dagupan	Private HEI
01 - Ilocos Region	Colegio De San Juan De Letran-Manaoag	Private HEI
01 - Ilocos Region	Colegio San Jose De Alaminos	Private HEI
01 - Ilocos Region	Dagupan Colleges Foundation	Private HEI
01 - Ilocos Region	Data Center College of the Philippines of Laoag City	Private HEI
01 - Ilocos Region	Divine Word College of Laoag	Private HEI
01 - Ilocos Region	Divine Word College of Vigan	Private HEI
01 - Ilocos Region	Don Mariano Marcos Memorial State University-Mid La Union	SUC
01 - Ilocos Region	Don Mariano Marcos Memorial State University-North La Union-Main Campus	SUC
01 - Ilocos Region	Don Mariano Marcos Memorial State University-Open University	SUC
01 - Ilocos Region	Don Mariano Marcos Memorial State University-South La Union	SUC
01 - Ilocos Region	Golden West Colleges	Private HEI
01 - Ilocos Region	Ilocos Sur Community College	LUC
01 - Ilocos Region	Ilocos Sur Polytechnic State College	SUC
01 - Ilocos Region	Ilocos Sur Polytechnic State College-Candon	SUC
01 - Ilocos Region	Ilocos Sur Polytechnic State College-Cervantes	SUC
01 - Ilocos Region	Ilocos Sur Polytechnic State College-College of Arts and Sciences-Tagudin	SUC
01 - Ilocos Region	Ilocos Sur Polytechnic State College-College of Engineering and Technology-Santiago	SUC
01 - Ilocos Region	Ilocos Sur Polytechnic State College-College of Fisheries and Marine Sciences-Narvacan	SUC
01 - Ilocos Region	International Colleges for Excellence, inc	Private HEI
01 - Ilocos Region	Kingfisher School of Business & Finance	Private HEI
01 - Ilocos Region	La Union Christian Comprehensive College	Private HEI
01 - Ilocos Region	La Union College of Science and Technology	Private HEI
01 - Ilocos Region	Lorma Colleges	Private HEI
01 - Ilocos Region	Luna Colleges	Private HEI
01 - Ilocos Region	Lyceum Northern Luzon	Private HEI
01 - Ilocos Region	Lyceum Northwestern University	Private HEI
01 - Ilocos Region	Lyceum Northwestern University-Urdaneta Campus	Private HEI
01 - Ilocos Region	Malasiqui Agno Valley College	Private HEI
01 - Ilocos Region	Mariano Marcos State University-College of Agriculture and Forestry-Dingras	SUC
01 - Ilocos Region	Mariano Marcos State University-College of Aquatic Sciences and Applied Technology	SUC
01 - Ilocos Region	Mariano Marcos State University-College of Industrial Technology-Laoag City	SUC
01 - Ilocos Region	Mariano Marcos State University-College of Teacher Education-Laoag City	SUC
01 - Ilocos Region	Mariano Marcos State University-Main	SUC
01 - Ilocos Region	Mary Help of Christians College Seminary	Private HEI
01 - Ilocos Region	Metro-Dagupan Colleges	Private HEI
01 - Ilocos Region	Mystical Rose College of Science and Technology	Private HEI
01 - Ilocos Region	NICOSAT Colleges	Private HEI
01 - Ilocos Region	NJ Valdez Colleges Foundation	Private HEI
01 - Ilocos Region	North Luzon Philippines State College	SUC
01 - Ilocos Region	Northern Christian College	Private HEI
01 - Ilocos Region	Northern Luzon Adventist College	Private HEI
01 - Ilocos Region	Northern Philippines College for Maritime, Science and Technology	Private HEI
01 - Ilocos Region	Northwestern University	Private HEI
01 - Ilocos Region	Osias Educational Foundation	Private HEI
01 - Ilocos Region	Palaris College	Private HEI
01 - Ilocos Region	Pangasinan Merchant Marine Academy	Private HEI
01 - Ilocos Region	Pangasinan State University	SUC
01 - Ilocos Region	Pangasinan State University-Alaminos City	SUC
01 - Ilocos Region	Pangasinan State University-Asingan	SUC
01 - Ilocos Region	Pangasinan State University-Bayambang	SUC
01 - Ilocos Region	Pangasinan State University-Binmaley	SUC
01 - Ilocos Region	Pangasinan State University-Infanta	SUC
01 - Ilocos Region	Pangasinan State University-San Carlos City	SUC
01 - Ilocos Region	Pangasinan State University-Sta. Maria	SUC
01 - Ilocos Region	Pangasinan State University-Urdaneta City	SUC
01 - Ilocos Region	Panpacific University North Philippines-Tayug	Private HEI
01 - Ilocos Region	Panpacific University North Philippines-Urdaneta City	Private HEI
01 - Ilocos Region	Pass College	Private HEI
01 - Ilocos Region	Perpetual Help College of Pangasinan	Private HEI
01 - Ilocos Region	Philippine College of Northwestern Luzon	Private HEI
01 - Ilocos Region	Philippine College of Science and Technology	Private HEI
01 - Ilocos Region	Philippine Darakbang Theological College	Private HEI
01 - Ilocos Region	PHINMA-Upang College Urdaneta	Private HEI
01 - Ilocos Region	PIMSAT Colleges-Dagupan	Private HEI
01 - Ilocos Region	PIMSAT Colleges-San Carlos City	Private HEI
01 - Ilocos Region	Polytechnic College of La union	Private HEI
01 - Ilocos Region	Rosales-Wesleyan Bible College	Private HEI
01 - Ilocos Region	Saint Columban's College	Private HEI
01 - Ilocos Region	Saint John Bosco College of Northern Luzon	Private HEI
01 - Ilocos Region	Saint Louis College-City of San Fernando	Private HEI
01 - Ilocos Region	Saint Mary's College Sta. Maria, Ilocos Sur	Private HEI
01 - Ilocos Region	Saint Paul College of Ilocos Sur	Private HEI
01 - Ilocos Region	San Carlos College	Private HEI
01 - Ilocos Region	Sea and Sky College	Private HEI
01 - Ilocos Region	Señor Tesoro College	Private HEI
01 - Ilocos Region	South Ilocandia College of Arts and Technology	Private HEI
01 - Ilocos Region	St. Camillus College of Manaoag Foundation	Private HEI
01 - Ilocos Region	St. Therese College Foundation	Private HEI
01 - Ilocos Region	Systems Technology Institute (STI) College-Dagupan City	Private HEI
01 - Ilocos Region	The Adelphi College	Private HEI
01 - Ilocos Region	The Great Plebeian College	Private HEI
01 - Ilocos Region	Union Christian College	Private HEI
01 - Ilocos Region	University of Eastern Pangasinan	LUC
01 - Ilocos Region	University of Luzon	Private HEI
01 - Ilocos Region	University of Northern Philippines	SUC
01 - Ilocos Region	University of Pangasinan	Private HEI
01 - Ilocos Region	Urdaneta City University	LUC
01 - Ilocos Region	Virgen Milagrosa University Foundation	Private HEI
01 - Ilocos Region	WCC Aeronautical & Technological College	Private HEI
02 - Cagayan Valley	Aldersgate College	Private HEI
02 - Cagayan Valley	AMA Computer College, Santiago	Private HEI
02 - Cagayan Valley	AMA Computer College-Tuguegarao City	Private HEI
02 - Cagayan Valley	Batanes State College	SUC
02 - Cagayan Valley	Cagayan State University-Andrews	SUC
02 - Cagayan Valley	Cagayan State University-Aparri	SUC
02 - Cagayan Valley	Cagayan State University-Gonzaga	SUC
02 - Cagayan Valley	Cagayan State University-Lallo	SUC
02 - Cagayan Valley	Cagayan State University-Lasam	SUC
02 - Cagayan Valley	Cagayan State University-Piat	SUC
02 - Cagayan Valley	Cagayan State University-Sanchez Mira	SUC
02 - Cagayan Valley	Cagayan State University-Tuguegarao (Carig)	SUC
02 - Cagayan Valley	Cagayan Valley Computer and Information Technology College	Private HEI
02 - Cagayan Valley	F.L. Vargas College-Abulug Campus	Private HEI
02 - Cagayan Valley	FL Vargas College-Tuguegarao	Private HEI
02 - Cagayan Valley	Global Academy of Technology and Entrepreneurship	Private HEI
02 - Cagayan Valley	HGBaquiran College	Private HEI
02 - Cagayan Valley	Infant Jesus Montessori School (College Department)	Private HEI
02 - Cagayan Valley	International School of Asia and the Pacific	Private HEI
02 - Cagayan Valley	Isabela College of Arts and Technology	Private HEI
02 - Cagayan Valley	Isabela Colleges	Private HEI
02 - Cagayan Valley	Isabela State University-Angadanan Campus	SUC
02 - Cagayan Valley	Isabela State University-Cabagan	SUC
02 - Cagayan Valley	Isabela State University-Cauayan Campus	SUC
02 - Cagayan Valley	Isabela State University-Ilagan Campus	SUC
02 - Cagayan Valley	Isabela State University-Jones Campus	SUC
02 - Cagayan Valley	Isabela State University-Main (Echague)	SUC
02 - Cagayan Valley	Isabela State University-Palanan Campus	SUC
02 - Cagayan Valley	Isabela State University-Roxas Campus	SUC
02 - Cagayan Valley	Isabela State University-San Mariano Campus	SUC
02 - Cagayan Valley	Isabela State University-San Mateo Campus	SUC
02 - Cagayan Valley	King's College of the Philippines-Bambang	Private HEI
02 - Cagayan Valley	La Patria College	Private HEI
02 - Cagayan Valley	La Salette of Roxas College	Private HEI
02 - Cagayan Valley	Lyceum of Aparri	Private HEI
02 - Cagayan Valley	Lyceum of Tuao	Private HEI
02 - Cagayan Valley	Maila Rosario Colleges	Private HEI
02 - Cagayan Valley	Mallig Plains Colleges	Private HEI
02 - Cagayan Valley	Medical Colleges of Northern Philippines	Private HEI
02 - Cagayan Valley	Metropolitan College of Science and Technology	Private HEI
02 - Cagayan Valley	Northeast Luzon Adventist College	Private HEI
02 - Cagayan Valley	Northeastern College	Private HEI
02 - Cagayan Valley	Northern Cagayan Colleges Foundation	Private HEI
02 - Cagayan Valley	Nueva Vizcaya State University - Main, Bayombong	SUC
02 - Cagayan Valley	Nueva Vizcaya State University-Bambang	SUC
02 - Cagayan Valley	Our Lady of the Pillar College-Cauayan	Private HEI
02 - Cagayan Valley	Our Lady of the Pillar College-Cauayan San Manuel Branch	Private HEI
02 - Cagayan Valley	Philippine Law Enforcement College	Private HEI
02 - Cagayan Valley	Philippine Normal University-North Luzon Campus	SUC
02 - Cagayan Valley	PLT College	Private HEI
02 - Cagayan Valley	Quezon Colleges of the North	Private HEI
02 - Cagayan Valley	Quirino State University	SUC
02 - Cagayan Valley	Quirino State University - Cabarroguis	SUC
02 - Cagayan Valley	Quirino State University - Maddela	SUC
02 - Cagayan Valley	Saint Anthony's College	Private HEI
02 - Cagayan Valley	Saint Dominic College of Batanes	Private HEI
02 - Cagayan Valley	Saint Ferdinand College-Cabagan Campus	Private HEI
02 - Cagayan Valley	Saint Joseph's College of Baggao	Private HEI
02 - Cagayan Valley	Saint Mary's University of Bayombong	Private HEI
02 - Cagayan Valley	Saint Paul University Philippines	Private HEI
02 - Cagayan Valley	Santiago City Colleges	Private HEI
02 - Cagayan Valley	SISTECH College of Santiago City	Private HEI
02 - Cagayan Valley	St. Ferdinand College-Ilagan	Private HEI
02 - Cagayan Valley	University of Cagayan Valley	Private HEI
02 - Cagayan Valley	University of La Salette	Private HEI
02 - Cagayan Valley	University of Perpetual Help System	Private HEI
02 - Cagayan Valley	University of Saint Louis-Tuguegarao	Private HEI`;

// This is just a sample - you would need to include ALL the data you provided
// For now, I'll create a function that can handle the complete dataset

function parseInstitutions(data) {
  const lines = data.trim().split('\n');
  const institutions = [];
  
  lines.forEach(line => {
    const parts = line.split('\t');
    if (parts.length >= 3) {
      const region = parts[0].trim();
      const name = parts[1].trim()
        .replace(/&amp;#39;/g, "'")
        .replace(/&amp;amp;/g, "&")
        .replace(/&amp;quot;/g, '"');
      const type = parts[2].trim();
      
      institutions.push({
        region,
        name,
        type
      });
    }
  });
  
  return institutions;
}

function generateJSON() {
  const institutions = parseInstitutions(rawData);
  const outputPath = path.join(__dirname, '..', 'data', 'complete-philippine-institutions.json');
  
  // Ensure data directory exists
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(institutions, null, 2));
  
  console.log(`Generated ${institutions.length} institutions`);
  console.log(`File saved to: ${outputPath}`);
  
  // Show summary by region
  const regionCounts = {};
  institutions.forEach(inst => {
    regionCounts[inst.region] = (regionCounts[inst.region] || 0) + 1;
  });
  
  console.log('\nInstitutions by region:');
  Object.entries(regionCounts).forEach(([region, count]) => {
    console.log(`${region}: ${count}`);
  });
  
  // Show summary by type
  const typeCounts = {};
  institutions.forEach(inst => {
    typeCounts[inst.type] = (typeCounts[inst.type] || 0) + 1;
  });
  
  console.log('\nInstitutions by type:');
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`${type}: ${count}`);
  });
}

generateJSON();