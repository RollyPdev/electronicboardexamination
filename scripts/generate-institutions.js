const fs = require('fs');
const path = require('path');

// Raw data from your input
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
01 - Ilocos Region	Kingfisher School of Business &amp;amp; Finance	Private HEI
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
01 - Ilocos Region	Saint Columban&amp;#39;s College	Private HEI
01 - Ilocos Region	Saint John Bosco College of Northern Luzon	Private HEI
01 - Ilocos Region	Saint Louis College-City of San Fernando	Private HEI
01 - Ilocos Region	Saint Mary&amp;#39;s College Sta. Maria, Ilocos Sur	Private HEI
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
01 - Ilocos Region	WCC Aeronautical &amp;amp; Technological College	Private HEI
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
02 - Cagayan Valley	King&amp;#39;s College of the Philippines-Bambang	Private HEI
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
02 - Cagayan Valley	Saint Anthony&amp;#39;s College	Private HEI
02 - Cagayan Valley	Saint Dominic College of Batanes	Private HEI
02 - Cagayan Valley	Saint Ferdinand College-Cabagan Campus	Private HEI
02 - Cagayan Valley	Saint Joseph&amp;#39;s College of Baggao	Private HEI
02 - Cagayan Valley	Saint Mary&amp;#39;s University of Bayombong	Private HEI
02 - Cagayan Valley	Saint Paul University Philippines	Private HEI
02 - Cagayan Valley	Santiago City Colleges	Private HEI
02 - Cagayan Valley	SISTECH College of Santiago City	Private HEI
02 - Cagayan Valley	St. Ferdinand College-Ilagan	Private HEI
02 - Cagayan Valley	University of Cagayan Valley	Private HEI
02 - Cagayan Valley	University of La Salette	Private HEI
02 - Cagayan Valley	University of Perpetual Help System	Private HEI
02 - Cagayan Valley	University of Saint Louis-Tuguegarao	Private HEI
03 - Central Luzon	Academia de San Lorenzo Dema Ala, inc.	Private HEI
03 - Central Luzon	ACLC College of Apalit, INC.	Private HEI
03 - Central Luzon	ACLC College of Malolos, Inc.	Private HEI
03 - Central Luzon	ACLC College of Meycauayan, Inc.	Private HEI
03 - Central Luzon	ACLC College of Poblacion Baliuag, Inc.	Private HEI
03 - Central Luzon	ACLC College of Sta. Maria, Inc.	Private HEI
03 - Central Luzon	AMA Computer College-Angeles City	Private HEI
03 - Central Luzon	AMA Computer College-Cabanatuan City	Private HEI
03 - Central Luzon	AMA Computer College-Tarlac City	Private HEI
03 - Central Luzon	Angeles University Foundation	Private HEI
03 - Central Luzon	Araullo University	Private HEI
03 - Central Luzon	Asia Pacific College of Advanced Studies	Private HEI
03 - Central Luzon	Aurora State College of Technology	SUC
03 - Central Luzon	Aurora State College of Technology-Bazal	SUC
03 - Central Luzon	Aurora State College of Technology-Casiguran	SUC
03 - Central Luzon	Baliuag University	Private HEI
03 - Central Luzon	Baliwag Maritime Academy	Private HEI
03 - Central Luzon	Baliwag Polytechnic College	LUC
03 - Central Luzon	Bataan Heroes College	Private HEI
03 - Central Luzon	Bataan Peninsula State University	SUC
03 - Central Luzon	Bataan Peninsula State University-Abucay	SUC
03 - Central Luzon	Bataan Peninsula State University-Balanga	SUC
03 - Central Luzon	Bataan Peninsula State University-Dinalupihan	SUC
03 - Central Luzon	Bataan Peninsula State University-Orani	SUC
03 - Central Luzon	Bestlink College of the Philippines-Bulacan	Private HEI
03 - Central Luzon	Bulacan Agricultural State College	SUC
03 - Central Luzon	Bulacan Agricultural State College-Doña Remedios Trinidad	SUC
03 - Central Luzon	Bulacan Polytechnic College	LUC
03 - Central Luzon	Bulacan State University-Bustos	SUC
03 - Central Luzon	Bulacan State University-Hagonoy	SUC
03 - Central Luzon	Bulacan State University-Main	SUC
03 - Central Luzon	Bulacan State University-Meneses	SUC
03 - Central Luzon	Bulacan State University-San Jose Del Monte	SUC
03 - Central Luzon	Camiling Colleges	Private HEI
03 - Central Luzon	Carthel Science Educational Foundation (CSEF), INC.	Private HEI
03 - Central Luzon	Central Luzon College of Science and Technology, Inc.	Private HEI
03 - Central Luzon	Central Luzon College of Science and Technology-Olongapo City	Private HEI
03 - Central Luzon	Central Luzon Doctors&amp;#39; Hospital Educational Institution	Private HEI
03 - Central Luzon	Central Luzon State University	SUC
03 - Central Luzon	Centro Colegio De Tarlac	Private HEI
03 - Central Luzon	Centro Escolar University-Malolos City	Private HEI
03 - Central Luzon	CIT Colleges of Paniqui Foundation	Private HEI
03 - Central Luzon	City College of Angeles	LUC
03 - Central Luzon	City College of San Fernando	LUC
03 - Central Luzon	Colegio De Calumpit	Private HEI
03 - Central Luzon	Colegio De San Gabriel Arcangel	Private HEI
03 - Central Luzon	Colegio de San Juan de Letran-Abucay	Private HEI
03 - Central Luzon	Colegio De San Pascual Baylon	Private HEI
03 - Central Luzon	Colegio de Sebastian-Pampanga	Private HEI
03 - Central Luzon	College for Research and Technology-Cabanatuan City	Private HEI
03 - Central Luzon	College of Mary Immaculate of Pandi, Bulacan	Private HEI
03 - Central Luzon	College of Our Lady of Mt. Carmel (Pampanga)	Private HEI
03 - Central Luzon	College of Saint Lawrence	Private HEI
03 - Central Luzon	College of Subic Montesorri-Dinalupihan	Private HEI
03 - Central Luzon	College of Subic Montessori-Subic Bay	Private HEI
03 - Central Luzon	College of the Immaculate Conception	Private HEI
03 - Central Luzon	College of the Our Lady of Mercy of Pulilan Foundation	Private HEI
03 - Central Luzon	Colleges of Advance Technology and Management of the Philippines	Private HEI
03 - Central Luzon	Columban College-Olongapo City	Private HEI
03 - Central Luzon	Columban College-Sta. Cruz, Zambales	Private HEI
03 - Central Luzon	Comteq Computer and Business College	Private HEI
03 - Central Luzon	Concepcion Holy Cross College	Private HEI
03 - Central Luzon	CORE Gateway College	Private HEI
03 - Central Luzon	Divina Pastora College	Private HEI
03 - Central Luzon	Dominican College of Tarlac	Private HEI
03 - Central Luzon	Don Honorio Ventura Technological State University-Main	SUC
03 - Central Luzon	Don Honorio Ventura Technological State University-Mexico	SUC
03 - Central Luzon	Don Honorio Ventura Technological State University-Porac	SUC
03 - Central Luzon	Don Honorio Ventura Technological State University-Sto.Thomas	SUC
03 - Central Luzon	Dr. Gloria D. Lacson Foundation Colleges - Nueva Ecija	Private HEI
03 - Central Luzon	Dr. Gloria D. Lacson Foundation Colleges-Cabanatuan City	Private HEI
03 - Central Luzon	Dr. Yanga&amp;#39;s Colleges	Private HEI
03 - Central Luzon	Eastwoods Professional College of Science and Technology	Private HEI
03 - Central Luzon	Eduardo L. Joson Memorial College	LUC
03 - Central Luzon	Emmanuel System College of Bulacan	Private HEI
03 - Central Luzon	Erhard Science College-Bulacan	Private HEI
03 - Central Luzon	Exact Colleges of Asia	Private HEI
03 - Central Luzon	Fernandez College of Arts and Technology	Private HEI
03 - Central Luzon	First City Providential College	Private HEI
03 - Central Luzon	Fundamental Baptist College For Asians	Private HEI
03 - Central Luzon	General De Jesus College	Private HEI
03 - Central Luzon	Gerona Junior College	Private HEI
03 - Central Luzon	Gordon College	LUC
03 - Central Luzon	Guagua Community College	LUC
03 - Central Luzon	Guagua National Colleges	Private HEI
03 - Central Luzon	Holy Angel University	Private HEI
03 - Central Luzon	Holy Cross College-Nueva Ecija	Private HEI
03 - Central Luzon	Holy Cross College-Pampanga	Private HEI
03 - Central Luzon	Holy Rosary Colleges Foundation	Private HEI
03 - Central Luzon	IMMACULATE CONCEPTION I-COLLEGE OF ARTS AND TECHNOLOGY, INC.	Private HEI
03 - Central Luzon	Interworld College of science and Technology Foundation-Tarlac	Private HEI
03 - Central Luzon	Interworld Colleges Foundation - Paniqui	Private HEI
03 - Central Luzon	Jesus Is Lord Colleges Foundation	Private HEI
03 - Central Luzon	Jocson College	Private HEI
03 - Central Luzon	Jose C. Feliciano College Foundation	Private HEI
03 - Central Luzon	Kolehiyo ng Subic	LUC
03 - Central Luzon	La Concepcion College	Private HEI
03 - Central Luzon	La Consolacion University Philippines	Private HEI
03 - Central Luzon	La Verdad Christian College	Private HEI
03 - Central Luzon	Limay Polytechnic College	LUC
03 - Central Luzon	Lourdes College of Bulacan	Private HEI
03 - Central Luzon	Lyceum of Subic Bay	Private HEI
03 - Central Luzon	Lyceum of the East-Aurora	Private HEI
03 - Central Luzon	Lyceum of Western Luzon - Zambales	Private HEI
03 - Central Luzon	Mabalacat City College	LUC
03 - Central Luzon	Magsaysay Memorial College	Private HEI
03 - Central Luzon	Manuel V. Gallego Foundation Colleges	Private HEI
03 - Central Luzon	Marian College of Baliuag	Private HEI
03 - Central Luzon	Maritime Academy of Asia and the Pacific	Private HEI
03 - Central Luzon	Mary the Queen College-Pampanga	Private HEI
03 - Central Luzon	Megabyte College, inc.	Private HEI
03 - Central Luzon	Meycauayan College	Private HEI
03 - Central Luzon	Micro Asia College of Science and Technology	Private HEI
03 - Central Luzon	MIDWAY COLLEGES, Inc. (Formerly: Midway Maritime Foundation)	Private HEI
03 - Central Luzon	Mondriaan Aura College	Private HEI
03 - Central Luzon	Mount Carmel College of Casiguran	Private HEI
03 - Central Luzon	Mount Carmel College-Baler	Private HEI
03 - Central Luzon	Mt. Carmel College of bocaue bulacan, inc.	Private HEI
03 - Central Luzon	Nazarenus College and Hospital Foundation	Private HEI
03 - Central Luzon	New Era University-Pampanga	Private HEI
03 - Central Luzon	Northern Zambales College	Private HEI
03 - Central Luzon	Norzagaray College	LUC
03 - Central Luzon	Nueva Ecija Doctors&amp;#39; Colleges	Private HEI
03 - Central Luzon	Nueva Ecija University of Science and Technology-Atate	SUC
03 - Central Luzon	Nueva Ecija University of Science and Technology-Carranglan	SUC
03 - Central Luzon	Nueva Ecija University of Science and Technology-Fort Magsaysay	SUC
03 - Central Luzon	Nueva Ecija University of Science and Technology-Main	SUC
03 - Central Luzon	Nueva Ecija University of Science and Technology-Peñaranda	SUC
03 - Central Luzon	Nueva Ecija University of Science and Technology-San Antonio Campus	SUC
03 - Central Luzon	Nueva Ecija University of Science and Technology-San Isidro Campus	SUC
03 - Central Luzon	Nueva Ecija University of Science and Technology-San Leonardo	SUC
03 - Central Luzon	Nueva Ecija University of Science and Technology-Sebani Estate Agricultural College	SUC
03 - Central Luzon	Nueva Ecija University of Science and Technology-Sumacab Campus	SUC
03 - Central Luzon	Nueva Ecija University of Science and Technology-Talavera	SUC
03 - Central Luzon	OLRA College Foundation	Private HEI
03 - Central Luzon	Osias Colleges	Private HEI
03 - Central Luzon	Our Lady of Fatima University-Pampanga	Private HEI
03 - Central Luzon	Our Lady of Sacred Heart College of Guimba	Private HEI
03 - Central Luzon	Pambayang Dalubhasaan ng Marilao	LUC
03 - Central Luzon	Pampanga Colleges	Private HEI
03 - Central Luzon	Pampanga State Agricultural University	SUC
03 - Central Luzon	Philippine Merchant Marine Academy	SUC
03 - Central Luzon	Philippine Rehabilitation Institute Foundation-Guagua	Private HEI
03 - Central Luzon	Philippine State College of Aeronautics-Pampanga Extension	SUC
03 - Central Luzon	Philippine Women\`s University Career Development and Continuing Education Center-Bataan	Private HEI
03 - Central Luzon	Polytechnic College of Botolan	LUC
03 - Central Luzon	Polytechnic College of the City of Meycauayan	LUC
03 - Central Luzon	Polytechnic University of the Philippines-Cabiao	SUC
03 - Central Luzon	Polytechnic University of the Philippines-Mariveles	SUC
03 - Central Luzon	Polytechnic University of the Philippines-Pulilan	SUC
03 - Central Luzon	Polytechnic University of the Philippines-Sta. Maria, Bulacan	SUC
03 - Central Luzon	President Ramon Magsaysay State University-Botolan	SUC
03 - Central Luzon	President Ramon Magsaysay State University-Candelaria	SUC
03 - Central Luzon	President Ramon Magsaysay State University-Castillejos	SUC
03 - Central Luzon	President Ramon Magsaysay State University-Main	SUC
03 - Central Luzon	President Ramon Magsaysay State University-Masinloc	SUC
03 - Central Luzon	President Ramon Magsaysay State University-San Marcelino	SUC
03 - Central Luzon	President Ramon Magsaysay State University-Sta. Cruz	SUC
03 - Central Luzon	Republic Central Colleges	Private HEI
03 - Central Luzon	Richwell Colleges	Private HEI
03 - Central Luzon	Saint Anthony College of Technology	Private HEI
03 - Central Luzon	Saint Mary&amp;#39;s Angels College of Pampanga	Private HEI
03 - Central Luzon	Saint Mary&amp;#39;s College of Meycauayan	Private HEI
03 - Central Luzon	Saint Rose College Educational Foundation	Private HEI
03 - Central Luzon	San Jose Christian Colleges	Private HEI
03 - Central Luzon	Santa Rita College of Pampanga	Private HEI
03 - Central Luzon	St. Augustine Colleges Foundation, Inc.	Private HEI
03 - Central Luzon	St. Benilde Center for Global Competence	Private HEI
03 - Central Luzon	St. Elizabeth Global Skills Institute	Private HEI
03 - Central Luzon	St. Joseph College-Olongapo	Private HEI
03 - Central Luzon	St. Mary&amp;#39;s College of Baliuag	Private HEI
03 - Central Luzon	St. Nicolas College of Business and Technology	Private HEI
03 - Central Luzon	St. Paul Colleges Foundation-Paniqui, Tarlac	Private HEI
03 - Central Luzon	St. Paul University at San Miguel	Private HEI
03 - Central Luzon	STI College Angeles	Private HEI
03 - Central Luzon	STI College Balagtas	Private HEI
03 - Central Luzon	STI College Baliuag	Private HEI
03 - Central Luzon	STI College Malolos	Private HEI
03 - Central Luzon	STI College Meycauayan	Private HEI
03 - Central Luzon	STI College San Fernando	Private HEI
03 - Central Luzon	STI College San Jose	Private HEI
03 - Central Luzon	STI College San Jose del Monte	Private HEI
03 - Central Luzon	STI College Sta. Maria	Private HEI
03 - Central Luzon	STI College Tarlac	Private HEI
03 - Central Luzon	Sto. Rosario Sapang Palay College	Private HEI
03 - Central Luzon	Subic Bay Colleges	Private HEI
03 - Central Luzon	Systems Plus College Foundation	Private HEI
03 - Central Luzon	Tarlac Agricultural University	SUC
03 - Central Luzon	Tarlac Christian Colleges	Private HEI
03 - Central Luzon	Tarlac State University	SUC
03 - Central Luzon	The Good Samaritan Colleges	Private HEI
03 - Central Luzon	The Manila Times College of Subic	Private HEI
03 - Central Luzon	Tomas Del Rosario College	Private HEI
03 - Central Luzon	United School of Science and Technology Colleges	Private HEI
03 - Central Luzon	University of Nueva Caceres - Bataan	Private HEI
03 - Central Luzon	University of the Assumption	Private HEI
03 - Central Luzon	University of the Philippines-Diliman (Pampanga)	SUC
03 - Central Luzon	Wesleyan University-Philippines (Cabanatuan)	Private HEI
03 - Central Luzon	Wesleyan University-Philippines-Aurora	Private HEI
03 - Central Luzon	World Citi Colleges, Guimba Campus	Private HEI`;

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
}

generateJSON();