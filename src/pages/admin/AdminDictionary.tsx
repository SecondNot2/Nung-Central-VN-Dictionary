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
      approved: "bg-nung-blue text-white",
      pending: "bg-amber-400 text-black",
      rejected: "bg-nung-red text-white",
    };
    const icons = {
      approved: "fa-check",
      pending: "fa-clock",
      rejected: "fa-times",
    };
    const labels = {
      approved: "HỢP LỆ",
      pending: "CHỜ DUYỆT",
      rejected: "TỪ CHỐI",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 border-2 border-black text-[10px] font-black uppercase tracking-widest shadow-none ${
          styles[status as keyof typeof styles]
        }`}
      >
        <i
          className={`fa-solid ${icons[status as keyof typeof icons]} mr-1.5`}
        />
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="bg-white text-black">
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
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
      />

      {/* Header Container */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-2 border-black p-6 shadow-brutal-sm">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">
              Trung tâm Từ điển
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Quản lý và kiểm duyệt kho tàng ngôn ngữ
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-black text-white border-2 border-black font-bold uppercase tracking-widest text-xs shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-plus" />
            Thêm từ mới
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border-2 border-black p-4 shadow-brutal-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            Tổng cộng
          </p>
          <p className="text-3xl font-bold">{entries.length}</p>
        </div>
        <div className="bg-white border-2 border-black p-4 shadow-brutal-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            Đã duyệt
          </p>
          <p className="text-3xl font-bold text-nung-blue">
            {entries.filter((e) => e.status === "approved").length}
          </p>
        </div>
        <div className="bg-white border-2 border-black p-4 shadow-brutal-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            Chờ duyệt
          </p>
          <p className="text-3xl font-bold text-amber-500">
            {entries.filter((e) => e.status === "pending").length}
          </p>
        </div>
        <div className="bg-white border-2 border-black p-4 shadow-brutal-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            Bị từ chối
          </p>
          <p className="text-3xl font-bold text-nung-red">
            {entries.filter((e) => e.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black p-6 shadow-brutal-sm mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập từ cần tìm..."
                className="w-full pl-10 pr-4 py-2 border-2 border-black bg-white font-bold text-sm outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="w-full lg:w-60">
            <CustomSelect
              value={languageFilter}
              onChange={setLanguageFilter}
              options={languageOptions}
              label="Ngôn ngữ"
            />
          </div>

          <div className="w-full lg:w-60">
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              label="Trạng thái"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        ref={tableSectionRef}
        className="bg-white border-2 border-black shadow-brutal-sm overflow-hidden mb-12"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-black">
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                  Từ vựng
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                  Nghĩa
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest hidden md:table-cell">
                  Ngôn ngữ
                </th>
                <th className="text-center px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                  Trạng thái
                </th>
                <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y border-black">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <p className="text-lg font-bold uppercase text-gray-400">
                      Không tìm thấy từ vựng nào
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 even:bg-white odd:bg-gray-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-lg uppercase">
                        {entry.word}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-black">
                        {entry.translation}
                      </p>
                      {entry.phonetic && (
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                          [{entry.phonetic}]
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-[10px] font-black uppercase tracking-tight text-gray-500 bg-gray-100 px-2 py-1 border border-gray-200">
                        {entry.language === "nung" ? "Nùng" : "Miền Trung"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(entry)}
                          className="p-2 bg-white border-2 border-black text-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                        >
                          <i className="fa-solid fa-pen text-xs" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry)}
                          className="p-2 bg-white border-2 border-black text-nung-red shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                        >
                          <i className="fa-solid fa-trash text-xs" />
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
          <div className="px-6 py-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  tableSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                disabled={currentPage === 1}
                className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
              >
                <i className="fa-solid fa-chevron-left text-xs" />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2)
                    pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        tableSectionRef.current?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                      className={`w-8 h-8 border-2 border-black font-bold text-xs flex items-center justify-center transition-all ${
                        currentPage === pageNum
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
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  tableSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                disabled={currentPage === totalPages}
                className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
              >
                <i className="fa-solid fa-chevron-right text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white border-2 border-black shadow-brutal-sm w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-xl font-bold uppercase tracking-tight">
                {editingEntry ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-nung-red transition-colors"
              >
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                    Từ gốc <span className="text-nung-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={(e) =>
                      setFormData({ ...formData, word: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-sm outline-none transition-all"
                    placeholder="Ví dụ: Ăn"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                    Bản dịch <span className="text-nung-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.translation}
                    onChange={(e) =>
                      setFormData({ ...formData, translation: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-sm outline-none transition-all"
                    placeholder="Ví dụ: Kín"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Phiên âm
                </label>
                <input
                  type="text"
                  value={formData.phonetic}
                  onChange={(e) =>
                    setFormData({ ...formData, phonetic: e.target.value })
                  }
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-sm outline-none transition-all"
                  placeholder="Ví dụ: keen"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
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
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-xs appearance-none outline-none"
                  >
                    <option value="nung">Tiếng Nùng</option>
                    <option value="central">Tiếng Miền Trung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
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
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-xs appearance-none outline-none"
                  >
                    <option value="pending">CHỜ DUYỆT</option>
                    <option value="approved">HỢP LỆ</option>
                    <option value="rejected">TỪ CHỐI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Ví dụ sử dụng
                </label>
                <textarea
                  value={formData.example}
                  onChange={(e) =>
                    setFormData({ ...formData, example: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-medium text-sm outline-none transition-all resize-none"
                  placeholder="Nhập ví dụ minh họa..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border-2 border-black bg-white font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white border-2 border-black font-bold uppercase text-[10px] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  Lưu từ vựng
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
