import React, { useState } from "react";
import UserInfo from "../Components/User/UserInfo";
import EditProfile from "../Components/User/EditProfile";
import styled from "styled-components";

const User = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div>
      <ProfileNav>
        <Tab active={activeTab === "profile"} onClick={() => setActiveTab("profile")}>Profile</Tab>
        <Tab active={activeTab === "orders"} onClick={() => setActiveTab("orders")}>Services / Orders</Tab>
      </ProfileNav>

      {activeTab === "profile" && <EditProfile />}
      {activeTab === "orders" && <UserInfo />}
    </div>
  );
};

export default User;

const ProfileNav = styled.div`
  display:flex;
  gap:1rem;
  align-items:center;
  justify-content:center;
  margin:1.2rem 0;
`;

const Tab = styled.button`
  padding:0.6rem 1rem;
  background: ${props => (props.active ? "#d62828" : "#fff")};
  color: ${props => (props.active ? "#fff" : "#333")};
  border: 1px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
`;
