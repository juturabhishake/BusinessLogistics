/* eslint-disable @typescript-eslint/no-unused-vars */
import { promises as fs } from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import Cors from 'cors';

export const config = {
  api: {
    bodyParser: false,
  },
};

const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "*",
});

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const uploadDir = path.join(process.cwd(), '/public/assets/files');

  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 1.5 * 1024 * 1024, // 1.5MB
  });
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      if (err.code === 1009) {
        return res.status(413).json({ error: 'File size exceeds the 1.5MB limit.' });
      }
      return res.status(500).json({ error: 'Failed to parse form data.' });
    }

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    const requestDate = Array.isArray(fields.requestDate) ? fields.requestDate[0] : fields.requestDate;
    const transportType = Array.isArray(fields.transportType) ? fields.transportType[0] : fields.transportType;
    const shipmentType = Array.isArray(fields.shipmentType) ? fields.shipmentType[0] : fields.shipmentType;
    const containerSize = Array.isArray(fields.containerSize) ? fields.containerSize[0] : fields.containerSize;
    const fromLocation = Array.isArray(fields.fromLocation) ? fields.fromLocation[0] : fields.fromLocation;
    const toLocation = Array.isArray(fields.toLocation) ? fields.toLocation[0] : fields.toLocation;

    const sanitize = (name) => name.replace(/[^a-zA-Z0-9.,-]/g, '_');
    const newFileName = `${sanitize(requestDate)}_${sanitize(transportType)}_${sanitize(shipmentType)}_${sanitize(containerSize)}_from_${sanitize(fromLocation)}_to_${sanitize(toLocation)}.pdf`;
    const newFilePath = path.join(uploadDir, newFileName);

    try {
      await fs.rename(file.filepath, newFilePath);
      const relativePath = `/assets/files/${newFileName}`;
      res.status(200).json({ message: 'File uploaded successfully', filePath: relativePath });
    } catch (renameError) {
      try {
        await fs.unlink(file.filepath);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
      res.status(500).json({ error: 'Failed to save the uploaded file.' });
    }
  });
}