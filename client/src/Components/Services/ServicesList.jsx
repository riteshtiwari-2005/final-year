import styled from "styled-components";
import Service from "./Service";
import { mobile, tablet } from "../../Utils/responsive";
import { useQuery } from "@tanstack/react-query";
import { publicRequest } from "../../Utils/requestMethods";
import Loading from "../Loading";

const ServicesList = () => {
  let content;
  const { data: services, isFetching } = useQuery({
    queryKey: ["servicesData"],
    queryFn: async () => {
      const res = await publicRequest.get("/services/");
      // console.log(res.data);
      return res.data;
    },
  });

  if (isFetching) {
    content = <Loading />;
  } else {
    content = (
      <ProductContainer>
        {services && services.length > 0 ? (
          services.map((service) => <Service service={service} key={service._id} />)
        ) : (
          <EmptyMessage>No services available yet</EmptyMessage>
        )}
      </ProductContainer>
    );
  }

  return (
    <Container>
      <Title>Services</Title>
      {content}
    </Container>
  );
};

export default ServicesList;

const Container = styled.div`
  padding: 25px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const ProductContainer = styled.div`
  padding: 20px 0;
  display: grid;
  width: 75vw;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  ${tablet({
    "grid-template-columns": `1fr`,
    width: "85%",
  })}
  ${mobile({
    width: "95%",
    gap: "1rem",
  })}
`;

const Title = styled.h3`
  font-size: 38px;
  line-height: 1.4;
  font-weight: 800;
`;

const EmptyMessage = styled.div`
  padding: 2rem 0;
  color: #666;
  font-weight: 600;
  text-align: center;
`;
