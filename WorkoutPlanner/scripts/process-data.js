const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const inputFile = path.join(__dirname, '..', 'src', 'data', 'exercise.csv');
const outputFile = path.join(__dirname, '..', 'src', 'data', 'exercises.json'); 

console.log('Starting data processing for new exercise.csv file...');
const results = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (data) => {
    // --- This section now uses your exact column headers ---
    const exerciseName = data['Title'];
    const bodyPart = data['BodyPart'];
    const equipment = data['Equipment'];
    const level = data['Level'];
    const description = data['Desc'];

    if (exerciseName) {
      results.push({
        name: exerciseName.trim(),
        bodyPart: bodyPart ? bodyPart.trim() : 'Unknown',
        equipment: equipment ? equipment.trim() : 'Unknown',
        level: level ? level.trim() : 'Any',
        description: description ? description.trim() : '',
      });
    }
  })
  .on('end', () => {
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`✅ Success! Processed ${results.length} exercises. New exercises.json file created.`);
  });