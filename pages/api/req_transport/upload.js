import { IncomingForm } from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import Cors from 'cors';

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "*",
});

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to parse form data.' });
    }

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      const uploadResponse = await cloudinary.uploader.upload(file.filepath, {
        folder: 'transport_documents',
        resource_type: 'auto',
        flags: "attachment", 
        access_mode: 'public',
        type: 'upload' 
      });

      res.status(200).json({ 
        message: 'File uploaded successfully', 
        filePath: uploadResponse.secure_url 
      });
    } catch (uploadError) {
      res.status(500).json({ error: 'Cloudinary upload failed', details: uploadError.message });
    }
  });
}