import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { publicRequest } from "../Utils/requestMethods";
import { toast } from "react-toastify";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const e = params.get("email");
    const t = params.get("token");
    if (e) setEmail(e);
    if (t) {
      setToken(t);
      setStep(2);
    }
  }, [location.search]);

  const requestOtp = async () => {
    try {
      await publicRequest.post("/auth/request-password-reset", { email });
      toast.info("Password reset token sent to email");
      // go back to login page so user can proceed to verification/login
      navigate(`/auth`);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to request OTP");
    }
  };

  const reset = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const tokenToUse = token || otp;
      await publicRequest.post("/auth/reset-password", {
        email,
        token: tokenToUse,
        newPassword,
      });

      toast.success("Password reset successful");
      setStep(3);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <Wrapper>
      <GlassCard>
        {step === 1 && (
          <>
            <Title>Forgot Password</Title>

            <Label>Email Address</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
            />

            <Button onClick={requestOtp}>Send Reset Link</Button>
          </>
        )}

        {step === 2 && (
          <>
            <Title>Create New Password</Title>

            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />

            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />

            <Button onClick={reset}>Reset Password</Button>
          </>
        )}

        {step === 3 && (
          <SuccessMsg>Your password has been reset successfully 🎉</SuccessMsg>
        )}
      </GlassCard>
    </Wrapper>
  );
};

export default PasswordReset;

/* -------------------------- PREMIUM UI -------------------------- */

const Wrapper = styled.div`
  width: 100%;
  min-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #ffe5e5 0%, #ffffff 100%);
`;

const GlassCard = styled.div`
  width: 95%;
  max-width: 420px;
  padding: 2.2rem;
  border-radius: 18px;

  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);

  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  border: 1px solid rgba(255, 255, 255, 0.5);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.6rem;
  color: #b71d1d;
  font-weight: 700;
`;

const Label = styled.label`
  display: block;
  margin: 0.4rem 0;
  font-size: 0.95rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem;
  margin-bottom: 1rem;

  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;

  background: rgba(255, 255, 255, 0.9);

  &:focus {
    border-color: #d62828;
    box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.25);
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: #d62828;
  color: white;
  border: none;
  border-radius: 10px;

  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;

  transition: all 0.25s ease;

  &:hover {
    background: #b71d1d;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(214, 40, 40, 0.3);
  }
`;

const SuccessMsg = styled.div`
  text-align: center;
  padding: 1.4rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #137c13;
`;
