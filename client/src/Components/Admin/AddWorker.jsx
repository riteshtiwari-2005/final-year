import React from "react";
import styled from "styled-components";
import { useState } from "react";
import { userRequest } from "../../Utils/requestMethods";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { publicRequest } from "../../Utils/requestMethods";

const AddWorker = () => {
  const [form, setForm] = useState({
    firstname: "",
    surname: "",
    phone: "",
    license: "",
    maker: "",
    email: "",
    password: "",
    img: "",
    service: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await userRequest.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, img: res.data.url }));
      toast.success("Image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, type: "worker" };
      const res = await userRequest.post("/admin/workers", payload);
      toast.success("Worker created: " + (res.data.email || "(created)"));
      setForm({ firstname: "", surname: "", phone: "", license: "", maker: "", email: "", password: "", img: "" });
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data || err.message || "Failed to create worker";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const { data: services = [] } = useQuery({
    queryKey: ["servicesForWorker"],
    queryFn: async () => {
      const res = await publicRequest.get("/services");
      return res.data;
    },
  });

  return (
    <Card>
      <Form onSubmit={onSubmit}>
        <Row>
          <Input name="firstname" placeholder="First name" value={form.firstname} onChange={onChange} required />
          <Input name="surname" placeholder="Surname" value={form.surname} onChange={onChange} required />
        </Row>
        <Row>
          <Input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} required />
          <Input name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        </Row>
        <Row>
          <Input name="license" placeholder="License (driving/license id)" value={form.license} onChange={onChange} />
          <Input name="maker" placeholder="Maker / Specialty (e.g. Toyota, Honda, Brakes)" value={form.maker} onChange={onChange} />
        </Row>
        <Row>
          <Input name="password" placeholder="Password" value={form.password} onChange={onChange} type="password" required />
          <Input name="img" placeholder="Image URL" value={form.img} onChange={onChange} />
        </Row>
        <Row>
          <label style={{ alignSelf: "center", marginRight: "0.5rem" }}>Assign to service</label>
          <select name="service" value={form.service} onChange={onChange} style={{ padding: "0.6rem", borderRadius: 8, flex: 1 }}>
            <option value="">(none)</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </Row>
        <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem" }}>Or upload image</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
        </div>
        {form.img && (
          <div style={{ marginBottom: "0.6rem" }}>
            <label style={{ display: "block", marginBottom: "0.3rem" }}>Preview</label>
            <img src={form.img} alt="preview" style={{ maxWidth: "200px", height: "auto", borderRadius: 8 }} />
          </div>
        )}
        <Actions>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Worker"}</Button>
        </Actions>
      </Form>
    </Card>
  );
};

export default AddWorker;

const Card = styled.div`
  padding: 1rem;
  margin: 1rem auto;
  max-width: 60rem;
  width: 90%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  border-radius: 14px;
  background-color: white;
`;
const Form = styled.form``;
const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;
const Input = styled.input`
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
`;
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.6rem;
`;
const Button = styled.button`
  background: #111;
  color: #fff;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
`;
