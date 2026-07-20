import ExcelJS from 'exceljs';

export type ExcelRow = Record<string, string>;

export async function readFirstWorksheetRows(buffer: Buffer): Promise<ExcelRow[]> {
  const workbook = new ExcelJS.Workbook();

  try {
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;
    await workbook.xlsx.load(arrayBuffer);
  } catch {
    throw new Error(
      'No se pudo leer el archivo. Asegúrese de subir un archivo Excel (.xlsx o .xls).',
    );
  }

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error('El archivo Excel no contiene hojas de datos');
  }

  const headerRow = worksheet.getRow(1);
  const rows: ExcelRow[] = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    if (row.actualCellCount === 0) {
      continue;
    }

    const record: ExcelRow = {};
    let hasData = false;

    for (let columnNumber = 1; columnNumber <= headerRow.cellCount; columnNumber++) {
      const header = headerRow.getCell(columnNumber).text.trim();
      const value = row.getCell(columnNumber).text.trim();

      if (!header || !value) {
        continue;
      }

      record[header] = value;
      hasData = true;
    }

    if (hasData) {
      rows.push(record);
    }
  }

  return rows;
}
