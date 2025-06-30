// File Path: pages/api/ADOC/upload_fcl_pdf.js

import { formidable } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};
const isVercel = process.env.VERCEL === '1';

const uploadDir = isVercel
  ? path.join('/tmp')
  : path.join(process.cwd(), 'public', 'assets', 'files', 'exportADOCFCL');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
    filename: (name, ext, part) => {
      const uniqueSuffix = uuidv4();
      const sanitizedOriginalName = part.originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
      return `${uniqueSuffix}_${sanitizedOriginalName}`;
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err);
      return res.status(500).json({ error: 'Failed to parse form data.', details: err.message });
    }

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file was uploaded.' });
    }

    const oldFilePathUrl = fields.oldFilePath?.[0];
    if (oldFilePathUrl) {
      try {
        const oldFilename = path.basename(oldFilePathUrl);
        const oldFileServerPath = path.join(uploadDir, oldFilename);
        if (fs.existsSync(oldFileServerPath)) {
          fs.unlinkSync(oldFileServerPath);
          console.log('Successfully deleted old file:', oldFileServerPath);
        }
      } catch (deleteError) {
        console.error('Failed to delete old file:', deleteError.message);
      }
    }

    if (file.mimetype !== 'application/pdf') {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'Invalid file type. Only PDF is allowed.' });
    }
    const publicPath = `/assets/files/exportADOCFCL/${file.newFilename}`;

    console.log('File uploaded. Storing this path in DB:', publicPath);
    res.status(200).json({ success: true, filePath: publicPath });
  });
}