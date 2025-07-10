export type TableRowData = {
  cells: string[];
  _key: string;
};

export type Table = {
  rows: TableRowData[];
};

export const Table = ({ value }: { value: Table }) => {
  return (
    <table>
      <tbody>
        {value.rows.map((row) => (
          <TableRow key={row._key} row={row} />
        ))}
      </tbody>
    </table>
  );
};

export const TableRow = ({ row }: { row: TableRowData }) => {
  return (
    <tr>
      {row.cells.map((cell, index) => (
        <td key={index}>{cell}</td>
      ))}
    </tr>
  );
};
