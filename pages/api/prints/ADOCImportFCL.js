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

 
    const { quote_month, quote_year, sc, username, loc_code, container_size } = req.body;

    console.log('quote_month:', quote_month);
    console.log('quote_year:', quote_year);
    console.log('sc:', sc);
    console.log('username:', username);
    console.log('loc_code:', loc_code);
    console.log('container_size:', container_size);

    if (!quote_month || !quote_year || !sc || !username || !loc_code || !container_size) {
      return res.status(400).json({ message: 'Missing required fields' });
    }     
    if (req.method === "POST") {
    
      try {
        console.log('Dashboard Data:', quote_month); 
          const result = await prisma.$queryRaw`exec [dbo].[GET_ADOCImportFCL_Print] ${quote_month}, ${quote_year}, ${sc}, ${username}, ${loc_code}, ${container_size}`;
           console.log('Dashboard Data:', result);        
          return res.status(200).json(result);
      } catch (error) {
          console.error('Error fetching ADOC Import get_FCL_QUOTE:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
      } finally {
          await prisma.$disconnect();
      }
  } else {
      return res.status(405).json({ message: "Method not allowed" });
  }

}
