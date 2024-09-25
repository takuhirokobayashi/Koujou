import styled from '@emotion/styled'

export const Input = styled.input`
  height: 100%;
  width: calc( 100% - 20px );
  padding: 5px;
  font-size: inherit;
  border: none;
  background-color: transparent;
`

export const Select = styled.select`
  padding: 10px;
  font-size: 14px;
`

export const Button = styled.button`
  height: 100%;
  padding: 0 5px;
  font-size: inherit;
  cursor: pointer;
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
`

export const TableHeader = styled.th`
  background-color: #f2f2f2;
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
`

export const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
  text-align: ${ ( { align } ) => ( 'right' === align ? 'right' : ( 'left' === align ? 'left' : 'center' ) ) };
  position: relative;
`

export const TableRow = styled.tr`
  &:nth-of-type(even) {
    background-color: #f9f9f9;
  }
`

export const DivTable = styled.div`
  display: table;
  width: 100%;
`

export const DivTableRow = styled.div`
  display: table-row;
  width: 100%;
`

type DivTableCellProps = {
  align?: 'left' | 'center' | 'right';
};

export const DivTableCell = styled.div<DivTableCellProps>`
  display: table-cell;
  width: 100%;
  text-align: ${ ( { align } ) => ( 'right' === align ? 'right' : ( 'left' === align ? 'left' : 'center' ) ) };
  padding: 5px;
  font-size: 12px;
`
