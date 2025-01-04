"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import  secureLocalStorage  from  "react-secure-storage";

export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email Input, 2: OTP Input, 3: Reset Password
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsPopupOpen(false);
      setStep(1);
      console.log("Final Submission:", { email, otp, newPassword, confirmPassword });
    }
  };

  const handleLogin = async () => {
    try {
      if (!loginEmail || !loginPassword) {
        alert("Please enter both email and password");
        return;
      }
      const response = await fetch(`http://localhost:5188/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: loginEmail,
          password: loginPassword
         }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.message === "Login Success") {
          console.log("Login successful");
          secureLocalStorage.setItem("un", data.user.username);
          secureLocalStorage.setItem("pw", data.user.password);
          secureLocalStorage.setItem("em", data.user.email);
          secureLocalStorage.setItem("pn", data.user.phone);
          secureLocalStorage.setItem("company", data.user.company);
          secureLocalStorage.setItem("address", data.user.address);
          window.location.href = "/dashboard";
        }
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("500!! Internal Server Error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
      <Card className="w-[350px] shadow-md rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">Login</CardTitle>
          <CardDescription className="text-sm text-gray-500">Enter your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</Label>
                <Input id="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Enter your email" className="mt-1 h-10 px-3 border-gray-300 rounded-md" />
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</Label>
                <Input id="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} type="password" placeholder="Enter password" className="mt-1 h-10 px-3 border-gray-300 rounded-md" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="mt-4">
          <Button onClick={handleLogin} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Login</Button>
        </CardFooter>
        <div className="flex justify-center mb-6">
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => setIsPopupOpen(true)}
          >
            Forgot Password
          </Button>
        </div>
      </Card>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            {step === 1 && (
              <>
                <h4 className="text-lg font-semibold text-center">Forgot Password</h4>
                <p className="text-sm text-gray-500 text-center mt-2">Enter your email to receive an OTP.</p>
                <div className="mt-4">
                  <Label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    className="mt-1 h-10 px-3 border-gray-300 rounded-md w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                    onClick={handleNextStep}
                  >
                    Get OTP
                  </Button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h4 className="text-lg font-semibold text-center">Enter OTP</h4>
                <p className="text-sm text-gray-500 text-center mt-2">Check your email for the OTP.</p>
                <div className="mt-4 flex justify-center">
                  <InputOTP maxLength={6} onChange={(value) => setOtp(value)}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  onClick={handleNextStep}
                >
                  Submit OTP
                </Button>
              </>
            )}
            {step === 3 && (
              <>
                <h4 className="text-lg font-semibold text-center">Reset Password</h4>
                <p className="text-sm text-gray-500 text-center mt-2">Enter your new password.</p>
                <div className="mt-4">
                  <Label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    className="mt-1 h-10 px-3 border-gray-300 rounded-md w-full"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mt-4">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    className="mt-1 h-10 px-3 border-gray-300 rounded-md w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                    onClick={handleNextStep}
                  >
                    Submit
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
