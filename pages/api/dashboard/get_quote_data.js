import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();

const cors = Cors({
  methods: ["POST"], 
  origin: "*",
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors); 

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, quote } = req.body;

    if (!id || !quote) {
      return res.status(400).json({ error: "id and quote are required" });
    }

    const result = await prisma.$queryRaw`EXEC get_Quote_Data ${id}, ${quote}`;
    

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing stored procedure:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
