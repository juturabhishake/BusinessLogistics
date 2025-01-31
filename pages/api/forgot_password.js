import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { encodePasswordToBase64 } from '@/lib/encryption'; 

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['POST', 'OPTIONS'],
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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const otpStore = {};

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'POST') {
    const { email, otp, newPassword } = req.body;

    try {
      if (otp) {
        if (!otpStore[email] || otpStore[email].otp !== otp || Date.now() > otpStore[email].expires) {
          return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await prisma.$queryRaw`SELECT * FROM Web_Login WHERE Email = ${email}`;
        
        if (!user || user.length === 0) {
          return res.status(404).json({ message: 'User  not found' });
        }

        const encodedPassword = encodePasswordToBase64(newPassword);
        await prisma.$executeRaw`UPDATE Web_Login SET Password = ${encodedPassword} WHERE Email = ${email}`;

        delete otpStore[email];

        return res.status(200).json({ message: 'Password reset successfully' });
      } else {
        const user = await prisma.$queryRaw`SELECT * FROM Web_Login WHERE Email = ${email}`;
        
        if (!user || user.length === 0) {
          return res.status(404).json({ message: 'User  not found' });
        }

        const firstName = user[0].Username;
        const otp = crypto.randomInt(100000, 999999).toString();
        
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: email,
          subject: 'Your OTP Code',
          text: `Hi ${firstName},\n\nYou have requested to reset your password.\nYour OTP is: ${otp}\n\nBest Regards,\nGTI`,
        });

        otpStore[email] = {
          otp,
          expires: Date.now() + 60 * 1000,
        };

        return res.status(200).json({ message: 'OTP sent to your email' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}