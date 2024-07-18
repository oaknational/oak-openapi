import styled from 'styled-components';

const Ul = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    border-top: 1px solid #bebebe;
    padding: 12px 0;

    svg {
      margin-right: 16px;
    }
  }
`;

type ListProps = {
  children: React.ReactNode;
};

export default function List({ children }: ListProps) {
  return <Ul>{children}</Ul>;
}
