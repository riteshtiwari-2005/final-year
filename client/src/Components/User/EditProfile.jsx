import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { userRequest } from "../../Utils/requestMethods";
import { useDispatch } from "react-redux";
import { authActions } from "../../Redux/authRedux";
import InitialsAvatar from "../Common/InitialsAvatar";
import { toast } from "react-toastify";
import EditModal from "./EditModal";

const EditProfile = () => {
  const dispatch = useDispatch();
  const authUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userRequest.get("users/profile");
        setProfile(res.data || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const openEditor = (field) => {
    setEditingField(field);
    setModalOpen(true);
  };

  const closeEditor = () => {
    setEditingField(null);
    setModalOpen(false);
  };

  const handleSave = async (field, value, file) => {
    setLoading(true);
    try {
      let uploadedUrl = profile.img;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const up = await userRequest.post("upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrl = up.data.url;
      }

      const payload = { ...profile };
      if (field === "img") payload.img = uploadedUrl;
      else payload[field] = value;

      const res = await userRequest.put("users/profile", payload);
      const updated = res.data;
      setProfile(updated);

      // refresh redux auth state
      dispatch(
        authActions.login({
          token: token,
          userId: authUserId,
          isAdmin: updated.isAdmin,
          name: `${updated.firstname} ${updated.surname}`,
          img: updated.img,
          phone: updated.phone,
          email: updated.email,
          maker: updated.maker,
          type: updated.type,
          license: updated.license,
        })
      );

      toast.success("Profile updated");
      closeEditor();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Header>Profile</Header>
        <Row>
          <Label>First name</Label>
          <Value>{profile.firstname || "-"}</Value>
          <EditButton onClick={() => openEditor("firstname")}>Edit</EditButton>
        </Row>

        <Row>
          <Label>Last name</Label>
          <Value>{profile.surname || "-"}</Value>
          <EditButton onClick={() => openEditor("surname")}>Edit</EditButton>
        </Row>

        <Row>
          <Label>Phone</Label>
          <Value>{profile.phone || "-"}</Value>
          <EditButton onClick={() => openEditor("phone")}>Edit</EditButton>
        </Row>

        <Row>
          <Label>Email</Label>
          <Value>{profile.email || "-"}</Value>
          <EditButton disabled>Edit</EditButton>
        </Row>

        <Row>
          <Label>Profile Image</Label>
          <Value>
              {profile.img ? (
                <Avatar src={profile.img} alt="avatar" />
              ) : (
                // show initials avatar when no image
                <InitialsAvatar name={`${profile.firstname || ""} ${profile.surname || ""}`} size={64} />
              )}
          </Value>
          <EditButton onClick={() => openEditor("img")}>Edit</EditButton>
        </Row>
      </Card>

      {modalOpen && (
        <EditModal
          field={editingField}
          currentValue={profile[editingField]}
          onClose={closeEditor}
          onSave={handleSave}
        />
      )}
    </Container>
  );
};

export default EditProfile;

const Container = styled.div`
  width:100%;
  max-width:900px;
  margin:0 auto 2rem;
`;

const Card = styled.div`
  background:white;
  padding:1rem 1.2rem;
  border-radius:12px;
  box-shadow:0 6px 18px rgba(0,0,0,0.06);
`;

const Header = styled.h3`
  margin:0 0 1rem 0;
`;

const Row = styled.div`
  display:flex;
  align-items:center;
  gap:1rem;
  padding:0.6rem 0;
  border-top:1px solid #f2f2f2;
`;

const Label = styled.div`
  width:160px;
  font-weight:600;
`;

const Value = styled.div`
  flex:1;
`;

const EditButton = styled.button`
  padding:0.4rem 0.8rem;
  background:#fff;
  border:1px solid #ddd;
  border-radius:8px;
  cursor:pointer;
  &:disabled{opacity:0.6; cursor:not-allowed}
`;

const Avatar = styled.img`
  width:64px;
  height:64px;
  object-fit:cover;
  border-radius:50%;
`;
