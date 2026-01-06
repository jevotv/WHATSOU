const fs = require('fs');

function chunkSqlFile(inputFile, outputFile, chunkSize = 300) {
    const content = fs.readFileSync(inputFile, 'utf-8');

    // Extract the INSERT INTO districts statement
    const startMarker = "INSERT INTO districts (city_id, name_ar, name_en) VALUES";
    const startIndex = content.indexOf(startMarker);

    if (startIndex === -1) {
        console.log("Could not find INSERT statement for districts");
        return;
    }

    // Find the end of the statement (last semicolon)
    let valuesPart = content.substring(startIndex + startMarker.length).trim();
    if (valuesPart.endsWith(';')) {
        valuesPart = valuesPart.slice(0, -1);
    }

    // Normalize input
    valuesPart = valuesPart.trim();
    if (!valuesPart.startsWith('(')) {
        console.log("Unexpected format after VALUES");
        return;
    }

    // Split using regex for SQL values (id, 'str', 'str')
    // Matches: (123, 'Details', 'Details')
    const pattern = /\(\d+,\s*'.*?',\s*'.*?'\)/g;
    const matches = valuesPart.match(pattern);

    if (!matches) {
        console.log("No value groups found");
        return;
    }

    console.log(`Found ${matches.length} district entries.`);

    let output = "-- Re-seeding districts\n";
    output += "DELETE FROM districts;\n";
    output += "ALTER SEQUENCE districts_id_seq RESTART WITH 1;\n\n";

    let currentChunk = [];
    for (let i = 0; i < matches.length; i++) {
        currentChunk.push(matches[i]);

        if (currentChunk.length >= chunkSize) {
            output += `INSERT INTO districts (city_id, name_ar, name_en) VALUES\n${currentChunk.join(',\n')};\n\n`;
            currentChunk = [];
        }
    }

    if (currentChunk.length > 0) {
        output += `INSERT INTO districts (city_id, name_ar, name_en) VALUES\n${currentChunk.join(',\n')};\n\n`;
    }

    fs.writeFileSync(outputFile, output, 'utf-8');
    console.log(`Successfully wrote chunks to ${outputFile}`);
}

chunkSqlFile('d:\\whatsou\\egypt_locations.sql', 'd:\\whatsou\\reseed_districts.sql');
