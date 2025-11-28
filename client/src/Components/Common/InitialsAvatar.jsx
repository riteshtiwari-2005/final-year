import React from "react";
import styled from "styled-components";

// Simple initials avatar: derive initials from name and render a colored circle
const InitialsAvatar = ({ name, size = 40 }) => {
  const initials = getInitials(name || "");
  const bg = stringToColor(name || "default");

  return <Circle style={{ backgroundColor: bg, width: size, height: size }}>{initials}</Circle>;
};

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return `#${"00000".substring(0, 6 - c.length) + c}`;
}

const Circle = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  border-radius: 50%;
  text-transform: uppercase;
  font-size: 0.95rem;
`;

export default InitialsAvatar;
