import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();
const cors = Cors({ methods: ["POST"], origin: "*" });

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { quoteData } = req.body;
  if (!quoteData || typeof quoteData !== 'object') {
    return res.status(400).json({ error: "Missing or invalid quote data" });
  }

  try {
    const jsonPayload = JSON.stringify(quoteData);
    await prisma.$executeRaw`EXEC [dbo].[Save_Chennai_Quote] @QuoteDataJSON = ${jsonPayload}`;
    res.status(200).json({ message: `Quote for ${quoteData.containerType} saved successfully` });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to save quote", details: error.message });
  }
}