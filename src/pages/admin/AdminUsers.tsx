import React, { useState, useEffect, useCallback } from "react";
import { AppRoute, User } from "../../types";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  ExtendedUserProfile,
} from "../../services/api/userManagementService";
import { ToastContainer, useToast, ConfirmDialog } from "../../components";

interface AdminUsersProps {
  user: User | null;
  setRoute: (route: AppRoute) => void;
}

const ITEMS_PER_PAGE = 10;

const AdminUsers: React.FC<AdminUsersProps> = ({ user, setRoute }) => {
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({ isOpen: false, userId: "", userName: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { toasts, addToast, removeToast } = useToast();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const result = await getAllUsers(page, ITEMS_PER_PAGE, search);
    setUsers(result.users);
    setTotal(result.total);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "contributor" | "admin"
  ) => {
    if (userId === user?.id) {
      addToast("Không thể thay đổi quyền của chính mình", "warning");
      return;
    }

    setActionLoading(userId);
    const result = await updateUserRole(userId, newRole);
    setActionLoading(null);

    if (result.success) {
      addToast("Đã cập nhật quyền người dùng", "success");
      loadUsers();
    } else {
      addToast(result.error || "Lỗi cập nhật quyền", "error");
    }
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    if (userId === user?.id) {
      addToast("Không thể xóa tài khoản của chính mình", "warning");
      return;
    }
    setDeleteConfirm({ isOpen: true, userId, userName });
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(deleteConfirm.userId);
    const result = await deleteUser(deleteConfirm.userId);
    setActionLoading(null);
    setDeleteConfirm({ isOpen: false, userId: "", userName: "" });

    if (result.success) {
      addToast("Đã xóa người dùng", "success");
      loadUsers();
    } else {
      addToast(result.error || "Lỗi xóa người dùng", "error");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Check admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="text-center p-12 bg-white border-2 border-black shadow-brutal-sm max-w-md animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-nung-red border-2 border-black flex items-center justify-center mx-auto mb-8">
            <i className="fa-solid fa-lock text-3xl text-white" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-500 font-medium italic mb-8">
            Bạn cần quyền quản trị viên tối cao để truy cập trung tâm điều hành
            này.
          </p>
          <button
            onClick={() => setRoute(AppRoute.DICTIONARY)}
            className="w-full px-8 py-4 bg-black text-white border-2 border-black font-bold uppercase tracking-widest text-xs shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-house"></i>
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Xóa người dùng?"
        message={`Hành động này sẽ xóa "${deleteConfirm.userName}" khỏi hệ thống. Bạn có chắc chắn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteConfirm({ isOpen: false, userId: "", userName: "" })
        }
        type="danger"
      />

      {/* Header & Controls Container */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white border-2 border-black p-6 shadow-brutal-sm">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">
              Quản lý người dùng
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Tổng số:{" "}
              <span className="text-black font-bold">{total} nhân sự</span>
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto"
          >
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm email hoặc tên..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-black bg-white font-bold text-xs outline-none transition-all"
              />
              <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2.5 bg-black text-white border-2 border-black font-bold uppercase tracking-widest text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                Tìm kiếm
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setPage(1);
                  }}
                  className="px-4 py-2.5 bg-white border-2 border-black font-bold uppercase tracking-widest text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  Xóa
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="mb-12">
        {/* Table Container */}
        <div className="bg-white border-2 border-black overflow-hidden shadow-brutal-sm">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-black mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">
                Đang tải...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center">
              <h2 className="text-xl font-bold uppercase mb-2">
                Không tìm thấy kết quả
              </h2>
              <p className="text-gray-500 text-sm">Thử lại với từ khóa khác.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-black">
                    <th className="text-left px-6 py-4 font-black uppercase tracking-widest text-[10px]">
                      Hồ sơ
                    </th>
                    <th className="text-left px-6 py-4 font-black uppercase tracking-widest text-[10px] hidden md:table-cell">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 font-black uppercase tracking-widest text-[10px]">
                      Vai trò
                    </th>
                    <th className="text-left px-6 py-4 font-black uppercase tracking-widest text-[10px] hidden lg:table-cell">
                      Ngày tham gia
                    </th>
                    <th className="text-right px-6 py-4 font-black uppercase tracking-widest text-[10px]">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y border-black">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 even:bg-white odd:bg-gray-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border-2 border-black bg-white overflow-hidden shrink-0">
                            {u.avatar_url ? (
                              <img
                                src={u.avatar_url}
                                alt={u.display_name || "Avatar"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 font-bold text-black">
                                {(u.display_name ||
                                  u.email)?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase">
                              {u.display_name || "Vô danh"}
                            </p>
                            {u.id === user?.id && (
                              <span className="text-[8px] font-black uppercase tracking-widest text-nung-blue">
                                (Bạn)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative max-w-[150px]">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(
                                u.id,
                                e.target.value as "contributor" | "admin"
                              )
                            }
                            disabled={
                              u.id === user?.id || actionLoading === u.id
                            }
                            className={`w-full px-2 py-1.5 border-2 border-black font-bold uppercase text-[9px] transition-all appearance-none outline-none ${
                              u.role === "admin"
                                ? "bg-amber-400 text-black shadow-brutal-sm"
                                : "bg-white text-gray-600"
                            } ${
                              u.id === user?.id
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:bg-black hover:text-white"
                            }`}
                          >
                            <option value="contributor">Cộng tác viên</option>
                            <option value="admin">Quản trị viên</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(u.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            handleDeleteClick(u.id, u.display_name || u.email)
                          }
                          disabled={u.id === user?.id || actionLoading === u.id}
                          className={`p-2 border-2 border-black flex items-center justify-center transition-all ml-auto ${
                            u.id === user?.id
                              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                              : "bg-white text-nung-red hover:bg-nung-red hover:text-white shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                          }`}
                        >
                          {actionLoading === u.id ? (
                            <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                          ) : (
                            <i className="fa-solid fa-trash-can text-xs" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 border-t-2 border-black px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Trang {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
                >
                  <i className="fa-solid fa-chevron-left text-xs" />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 border-2 border-black font-bold text-xs flex items-center justify-center transition-all ${
                          page === pageNum
                            ? "bg-black text-white shadow-none"
                            : "bg-white text-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
                >
                  <i className="fa-solid fa-chevron-right text-xs" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
