const fs = require('fs');

const html = fs.readFileSync('form_debug.html', 'utf8');

// Find all occurrences of "entry.\d+" or data fields
const entryRegex = /entry\.(\d+)/g;
let match;
const entries = new Set();
while ((match = entryRegex.exec(html)) !== null) {
    entries.add(match[0]);
}

console.log("Found Entry IDs:");
console.log(Array.from(entries));

// For context, find the questions associated with them in the HTML:
// We can just dump 100 characters around each "entry" to see what question it maps to.
entries.forEach(e => {
     let index = html.indexOf(e);
     console.log(`\nContext for ${e}:`);
     console.log(html.substring(Math.max(0, index - 50), Math.min(html.length, index + 50)));
});
