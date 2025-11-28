import React from "react";
import styled from "styled-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userRequest } from "../Utils/requestMethods";
import Loading from "../Components/Loading";
import { toast } from "react-toastify";

const WorkersPage = () => {
  const qc = useQueryClient();
  const { data = [], isFetching, error } = useQuery({
    queryKey: ["adminWorkersPage"],
    queryFn: async () => {
      const res = await userRequest.get("/admin/workers");
      return res.data;
    },
  });

  const [selected, setSelected] = React.useState(null);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this worker?")) return;
    try {
      await userRequest.delete(`/admin/workers/${id}`);
      toast.success("Worker deleted");
      qc.invalidateQueries(["adminWorkersPage"]);
      setSelected(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to delete worker");
    }
  };

  if (isFetching) return <Loading />;
  if (error) return <p>Error loading workers: {String(error.message)}</p>;

  return (
    <Page>
      <Grid>
        {data.map((w) => (
          <Card key={w._id} onClick={() => setSelected(w)}>
            {w.img ? <Thumb src={w.img} alt={w.firstname} /> : <NoThumb />}
            <Name>{w.firstname} {w.surname}</Name>
          </Card>
        ))}
      </Grid>

      {selected && (
        <Modal onClick={() => setSelected(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalThumb src={selected.img} alt={selected.firstname} />
              <div>
                <h3>{selected.firstname} {selected.surname}</h3>
                <p>{selected.email}</p>
                <p>{selected.phone}</p>
                {selected.maker && <p>Maker/Specialty: {selected.maker}</p>}
                {selected.license && <p>License: {selected.license}</p>}
              </div>
            </ModalHeader>
            <ModalActions>
              <button onClick={() => onDelete(selected._id)}>Delete</button>
              <button onClick={() => setSelected(null)}>Close</button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Page>
  );
};

export default WorkersPage;

const Page = styled.div`
  padding: 2rem 1rem;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  max-width: 1100px;
  margin: 0 auto;
`;
const Card = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;
const Thumb = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
`;
const NoThumb = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f0f0f0;
`;
const Name = styled.div`
  font-weight: 700;
`;

const Modal = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index: 1200;
`;
const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 95%;
  padding: 1rem;
`;
const ModalHeader = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;
const ModalThumb = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
`;
const ModalActions = styled.div`
  display:flex;
  gap: 0.6rem;
  justify-content:flex-end;
  margin-top: 1rem;
  & button {
    padding: 0.6rem 0.9rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }
  & button:first-child { background: #e53e3e; color: white; }
  & button:last-child { background: #eee; }
`;