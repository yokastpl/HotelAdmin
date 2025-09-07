const fs = require('fs');
const path = require('path');

const replacements = [
  { from: 'bg-primary text-white', to: 'bg-blue-600 text-white' },
  { from: 'bg-success text-white', to: 'bg-green-500 text-white' },
  { from: 'bg-warning text-white', to: 'bg-yellow-500 text-white' },
  { from: 'bg-warning text-dark', to: 'bg-yellow-500 text-black' },
  { from: 'bg-info text-white', to: 'bg-blue-500 text-white' },
  { from: 'bg-danger text-white', to: 'bg-red-500 text-white' },
  { from: 'bg-secondary text-white', to: 'bg-gray-500 text-white' },
  { from: 'bg-destructive text-white', to: 'bg-red-500 text-white' }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from, 'g'), to);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx')) {
      fixFile(filePath);
    }
  });
}

walkDir('./client/src/pages');
console.log('Bootstrap class fixes completed!');
