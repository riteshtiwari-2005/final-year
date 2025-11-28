import React, { useState } from "react";
import styled from "styled-components";

const EditModal = ({ field, currentValue, onClose, onSave }) => {
  const [value, setValue] = useState(currentValue || "");
  const [file, setFile] = useState(null);

  const titleMap = {
    firstname: "First name",
    surname: "Last name",
    phone: "Phone",
    img: "Profile Image",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (field === "img") {
      onSave(field, null, file);
    } else {
      onSave(field, value, null);
    }
  };

  return (
    <Overlay>
      <Modal>
        <ModalHeader>
          <h4>Edit {titleMap[field] || field}</h4>
          <Close onClick={onClose}>✕</Close>
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          {field === "img" ? (
            <>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </>
          ) : (
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
          )}

          <Actions>
            <Cancel onClick={onClose} type="button">Cancel</Cancel>
            <Save type="submit">Save</Save>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default EditModal;

const Overlay = styled.div`
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.4);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index: 2000;
`;

const Modal = styled.div`
  background:white;
  width:90%;
  max-width:520px;
  border-radius:12px;
  padding:1rem;
`;

const ModalHeader = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:0.6rem;
`;

const Close = styled.button`
  background:transparent;
  border:none;
  font-size:1.2rem;
  cursor:pointer;
`;

const Form = styled.form``;

const Input = styled.input`
  width:100%;
  padding:0.7rem;
  border:1px solid #ddd;
  border-radius:8px;
  margin-bottom:0.8rem;
`;

const Actions = styled.div`
  display:flex;
  justify-content:flex-end;
  gap:0.6rem;
`;

const Cancel = styled.button`
  padding:0.5rem 0.8rem;
  border:1px solid #ddd;
  background:#fff;
  border-radius:8px;
  cursor:pointer;
`;

const Save = styled.button`
  padding:0.5rem 0.8rem;
  border:none;
  background:#d62828;
  color:#fff;
  border-radius:8px;
  cursor:pointer;
`;
