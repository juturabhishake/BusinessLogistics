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
    const parseDecimal = (value) => (value ? parseFloat(value) : 0.0);

    const quoteData = [
      {
        Supplier_Code: supplierCode,
        Location_Code: locationCode,
        Quote_Month: quoteMonth,
        Quote_Year: quoteYear,
        Cont_Feet: 20,
        O_CCD: parseDecimal(originData[0]?.[20]),
        O_LTG: parseDecimal(originData[1]?.[20]),
        O_THC: parseDecimal(originData[2]?.[20]),
        O_BLC: parseDecimal(originData[3]?.[20]),
        O_LUS: parseDecimal(originData[4]?.[20]),
        O_Halt: parseDecimal(originData[5]?.[20]),
        O_Total_Chg: parseDecimal(originData[6]?.[20]),
        S_SeaFre: parseDecimal(seaFreightData[0]?.[20]),
        S_ENS: parseDecimal(seaFreightData[1]?.[20]),
        S_ISPS: parseDecimal(seaFreightData[2]?.[20]),
        S_ITT: parseDecimal(seaFreightData[3]?.[20]),
        S_Total_Chg: parseDecimal(seaFreightData[4]?.[20]),
        D_DTH: parseDecimal(destinationData[0]?.[20]),
        D_BLF: parseDecimal(destinationData[1]?.[20]),
        D_DBR: parseDecimal(destinationData[2]?.[20]),
        D_DOF: parseDecimal(destinationData[3]?.[20]),
        D_HC: parseDecimal(destinationData[4]?.[20]),
        D_TDO: parseDecimal(destinationData[5]?.[20]),
        D_LOC: parseDecimal(destinationData[6]?.[20]),
        D_Total_Chg: parseDecimal(destinationData[7]?.[20]),
        Total_Ship_Cost: parseDecimal(totalShipmentCost[20]),
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
        Cont_Feet: 40,
        O_CCD: parseDecimal(originData[0]?.[40]),
        O_LTG: parseDecimal(originData[1]?.[40]),
        O_THC: parseDecimal(originData[2]?.[40]),
        O_BLC: parseDecimal(originData[3]?.[40]),
        O_LUS: parseDecimal(originData[4]?.[40]),
        O_Halt: parseDecimal(originData[5]?.[40]),
        O_Total_Chg: parseDecimal(originData[6]?.[40]),
        S_SeaFre: parseDecimal(seaFreightData[0]?.[40]),
        S_ENS: parseDecimal(seaFreightData[1]?.[40]),
        S_ISPS: parseDecimal(seaFreightData[2]?.[40]),
        S_ITT: parseDecimal(seaFreightData[3]?.[40]),
        S_Total_Chg: parseDecimal(seaFreightData[4]?.[40]),
        D_DTH: parseDecimal(destinationData[0]?.[40]),
        D_BLF: parseDecimal(destinationData[1]?.[40]),
        D_DBR: parseDecimal(destinationData[2]?.[40]),
        D_DOF: parseDecimal(destinationData[3]?.[40]),
        D_HC: parseDecimal(destinationData[4]?.[40]),
        D_TDO: parseDecimal(destinationData[5]?.[40]),
        D_LOC: parseDecimal(destinationData[6]?.[40]),
        D_Total_Chg: parseDecimal(destinationData[7]?.[40]),
        Total_Ship_Cost: parseDecimal(totalShipmentCost[40]),
        Is_Locked: null,
        Created_Date: new Date(),
        Created_By: createdBy,
        Updated_Date: new Date(),
        Updated_By: createdBy,
      },
    ];
    console.log(quoteData);
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

