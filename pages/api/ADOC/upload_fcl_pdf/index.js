import { put, del } from '@vercel/blob';
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
const localUploadDir = path.join(process.cwd(), 'public', 'assets', 'files', 'exportADOCFCL');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const form = formidable({
    maxFileSize: 10 * 1024 * 1024,
    keepExtensions: true,
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

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Invalid file type. Only PDF is allowed.' });
    }

    if (isVercel) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({ error: 'Blob storage is not configured correctly on Vercel.' });
      }

      const oldFileUrl = fields.oldFilePath?.[0];
      if (oldFileUrl && oldFileUrl.startsWith('https://')) {
        try {
          await del(oldFileUrl);
        } catch (deleteError) {
          console.error('Could not delete old blob file:', deleteError.message);
        }
      }

      try {
        const fileData = fs.readFileSync(file.filepath);
        const sanitizedOriginalName = file.originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const blobPath = `fcl_exports/${Date.now()}_${sanitizedOriginalName}`;

        const blob = await put(blobPath, fileData, { access: 'public' });
        fs.unlinkSync(file.filepath);

        return res.status(200).json({ success: true, filePath: blob.url });

      } catch (uploadError) {
        console.error('Error uploading to Vercel Blob:', uploadError);
        return res.status(500).json({ error: 'Failed to upload file to Blob storage.' });
      }

    } else {
      if (!fs.existsSync(localUploadDir)) {
        fs.mkdirSync(localUploadDir, { recursive: true });
      }

      const uniqueSuffix = uuidv4();
      const sanitizedOriginalName = file.originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const newFilename = `${uniqueSuffix}_${sanitizedOriginalName}`;
      const newFilePath = path.join(localUploadDir, newFilename);
      
      fs.copyFileSync(file.filepath, newFilePath);
      fs.unlinkSync(file.filepath);

      const oldFilePathUrl = fields.oldFilePath?.[0];
      if (oldFilePathUrl && oldFilePathUrl.startsWith('/')) {
        try {
          const oldFilename = path.basename(oldFilePathUrl);
          const oldFileServerPath = path.join(localUploadDir, oldFilename);
          if (fs.existsSync(oldFileServerPath)) {
            fs.unlinkSync(oldFileServerPath);
          }
        } catch (deleteError) {
          console.error('Could not delete old local file:', deleteError.message);
        }
      }

      const publicPath = `/assets/files/exportADOCFCL/${newFilename}`;
      return res.status(200).json({ success: true, filePath: publicPath });
    }
  });
}