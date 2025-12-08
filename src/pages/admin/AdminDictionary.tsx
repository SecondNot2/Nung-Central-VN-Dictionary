import React, { useState, useEffect, useRef } from "react";
import {
  ToastContainer,
  useToast,
  ConfirmDialog,
  CustomSelect,
  SelectOption,
} from "../../components";
import {
  getDictionaryEntries,
  type DictionaryEntry,
} from "../../services/dictionary/dictionaryDisplayService";
import {
  addDictionaryEntry,
  updateDictionaryEntry as updateDictionaryEntryDB,
  deleteDictionaryEntry as deleteDictionaryEntryDB,
} from "../../services/api/dictionaryService";
import { AppRoute } from "../../types";

interface AdminDictionaryProps {
  setRoute: (route: AppRoute) => void;
}

const STORAGE_KEY = "admin_dictionary_entries";

const languageOptions: SelectOption[] = [
  { value: "all", label: "Tất cả ngôn ngữ", icon: "fa-globe" },
  { value: "nung", label: "Tiếng Nùng", icon: "fa-mountain" },
  { value: "central", label: "Tiếng Miền Trung", icon: "fa-wheat-awn" },
];

const statusOptions: SelectOption[] = [
  { value: "all", label: "Tất cả trạng thái", icon: "fa-list" },
  { value: "approved", label: "Đã duyệt", icon: "fa-check-circle" },
  { value: "pending", label: "Chờ duyệt", icon: "fa-clock" },
  { value: "rejected", label: "Từ chối", icon: "fa-times-circle" },
];

const AdminDictionary: React.FC<AdminDictionaryProps> = ({ setRoute }) => {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(
    null
  );
  const [formData, setFormData] = useState({
    word: "",
    translation: "",
    phonetic: "",
    language: "nung" as "nung" | "central",
    example: "",
    notes: "",
    status: "pending" as "approved" | "pending" | "rejected",
  });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    onConfirm: () => {},
  });

  const tableSectionRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, removeToast } = useToast();

  // Load entries from NUNG_DICTIONARY + localStorage on mount
  useEffect(() => {
    setLoading(true);
    try {
      // Get base dictionary entries from NUNG_DICTIONARY
      const baseEntries = getDictionaryEntries();

      // Check for any custom additions in localStorage
      const savedCustom = localStorage.getItem(STORAGE_KEY);
      let customEntries: DictionaryEntry[] = [];
      if (savedCustom) {
        try {
          customEntries = JSON.parse(savedCustom);
        } catch {
          customEntries = [];
        }
      }

      // Merge: custom entries (từ admin thêm) + base entries (từ NUNG_DICTIONARY)
      // Custom entries có thể override base entries nếu cùng id
      const entryMap = new Map<string, DictionaryEntry>();
      baseEntries.forEach((e) => entryMap.set(e.id, e));
      customEntries.forEach((e) => entryMap.set(e.id, e));

      setEntries(Array.from(entryMap.values()));
    } catch (error) {
      console.error("Error loading dictionary:", error);
      addToast("Không thể tải từ điển", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Save custom entries to localStorage and optionally to Supabase
  const saveCustomEntries = async (allEntries: DictionaryEntry[]) => {
    // Chỉ lưu những entries không có trong base dictionary hoặc đã được sửa đổi
    const baseEntries = getDictionaryEntries();
    const baseIds = new Set(baseEntries.map((e) => e.id));

    const customEntries = allEntries.filter((e) => {
      // Entries mới (không có trong base)
      if (!baseIds.has(e.id)) return true;
      // Entries đã được sửa status (pending/rejected thay vì approved)
      if (e.status !== "approved") return true;
      return false;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customEntries));
    setEntries(allEntries);
  };

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage =
      languageFilter === "all" || entry.language === languageFilter;
    const matchesStatus =
      statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesLanguage && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, languageFilter, statusFilter]);

  // Open modal for add/edit
  const openModal = (entry?: DictionaryEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        word: entry.word,
        translation: entry.translation,
        phonetic: entry.phonetic,
        language: entry.language,
        example: entry.example || "",
        notes: entry.notes || "",
        status: entry.status,
      });
    } else {
      setEditingEntry(null);
      setFormData({
        word: "",
        translation: "",
        phonetic: "",
        language: "nung",
        example: "",
        notes: "",
        status: "pending",
      });
    }
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.word.trim() || !formData.translation.trim()) {
      addToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }

    if (editingEntry) {
      // Update existing entry
      const updated = entries.map((entry) =>
        entry.id === editingEntry.id
          ? {
              ...entry,
              ...formData,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : entry
      );
      saveCustomEntries(updated);
      addToast("Cập nhật từ điển thành công!", "success");
    } else {
      // Add new entry
      const newEntry: DictionaryEntry = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
      };
      saveCustomEntries([newEntry, ...entries]);
      addToast("Thêm từ mới thành công!", "success");
    }

    setIsModalOpen(false);
  };

  // Delete entry
  const deleteEntry = (entry: DictionaryEntry) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xóa mục từ điển?",
      message: `Bạn có chắc muốn xóa "${entry.word}" khỏi từ điển? Hành động này không thể hoàn tác.`,
      type: "danger",
      onConfirm: () => {
        const updated = entries.filter((e) => e.id !== entry.id);
        saveCustomEntries(updated);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addToast("Đã xóa mục khỏi từ điển", "success");

        // Adjust page if empty
        const newTotalPages = Math.ceil(updated.length / itemsPerPage) || 1;
        if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
      },
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      approved: "bg-bamboo-100 text-bamboo-700 border-bamboo-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    const icons = {
      approved: "fa-check",
      pending: "fa-clock",
      rejected: "fa-times",
    };
    const labels = {
      approved: "Đã duyệt",
      pending: "Chờ duyệt",
      rejected: "Từ chối",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        <i className={`fa-solid ${icons[status as keyof typeof icons]} mr-1`} />
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
        confirmText="Xóa"
        cancelText="Hủy"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => setRoute(AppRoute.ADMIN_DASHBOARD)}
            className="p-2 hover:bg-earth-100 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-earth-600" />
          </button>
          <h1 className="text-3xl font-serif font-bold text-earth-900">
            <i className="fa-solid fa-book-bookmark mr-3 text-bamboo-600" />
            Quản lý Từ điển
          </h1>
        </div>
        <p className="text-earth-600 ml-12">
          Thêm, sửa, xóa và quản lý các mục trong từ điển
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-earth-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-earth-500 uppercase tracking-wide">
                Tổng số
              </p>
              <p className="text-2xl font-bold text-earth-900">
                {entries.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-earth-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-book text-earth-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-bamboo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-bamboo-600 uppercase tracking-wide">
                Đã duyệt
              </p>
              <p className="text-2xl font-bold text-bamboo-700">
                {entries.filter((e) => e.status === "approved").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-bamboo-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-check text-bamboo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 uppercase tracking-wide">
                Chờ duyệt
              </p>
              <p className="text-2xl font-bold text-yellow-700">
                {entries.filter((e) => e.status === "pending").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-clock text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 uppercase tracking-wide">
                Từ chối
              </p>
              <p className="text-2xl font-bold text-red-700">
                {entries.filter((e) => e.status === "rejected").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-times text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-xl shadow-md border border-earth-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Search */}
          <div className="flex-1 w-full lg:w-auto">
            <label className="block text-sm font-medium text-earth-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm từ hoặc nghĩa..."
                className="w-full pl-10 pr-4 py-2.5 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Language Filter */}
          <div className="w-full lg:w-48">
            <CustomSelect
              value={languageFilter}
              onChange={setLanguageFilter}
              options={languageOptions}
              label="Ngôn ngữ"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              label="Trạng thái"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => openModal()}
            className="w-full lg:w-auto px-6 py-2.5 bg-gradient-to-r from-bamboo-600 to-bamboo-700 text-white font-medium rounded-lg hover:from-bamboo-700 hover:to-bamboo-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <i className="fa-solid fa-plus mr-2" />
            Thêm từ mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        ref={tableSectionRef}
        className="bg-white rounded-xl shadow-md border border-earth-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-earth-50 border-b border-earth-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-earth-600 uppercase tracking-wider">
                  Từ gốc
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-earth-600 uppercase tracking-wider">
                  Bản dịch
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-earth-600 uppercase tracking-wider hidden md:table-cell">
                  Ngôn ngữ
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-earth-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-right px-6 py-4 text-xs font-bold text-earth-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-earth-400">
                      <i className="fa-solid fa-inbox text-4xl mb-3" />
                      <p className="text-lg font-medium">Không có kết quả</p>
                      <p className="text-sm">
                        Thử thay đổi bộ lọc hoặc thêm từ mới
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-earth-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-earth-900">
                          {entry.word}
                        </p>
                        {entry.example && (
                          <p className="text-xs text-earth-500 mt-1 truncate max-w-xs">
                            {entry.example}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-earth-800">{entry.translation}</p>
                      <p className="text-sm text-earth-500 italic">
                        {entry.phonetic}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-earth-100 text-earth-700">
                        <i
                          className={`fa-solid ${
                            entry.language === "nung"
                              ? "fa-mountain"
                              : "fa-wheat-awn"
                          } mr-1`}
                        />
                        {entry.language === "nung"
                          ? "Tiếng Nùng"
                          : "Miền Trung"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openModal(entry)}
                          className="p-2 text-earth-500 hover:text-bamboo-600 hover:bg-bamboo-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <i className="fa-solid fa-pen-to-square" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry)}
                          className="p-2 text-earth-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-earth-200 flex items-center justify-between bg-earth-50">
            <p className="text-sm text-earth-600">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredEntries.length)} của{" "}
              {filteredEntries.length} mục
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  tableSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                  currentPage === 1
                    ? "border-earth-200 text-earth-300 cursor-not-allowed"
                    : "border-earth-300 text-earth-600 hover:bg-white hover:border-earth-400"
                }`}
              >
                <i className="fa-solid fa-chevron-left text-sm" />
              </button>
              <span className="text-sm text-earth-600 px-3">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  tableSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                  currentPage === totalPages
                    ? "border-earth-200 text-earth-300 cursor-not-allowed"
                    : "border-earth-300 text-earth-600 hover:bg-white hover:border-earth-400"
                }`}
              >
                <i className="fa-solid fa-chevron-right text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-white border-b border-earth-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-earth-900">
                {editingEntry ? "Chỉnh sửa từ" : "Thêm từ mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-lg transition-all"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">
                  Từ gốc (Tiếng Việt) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) =>
                    setFormData({ ...formData, word: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập từ tiếng Việt"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">
                  Bản dịch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.translation}
                  onChange={(e) =>
                    setFormData({ ...formData, translation: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập bản dịch"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">
                  Phiên âm
                </label>
                <input
                  type="text"
                  value={formData.phonetic}
                  onChange={(e) =>
                    setFormData({ ...formData, phonetic: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập phiên âm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">
                    Ngôn ngữ
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        language: e.target.value as "nung" | "central",
                      })
                    }
                    className="w-full px-4 py-2.5 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                  >
                    <option value="nung">Tiếng Nùng</option>
                    <option value="central">Tiếng Miền Trung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
                          | "approved"
                          | "pending"
                          | "rejected",
                      })
                    }
                    className="w-full px-4 py-2.5 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                  >
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">
                  Ví dụ sử dụng
                </label>
                <textarea
                  value={formData.example}
                  onChange={(e) =>
                    setFormData({ ...formData, example: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-earth-300 rounded-lg focus:ring-2 focus:ring-bamboo-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Nhập ví dụ câu sử dụng từ này"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-earth-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-earth-300 text-earth-700 font-medium rounded-lg hover:bg-earth-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-bamboo-600 to-bamboo-700 text-white font-medium rounded-lg hover:from-bamboo-700 hover:to-bamboo-800 transition-all shadow-md"
                >
                  {editingEntry ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDictionary;
