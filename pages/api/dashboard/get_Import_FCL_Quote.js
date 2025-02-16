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

  try {
    const { quote_month, quote_year, sc } = req.body;

    if (!quote_month || !quote_year || !sc) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let query;
    if (sc === "admin") {
      query = prisma.$queryRaw`
        SELECT * FROM Import_FCL_Quote
        WHERE Quote_Month = ${quote_month} 
        AND Quote_Year = ${quote_year}`;
    } else {
      query = prisma.$queryRaw`
        SELECT * FROM Import_FCL_Quote
        WHERE Quote_Month = ${quote_month} 
        AND Quote_Year = ${quote_year} 
        AND Supplier_Code = ${sc}`;
    }

    const result = await query;
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching LCL quotes:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
