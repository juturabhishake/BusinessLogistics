import { PrismaClient } from '@prisma/client';
import Cors from 'cors';

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['GET', 'POST'], // Allow GET requests
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
  await runMiddleware(req, res, cors);

  try {
    const result = await prisma.$queryRaw`select * from [dbo].[get_locations_and_codes]()`;
    console.log('Location codes:', result);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'No location codes found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching location codes:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}