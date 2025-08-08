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
    quote_Date,
    quoteMonth,
    quoteYear,
    cbm,
    originData,
    seaFreightData,
    destinationData,
    totalShipmentCost,
    totalOrigin,
    totalSeaFreight,
    totalDestination,
    createdBy,
    remarks,
    Request_Id,
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
    Quote_Date: quote_Date || "",
    Quote_Month: quoteMonth,
    Quote_Year: quoteYear,
    CBM: cbm,
    O_PU: parseDecimal(originData[0]?.[20]),
    O_CC: parseDecimal(originData[1]?.[20]),
    O_HDO: parseDecimal(originData[2]?.[20]),
    O_THC: parseDecimal(originData[3]?.[20]),
    O_DOC: parseDecimal(originData[4]?.[20]),
    O_Total_Chg: parseDecimal(totalOrigin?.[20]),
    S_AirFre: parseDecimal(seaFreightData[0]?.[20]),
    S_FSC: parseDecimal(seaFreightData[1]?.[20]),
    S_SSC: parseDecimal(seaFreightData[2]?.[20]),
    S_ISS: parseDecimal(seaFreightData[3]?.[20]),
    S_Xray: parseDecimal(seaFreightData[4]?.[20]),
    S_AAI: parseDecimal(seaFreightData[5]?.[20]),
    S_Total_Chg: parseDecimal(totalSeaFreight?.[20]),
    D_CC: parseDecimal(destinationData[0]?.[20]),
    D_CCF: parseDecimal(destinationData[1]?.[20]),
    D_DOC: parseDecimal(destinationData[2]?.[20]),
    D_LC: parseDecimal(destinationData[3]?.[20]),
    D_LU: parseDecimal(destinationData[4]?.[20]),
    D_DEL: parseDecimal(destinationData[5]?.[20]),
    D_Total_Chg: parseDecimal(totalDestination?.[20]),
    Total_Ship_Cost: parseDecimal(totalShipmentCost?.[20]),
    Created_Date: new Date(),
    Created_By: createdBy || "Unknown",
    Updated_By: createdBy || "Unknown",
    remarks: remarks || "",
    Request_Id: Request_Id,
  };

  try {
    console.log("Payload:", quoteData);

    await prisma.$executeRaw`EXEC [dbo].[SaveAIRExportQuote] @jsonval = ${JSON.stringify(
      quoteData
    )}`;
    res.status(200).json({ message: `Quote saved successfully` });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to save quote", details: error.message });
  }
}
