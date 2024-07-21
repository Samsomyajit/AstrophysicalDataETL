import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Header = styled.h2`
  text-align: center;
  color: #333;
`;

const Paragraph = styled.p`
  line-height: 1.6;
  color: #555;
`;

const Research = () => {
  return (
    <Container>
      <Header>Research Findings</Header>
      <Paragraph>
        The data analyzed in this project consists of various near-Earth objects (NEOs) recorded by NASA. 
        The primary variables include the diameter of the NEOs and their distance from Earth. 
        Our analysis shows that there is a significant variation in the sizes and distances of these objects.
      </Paragraph>
      <Paragraph>
        Key findings include:
        <ul>
          <li>The majority of NEOs have a diameter less than 1 km.</li>
          <li>There are a few outliers with diameters greater than 5 km.</li>
          <li>Most NEOs pass Earth at a distance greater than 10 million km.</li>
          <li>Box plots reveal a skewed distribution for both diameter and distance.</li>
          <li>The scatter plot matrix suggests a lack of strong correlation between diameter and distance.</li>
        </ul>
      </Paragraph>
      <Paragraph>
        These findings are crucial for understanding the potential threat and characteristics of NEOs. 
        Further research could delve into the composition and orbit patterns of these objects to better assess their behavior and potential impact risks.
      </Paragraph>
    </Container>
  );
};

export default Research;
