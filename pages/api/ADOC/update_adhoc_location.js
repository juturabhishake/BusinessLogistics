import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();
const cors = Cors({
  methods: ["POST", "OPTIONS"],
});

const runMiddleware = (req, res, fn) => ///assets/files/exportADOCFCL
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { Location_Id, Location,Actual_Location, Country, Currency, Loc_Address, UpdatedBy } = req.body;

  if (!Location_Id) {
    return res.status(400).json({ error: "Location_Id is required" });
  }

  try {
    console.log("Updating Location:", req.body);

    const result = await prisma.$queryRaw`
      EXEC Update_Adhoc_Location_Master 
        @Location_Id = ${Location_Id}, 
        @Location = ${Location}, 
        @Actual_Location = ${Actual_Location}, 
        @Country = ${Country}, 
        @Currency = ${Currency}, 
        @Loc_Address = ${Loc_Address},
        @UpdatedBy = ${UpdatedBy}`;
      

    res.status(200).json({ message: "Location updated successfully", result });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to update location", details: error.message });
  }
}
