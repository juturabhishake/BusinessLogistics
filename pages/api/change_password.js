import { PrismaClient } from '@prisma/client';
import Cors from 'cors';

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: '*',
}); 

function encodePasswordToBase64(password) {
  try {
    const encDataByte = new TextEncoder().encode(password);
    const encodedData = btoa(String.fromCharCode(...encDataByte));
    return encodedData;
  } catch (ex) {
    throw new Error("Error in base64Encode: " + ex.message);
  }
}

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

  if (req.method === 'POST') {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    console.log("Received Request Body:", req.body);

    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      console.error("Missing required fields.");
      return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
      console.log("Encoding passwords...");
      const encodedCurrentPassword = encodePasswordToBase64(currentPassword);
      const encodedNewPassword = encodePasswordToBase64(newPassword);
      const encodedConfirmPassword = encodePasswordToBase64(confirmPassword);

      console.log("Encoded Current Password:", encodedCurrentPassword);
      console.log("Encoded New Password:", encodedNewPassword);
      console.log("Encoded Confirm Password:", encodedConfirmPassword);

      console.log("Executing stored procedure...");
      const result = await prisma.$queryRaw`
        EXEC [dbo].[SP_Change_User_Password]
          @email = ${email},
          @currentPassword = ${encodedCurrentPassword},
          @newPassword = ${encodedNewPassword},
          @confirmPassword = ${encodedConfirmPassword};
      `;

      console.log("Stored Procedure Result:", result);

      return res.status(200).json({
        message: result[0]?.Message || 'Operation completed',
      });
    } catch (error) {
      console.error("Error during password change:", error.message);
      return res.status(500).json({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  } else {
    console.error("Invalid request method:", req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
