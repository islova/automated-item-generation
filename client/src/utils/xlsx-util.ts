import XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { parseItem } from './item-parser';

export const itemXLSXDownload = (data: string) => {
  const parsedData = parseItem(data);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(parsedData);
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Apply text wrapping to all cells
  Object.keys(ws).forEach((cell) => {
    if (cell[0] !== '!' && ws[cell].v) {
      // Skip metadata keys (e.g., !ref, !cols, !rows)
      ws[cell].s = { alignment: { wrapText: true } };
    }
  });

  ws['!rows'] = [
    { hpx: 40 }, // Set height for the first row (40 points)
    ...parsedData.slice(1).map(() => ({ hpx: 70 })), // Set height for the remaining rows (20 points)
  ];

  ws['!cols'] = [
    { wpx: 500 }, // Set height for the first row (40 points)
    ...parsedData.slice(1).map(() => ({ wpx: 200 })), // Set height for the remaining rows (20 points)
  ];

  // Generate the XLSX file
  const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  // Save the file using FileSaver.js
  saveAs(new Blob([blob]), 'example.xlsx');
};

export const descriptorXLSXReader = async (filename: string) => {
  let result = {};
  try {
    // Fetch the Excel file from the public folder
    const response = await fetch(filename); // Public folder path
    const arrayBuffer = await response.arrayBuffer(); // Read the file as an ArrayBuffer
    const workbook = XLSX.read(arrayBuffer, { type: 'array' }); // Parse the file using XLSX
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet); // Convert to JSON
    const mergedData = [].concat(...data); // Merge arrays into a single array

    const filtered = mergedData.filter(
      (row: any) =>
        row['CEFR Descriptor Scheme (updated)'] ===
          'Communicative language activities' &&
        row['Mode of communication'] === 'Reception' &&
        (row['Activity, strategy or competence'] === 'Oral comprehension' ||
          row['Activity, strategy or competence'] ===
            'Reading comprehension') &&
        row['Level'] !== 'C2',
    );

    result = extractUniqueColumnValues([].concat(...filtered));
  } catch (error) {
    console.error('Error reading the Excel file:', error);
  }
  return result;
};

const extractUniqueColumnValues = (data: any[]) => {
  const uniqueLevels = new Set();
  const descriptorByLevel: { [key: string]: Set<string> } = {};

  data.forEach((row) => {
    const level = row.Level;
    const descriptor = row.Descriptor;

    // Add unique "Level" values to the Set
    if (level) uniqueLevels.add(level);

    // Add unique "Descriptor" values to the corresponding "Level"
    if (level && descriptor) {
      if (!descriptorByLevel[level]) {
        descriptorByLevel[level] = new Set(); // Initialize a Set for each level
      }
      descriptorByLevel[level].add(descriptor); // Add the descriptor to the Set
    }
  });

  // Convert Sets to arrays
  const descriptorObject = {};
  Object.keys(descriptorByLevel).forEach((level) => {
    descriptorObject[level] = Array.from(descriptorByLevel[level]); // Convert Set to array for each level
  });

  return {
    Level: Array.from(uniqueLevels), // Convert Set to array for "Level"
    Descriptor: descriptorObject,
  };
};
