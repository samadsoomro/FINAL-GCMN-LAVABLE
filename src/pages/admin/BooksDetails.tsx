import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Book,
  Plus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const Books: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [formData, setFormData] = useState({
    bookName: "",
    shortIntro: "",
    description: "",
    totalCopies: "1",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [borrows, setBorrows] = useState<any[]>([]);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchBooks();
    fetchBorrows();
  }, []);

  const fetchBorrows = async () => {
    try {
      const res = await fetch("/api/admin/borrowed-books");
      if (res.ok) {
        const data = await res.json();
        setBorrows(data);
      }
    } catch (error) {
      console.error("Error fetching borrows:", error);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        title: "Error",
        description: "Failed to fetch books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (books.length === 0) {
      toast({
        title: "No Data",
        description: "No books to download.",
        variant: "destructive",
      });
      return;
    }
    const excelData = books.map((book) => ({
      "Book Name": book.bookName,
      "Short Intro": book.shortIntro || "-",
      Description: book.description || "-",
      "Created At": new Date(book.createdAt).toLocaleDateString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Books");
    XLSX.writeFile(workbook, "books-report.xlsx");
    toast({ title: "Success", description: "Excel report downloaded." });
  };

  const downloadPDF = () => {
    if (books.length === 0) {
      toast({
        title: "No Data",
        description: "No books to download.",
        variant: "destructive",
      });
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("GCMN Library - Books Report", 10, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 30);

    let y = 40;
    books.forEach((book, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${book.bookName}`, 10, y);
      doc.setFont("helvetica", "normal");
      doc.text(`Intro: ${book.shortIntro || "N/A"}`, 15, y + 5);
      y += 15;
    });
    doc.save("books-report.pdf");
    toast({ title: "Success", description: "PDF report downloaded." });
  };

  const handleEdit = (book: any) => {
    setSelectedBook(book);
    setFormData({
      bookName: book.bookName,
      shortIntro: book.shortIntro || "",
      description: book.description || "",
      totalCopies: String(book.totalCopies || 1),
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      const res = await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Success", description: "Book deleted successfully" });
        fetchBooks();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append("bookName", formData.bookName);
      submitData.append("shortIntro", formData.shortIntro);
      submitData.append("description", formData.description);
      submitData.append("totalCopies", formData.totalCopies);
      if (selectedFile) {
        submitData.append("bookImage", selectedFile);
      }

      const url = isEditing
        ? `/api/admin/books/${selectedBook.id}`
        : "/api/admin/books";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: submitData,
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `Book ${isEditing ? "updated" : "added"} successfully`,
        });
        setIsEditing(false);
        setSelectedBook(null);
        setFormData({
          bookName: "",
          shortIntro: "",
          description: "",
          totalCopies: "1",
        });
        setSelectedFile(null);
        fetchBooks();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to save book",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save book",
        variant: "destructive",
      });
    }
  };

  const handleReturn = async (borrowId: string) => {
    try {
      const res = await fetch(`/api/book-borrows/${borrowId}/return`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast({ title: "Success", description: "Book marked as returned" });
        fetchBorrows();
        fetchBooks();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to return book",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to return book",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) return <Navigate to="/login" />;

  const filteredBooks = books.filter((book) =>
    book.bookName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Books</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadExcel} className="gap-2">
            <FileSpreadsheet size={16} /> Excel
          </Button>
          <Button variant="outline" onClick={downloadPDF} className="gap-2">
            <Download size={16} /> PDF
          </Button>
          <Button variant="outline" onClick={fetchBooks} className="gap-2">
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setSelectedBook(null);
              setFormData({
                bookName: "",
                shortIntro: "",
                description: "",
                totalCopies: "1",
              });
            }}
            className="gap-2"
          >
            <Plus size={16} /> Add New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Book" : "Add New Book"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Book Name *</label>
                <Input
                  required
                  value={formData.bookName}
                  onChange={(e) =>
                    setFormData({ ...formData, bookName: e.target.value })
                  }
                  placeholder="Enter book title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Intro *</label>
                <Input
                  required
                  value={formData.shortIntro}
                  onChange={(e) =>
                    setFormData({ ...formData, shortIntro: e.target.value })
                  }
                  placeholder="Brief overview"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detailed book information"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Copies *</label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={formData.totalCopies}
                  onChange={(e) =>
                    setFormData({ ...formData, totalCopies: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Book Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {isEditing && selectedBook?.bookImage && !selectedFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current image: {selectedBook.bookImage.split("/").pop()}
                  </p>
                )}
              </div>
              <div className="pt-2 flex gap-2">
                <Button type="submit" className="flex-1">
                  {isEditing ? "Update Book" : "Add Book"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Book Catalog</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                <Book className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No books found in the catalog.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex gap-4 p-5 rounded-xl border bg-gradient-to-br from-white to-slate-50/50 hover:shadow-xl transition-all duration-300 group border-slate-200/60"
                  >
                    <div className="w-24 h-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300 ring-4 ring-white">
                      {book.bookImage ? (
                        <img
                          src={book.bookImage}
                          alt={book.bookName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                          <ImageIcon size={32} />
                          <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-xl truncate text-slate-800 tracking-tight group-hover:text-primary transition-colors">
                          {book.bookName}
                        </h3>
                        <div className="flex flex-col items-end gap-1.5">
                          <div
                            className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${parseInt(book.availableCopies || "0") > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                          >
                            {book.availableCopies || 0} /{" "}
                            {book.totalCopies || 0}
                          </div>
                          {parseInt(book.totalCopies || "0") -
                            parseInt(book.availableCopies || "0") >
                            0 && (
                            <div className="text-[9px] text-blue-600 font-black uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                              Borrowed:{" "}
                              {parseInt(book.totalCopies || "0") -
                                parseInt(book.availableCopies || "0")}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1 mb-4 italic">
                        {book.shortIntro || "No introductory text provided"}
                      </p>

                      {/* Borrowers list */}
                      {borrows.filter(
                        (b) => b.bookId === book.id && b.status === "borrowed",
                      ).length > 0 && (
                        <div className="mb-4 space-y-2 p-3 bg-white/60 rounded-lg border border-slate-100 shadow-inner">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                            <RefreshCw
                              size={10}
                              className="animate-spin-slow"
                            />{" "}
                            Active Borrowers
                          </p>
                          {borrows
                            .filter(
                              (b) =>
                                b.bookId === book.id && b.status === "borrowed",
                            )
                            .map((b) => (
                              <div
                                key={b.id}
                                className="flex items-center justify-between text-[11px] bg-slate-50/80 p-2 rounded-md border border-slate-100/50 group/row"
                              >
                                <span className="truncate max-w-[120px] font-bold text-slate-700">
                                  {b.userId}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
                                  onClick={() => handleReturn(b.id)}
                                >
                                  Return Asset
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}

                      <div className="flex gap-2.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(book)}
                          className="h-8 text-[11px] font-bold uppercase tracking-wider rounded-lg border-slate-200 hover:bg-slate-50"
                        >
                          <Pencil size={12} className="mr-1.5 text-blue-600" />{" "}
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[11px] font-bold uppercase tracking-wider rounded-lg border-rose-100 text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(book.id)}
                        >
                          <Trash2 size={12} className="mr-1.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Books;
