import ProductsDetails from "../ProductsDetails";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicRequest, userRequest } from "../../Utils/requestMethods";
import { toast } from "react-toastify";

const ServiceDetails = (props) => {
  const { serviceId, service, products, totalProduct } = props;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data: services = [], isFetching } = useQuery({
    queryKey: ["allServicesForAdmin", serviceId],
    queryFn: async () => {
      const res = await publicRequest.get("/services/");
      return res.data;
    },
  });

  const onApply = async () => {
    if (!selected) return toast.warn("Select a service first");
    try {
      const newTotal = Number(totalProduct || 0) + Number(selected.price || 0);
      await userRequest.put(`/appointments/status/${serviceId}`, {
        service: selected,
        totalAppointmentAmount: newTotal,
      });
      toast.success("Service updated on appointment");
      setOpen(false);
      // optionally refresh parent query by reloading window or invalidating queries in parent
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update appointment");
    }
  };
  return (
    <>
      <UserDetailsContainer>
      <TopContainer>
        <h3>Status: {service.status}</h3>
        <h3>Service Info: {props.name}</h3>
        <ButtonContainer>
          <Link to={`/invoice/${serviceId}`} state={{ from: props }}>
            <Button>Invoice</Button>
          </Link>
          <Link to={`/invoiceAdmin/${serviceId}`} state={{ from: props }}>
            <Button>Edit Invoice</Button>
          </Link>
          <Button onClick={() => setOpen(true)}>Change Service</Button>
        </ButtonContainer>
      </TopContainer>
      <OrderID>Appointment # {serviceId}</OrderID>
      <ServiceContainer>Service: {service.name}</ServiceContainer>
      {products.length > 0 &&
        products.map((order, index) => (
          <ProductsDetails
            key={index}
            name={order.name}
            amount={order.amount}
          />
        ))}
      </UserDetailsContainer>
      {open && (
      <ModalOverlay onClick={() => setOpen(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <h4>Select a service to apply</h4>
          {isFetching ? (
            <p>Loading services...</p>
          ) : (
            <ServiceList>
              {services.map((s) => (
                <ServiceItem key={s._id} onClick={() => setSelected(s)} selected={selected?._id === s._id}>
                  <strong>{s.name}</strong> — ${s.price}
                </ServiceItem>
              ))}
            </ServiceList>
          )}
          <ModalActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={onApply}>Apply</Button>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>
      )}
    </>
  );
};

export default ServiceDetails;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const UserDetailsContainer = styled.li`
  display: flex;
  flex-direction: column;
  margin: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid black;
  & h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.4rem;
  }
`;

const ServiceContainer = styled.div`
  margin-top: 0.8rem;
  margin-bottom: 0.2rem;
  font-weight: bold;
  color: #d32929;
  font-size: 1.2rem;
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px 15px;
  background-color: black;
  box-shadow: 0 3px 24px rgb(0 0 0 / 30%);
  border-radius: 1rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.5s ease;
  &:hover {
    transform: scale(1.1);
  }
`;
const OrderID = styled.div`
  color: rgb(163, 153, 153);
  font-weight: 600;
  padding-bottom: 10px;
  font-size: 0.9rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 1rem 1.2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
`;

const ServiceList = styled.div`
  max-height: 280px;
  overflow: auto;
  margin: 0.5rem 0;
`;

const ServiceItem = styled.div`
  padding: 0.6rem;
  border-radius: 6px;
  margin-bottom: 0.3rem;
  cursor: pointer;
  background: ${(p) => (p.selected ? "#111" : "#f5f5f5")};
  color: ${(p) => (p.selected ? "#fff" : "#000")};
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;
