import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();
const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "*",
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

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const {
    supplierCode,
    locationCode,
    quoteMonth,
    quote_Date,
    quoteYear,
    originData,
    cbm,      
    seaFreightData,
    destinationData,
    totalShipmentCost,
    totalOrigin,
    totalSeaFreight,
    totalDestination,
    createdBy,
    remarks,
  } = req.body;

  if (
    !supplierCode ||
    !locationCode ||
    !quoteMonth ||
    !quoteYear ||
    !originData ||
    !seaFreightData ||
    !destinationData ||
    totalShipmentCost === undefined ||
    totalOrigin === undefined ||
    totalSeaFreight === undefined ||
    totalDestination === undefined
  ) {
    return res.status(400).json({ error: "Missing or invalid required fields" });
  }

  const parseDecimal = (value) => (value ? parseFloat(value) : 0.0);

  const quoteData = {
    Supplier_Code: supplierCode,
    Location_Code: locationCode || "",
      Quote_Date: quote_Date,
    Quote_Month: quoteMonth,
    Quote_Year: quoteYear,
    CBM: cbm,
    D_CCD: parseDecimal(originData[0]?.[20]),
    D_LTS: parseDecimal(originData[1]?.[20]),
    D_THC: parseDecimal(originData[2]?.[20]),
    D_BLC: parseDecimal(originData[3]?.[20]),
    D_LUS: parseDecimal(originData[4]?.[20]),
    // O_CFS: parseDecimal(originData[5]?.[20]),
    D_Total_Chg: parseDecimal(totalOrigin?.[20]),
    S_SeaFre: parseDecimal(seaFreightData[0]?.[20]),
    S_FSC: parseDecimal(seaFreightData[1]?.[20]),
    S_SSC: parseDecimal(seaFreightData[2]?.[20]),
    S_Total_Chg: parseDecimal(totalSeaFreight?.[20]),
    O_CC: parseDecimal(destinationData[0]?.[20]),
    O_CCF: parseDecimal(destinationData[1]?.[20]),
    O_DOC: parseDecimal(destinationData[2]?.[20]),
    O_CFS: parseDecimal(destinationData[3]?.[20]),
    O_LU: parseDecimal(destinationData[4]?.[20]),
    O_Del: parseDecimal(destinationData[5]?.[20]),
    O_Total_Chg: parseDecimal(totalDestination?.[20]),
    Total_Ship_Cost: parseDecimal(totalShipmentCost?.[20]),
    Created_Date: new Date(),
    Created_By: createdBy || "Unknown",
    remarks: remarks || "",
  };

  try {
    console.log("Payload:", quoteData);

    await prisma.$executeRaw`EXEC [dbo].[SaveADOCImportLCLQuote] @jsonval = ${JSON.stringify(
      quoteData
    )}`;
    res.status(200).json({ message: `Quote saved successfully` });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to save quote", details: error.message });
  }
}
