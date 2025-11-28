import React, { useState } from "react";
import styled from "styled-components";
import { publicRequest } from "../../Utils/requestMethods";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { authActions } from "../../Redux/authRedux";
import { useNavigate } from "react-router-dom";

const VerifyOtp = ({ email, onVerified, purpose = "register" }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await publicRequest.post("/auth/verify-otp", {
        email,
        otp,
        purpose,
      });
      const data = res?.data || {};
      toast.success("Verified");

      // backend may return token as `access` (current) or `accessToken` (legacy)
      const token = data.access || data.accessToken;

      if (token) {
        dispatch(
          authActions.login({
            token,
            isAdmin: data.isAdmin,
            userId: data._id || data.id,
            maker: data.maker,
            type: data.type,
            license: data.license,
          })
        );

        navigate("/");
        return;
      }

      if (onVerified) onVerified();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <CardContainer>
        <Title>Verify OTP</Title>
        <SubText>
          Enter the 6-digit code sent to <strong>{email}</strong>
        </SubText>

        <Form onSubmit={submit}>
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            placeholder="Enter OTP"
          />

          <Button disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </Form>
      </CardContainer>
    </Wrapper>
  );
};

export default VerifyOtp;

/* -------------------------- UI STYLING BELOW -------------------------- */

const Wrapper = styled.div`
  width: 100%;
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4rem;
`;

const CardContainer = styled.div`
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 2.5rem;
  border-radius: 18px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  text-align: center;
`;

const Title = styled.h2`
  margin: 0;
  font-weight: 600;
  color: #222;
  font-size: 1.8rem;
`;

const SubText = styled.p`
  margin: 0;
  color: #555;
  font-size: 1rem;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 1rem;
  font-size: 1.05rem;
  border-radius: 12px;
  border: 1px solid #dcdcdc;
  outline: none;
  letter-spacing: 2px;
  text-align: center;
  background: #fafafa;

  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
  }
`;

const Button = styled.button`
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: red;
  color: white;
  font-size: 1.05rem;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: red;
  }

  &:disabled {
    background: #999;
    cursor: not-allowed;
  }
`;
