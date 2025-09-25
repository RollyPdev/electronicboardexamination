const heiData = [
  { region: "01 - Ilocos Region", heiName: "ABE International College of Business and Accountancy-Urdaneta City", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "AMA Computer College-Dagupan City", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "AMA Computer College-Laoag City", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Asbury College", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Asiacareer College Foundation", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Binalatongan Community College", heiType: "LUC" },
  { region: "01 - Ilocos Region", heiName: "CICOSAT Colleges", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Colegio de Dagupan", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Colegio De San Juan De Letran-Manaoag", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Colegio San Jose De Alaminos", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Dagupan Colleges Foundation", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Data Center College of the Philippines of Laoag City", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Divine Word College of Laoag", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Divine Word College of Vigan", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Don Mariano Marcos Memorial State University-Mid La Union", heiType: "SUC" },
  { region: "01 - Ilocos Region", heiName: "Don Mariano Marcos Memorial State University-North La Union-Main Campus", heiType: "SUC" },
  { region: "01 - Ilocos Region", heiName: "Don Mariano Marcos Memorial State University-Open University", heiType: "SUC" },
  { region: "01 - Ilocos Region", heiName: "Don Mariano Marcos Memorial State University-South La Union", heiType: "SUC" },
  { region: "01 - Ilocos Region", heiName: "Golden West Colleges", heiType: "Private HEI" },
  { region: "01 - Ilocos Region", heiName: "Ilocos Sur Community College", heiType: "LUC" }
];

async function testHEIImport() {
  try {
    const response = await fetch('http://localhost:3000/api/institutions/hei-import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: heiData })
    });

    const result = await response.json();
    console.log('Import Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing HEI import:', error);
  }
}

testHEIImport();