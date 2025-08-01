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
    const { Shipment_Type,Transport_Type,Month_No,Year_No } = req.body;
    if (!Shipment_Type) {
        return res.status(400).json({ message: "Location code is required" });
    }
  try {
    const result = await prisma.$queryRaw`EXEC [dbo].[GET_Locations_Adhoc_AIR_Print] ${Shipment_Type},${Transport_Type},${Month_No},${Year_No}`;
    // const result = await prisma.$queryRaw`select * from get_req_locations(${RFQType});`;

    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
}