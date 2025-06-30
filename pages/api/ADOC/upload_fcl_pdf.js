/* eslint-disable @typescript-eslint/no-unused-vars */
import { formidable } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'assets', 'files', 'exportADOCFCL');

fs.mkdirSync(uploadDir, { recursive: true });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const form = formidable({
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
    filename: (name, ext, part, form) => {
        const uniqueSuffix = uuidv4();
        const originalName = part.originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
        return `${uniqueSuffix}_${originalName}`;
    }
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Error uploading file.', details: err.message });
    }
    
    const file = files.file?.[0];

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    console.log(file);
    if (file.mimetype !== 'application/pdf') {
        fs.unlink(file.filepath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting invalid file:", unlinkErr);
        });
        return res.status(400).json({ error: 'Invalid file type. Only PDF is allowed.' });
    }

    const oldFilePath = fields.oldFilePath?.[0];
    if (oldFilePath) {
      const fullOldPath = path.join(process.cwd(), 'public', oldFilePath);
      
      if (fs.existsSync(fullOldPath)) {
        fs.unlink(fullOldPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(`Failed to delete old file: ${fullOldPath}`, unlinkErr);
          } else {
            console.log(`Successfully deleted old file: ${fullOldPath}`);
          }
        });
      }
    }
    
    const serverRelativePath = path.join('/assets/files/exportADOCFCL', file.newFilename).replace(/\\/g, '/');
    console.log(serverRelativePath);

    res.status(200).json({ success: true, filePath: serverRelativePath });
  });
}