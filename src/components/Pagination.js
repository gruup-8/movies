import React from 'react';
import ReactPaginate from 'react-paginate';

function Pagination({ pageCount, onPageChange, currentPage }) {
  return (
    <ReactPaginate
      className="react-paginate"
      breakLabel="..."
      nextLabel="next >"
      onPageChange={(e) => onPageChange(e.selected + 1)}
      pageRangeDisplayed={5} 
      pageCount={pageCount} 
      previousLabel="< previous"
      renderOnZeroPageCount={null}
      forcePage={currentPage - 1}
    />
  );
}

export default Pagination;