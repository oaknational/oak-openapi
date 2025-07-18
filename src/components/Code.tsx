import Highlight from 'react-highlight';

type Code = {
  code?: string;
  language?: string;
};

export const Code = ({ value }: { value: Code }) => {
  return (
    <Highlight className={value.language || 'plaintext'}>
      {value.code}
    </Highlight>
  );
};
