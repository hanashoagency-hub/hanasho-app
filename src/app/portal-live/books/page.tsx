"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, BookMarked, Upload, ImageIcon, X, FileText, CheckCircle2 } from "lucide-react";
import {
  createBookAction,
  updateBookAction,
  deleteBookAction,
  toggleBookPublishAction,
  getAdminBooksAction,
  uploadBookCoverAction,
  uploadBookFileAction,
} from "./actions";

const COVER_MAX_WIDTH = 1200;

async function compressCoverImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, COVER_MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image compression failed"))),
      "image/webp",
      0.85
    );
  });
}

interface Book {
  id: string;
  title: string;
  description: string;
  author: string;
  cover_image: string;
  file_url: string;
  price: number;
  category: string;
  benefits: string;
  is_published: boolean;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);

  const defaultForm = {
    title: "", description: "", author: "", cover_image: "", file_url: "",
    price: 0, category: "", benefits: "",
  };
  const [form, setForm] = useState(defaultForm);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBooks = async () => {
    const res = await getAdminBooksAction();
    if (res.success) setBooks(res.data as Book[]);
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const openCreate = () => {
    setEditingBook(null);
    setForm(defaultForm);
    setFileName("");
    setShowModal(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title, description: book.description || "", author: book.author || "",
      cover_image: book.cover_image || "", file_url: book.file_url || "",
      price: book.price, category: book.category || "", benefits: book.benefits || "",
    });
    setFileName(book.file_url ? "Existing file" : "");
    setShowModal(true);
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setCoverError("Please choose a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setCoverError("Image is too large. Please choose a file under 10MB.");
      e.target.value = "";
      return;
    }

    setCoverError("");
    setUploadingCover(true);
    try {
      const compressed = await compressCoverImage(file);
      const formData = new FormData();
      formData.append("file", compressed, "cover.webp");
      const res = await uploadBookCoverAction(formData);
      if (res.success && res.url) {
        setForm((f) => ({ ...f, cover_image: res.url as string }));
      } else {
        setCoverError(res.error || "Upload failed. Please try again.");
      }
    } catch {
      setCoverError("Upload failed. Please try again.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["application/pdf", "application/epub+zip"].includes(file.type)) {
      setFileError("Please choose a PDF or ePub file.");
      e.target.value = "";
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setFileError("File is too large. Please choose a file under 100MB.");
      e.target.value = "";
      return;
    }

    setFileError("");
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadBookFileAction(formData);
      if (res.success && res.url) {
        setForm((f) => ({ ...f, file_url: res.url as string }));
        setFileName(res.fileName || file.name);
      } else {
        setFileError(res.error || "Upload failed. Please try again.");
      }
    } catch {
      setFileError("Upload failed. Please try again.");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingBook) {
        await updateBookAction(editingBook.id, form);
      } else {
        await createBookAction(form);
      }
      setShowModal(false);
      fetchBooks();
    } catch {
      alert("Error saving book");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ma hubtaa inaad tirtirto buugan?")) {
      await deleteBookAction(id);
      fetchBooks();
    }
  };

  const togglePublish = async (book: Book) => {
    await toggleBookPublishAction(book.id, !book.is_published);
    fetchBooks();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Book Management</h1>
          <p className="text-white/50 mt-1">Create and manage books for sale.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" /> New Book
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <BookMarked className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Books Yet</h3>
          <p className="text-white/50 mb-6">Add your first book to start selling.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" /> Create Book
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {books.map((book) => (
            <div key={book.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex items-center gap-6 group hover:border-white/20 transition-colors">
              {book.cover_image ? (
                <img src={book.cover_image} alt={book.title} className="w-16 h-24 object-cover rounded-xl flex-shrink-0" />
              ) : (
                <div className="w-16 h-24 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookMarked className="w-6 h-6 text-white/20" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white truncate">{book.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${book.is_published ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                    {book.is_published ? "Published" : "Draft"}
                  </span>
                  {book.file_url && (
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> File attached
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-sm line-clamp-1">{book.author ? `${book.author} — ` : ""}{book.description || "No description"}</p>
              </div>
              <div className="text-right mr-4 flex-shrink-0">
                <p className="text-white/50 text-xs uppercase tracking-wider">Price</p>
                <span className="font-bold text-white text-lg">${book.price}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => togglePublish(book)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title={book.is_published ? "Unpublish" : "Publish"}>
                  {book.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(book)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(book.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingBook ? "Edit Book" : "Create New Book"}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Book Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="e.g. The AI Playbook" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Author</label>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="e.g. Buzuri" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Cover Image</label>
                {coverError && <p className="text-red-400 text-xs mb-2">{coverError}</p>}
                {form.cover_image ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 group w-40">
                    <img src={form.cover_image} alt="Book cover" className="w-40 aspect-[2/3] object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button type="button" onClick={() => coverInputRef.current?.click()} className="flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-lg">
                        <Upload className="w-3.5 h-3.5" /> Replace
                      </button>
                      <button type="button" onClick={() => setForm({ ...form, cover_image: "" })} className="flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="book-cover-upload" className={`flex flex-col items-center justify-center gap-2 w-40 aspect-[2/3] rounded-xl border border-dashed cursor-pointer transition-colors ${uploadingCover ? "border-white/10 text-white/30" : "border-white/20 text-white/50 hover:border-white/40 hover:text-white hover:bg-white/5"}`}>
                    {uploadingCover ? (
                      <><Loader2 className="w-6 h-6 animate-spin" /><span className="text-xs">Uploading...</span></>
                    ) : (
                      <><ImageIcon className="w-7 h-7" /><span className="text-xs font-medium text-center px-2">Click to upload cover</span></>
                    )}
                  </label>
                )}
                <input id="book-cover-upload" ref={coverInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleCoverSelect} disabled={uploadingCover} className="hidden" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Book File (PDF or ePub)</label>
                {fileError && <p className="text-red-400 text-xs mb-2">{fileError}</p>}
                {form.file_url ? (
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl py-3 px-4">
                    <span className="flex items-center gap-2 text-sm text-green-400 truncate">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{fileName || "File uploaded"}</span>
                    </span>
                    <button type="button" onClick={() => { setForm({ ...form, file_url: "" }); setFileName(""); }} className="text-white/40 hover:text-red-400 flex-shrink-0 ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="book-file-upload" className={`flex items-center justify-center gap-2 py-4 rounded-xl border border-dashed cursor-pointer transition-colors ${uploadingFile ? "border-white/10 text-white/30" : "border-white/20 text-white/50 hover:border-white/40 hover:text-white hover:bg-white/5"}`}>
                    {uploadingFile ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Uploading...</span></>
                    ) : (
                      <><FileText className="w-5 h-5" /><span className="text-sm font-medium">Click to upload the book file</span></>
                    )}
                  </label>
                )}
                <input id="book-file-upload" ref={fileInputRef} type="file" accept="application/pdf,application/epub+zip" onChange={handleFileSelect} disabled={uploadingFile} className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Price ($)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Category</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="e.g. AI, Business" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Benefits (One per line)</label>
                <textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" placeholder="Step-by-step frameworks&#10;Real-world case studies..." />
              </div>
            </div>

            <div className="flex gap-3 mt-8 border-t border-white/10 pt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title} className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingBook ? "Save Changes" : "Create Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
