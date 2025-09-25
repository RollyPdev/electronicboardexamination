const fs = require('fs')
const path = require('path')

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true })
    console.log(`Deleted: ${folderPath}`)
  }
}

// Clear Next.js cache
deleteFolderRecursive(path.join(__dirname, '.next'))

console.log('Cache cleared successfully!')