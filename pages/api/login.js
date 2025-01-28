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

function encodePasswordToBase64(password) {
    try {
        const encDataByte = new TextEncoder().encode(password);
        const encodedData = btoa(String.fromCharCode(...encDataByte));
        return encodedData;
    } catch (ex) {
        throw new Error("Error in base64Encode: " + ex.message);
    }
}
// function decodeFrom64(encodedData) {
//     const decodedData = atob(encodedData);
//     const byteNumbers = new Uint8Array(decodedData.length);
//     for (let i = 0; i < decodedData.length; i++) {
//         byteNumbers[i] = decodedData.charCodeAt(i);
//     }
//     const decodedString = new TextDecoder("utf-8").decode(byteNumbers);
//     return decodedString;
// }
export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    if (req.method === "POST") {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        try {
            const encryptedPassword = encodePasswordToBase64(password);
            console.log("encryptedPassword", encryptedPassword);
            console.log("password", password);
            const result = await prisma.$queryRaw`
                DECLARE @message NVARCHAR(100);
                EXEC [dbo].[SP_Check_Login] 
                    @email = ${email}, 
                    @password = ${encryptedPassword}, 
                    @message = @message OUTPUT;
                SELECT @message AS Message;
            `;

            const loginMessage = result[0]?.Message;

            if (loginMessage === "Login Success") {
                const query = await prisma.$queryRaw`
                    SELECT [Login_id]
                        ,[Username]
                        ,[Email]
                        ,[Password] = ${password}
                        ,[Phone]
                        ,[Company]
                        ,[Address]
                        ,[Is_Active]
                        ,[Created_Date]
                    FROM [abhi1289_].[dbo].[Web_Login] where email = ${email}`;
                return res.status(200).json({ message: loginMessage, data: query });
            } else {
                return res.status(401).json({ message: loginMessage });
            }
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}