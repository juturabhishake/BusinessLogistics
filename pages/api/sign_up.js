import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import { encodePasswordToBase64 } from '@/lib/encryption';

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['POST'],
  origin: '*',
  allowedHeaders: ['Content-Type'],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await runMiddleware(req, res, cors);

  const { username, email, password, phone, company, address, is_active } = req.body;

  if (!username || !email || !password || !phone || !company || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const encryptedPassword = encodePasswordToBase64(password);

    const result = await prisma.$queryRaw`
      DECLARE @message NVARCHAR(100);
      EXEC register ${username}, ${email}, ${encryptedPassword}, ${phone}, ${company}, ${address}, ${is_active}, @message OUTPUT;
      SELECT @message as message;
    `;

    return res.status(200).json({ message: result[0]?.message || 'Something went wrong' });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
