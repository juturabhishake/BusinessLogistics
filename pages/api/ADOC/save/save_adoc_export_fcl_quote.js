import { PrismaClient } from "@prisma/client";
import Cors from "cors";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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
    containerSize,
    Quote_Date,
    quoteMonth,
    quoteYear,
    originData,
    seaFreightData,
    destinationData,
    totalShipmentCost,
    totalOrigin,
    totalSeaFreight,
    totalDestination,
    createdBy,
    remarks,
    uploaded_pdf_path,
    Request_Id,
  } = req.body;

  if (
    !supplierCode ||
    !containerSize ||
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
    Container_Size: containerSize,
    Quote_Date:Quote_Date,
    Quote_Month: quoteMonth,
    Quote_Year: quoteYear,
    O_CCD: parseDecimal(originData[0]?.[20]),
    O_LTG: parseDecimal(originData[1]?.[20]),
    O_THC: parseDecimal(originData[2]?.[20]),
    O_BLC: parseDecimal(originData[3]?.[20]),
    O_LUS: parseDecimal(originData[4]?.[20]),
    O_Halt: parseDecimal(originData[5]?.[20]),
    O_Total_Chg: parseDecimal(totalOrigin?.[20]),
    S_SeaFre: parseDecimal(seaFreightData[0]?.[20]),
    S_ENS: parseDecimal(seaFreightData[1]?.[20]),
    S_ISPS: parseDecimal(seaFreightData[2]?.[20]),
    S_ITT: parseDecimal(seaFreightData[3]?.[20]),
    S_Total_Chg: parseDecimal(totalSeaFreight?.[20]),
    D_DTH: parseDecimal(destinationData[0]?.[20]),
    D_BLF: parseDecimal(destinationData[1]?.[20]),
    D_DBR: parseDecimal(destinationData[2]?.[20]),
    D_DOF: parseDecimal(destinationData[3]?.[20]),
    D_HC: parseDecimal(destinationData[4]?.[20]),
    D_TDO: parseDecimal(destinationData[5]?.[20]),
    D_LOC: parseDecimal(destinationData[6]?.[20]),
    D_Total_Chg: parseDecimal(totalDestination?.[20]),
    Total_Ship_Cost: parseDecimal(totalShipmentCost?.[20]),
    Created_Date: new Date(),
    Created_By: createdBy || "Unknown",
    remarks: remarks || "",
    uploaded_pdf_path: uploaded_pdf_path || "",
    Request_Id: Request_Id,
  };
  console.log("Payload:", quoteData);
  try {
    console.log("Payload:", quoteData);

    await prisma.$executeRaw`EXEC [dbo].[SaveADOCExportFCLQuote] @jsonval = ${JSON.stringify(
      quoteData
    )}`;
    res.status(200).json({ message: `Quote saved successfully` });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to save quote", details: error.message });
  }
}
