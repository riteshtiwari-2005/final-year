import React from "react";
import styled from "styled-components";
import { useState } from "react";
import { userRequest } from "../../Utils/requestMethods";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    img: "",
    description: "",
    stock: "",
  });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

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
      const payload = {
        name: "ritesh",
        price: Number(form.price) || 0,
        category: form.category,
        img: form.img,
        description: form.description,
        stock: Number(form.stock) || 0,
      };
      const res = await userRequest.post("/products", payload);
      toast.success("Product created: " + (res.data.name || "(created)"));
      setForm({ name: "", price: "", category: "", img: "", description: "", stock: "" });
      queryClient.invalidateQueries(["productsData"]);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data || err.message || "Failed to create product";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form onSubmit={onSubmit}>
        <Row>
          <Input name="title" placeholder="Title" value={form.title} onChange={onChange} required />
          <Input name="price" placeholder="Price" value={form.price} onChange={onChange} required />
        </Row>
        <Row>
          <Input name="category" placeholder="Category" value={form.category} onChange={onChange} />
          <Input name="stock" placeholder="Stock" value={form.stock} onChange={onChange} />
        </Row>
        <Input name="img" placeholder="Image URL" value={form.img} onChange={onChange} />
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
        <Textarea name="description" placeholder="Description" value={form.description} onChange={onChange} />
        <Actions>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Product"}</Button>
        </Actions>
      </Form>
    </Card>
  );
};

export default AddProduct;

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
const Textarea = styled.textarea`
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
  min-height: 80px;
  resize: vertical;
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
