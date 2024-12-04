import XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { parseItem } from './item-parser';

export const itemXLSXDownload = (data: string) => {
  console.log(data);
  const parsedData = parseItem(data);
  console.log(parsedData);
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
          row['Activity, strategy or competence'] ===
            'Reading Comprehension'
    );

    result = extractLevelDescriptorContext([].concat(...filtered));
  } catch (error) {
    console.error('Error reading the Excel file:', error);
  }
  return result;
};

const extractLevelDescriptorContext = (data: any[]) => {
  const result: { [level: string]: { [descriptor: string]: string[] } } = {};

  data.forEach((row) => {
    const level = row['Level'];
    const descriptor = row['PELEx Descriptor'];
    const context = row['Context'];

    // Ensure the level exists in the result
    if (!result[level]) {
      result[level] = {};
    }

    // Ensure the descriptor exists under the level
    if (!result[level][descriptor]) {
      result[level][descriptor] = [];
    }

    // Add the context if it's not already present
    if (context && !result[level][descriptor].includes(context)) {
      result[level][descriptor].push(context);
    }
  });

  return result;
};
