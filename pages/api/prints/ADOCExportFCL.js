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

 
    const { quote_month, quote_year, sc, username, loc_code } = req.body;

    if (!quote_month || !quote_year || !sc) {
      return res.status(400).json({ message: 'Missing required fields' });
    }     
    if (req.method === "POST") {
    
      try {
        console.log('Dashboard Data:', quote_month); 
          const result = await prisma.$queryRaw`exec [dbo].[GET_ADOCExportFCL_Print_1] ${quote_month}, ${quote_year}, ${sc}, ${username}, ${loc_code}`;
           console.log('Dashboard ADOC Export FCL Data:', result);        
          return res.status(200).json(result);
      } catch (error) {
          console.error('Error fetching get_FCL_QUOTE:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
      } finally {
          await prisma.$disconnect();
      }
  } else {
      return res.status(405).json({ message: "Method not allowed" });
  }

}
