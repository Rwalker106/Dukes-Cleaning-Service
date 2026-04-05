const fs = require('fs');

const html = fs.readFileSync('form_debug.html', 'utf8');

const actionMatch = html.match(/<form action="([^"]+)"/);
const actionUrl = actionMatch ? actionMatch[1] : null;

console.log("Action URL: ", actionUrl);

// Find the FB_PUBLIC_LOAD_DATA_
const dataMatch = html.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);\n/);
if (dataMatch) {
    try {
        const data = JSON.parse(dataMatch[1]);
        const formObj = data[1][1];
        console.log("Form Title: ", data[1][8]);
        
        formObj.forEach(item => {
            if (item[3] === 0 || item[3] === 1) { // 0: text, 1: paragraph
                const title = item[1];
                const inputId = item[4][0][0]; // This is the numeric part of entry.XYZ
                console.log(`Field: "${title}" -> name="entry.${inputId}"`);
            }
        });
    } catch(e) {
        console.error("Error parsing data: ", e);
    }
} else {
    console.log("No FB_PUBLIC_LOAD_DATA_ found.");
}
