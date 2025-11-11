import { PrismaClient } from "@prisma/client";
import Cors from 'cors';

const prisma = new PrismaClient();
const cors = Cors({ methods: ['POST'], origin: '*' });

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    if (req.method === "POST") {
        try {
            const { quoteData } = req.body;
            const { vehicleType, currency, rate, supplierCode, createdBy, quoteYear } = quoteData;

            if (!vehicleType || !rate || !supplierCode || !createdBy || !quoteYear) {
                return res.status(400).json({ message: "Missing required fields" });
            }
            
            await prisma.$executeRaw`EXEC [dbo].[Save_Pune_Quote] ${vehicleType}, ${currency}, ${parseFloat(rate)}, ${supplierCode}, ${createdBy}, ${parseInt(quoteYear)}`;
            
            return res.status(200).json({ message: "Quote saved successfully" });

        } catch (error) {
            console.error('Error saving Pune quote:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}