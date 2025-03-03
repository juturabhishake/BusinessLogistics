"use client";
import { useState, useEffect } from "react";
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
import secureLocalStorage from "react-secure-storage";
import { FiLoader, FiCheck, FiXCircle } from "react-icons/fi";

export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginState, setLoginState] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(180);
  const [otpExpired, setOtpExpired] = useState(false);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isPopupOpen && step === 2 && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setOtpExpired(true);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPopupOpen, step, otpTimer]);

  const handleNextStep = async () => {
    console.log('Current Step:', step);

    if (step === 1) {
        if (email === "") {
            alert("Please enter your email");
            return;
        }
        setLoading(true);

        const response = await fetch('/api/forgot_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        setLoading(false);
        console.log('Response from OTP request:', response);

        if (response.ok) {
            setStep(2);
            setOtpTimer(180);
            setOtpExpired(false);
        } else {
            const errorData = await response.json();
            console.error('Error data:', errorData);
            alert(errorData.message || 'Something went wrong!');
        }

    } else if (step === 2) {
        if (otp === "") {
            alert("Please enter the OTP");
            return;
        }
        setLoading(true);

        const response = await fetch('/api/forgot_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        setLoading(false);
        console.log('Response from OTP verification:', response);

        if (response.ok) {
            setStep(3);
        } else {
            const errorData = await response.json();
            console.error('Error data:', errorData);
            alert(errorData.message || 'Invalid OTP');
        }

    } else if (step === 3) {
        if (newPassword === "" || confirmPassword === "") {
            alert("Please enter a password");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        setLoading(true);

        const response = await fetch('/api/forgot_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword }),
        });

        setLoading(false);
        console.log('Response from password reset:', response);

        if (response.ok) {
            alert('Password reset successfully');
            setIsPopupOpen(false);
            setStep(1);
        } else {
            const errorData = await response.json();
            console.error('Error data:', errorData);
            alert(errorData.message || 'Something went wrong!');
        }
    }
  };

  const handleLogin = async () => {
    setLoginState("loading");
    try {
      if (!loginEmail || !loginPassword) {
        setLoginState("failure");
        alert("Please enter both email and password");
        return;
      }
      const response = await fetch(`/api/login`, {
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
        const result = await response.json();
        if (result.message === "Login Success" && result.data?.length > 0) {
          const user = result.data[0]; 
          secureLocalStorage.setItem("un", user.Username);
          secureLocalStorage.setItem("pw", user.Password);
          secureLocalStorage.setItem("em", user.Email);
          secureLocalStorage.setItem("pn", user.Phone);
          secureLocalStorage.setItem("company", user.Company);
          secureLocalStorage.setItem("address", user.Address);
          secureLocalStorage.setItem("sc", user.Vendor_Code);
          // console.log('vendor code:', user.Vendor_Code);
          setLoginState("success");
          setTimeout(() => {
            if (user.Vendor_Code === 'admin') {
              window.location.href = "/settings/dashboarda";
            } else {
              window.location.href = "/dashboard";
            }
          }, 1500);
        } else {
          setLoginState("failure");
          alert("Invalid login details");
        }
      } else {
        setLoginState("failure");
        const errorData = await response.json();
        alert(errorData.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error:", error);
      setLoginState("failure");
      alert("500!! Internal Server Error");
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center font-sans" 
      style={{ backgroundImage: "url('/assets/track2.png')" }}
    >
      <Card className="backdrop-blur-sm bg-white/20 shadow-lg rounded-lg p-6 w-full max-w-[350px] sm:max-w-[400px] md:max-w-[450px]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold text-white">Login</CardTitle>
          <CardDescription className="text-sm text-white/70">Enter your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }}}
          >
            <div className="grid gap-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-white">Email</Label>
                <Input id="email" style={{backgroundColor: "black", color:"white"}} value={loginEmail} onChange ={(e) => setLoginEmail(e.target.value)} placeholder="Enter your email" className="mt-1 h-10 px-3 border-gray-300 rounded-md" required />
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-white">Password</Label>
                <Input id="password" style={{backgroundColor: "black", color:"white"}} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} type="password" placeholder="Enter password" className="mt-1 h-10 px-3 border-gray-300 rounded-md" required />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="mt-2">
          <div className="flex flex-col sm:flex-row w-full">
          <Button
              onClick={handleLogin}
              className={`w-full text-white py-4 rounded-md flex items-center justify-center ${
                loginState === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : loginState === "failure"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={loginState === "loading"}
            >
              {loginState === "idle" && "Login"}
              {loginState === "loading" && (
                <>
                  <FiLoader className="mr-2 animate-spin" />
                  Please Wait...
                </>
              )}
              {loginState === "success" && (
                <>
                  <FiCheck className="mr-2 animate-pulse" />
                  Success
                </>
              )}
              {loginState === "failure" && (
                <>
                  <FiXCircle className="mr-2" />
                  Login Failed
                </>
              )}
            </Button>
            <Button
              className="w-full bg-red-600 text-white py-4 rounded-md hover:bg-red-900 sm:ml-4 mt-2 sm:mt-0"
              onClick={() => setIsPopupOpen(true)}
            >
              Forgot Password
            </Button>
          </div>
        </CardFooter>
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
                    required
                  />
                  <Button
 className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FiLoader className="mr-2 animate-spin" />
                        Please Wait...
                      </>
                    ) : (
                      "Get OTP"
                    )}
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
                      <InputOTPSlot index={0} onPaste={(e) => e.preventDefault()} />
                      <InputOTPSlot index={1} onPaste={(e) => e.preventDefault()} />
                      <InputOTPSlot index={2} onPaste={(e) => e.preventDefault()} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} onPaste={(e) => e.preventDefault()} />
                      <InputOTPSlot index={4} onPaste={(e) => e.preventDefault()} />
                      <InputOTPSlot index={5} onPaste={(e) => e.preventDefault()} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                    onClick={handleNextStep}
                    disabled={loading || otpExpired}
                  >
                    {loading ? (
                      <>
                        <FiLoader className="mr-2 animate-spin" />
                        Please Wait...
                      </>
                    ) : (
                      "Submit OTP"
                    )}
                  </Button>
                  <span className="ml-2 text-red-600">{otpExpired ? "OTP expired" : `${otpTimer}s`}</span>
                </div>
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
                    required
                  />
                  <Label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mt-4">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    className="mt-1 h-10 px-3 border-gray-300 rounded-md w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FiLoader className="mr-2 animate-spin" />
                        Please Wait...
                      </>
                    ) : (
                      "Submit"
                    )}
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