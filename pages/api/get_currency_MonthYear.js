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
  if (req.method === "POST") {
     
    const { Month,Year } = req.body;
    console.log('Curr Month:', Month);  
    if (!Month) {
        return res.status(400).json({ message: "Location code is required" }); 
    }
  try {
    const result = await prisma.$queryRaw`EXEC [dbo].[Get_Currency_MonthYear] ${Month},${Year}`;
    console.log('currecy Data:', result);
    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error fetching currency:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
}