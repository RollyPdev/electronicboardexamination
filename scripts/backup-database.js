const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.sql`;
    const backupPath = path.join(__dirname, '..', backupFileName);
    
    console.log('Starting database backup...');
    
    let sqlContent = `-- Database Backup Created: ${new Date().toISOString()}\n\n`;
    
    // Backup Students Table
    console.log('Backing up Students...');
    const students = await prisma.student.findMany();
    
    if (students.length > 0) {
      sqlContent += `-- Students Table\n`;
      for (const student of students) {
        const values = [
          `'${student.id}'`,
          `'${student.studentId}'`,
          `'${student.firstName}'`,
          `'${student.lastName}'`,
          student.middleName ? `'${student.middleName}'` : 'NULL',
          `'${student.gender}'`,
          `'${student.birthDate.toISOString()}'`,
          student.age,
          `'${student.birthPlace}'`,
          `'${student.contactNumber}'`,
          `'${student.email}'`,
          `'${student.address}'`,
          `'${student.region}'`,
          `'${student.province}'`,
          `'${student.cityMunicipality}'`,
          `'${student.barangay}'`,
          `'${student.zipCode}'`,
          `'${student.guardianFirstName}'`,
          `'${student.guardianLastName}'`,
          student.guardianMiddleName ? `'${student.guardianMiddleName}'` : 'NULL',
          `'${student.guardianContactNumber}'`,
          `'${student.guardianAddress}'`,
          `'${student.guardianRelationship}'`,
          `'${student.school}'`,
          `'${student.course}'`,
          `'${student.graduationYear}'`,
          `'${student.howDidYouKnow}'`,
          student.referredBy ? `'${student.referredBy}'` : 'NULL',
          student.notes ? `'${student.notes}'` : 'NULL',
          student.profileImage ? `'${student.profileImage}'` : 'NULL',
          `'${student.status}'`,
          `'${student.createdAt.toISOString()}'`,
          `'${student.updatedAt.toISOString()}'`
        ].join(', ');
        
        sqlContent += `INSERT INTO "Student" VALUES (${values});\n`;
      }
      sqlContent += '\n';
    }
    
    // Backup Users Table
    console.log('Backing up Users...');
    const users = await prisma.user.findMany();
    
    if (users.length > 0) {
      sqlContent += `-- Users Table\n`;
      for (const user of users) {
        const values = [
          `'${user.id}'`,
          user.name ? `'${user.name.replace(/'/g, "''")}'` : 'NULL',
          `'${user.email}'`,
          user.emailVerified ? `'${user.emailVerified.toISOString()}'` : 'NULL',
          user.image ? `'${user.image}'` : 'NULL',
          `'${user.role}'`,
          user.school ? `'${user.school.replace(/'/g, "''")}'` : 'NULL',
          `'${user.createdAt.toISOString()}'`,
          `'${user.updatedAt.toISOString()}'`
        ].join(', ');
        
        sqlContent += `INSERT INTO "users" VALUES (${values});\n`;
      }
      sqlContent += '\n';
    }
    
    // Backup Exams Table
    console.log('Backing up Exams...');
    const exams = await prisma.exam.findMany();
    
    if (exams.length > 0) {
      sqlContent += `-- Exams Table\n`;
      for (const exam of exams) {
        const values = [
          `'${exam.id}'`,
          `'${exam.title.replace(/'/g, "''")}'`,
          exam.description ? `'${exam.description.replace(/'/g, "''")}'` : 'NULL',
          exam.durationMin,
          exam.randomize,
          exam.published,
          `'${exam.createdAt.toISOString()}'`,
          `'${exam.updatedAt.toISOString()}'`,
          `'${exam.creatorId}'`
        ].join(', ');
        
        sqlContent += `INSERT INTO "exams" VALUES (${values});\n`;
      }
      sqlContent += '\n';
    }
    
    // Backup Questions Table
    console.log('Backing up Questions...');
    const questions = await prisma.question.findMany();
    
    if (questions.length > 0) {
      sqlContent += `-- Questions Table\n`;
      for (const question of questions) {
        const values = [
          `'${question.id}'`,
          `'${question.examId}'`,
          `'${question.type}'`,
          `'${question.text.replace(/'/g, "''")}'`,
          question.options ? `'${JSON.stringify(question.options).replace(/'/g, "''")}'` : 'NULL',
          question.points,
          question.order,
          `'${question.createdAt.toISOString()}'`,
          `'${question.updatedAt.toISOString()}'`
        ].join(', ');
        
        sqlContent += `INSERT INTO "questions" VALUES (${values});\n`;
      }
      sqlContent += '\n';
    }
    
    // Backup ExamResults Table
    console.log('Backing up Exam Results...');
    const examResults = await prisma.examResult.findMany();
    
    if (examResults.length > 0) {
      sqlContent += `-- Exam Results Table\n`;
      for (const result of examResults) {
        const values = [
          `'${result.id}'`,
          `'${result.examId}'`,
          `'${result.userId}'`,
          `'${result.startedAt.toISOString()}'`,
          result.submittedAt ? `'${result.submittedAt.toISOString()}'` : 'NULL',
          result.gradedAt ? `'${result.gradedAt.toISOString()}'` : 'NULL',
          result.score || 'NULL',
          result.maxScore || 'NULL',
          `'${result.status}'`,
          result.answers ? `'${JSON.stringify(result.answers).replace(/'/g, "''")}'` : 'NULL',
          result.events ? `'${JSON.stringify(result.events).replace(/'/g, "''")}'` : 'NULL',
          result.recordingKeys ? `'${JSON.stringify(result.recordingKeys).replace(/'/g, "''")}'` : 'NULL',
          `'${result.createdAt.toISOString()}'`,
          `'${result.updatedAt.toISOString()}'`
        ].join(', ');
        
        sqlContent += `INSERT INTO "exam_results" VALUES (${values});\n`;
      }
      sqlContent += '\n';
    }
    
    // Backup Settings Table
    console.log('Backing up Settings...');
    const settings = await prisma.settings.findMany();
    
    if (settings.length > 0) {
      sqlContent += `-- Settings Table\n`;
      for (const setting of settings) {
        const values = [
          `'${setting.id}'`,
          `'${setting.siteName.replace(/'/g, "''")}'`,
          `'${setting.siteDescription.replace(/'/g, "''")}'`,
          setting.allowRegistration,
          setting.requireEmailVerification,
          setting.enableProctoring,
          setting.maxExamDuration,
          setting.autoGrading,
          setting.showResultsImmediately,
          `'${setting.createdAt.toISOString()}'`,
          `'${setting.updatedAt.toISOString()}'`
        ].join(', ');
        
        sqlContent += `INSERT INTO "settings" VALUES (${values});\n`;
      }
      sqlContent += '\n';
    }
    
    // Write backup file
    fs.writeFileSync(backupPath, sqlContent);
    
    console.log(`✅ Database backup completed successfully!`);
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log(`📊 Backup statistics:`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Exams: ${exams.length}`);
    console.log(`   - Questions: ${questions.length}`);
    console.log(`   - Exam Results: ${examResults.length}`);
    console.log(`   - Settings: ${settings.length}`);
    
    return backupPath;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run backup if called directly
if (require.main === module) {
  backupDatabase()
    .then(() => {
      console.log('Backup process completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Backup process failed:', error);
      process.exit(1);
    });
}

module.exports = { backupDatabase };