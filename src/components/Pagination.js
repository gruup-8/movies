import React from 'react';
import ReactPaginate from 'react-paginate';

function Pagination({ pageCount, onPageChange }) {
  return (
    <ReactPaginate
      containerClassName={'pagination'}
      breakLabel="..."
      nextLabel="next >"
      onPageChange={(e) => onPageChange(e.selected + 1)}
      pageRangeDisplayed={5}
      pageCount={pageCount}
      previousLabel="< previous"
      renderOnZeroPageCount={null}
    />
  );
}

export default Pagination;