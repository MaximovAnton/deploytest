import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'schedule.json');

  if (!fs.existsSync(filePath)) {
    return res.status(200).json([]);
  }

  const allData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const dates = Object.keys(allData).sort();

  res.status(200).json(dates);
}
