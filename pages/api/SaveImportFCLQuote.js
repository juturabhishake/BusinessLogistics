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
    quoteYear,
    containerSize,
    originData,
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
    !containerSize ||
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
    Quote_Month: quoteMonth,
    Quote_Year: quoteYear,
    Cont_Feet: containerSize,
    O_CCD: parseDecimal(originData[0]?.[containerSize]),
    O_LTG: parseDecimal(originData[1]?.[containerSize]),
    O_THC: parseDecimal(originData[2]?.[containerSize]),
    O_BLC: parseDecimal(originData[3]?.[containerSize]),
    O_LUS: parseDecimal(originData[4]?.[containerSize]),
    O_Halt: parseDecimal(originData[5]?.[containerSize]),
    O_Total_Chg: parseDecimal(totalOrigin),
    S_SeaFre: parseDecimal(seaFreightData[0]?.[containerSize]),
    S_ENS: parseDecimal(seaFreightData[1]?.[containerSize]),
    S_ISPS: parseDecimal(seaFreightData[2]?.[containerSize]),
    S_ITT: parseDecimal(seaFreightData[3]?.[containerSize]),
    S_Total_Chg: parseDecimal(totalSeaFreight),
    D_DTH: parseDecimal(destinationData[0]?.[containerSize]),
    D_BLF: parseDecimal(destinationData[1]?.[containerSize]),
    D_DBR: parseDecimal(destinationData[2]?.[containerSize]),
    D_DOF: parseDecimal(destinationData[3]?.[containerSize]),
    D_HC: parseDecimal(destinationData[4]?.[containerSize]),
    D_TDO: parseDecimal(destinationData[5]?.[containerSize]),
    D_LOC: parseDecimal(destinationData[6]?.[containerSize]),
    D_Total_Chg: parseDecimal(totalDestination),
    Total_Ship_Cost: parseDecimal(totalShipmentCost),
    Created_Date: new Date(),
    Created_By: createdBy || "Unknown",
    remarks: remarks || "",
  };

  try {
    console.log("Saving data to database for container size:", containerSize);
    console.log("Payload:", quoteData);

    await prisma.$executeRaw`EXEC SaveImportFCLQuote @jsonval = ${JSON.stringify(
      quoteData
    )}`;
    res.status(200).json({ message: `Quote for ${containerSize}ft saved successfully` });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to save quote", details: error.message });
  }
}
