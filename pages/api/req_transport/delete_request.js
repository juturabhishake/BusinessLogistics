import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();
const cors = Cors({ methods: ["POST", "OPTIONS"], origin: "*" });

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
  
  const { ID } = req.body;

  if (!ID) {
    return res.status(400).json({ error: "ID is required." });
  }

  try {
    const result = await prisma.$queryRaw`EXEC [dbo].[sp_DeleteTransportRequest] @ID = ${ID}`;

    if (result && result[0] && result[0].Status === 'Success') {
      res.status(200).json({ message: result[0].Message });
    } else {
      res.status(404).json({ error: result[0].Message || "Request not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the request", details: error.message });
  }
}