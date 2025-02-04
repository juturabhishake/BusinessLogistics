import { PrismaClient } from '@prisma/client';
import Cors from 'cors';

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: '*',
});

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'POST') {
    const {
      supplierCode,
      locationCode,
      quoteMonth,
      quoteYear,
      originData,
      seaFreightData,
      destinationData,
      totalShipmentCost,
      createdBy,
    } = req.body;

    if (!originData || !seaFreightData || !destinationData) {
      return res.status(400).json({ error: 'Invalid data structure' });
    }

    const quoteData = [
      {
        Supplier_Code: supplierCode,
        Location_Code: locationCode,
        Quote_Month: quoteMonth,
        Quote_Year: quoteYear,
        Cont_Feet: '20 ft',
        O_CCD: originData[0]?.[20] || 0,
        O_LTG: originData[1]?.[20] || 0,
        O_THC: originData[2]?.[20] || 0,
        O_BLC: originData[3]?.[20] || 0,
        O_LUS: originData[4]?.[20] || 0,
        O_Halt: originData[5]?.[20] || 0,
        O_Total_Chg: originData[6]?.[20] || 0,
        S_SeaFre: seaFreightData[0]?.[20] || 0,
        S_ENS: seaFreightData[1]?.[20] || 0,
        S_ISPS: seaFreightData[2]?.[20] || 0,
        S_ITT: seaFreightData[3]?.[20] || 0,
        S_Total_Chg: seaFreightData[4]?.[20] || 0,
        D_DTH: destinationData[0]?.[20] || 0,
        D_BLF: destinationData[1]?.[20] || 0,
        D_DBR: destinationData[2]?.[20] || 0,
        D_DOF: destinationData[3]?.[20] || 0,
        D_HC: destinationData[4]?.[20] || 0,
        D_TDO: destinationData[5]?.[20] || 0,
        D_LOC: destinationData[6]?.[20] || 0,
        D_Total_Chg: destinationData[7]?.[20] || 0,
        Total_Ship_Cost: totalShipmentCost[20] || 0,
        Is_Locked: null,
        Created_Date: new Date(),
        Created_By: createdBy,
        Updated_Date: new Date(),
        Updated_By: createdBy,
      },
      {
        Supplier_Code: supplierCode,
        Location_Code: locationCode,
        Quote_Month: quoteMonth,
        Quote_Year: quoteYear,
        Cont_Feet: '40 ft',
        O_CCD: originData[0]?.[40] || 0,
        O_LTG: originData[1]?.[40] || 0,
        O_THC: originData[2]?.[40] || 0,
        O_BLC: originData[3]?.[40] || 0,
        O_LUS: originData[4]?.[40] || 0,
        O_Halt: originData[5]?.[40] || 0,
        O_Total_Chg: originData[6]?.[40] || 0,
        S_SeaFre: seaFreightData[0]?.[40] || 0,
        S_ENS: seaFreightData[1]?.[40] || 0,
        S_ISPS: seaFreightData[2]?.[40] || 0,
        S_ITT: seaFreightData[3]?.[40] || 0,
        S_Total_Chg: seaFreightData[4]?.[40] || 0,
        D_DTH: destinationData[0]?.[40] || 0,
        D_BLF: destinationData[1]?.[40] || 0,
        D_DBR: destinationData[2]?.[40] || 0,
        D_DOF: destinationData[3]?.[40] || 0,
        D_HC: destinationData[4]?.[40] || 0,
        D_TDO: destinationData[5]?.[40] || 0,
        D_LOC: destinationData[6]?.[40] || 0,
        D_Total_Chg: destinationData[7]?.[40] || 0,
        Total_Ship_Cost: totalShipmentCost[40] || 0,
        Is_Locked: null,
        Created_Date: new Date(),
        Created_By: createdBy,
        Updated_Date: new Date(),
        Updated_By: createdBy,
      },
    ];

    try {
      for (const data of quoteData) {
        await prisma.$executeRaw`EXEC InsertFCLQuote @QuoteData = ${data}`;
      }
      res.status(200).json({ message: 'Quote saved successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to save quote' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
