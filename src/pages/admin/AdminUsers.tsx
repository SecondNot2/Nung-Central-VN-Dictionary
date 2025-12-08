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
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <i className="fa-solid fa-lock text-4xl text-earth-400 mb-4" />
          <h2 className="text-xl font-bold text-earth-900 mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-earth-600 mb-4">
            Bạn cần quyền quản trị viên để truy cập trang này.
          </p>
          <button
            onClick={() => setRoute(AppRoute.DICTIONARY)}
            className="px-6 py-2 bg-bamboo-600 text-white rounded-lg hover:bg-bamboo-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-bamboo-50/30">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Xóa người dùng"
        message={`Bạn có chắc muốn xóa "${deleteConfirm.userName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteConfirm({ isOpen: false, userId: "", userName: "" })
        }
        type="danger"
      />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-earth-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRoute(AppRoute.ADMIN_DASHBOARD)}
                className="p-2 hover:bg-earth-100 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-arrow-left text-earth-600" />
              </button>
              <div>
                <h1 className="text-2xl font-serif font-bold text-earth-900">
                  Quản lý người dùng
                </h1>
                <p className="text-earth-600 text-sm">
                  {total} người dùng trong hệ thống
                </p>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm theo email hoặc tên..."
                  className="pl-10 pr-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none w-64"
                />
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-bamboo-600 text-white rounded-lg hover:bg-bamboo-700 transition-colors"
              >
                Tìm
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setPage(1);
                  }}
                  className="px-4 py-2 bg-earth-200 text-earth-700 rounded-lg hover:bg-earth-300 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-earth-200/50 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <i className="fa-solid fa-circle-notch fa-spin text-2xl text-bamboo-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-earth-400">
              <i className="fa-solid fa-users-slash text-4xl mb-3" />
              <p>Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-earth-50 border-b border-earth-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-earth-700">
                      Người dùng
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-earth-700">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-earth-700">
                      Quyền
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-earth-700">
                      Ngày tạo
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-earth-700">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-earth-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bamboo-400 to-bamboo-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                            {u.avatar_url ? (
                              <img
                                src={u.avatar_url}
                                alt={u.display_name || "Avatar"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (u.display_name || u.email)?.[0]?.toUpperCase() ||
                              "?"
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-earth-900">
                              {u.display_name || "Chưa đặt tên"}
                            </p>
                            {u.id === user?.id && (
                              <span className="text-xs text-bamboo-600 bg-bamboo-50 px-2 py-0.5 rounded">
                                Bạn
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-earth-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(
                              u.id,
                              e.target.value as "contributor" | "admin"
                            )
                          }
                          disabled={u.id === user?.id || actionLoading === u.id}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                            u.role === "admin"
                              ? "bg-purple-50 border-purple-200 text-purple-700"
                              : "bg-bamboo-50 border-bamboo-200 text-bamboo-700"
                          } ${
                            u.id === user?.id
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-opacity-75"
                          }`}
                        >
                          <option value="contributor">Cộng tác viên</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-earth-500 text-sm">
                        {new Date(u.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            handleDeleteClick(u.id, u.display_name || u.email)
                          }
                          disabled={u.id === user?.id || actionLoading === u.id}
                          className={`p-2 rounded-lg transition-colors ${
                            u.id === user?.id
                              ? "text-earth-300 cursor-not-allowed"
                              : "text-red-500 hover:bg-red-50 hover:text-red-700"
                          }`}
                          title={
                            u.id === user?.id
                              ? "Không thể xóa chính mình"
                              : "Xóa người dùng"
                          }
                        >
                          {actionLoading === u.id ? (
                            <i className="fa-solid fa-circle-notch fa-spin" />
                          ) : (
                            <i className="fa-solid fa-trash" />
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-earth-200 bg-earth-50/50">
              <p className="text-sm text-earth-600">
                Trang {page} / {totalPages} ({total} người dùng)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-earth-300 text-earth-700 hover:bg-earth-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        page === pageNum
                          ? "bg-bamboo-600 text-white"
                          : "border border-earth-300 text-earth-700 hover:bg-earth-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-earth-300 text-earth-700 hover:bg-earth-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fa-solid fa-chevron-right" />
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
