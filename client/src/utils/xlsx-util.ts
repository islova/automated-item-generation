import XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { parseItem } from './item-parser';

export const itemXLSXDownload = (data: string) => {
    const parsedData = parseItem(data);
    const wb = XLSX.utils.book_new();
    const ws = XLSX. utils.aoa_to_sheet(parsedData);
    // Add the worksheet to the workbook
    XLSX. utils.book_append_sheet(wb, ws, 'Sheet1');
    // Generate the XLSX file
    const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    // Save the file using FileSaver.js
    saveAs (new Blob([blob]), 'example.xlsx');
}
