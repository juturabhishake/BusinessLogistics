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
    const { Shipment_Type, Transport_Type } = req.body;
    
    if (!Shipment_Type || Transport_Type !== 'import') {
        return res.status(400).json({ message: "Shipment type is required and Transport type must be 'import'" });
    }
    
    try {
      const result = await prisma.$queryRaw`EXEC [dbo].[GET_Locations_Adhoc_AIR_Multi] ${Shipment_Type}, ${Transport_Type}`;
      
      return res.status(200).json({ result });
    } catch (error) {
      console.error('Error fetching multi-select locations:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}