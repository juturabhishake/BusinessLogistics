import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();
const cors = Cors({
  methods: ["POST", "OPTIONS"],
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {  Location, Actual_Location,Country, Currency, Loc_Address, CreatedBy } = req.body;

  try {
    console.log("Inserting new location:", req.body);

    const result = await prisma.$queryRaw`
      EXEC Insert_Adhoc_Location_Master       
        @Location = ${Location}, 
         @Actual_Location = ${Actual_Location}, 
        @Country = ${Country}, 
        @Currency = ${Currency}, 
        @Loc_Address = ${Loc_Address},
        @CreatedBy = ${CreatedBy}`;

    const message = JSON.stringify(result);

    if (message.includes("Location_Code already exists")) {
      return res.status(400).json({ error: "Location code already exists. Please use a unique Location Code." });
    }

    res.status(200).json({ message: "Location added successfully", result });

  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to insert location", details: error.message });
  }
}
