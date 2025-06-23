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
    requestDate,
    transportType,
    shipmentType,
    containerSize,
    fromLocation,
    toLocation,
    Commodity,
    HSN_Code,
    Incoterms,
    USD,
    EURO,
    Transit_Days,
    Dest_Port,
    Free_Days,
    Pref_Vessel,
    Pref_Service,
    Pref_Liners,
    Avg_Cont_Per_Mnth,
    createdBy,
  } = req.body;

  if (!requestDate || !transportType || !shipmentType || !containerSize) {
    return res.status(400).json({ error: "Missing required selection fields" });
  }
  
  const payload = {
    Request_Date: requestDate,
    Transport_Type: transportType,
    Shipment_Type: shipmentType,
    Container_Size: containerSize,
    From_Location_Code: fromLocation?.Location_Code || null,
    From_Location_Name: fromLocation?.Location || null,
    To_Location_Code: toLocation?.Location_Code || null,
    To_Location_Name: toLocation?.Location || null,
    Commodity: Commodity || null,
    HSN_Code: HSN_Code || null,
    Incoterms: Incoterms || null,
    USD: USD || null,
    EURO: EURO || null,
    Transit_Days: Transit_Days || null,
    Dest_Port: Dest_Port || null,
    Free_Days: Free_Days || null,
    Pref_Vessel: Pref_Vessel || null,
    Pref_Service: Pref_Service || null,
    Pref_Liners: Pref_Liners || null,
    Avg_Cont_Per_Mnth: Avg_Cont_Per_Mnth || null,
    Created_By: createdBy || "Unknown",
  };

  console.log("Payload:", payload);

  try {
    const result = await prisma.$queryRaw`EXEC [dbo].[sp_CreateTransportRequest] @jsonData = ${JSON.stringify(payload)}`;

    console.log("Stored Procedure Result:", result);

    if (result && result[0] && result[0].Status === 'Success') {
      res.status(201).json({ message: result[0].Message });
    } else if (result && result[0] && result[0].Status === 'Conflict') {
      res.status(409).json({ error: result[0].Message });
    } else {
      throw new Error("Failed to execute stored procedure or unknown result.");
    }
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ error: "Failed to save the request", details: error.message });
  }
}