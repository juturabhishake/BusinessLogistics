import { PrismaClient } from '@prisma/client';
import Cors from 'cors';

const prisma = new PrismaClient();
const cors = Cors({ methods: ['POST'], origin: '*', allowedHeaders: ['Content-Type'] });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { quote_month, quote_year, loc_code, container_sizes } = req.body;
  console.log("Received data:", quote_month, quote_year, loc_code, container_sizes);

  if (!quote_month || !quote_year || !loc_code || !container_sizes || !Array.isArray(container_sizes) || container_sizes.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  try {
    const containerSizesString = container_sizes.join(',');
    const result = await prisma.$queryRaw`exec [dbo].[GET_ADOCImportFCL_Print_multi] ${quote_month}, ${quote_year}, ${loc_code}, ${containerSizesString}`;
    console.log('API Result:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in API:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}