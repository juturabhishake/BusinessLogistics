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
  
    const payload = req.body;
  
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Invalid payload" });
    }
  
    try {
      console.log("Payload received:", payload);
  
      const result = await prisma.$queryRaw`EXEC SaveLCLQuote @jsonval = ${JSON.stringify(payload)}`;
        
      res.status(200).json({ message: "Quote saved successfully", result });
    } catch (error) {
      console.error("Database error:", error.message);
      res.status(500).json({ error: "Failed to save quote", details: error.message });
    }
  }
  
