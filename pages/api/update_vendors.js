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

  const { Vendor_Id, Vendor_Name, Contact_Name, Contact_No,Contact_Email, Email_2,Email_3,IsActive,UpdatedBy } = req.body;

  if (!Vendor_Id) {
    return res.status(400).json({ error: "Vendor_Id is required" });
  }

  try {
    console.log("Updating Location:", req.body);

    const result = await prisma.$queryRaw`
      EXEC Update_Vendor_Details 
        @Vendor_Id = ${Vendor_Id}, 
        @Vendor_Name = ${Vendor_Name}, 
        @Contact_Name = ${Contact_Name}, 
        @Contact_No = ${Contact_No}, 
        @Contact_Email = ${Contact_Email},
        @Email_2 = ${Email_2}, 
        @Email_3 = ${Email_3}, 
        @IsActive = ${IsActive}, 
        @UpdatedBy = ${UpdatedBy}`;

    res.status(200).json({ message: "Vendor updated successfully", result });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to update location", details: error.message });
  }
}
