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

  const { quotes } = req.body;

  if (!Array.isArray(quotes) || quotes.length === 0) {
    return res.status(400).json({ error: "Invalid payload, expecting a non-empty array of quotes." });
  }

  try {
    const jsonPayload = JSON.stringify(quotes);
    await prisma.$executeRaw`EXEC [dbo].[SaveADOCImportFCLQuote_multi] @jsonval = ${jsonPayload}`;
    res.status(200).json({ message: `Quotes saved successfully` });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to save quotes", details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}