import { PrismaClient } from "@prisma/client";
import Cors from 'cors';

const prisma = new PrismaClient();

const cors = Cors({
    methods: ['POST', 'GET', 'HEAD'], 
    origin: '*', 
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

    if (req.method === "POST") {
        const { Loc_Code,sc } = req.body;
        if (!Loc_Code) {
            return res.status(400).json({ message: "Location code is required" });
        }
        try {
            const result = await prisma.$queryRaw`EXEC [dbo].[get_AIR_Export_QUOTE] ${Loc_Code},${sc}`;
            console.log('FCL Data:', result);    
            return res.status(200).json({ result });
        } catch (error) {
            console.error('Error fetching get_AIR_Export_QUOTE:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}