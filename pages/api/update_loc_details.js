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

  const { Loc_Details_ID, Customer_Name, Delivery_Address, Commodity,HSN_Code, Incoterms,Transit_Days,Dest_Port,Free_Days,Pref_Vessel,Pref_Service,Pref_Liners,Avg_Cont_Per_Mnth, UpdatedBy } = req.body;

  if (!Loc_Details_ID) {
    return res.status(400).json({ error: "Loc_Details_ID is required" });
  }

  try {
    console.log("Updating Location:", req.body);

    const result = await prisma.$queryRaw`
      EXEC Update_Location_Details 
        @Loc_Details_ID = ${Loc_Details_ID}, 
        @Customer_Name = ${Customer_Name}, 
        @Delivery_Address = ${Delivery_Address}, 
        @Commodity = ${Commodity}, 
        @HSN_Code = ${HSN_Code},
        @Incoterms = ${Incoterms}, 
        @Transit_Days = ${Transit_Days}, 
        @Dest_Port = ${Dest_Port}, 
        @Free_Days = ${Free_Days},
        @Pref_Vessel = ${Pref_Vessel}, 
        @Pref_Service = ${Pref_Service}, 
        @Pref_Liners = ${Pref_Liners}, 
        @Avg_Cont_Per_Mnth = ${Avg_Cont_Per_Mnth},

        @UpdatedBy = ${UpdatedBy}`;

    res.status(200).json({ message: "Location updated successfully", result });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to update location", details: error.message });
  }
}
