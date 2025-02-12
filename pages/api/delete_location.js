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

  const { Location_Id } = req.body;

  if (!Location_Id) {
    return res.status(400).json({ error: "Location_Id is required" });
  }

  try {
    console.log("Deleting location with ID:", Location_Id);

    const result = await prisma.$queryRaw`EXEC Delete_Location_Master @Location_Id = ${Location_Id}`;

    res.status(200).json({ message: "Location deleted successfully", result });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to delete location", details: error.message });
  }
}
