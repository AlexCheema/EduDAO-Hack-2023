import { promises as fs } from 'fs';

export function FileCursor(fileName = 'cursor.json', defaultValue = 0) {
  return {
    save: async function(cursor) {
      await fs.writeFile(fileName, JSON.stringify({ cursor }))
    },
    get: async function() {
      try {
        const data = await fs.readFile(fileName);
        if (!data) return defaultValue;
        return JSON.parse(data).cursor ?? defaultValue;
      } catch (err) {
        return defaultValue;
      }
    },
  }
}


