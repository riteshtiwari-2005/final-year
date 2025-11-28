import React, { useState, useEffect } from "react";
import VerifyOtp from "../Components/Auth/VerifyOtp";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyOtpPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [purpose, setPurpose] = useState("register");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const e = params.get("email");
    const p = params.get("purpose") || "register";
    if (e) {
      setEmail(e);
      setSent(true);
    }
    setPurpose(p);
  }, [location.search]);

  return (
    <Container>
      {!sent ? (
        <div>
          <h3>Verify your email</h3>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <button onClick={() => setSent(true)}>Continue</button>
        </div>
      ) : (
        <VerifyOtp
          email={email}
          purpose={purpose}
          onVerified={() => {
            if (purpose !== "login") navigate("/auth");
          }}
        />
      )}
    </Container>
  );
};

export default VerifyOtpPage;

const Container = styled.div`padding: 1rem;`;
