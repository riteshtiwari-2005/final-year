import React from "react";
import styled from "styled-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userRequest } from "../../Utils/requestMethods";
import Loading from "../Loading";
import { toast } from "react-toastify";

const WorkersAdmin = () => {
  const qc = useQueryClient();
  const { data = [], isFetching, error } = useQuery({
    queryKey: ["adminWorkers"],
    queryFn: async () => {
      const res = await userRequest.get("/admin/workers");
      return res.data;
    },
  });

  const onDelete = async (id) => {
    if (!window.confirm("Delete this worker?")) return;
    try {
      await userRequest.delete(`/admin/workers/${id}`);
      toast.success("Worker deleted");
      qc.invalidateQueries(["adminWorkers"]);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to delete worker");
    }
  };

  if (isFetching) return <Loading />;
  if (error) return <p>Error loading workers: {String(error.message)}</p>;

  return (
    <Card>
      <Title>Workers</Title>
      {data.length === 0 ? (
        <p>No workers yet.</p>
      ) : (
        <List>
          {data.map((w) => (
            <Item key={w._id}>
              {w.img ? <Thumb src={w.img} alt={`${w.firstname} ${w.surname}`} /> : <NoThumb />}
              <Info>
                <Name>{w.firstname} {w.surname}</Name>
                <Small>{w.email}</Small>
                <Small>{w.phone}</Small>
                {w.maker && <Small>Maker/Specialty: {w.maker}</Small>}
                {w.license && <Small>License: {w.license}</Small>}
              </Info>
              <Actions>
                <Delete onClick={() => onDelete(w._id)}>Delete</Delete>
              </Actions>
            </Item>
          ))}
        </List>
      )}
    </Card>
  );
};

export default WorkersAdmin;

const Card = styled.div`
  padding: 1rem;
  margin: 1rem auto;
  max-width: 60rem;
  width: 90%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  background: #fff;
`;
const Title = styled.h4`
  margin: 0 0 0.6rem 0;
`;
const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;
const Item = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid #eee;
`;
const Info = styled.div``;
const Name = styled.div`
  font-weight: 700;
`;
const Small = styled.div`
  font-size: 0.9rem;
  color: #555;
`;
const Actions = styled.div``;
const Delete = styled.button`
  background: #e53e3e;
  color: white;
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
`;

const Thumb = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 0.8rem;
`;

const NoThumb = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: #f0f0f0;
  margin-right: 0.8rem;
`;
