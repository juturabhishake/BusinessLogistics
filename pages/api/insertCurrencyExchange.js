import { PrismaClient } from '@prisma/client';
import Cors from 'cors';

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
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { month_no, year_no, usd, euro, created_by } = req.body;

  if (!month_no || !year_no || !usd || !euro || !created_by) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const result = await prisma.$queryRaw`EXEC [dbo].[Insert_Currency_Exchange] ${month_no}, ${year_no}, ${usd}, ${euro}, ${created_by}`;
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error executing Insert_Currency_Exchange:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}