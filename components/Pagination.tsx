import React from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  scrollRef?: React.RefObject<HTMLElement>;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  scrollRef,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    onPageChange(page);
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex justify-center items-center mt-6 space-x-2">
      <button
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
          currentPage === 1
            ? "border-earth-200 text-earth-300 cursor-not-allowed"
            : "border-earth-300 text-earth-600 hover:bg-earth-50 hover:border-earth-400"
        }`}
      >
        <i className="fa-solid fa-chevron-left" />
      </button>

      <span className="text-earth-600 font-medium px-4">
        Trang {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
          currentPage === totalPages
            ? "border-earth-200 text-earth-300 cursor-not-allowed"
            : "border-earth-300 text-earth-600 hover:bg-earth-50 hover:border-earth-400"
        }`}
      >
        <i className="fa-solid fa-chevron-right" />
      </button>
    </div>
  );
};

export default Pagination;
