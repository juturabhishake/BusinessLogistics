import { PrismaClient } from '@prisma/client';
import Cors from 'cors';

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: '*',
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
  await runMiddleware(req, res, cors);

  if (req.method === 'POST') {
    const { email, username, phone, company, address } = req.body;

    if (!email || !username || !phone || !company || !address) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
      const result = await prisma.$queryRaw`
        EXEC [dbo].[SP_Update_User_Profile]
          @email = ${email},
          @username = ${username},
          @phone = ${phone},
          @company = ${company},
          @address = ${address};
      `;

      return res.status(200).json({
        message: 'Profile updated successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}