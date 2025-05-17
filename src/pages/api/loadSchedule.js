import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { date } = req.query;
  const filePath = path.join(process.cwd(), 'data', 'schedule.json');

  if (!fs.existsSync(filePath)) {
    return res.status(200).json({});
  }

  const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.status(200).json(json[date] || { columns: [], schedule: {}, colors: {} });
}
