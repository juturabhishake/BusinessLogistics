///api/ADOC/ADOCFCL_Terms
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
        const {Shipment_Type,Transport_Type, Loc_Code, Container_Size } = req.body;
        console.log('Terms Request body:', req.body);
        if (!Loc_Code || !Shipment_Type || !Transport_Type || !Container_Size) {
            return res.status(400).json({ message: "Location code and Container Size is required" });
        }
        try {
            const result = await prisma.$queryRaw`EXEC [dbo].[Get_Terms_AdhocFCL_AIR] ${Shipment_Type},${Transport_Type},${Loc_Code}, ${Container_Size}`;
            return res.status(200).json({ result });
        } catch (error) {
            console.error('Error fetching GET_Supplier_LOC_details:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}