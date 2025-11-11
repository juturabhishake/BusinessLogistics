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
        const { sc, un, year } = req.body;
        if (!sc || !un || !year) {
            return res.status(400).json({ message: "Supplier code, username, and year are required" });
        }
        
        try {
            const result = await prisma.$queryRaw`EXEC [dbo].[Get_Pune_Quote] ${sc}, ${un}, ${parseInt(year)}`;
            return res.status(200).json({ result });
        } catch (error) {
            console.error('Error fetching Pune quote:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}