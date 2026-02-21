import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  CreditCard,
  LogOut,
  Mail,
  Gift,
  Trash2,
  CheckCircle,
  Download,
  BarChart3,
  RefreshCw,
  FileText,
  Archive,
  Book,
  Eye,
  Shield,
  Calendar,
  ArrowRight,
  MoreVertical,
  Clock,
  Bell,
  PenTool,
  User,
  MapPin,
  UserPlus,
  Phone,
  Palette,
  History,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import collegeLogo from "@/assets/images/college-logo.png";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { useBranding } from "@/contexts/BrandingContext";

import Books from "./admin/BooksDetails";
import Notifications from "./admin/Notifications";
import AdminBlog from "./admin/Blog";
import AdminPrincipal from "./admin/AdminPrincipal";
import AdminFaculty from "./admin/AdminFaculty";
import Addresses from "./admin/Addresses";
import RegisteredPeople from "./admin/RegisteredPeople";
import AdminHome from "./admin/AdminHome";
import AdminHistory from "./admin/AdminHistory";
import ThemeBranding from "./admin/ThemeBranding";
import AdminCredentials from "./admin/AdminCredentials";
import InstituteAddress from "./admin/InstituteAddress";

export default function AdminDashboard() {
  const [activeModule, setActiveModule] = useState("messages");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [libraryCards, setLibraryCards] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [notes, setNotes] = useState([]);
  const [rareBooks, setRareBooks] = useState([]);
  const [booksDetails, setBooksDetails] = useState([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [isFieldsLoading, setIsFieldsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    totalCopies: 1,
    availableCopies: 1,
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [noteForm, setNoteForm] = useState({
    class: "",
    subject: "",
    title: "",
    description: "",
    pdfPath: "",
    status: "active",
  });
  const [rareBookForm, setRareBookForm] = useState({
    title: "",
    description: "",
    category: "",
    status: "active",
  });
  const [blogForm, setBlogForm] = useState({ title: "", content: "" }); // Placeholder if needed, but AdminBlog handles its own state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { logout, isAdmin } = useAuth();
  const { settings } = useBranding();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getNormalizedType = (u: any) => {
    const role = (u.role || "").toLowerCase();
    const type = (u.type || "").toLowerCase();
    if (type === "admin" || role === "admin") return "admin";
    if (type === "student" || role === "student") return "student";
    if (
      role.includes("staff") ||
      role.includes("professor") ||
      role.includes("librarian")
    )
      return "staff";
    return "visitor";
  };

  const studentCountValue = users.filter(
    (u: any) => getNormalizedType(u) === "student",
  ).length;
  const staffCountValue = users.filter(
    (u: any) => getNormalizedType(u) === "staff",
  ).length;
  const visitorCountValue = users.filter(
    (u: any) => getNormalizedType(u) === "visitor",
  ).length;
  const totalDonationsValue = donations.reduce(
    (sum, d: any) => sum + parseFloat(d.amount || 0),
    0,
  );

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
    } else {
      fetchMessages();
    }
  }, [isAdmin, navigate]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contact-messages", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers([...(data.students || []), ...(data.nonStudents || [])]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLibraryCards = async () => {
    try {
      setLoading(true);

      // Fetch cards
      const res = await fetch("/api/admin/library-cards", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLibraryCards(data);
      }

      // Fetch dynamic field definitions
      const fieldRes = await fetch("/api/library-card-fields");
      if (fieldRes.ok) {
        const fields = await fieldRes.json();
        setCustomFields(fields.filter((f: any) => f.showInAdmin));
      }
    } catch (error) {
      console.error("Error fetching library cards or fields:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/borrowed-books", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBorrowedBooks(data);
      }
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/donations", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notes", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const [rareBookFiles, setRareBookFiles] = useState<{
    pdf: File | null;
    image: File | null;
  }>({ pdf: null, image: null });

  const fetchRareBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/rare-books", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRareBooks(data);
      }
    } catch (error) {
      console.error("Error fetching rare books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Blog handling is self-contained in AdminBlog component

  const deleteRareBook = async (id: string) => {
    if (!confirm("Delete this rare book?")) return;
    try {
      const res = await fetch(`/api/admin/rare-books/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setRareBooks(rareBooks.filter((b: any) => b.id !== id));
        toast({
          title: "Deleted",
          description: "Rare book deleted successfully.",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to delete rare book",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rare book.",
        variant: "destructive",
      });
    }
  };

  const handleRareBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", rareBookForm.title);
      formData.append("description", rareBookForm.description);
      formData.append("category", rareBookForm.category);
      formData.append("status", rareBookForm.status);
      if (rareBookFiles.pdf) formData.append("file", rareBookFiles.pdf);
      if (rareBookFiles.image)
        formData.append("coverImage", rareBookFiles.image);

      const res = await fetch("/api/admin/rare-books", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Rare book uploaded successfully",
        });
        setRareBookForm({
          title: "",
          description: "",
          category: "",
          status: "active",
        });
        setRareBookFiles({ pdf: null, image: null });
        fetchRareBooks();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Upload failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Upload failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBooksDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/books", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBooksDetails(data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", eventForm.title);
      formData.append("description", eventForm.description);
      formData.append("date", eventForm.date);

      const fileInput = document.getElementById(
        "eventImages",
      ) as HTMLInputElement;
      if (fileInput?.files) {
        for (let i = 0; i < fileInput.files.length; i++) {
          formData.append("eventImages", fileInput.files[i]);
        }
      }

      const res = await fetch("/api/admin/events", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast({ title: "Success", description: "Event added successfully" });
        setEventForm({ title: "", description: "", date: "" });
        fetchEvents();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to add event",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setEvents(events.filter((e: any) => e.id !== id));
        toast({ title: "Deleted", description: "Event deleted successfully." });
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to delete event",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/admin/books-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookForm),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Book added successfully" });
        setBookForm({
          title: "",
          author: "",
          isbn: "",
          category: "",
          totalCopies: 1,
          availableCopies: 1,
        });
        fetchBooksDetails();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to add book",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    try {
      const res = await fetch(`/api/admin/books-details/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setBooksDetails(booksDetails.filter((b: any) => b.id !== id));
        toast({ title: "Deleted", description: "Book deleted successfully." });
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to delete book",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book.",
        variant: "destructive",
      });
    }
  };

  const approveLibraryCardHandler = async (id: string) => {
    try {
      const res = await fetch(`/api/library-card-applications/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (res.ok) {
        setLibraryCards(
          libraryCards.map((c) =>
            c.id === id ? { ...c, status: "approved" } : c,
          ),
        );
        toast({
          title: "Approved",
          description: "Library card approved successfully.",
        });
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to approve");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve library card.",
        variant: "destructive",
      });
    }
  };

  const handleModuleChange = async (module: string) => {
    setActiveModule(module);
    switch (module) {
      case "messages":
        await fetchMessages();
        break;
      case "users":
        await fetchUsers();
        break;
      case "library-cards":
        await fetchLibraryCards();
        break;
      case "books":
        await fetchBorrowedBooks();
        break;
      case "donations":
        await fetchDonations();
        break;
      case "notes":
        await fetchNotes();
        break;
      case "rare-books":
        await fetchRareBooks();
        break;
      case "books-details":
        await fetchBooksDetails();
        break;
      case "events":
        await fetchEvents();
        break;
      case "addresses":
        // Address fetching is handled inside the component
        break;
      case "institute-address":
        // Handled inside component
        break;
      // Blog self-fetches
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const downloadExcel = (
    data: any[],
    filename: string,
    moduleType?: string,
  ) => {
    const wb = XLSX.utils.book_new();

    // Prepare data with proper columns based on module type
    let exportData: any[] = [];
    let headers: string[] = [];

    if (moduleType === "library-cards") {
      headers = [
        "S.No",
        "Card ID",
        "Student Name",
        "Father Name",
        "Date of Birth",
        "Email",
        "Phone",
        "Address",
        "Status",
        "Date Issued",
      ];
      exportData = (data as any[]).map((card, idx) => ({
        "S.No": idx + 1,
        "Card ID": card.cardNumber || "-",
        "Student Name": `${card.firstName || ""} ${card.lastName || ""}`.trim(),
        "Father Name": card.fatherName || "-",
        "Date of Birth": card.dob || "-",
        Email: card.email || "-",
        Phone: card.phone || "-",
        Address: card.addressStreet || "-",
        Status: card.status || "Pending",
        "Date Issued": new Date(card.createdAt).toLocaleDateString() || "-",
      }));
    } else if (moduleType === "messages") {
      headers = ["S.No", "From", "Email", "Subject", "Message", "Date"];
      exportData = (data as any[]).map((msg, idx) => ({
        "S.No": idx + 1,
        From: msg.name || "-",
        Email: msg.email || "-",
        Subject: msg.subject || "-",
        Message: msg.message || "-",
        Date: new Date(msg.createdAt).toLocaleDateString() || "-",
      }));
    } else if (moduleType === "borrowed-books") {
      headers = [
        "Serial No",
        "Borrower Name",
        "Phone Number",
        "Email Address",
        "Book Name",
        "Borrow Date",
        "Return Date (auto)",
        "Status",
      ];
      exportData = (data as any[]).map((book, idx) => ({
        "Serial No": idx + 1,
        "Borrower Name": book.borrowerName || "-",
        "Phone Number": book.borrowerPhone || "-",
        "Email Address": book.borrowerEmail || "-",
        "Book Name": book.bookTitle || "-",
        "Borrow Date": new Date(book.borrowDate).toLocaleDateString() || "-",
        "Return Date (auto)": book.dueDate
          ? new Date(book.dueDate).toLocaleDateString()
          : book.returnDate
            ? new Date(book.returnDate).toLocaleDateString()
            : "-",
        Status: book.status || "-",
      }));
    } else if (moduleType === "users") {
      headers = [
        "S.No",
        "Full Name",
        "Email",
        "Phone",
        "Type",
        "Registration Date",
      ];
      exportData = (data as any[]).map((user, idx) => ({
        "S.No": idx + 1,
        "Full Name": user.fullName || user.full_name || "-",
        Email: user.email || "-",
        Phone: user.phone || "-",
        Type: user.type || "User",
        "Registration Date":
          new Date(user.createdAt).toLocaleDateString() || "-",
      }));
    } else if (moduleType === "donations") {
      headers = ["S.No", "Donor Name", "Email", "Amount (PKR)", "Date"];
      exportData = (data as any[]).map((donation, idx) => ({
        "S.No": idx + 1,
        "Donor Name": donation.donorName || "-",
        Email: donation.email || "-",
        "Amount (PKR)": parseFloat(donation.amount || 0).toLocaleString(),
        Date: new Date(donation.createdAt).toLocaleDateString() || "-",
      }));
    } else if (moduleType === "notes") {
      headers = ["S.No", "Class", "Subject", "Title", "Status", "Date Added"];
      exportData = (data as any[]).map((note, idx) => ({
        "S.No": idx + 1,
        Class: note.class || "-",
        Subject: note.subject || "-",
        Title: note.title || "-",
        Status: note.status || "-",
        "Date Added": new Date(note.createdAt).toLocaleDateString() || "-",
      }));
    } else if (moduleType === "rare-books") {
      headers = ["S.No", "Title", "Category", "Status", "Date Added"];
      exportData = (data as any[]).map((book, idx) => ({
        "S.No": idx + 1,
        Title: book.title || "-",
        Category: book.category || "-",
        Status: book.status || "-",
        "Date Added": new Date(book.createdAt).toLocaleDateString() || "-",
      }));
    } else if (moduleType === "events") {
      headers = ["S.No", "Title", "Date", "Description"];
      exportData = (data as any[]).map((event, idx) => ({
        "S.No": idx + 1,
        Title: event.title || "-",
        Date: event.date || "-",
        Description: event.description || "-",
      }));
    } else {
      exportData = data;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = headers.map((h) => Math.max(h.length + 2, 12));
    ws["!cols"] = colWidths.map((w) => ({ wch: w }));

    // Style header row with green background
    const headerCells = XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: headers.length - 1, r: 0 },
    });
    for (let C = 0; C < headers.length; C++) {
      const cellAddress = XLSX.utils.encode_col(C) + "1";
      if (!ws[cellAddress]) continue;
      ws[cellAddress].fill = { type: "solid", fgColor: { rgb: "FF22C55E" } };
      ws[cellAddress].font = { bold: true, color: { rgb: "FFFFFFFF" } };
      ws[cellAddress].alignment = { horizontal: "center", vertical: "center" };
    }

    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString()}.xlsx`);
  };

  const downloadPDF = (title: string, data: any[], moduleType?: string) => {
    try {
      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "No data available to export.",
          variant: "destructive",
        });
        return;
      }

      const doc = new jsPDF("l", "mm", "a4");
      const pageWidth = 297;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 10;
      const rowHeight = 10;
      const headerHeight = 11;
      const usableWidth = pageWidth - 2 * margin;

      // Green header section
      doc.setFillColor(22, 78, 59);
      doc.rect(0, 0, pageWidth, 22, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${settings.instituteFullName}`, pageWidth / 2, 9, {
        align: "center",
      });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(title, pageWidth / 2, 16.5, { align: "center" });

      let y = 28;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);

      y = 35;

      // Define headers and column weight distribution (proportional to content width)
      let headers: string[] = [];
      let colWeights: number[] = [];

      if (moduleType === "library-cards") {
        headers = [
          "S.No",
          "Card ID",
          "Student Name",
          "Father Name",
          "DOB",
          "Email",
          "Phone",
          "Address",
          "Status",
        ];
        colWeights = [0.6, 1.0, 1.8, 1.5, 1.2, 1.5, 1.2, 2.0, 1.0];
      } else if (moduleType === "messages") {
        headers = ["S.No", "From", "Email", "Subject", "Message", "Date"];
        colWeights = [0.6, 1.3, 1.5, 2.0, 3.0, 1.2];
      } else if (moduleType === "borrowed-books") {
        headers = [
          "Serial No",
          "Borrower Name",
          "Phone Number",
          "Email Address",
          "Book Name",
          "Borrow Date",
          "Return Date (auto)",
        ];
        colWeights = [0.8, 1.8, 1.4, 2.0, 2.0, 1.2, 1.2];
      } else if (moduleType === "users") {
        headers = ["S.No", "Full Name", "Email", "Phone", "Type", "Reg Date"];
        colWeights = [0.6, 1.8, 1.8, 1.3, 0.8, 1.2];
      } else if (moduleType === "donations") {
        headers = ["S.No", "Donor Name", "Email", "Amount", "Date"];
        colWeights = [0.6, 1.8, 1.8, 1.2, 1.2];
      } else if (moduleType === "notes") {
        headers = ["S.No", "Class", "Subject", "Title", "Status"];
        colWeights = [0.6, 1.2, 1.5, 2.5, 1.0];
      } else if (moduleType === "rare-books") {
        headers = ["S.No", "Title", "Category", "Status"];
        colWeights = [0.6, 2.5, 1.5, 1.0];
      } else if (moduleType === "events") {
        headers = ["S.No", "Title", "Date", "Description"];
        colWeights = [0.6, 2.0, 1.5, 3.5];
      }

      // Calculate proportional column widths to fill available width
      const totalWeight = colWeights.reduce((a, b) => a + b, 0);
      const colWidths = colWeights.map((w) => (w / totalWeight) * usableWidth);

      const drawHeader = () => {
        doc.setFillColor(34, 197, 94);
        let x = margin;
        headers.forEach((col, i) => {
          // Fill background
          doc.setFillColor(34, 197, 94);
          doc.rect(x, y, colWidths[i], headerHeight, "F");

          // Draw border
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.35);
          doc.rect(x, y, colWidths[i], headerHeight);

          // Draw text
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          const textY = y + 6.5;
          doc.text(col, x + 1.5, textY, {
            maxWidth: colWidths[i] - 3,
            align: "left",
          });
          x += colWidths[i];
        });
        y += headerHeight;
      };

      drawHeader();

      // Draw data rows
      data.forEach((item: any, idx: number) => {
        // Check if new page is needed
        if (y + rowHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          drawHeader();
        }

        let rowData: string[] = [];

        if (moduleType === "library-cards") {
          rowData = [
            String(idx + 1),
            item.cardNumber || "-",
            `${item.firstName || ""} ${item.lastName || ""}`.trim() || "-",
            item.fatherName || "-",
            item.dob || "-",
            item.email || "-",
            item.phone || "-",
            item.addressStreet || "-",
            item.status || "Pending",
          ];
        } else if (moduleType === "messages") {
          rowData = [
            String(idx + 1),
            item.name || "-",
            item.email || "-",
            item.subject || "-",
            (item.message || "-").substring(0, 40),
            new Date(item.createdAt).toLocaleDateString(),
          ];
        } else if (moduleType === "borrowed-books") {
          rowData = [
            String(idx + 1),
            item.borrowerName || "-",
            item.borrowerPhone || "-",
            item.borrowerEmail || "-",
            item.bookTitle || "-",
            new Date(item.borrowDate).toLocaleDateString(),
            item.dueDate
              ? new Date(item.dueDate).toLocaleDateString()
              : item.returnDate
                ? new Date(item.returnDate).toLocaleDateString()
                : "-",
          ];
        } else if (moduleType === "users") {
          rowData = [
            String(idx + 1),
            item.fullName || item.full_name || "-",
            item.email || "-",
            item.phone || "-",
            item.type || "User",
            new Date(item.createdAt).toLocaleDateString(),
          ];
        } else if (moduleType === "donations") {
          rowData = [
            String(idx + 1),
            item.donorName || "-",
            item.email || "-",
            `PKR ${parseFloat(item.amount || 0).toLocaleString()}`,
            new Date(item.createdAt).toLocaleDateString(),
          ];
        } else if (moduleType === "notes") {
          rowData = [
            String(idx + 1),
            item.class || "-",
            item.subject || "-",
            item.title || "-",
            item.status || "-",
          ];
        } else if (moduleType === "rare-books") {
          rowData = [
            String(idx + 1),
            item.title || "-",
            item.category || "-",
            item.status || "-",
          ];
        } else if (moduleType === "events") {
          rowData = [
            String(idx + 1),
            item.title || "-",
            item.date || "-",
            (item.description || "-").substring(0, 100),
          ];
        }

        // Alternating row colors
        if (idx % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          let x = margin;
          colWidths.forEach((w) => {
            doc.rect(x, y, w, rowHeight, "F");
            x += w;
          });
        }

        // Draw cell borders and text
        let x = margin;
        rowData.forEach((text, i) => {
          // Draw border
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.2);
          doc.rect(x, y, colWidths[i], rowHeight);

          // Draw text
          doc.setTextColor(40, 40, 40);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const textY = y + 6;
          doc.text(text, x + 1.5, textY, {
            maxWidth: colWidths[i] - 3,
            align: "left",
          });
          x += colWidths[i];
        });

        y += rowHeight;
      });

      const filename = `${title.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`;
      doc.save(filename);
      toast({ title: "Success", description: "PDF downloaded successfully." });
    } catch (error: any) {
      console.error("PDF generation error:", error?.message || error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/contact-messages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id));
        toast({
          title: "Deleted",
          description: "Message deleted successfully.",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to delete message",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const deleteLibraryCard = async (id: string) => {
    if (!confirm("Delete this library card?")) return;
    try {
      const res = await fetch(`/api/library-card-applications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setLibraryCards(libraryCards.filter((c) => c.id !== id));
        toast({
          title: "Deleted",
          description: "Library card deleted successfully.",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to delete library card",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete library card.",
        variant: "destructive",
      });
    }
  };

  const deleteBorrowedBook = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    try {
      const res = await fetch(`/api/book-borrows/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setBorrowedBooks(borrowedBooks.filter((b) => b.id !== id));
        toast({
          title: "Deleted",
          description: "Book record deleted successfully.",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to delete book record",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book record.",
        variant: "destructive",
      });
    }
  };

  const approveLibraryCard = async (id: string) => {
    try {
      await fetch(`/api/library-card-applications/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      setLibraryCards(
        libraryCards.map((c) =>
          c.id === id ? { ...c, status: "approved" } : c,
        ),
      );
      toast({ title: "Approved", description: "Library card approved." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve.",
        variant: "destructive",
      });
    }
  };

  const deleteDonation = async (id: string) => {
    if (!confirm("Delete this donation?")) return;
    try {
      const res = await fetch(`/api/admin/donations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDonations(donations.filter((d) => d.id !== id));
        toast({
          title: "Deleted",
          description: "Donation deleted successfully.",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to delete donation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete donation.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This will also remove their profile.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setUsers(users.filter((u: any) => u.id !== id));
        toast({ title: "Deleted", description: "User deleted successfully." });
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/admin/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setNotes(notes.filter((n: any) => n.id !== id));
        toast({ title: "Deleted", description: "Note deleted successfully." });
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to delete note",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  const toggleNoteStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notes/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        fetchNotes();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to toggle status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle status.",
        variant: "destructive",
      });
    }
  };

  const toggleRareBookStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/rare-books/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        fetchRareBooks();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to toggle status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle status.",
        variant: "destructive",
      });
    }
  };

  // Stats calculations
  const borrowedCount = borrowedBooks.filter(
    (b) => b.status === "borrowed",
  ).length;
  const returnedCount = borrowedBooks.filter(
    (b) => b.status === "returned",
  ).length;
  const totalDonations = donations.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );
  const studentCount = users.filter((u) => u.type === "student").length;
  const registeredCount = users.filter(
    (u) => u.type === "registered people",
  ).length;
  const adminCount = users.filter((u) => u.type === "admin").length;

  const modules = [
    {
      id: "books",
      label: "Borrowed Books",
      icon: BookOpen,
      count: borrowedBooks.length,
    },
    { id: "users", label: "Users", icon: Users, count: users.length },
    {
      id: "registered-people",
      label: "Registered People",
      icon: UserPlus,
      count: registeredCount,
    },
    {
      id: "donations",
      label: "Donations",
      icon: Gift,
      count: donations.length,
    },
    { id: "notes", label: "Notes", icon: FileText, count: notes.length },
    {
      id: "rare-books",
      label: "Rare Books",
      icon: Archive,
      count: rareBooks?.length || 0,
    },
    { id: "blog", label: "Blog", icon: PenTool, count: 0 },
    { id: "notifications", label: "Notifications", icon: Bell, count: 0 },
  ];

  const cardsModules = [
    {
      id: "library-cards",
      label: "Cards",
      icon: CreditCard,
      count: libraryCards.length,
    },
    { id: "addresses", label: "Addresses (Students)", icon: MapPin, count: 0 },
  ];

  const contactModules = [
    { id: "messages", label: "Messages", icon: Mail, count: messages.length },
    {
      id: "institute-address",
      label: "Institute Address",
      icon: MapPin,
      count: 0,
    },
  ];

  const aboutModules = [
    { id: "history", label: "History of College", icon: History, count: 0 },
    { id: "principal", label: "Principal", icon: User, count: 0 },
    { id: "faculty", label: "Faculty", icon: Users, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 pt-16 flex">
      {/* Sticky Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto hidden lg:block z-30">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={18} />
            </div>
            <h2 className="font-bold text-neutral-900 tracking-tight">
              Admin Panel
            </h2>
          </div>

          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4 px-2">
            Main Menu
          </h2>
          <nav className="space-y-1">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleChange(module.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-primary"
                          : "text-neutral-400 group-hover:text-neutral-600"
                      }
                    />
                    <span
                      className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}
                    >
                      {module.label}
                    </span>
                  </div>
                  {module.count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {module.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* About Section */}
            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                About Section
              </p>
            </div>
            {aboutModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleChange(module.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-primary"
                          : "text-neutral-400 group-hover:text-neutral-600"
                      }
                    />
                    <span
                      className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}
                    >
                      {module.label}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Cards Management */}
            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Cards Management
              </p>
            </div>
            {cardsModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleChange(module.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-primary"
                          : "text-neutral-400 group-hover:text-neutral-600"
                      }
                    />
                    <span
                      className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}
                    >
                      {module.label}
                    </span>
                  </div>
                  {module.count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {module.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Contact Us */}
            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Contact Us
              </p>
            </div>
            {contactModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleChange(module.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-primary"
                          : "text-neutral-400 group-hover:text-neutral-600"
                      }
                    />
                    <span
                      className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}
                    >
                      {module.label}
                    </span>
                  </div>
                  {module.count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {module.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* System & Branding */}
            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                System & Branding
              </p>
            </div>
            <button
              onClick={() => handleModuleChange("branding")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeModule === "branding" ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"}`}
            >
              <Palette
                size={18}
                className={
                  activeModule === "branding"
                    ? "text-primary"
                    : "text-neutral-400 group-hover:text-neutral-600"
                }
              />
              <span
                className={`text-sm ${activeModule === "branding" ? "font-semibold" : "font-medium"}`}
              >
                Theme & Branding
              </span>
            </button>

            <button
              onClick={() => handleModuleChange("home-cms")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeModule === "home-cms" ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"}`}
            >
              <PenTool
                size={18}
                className={
                  activeModule === "home-cms"
                    ? "text-primary"
                    : "text-neutral-400 group-hover:text-neutral-600"
                }
              />
              <span
                className={`text-sm ${activeModule === "home-cms" ? "font-semibold" : "font-medium"}`}
              >
                Home CMS
              </span>
            </button>

            <button
              onClick={() => handleModuleChange("admin-credentials")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeModule === "admin-credentials" ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"}`}
            >
              <Shield
                size={18}
                className={
                  activeModule === "admin-credentials"
                    ? "text-primary"
                    : "text-neutral-400 group-hover:text-neutral-600"
                }
              />
              <span
                className={`text-sm ${activeModule === "admin-credentials" ? "font-semibold" : "font-medium"}`}
              >
                Admin Credentials
              </span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white border-b border-neutral-200 sticky top-16 z-30 p-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleChange(module.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-neutral-500 border border-neutral-200"
                }`}
              >
                <Icon size={14} />
                {module.label}
              </button>
            );
          })}

          {contactModules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleChange(module.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-neutral-500 border border-neutral-200"
                }`}
              >
                <Icon size={14} />
                {module.label}
              </button>
            );
          })}

          {aboutModules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleChange(module.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-neutral-500 border border-neutral-200"
                }`}
              >
                <Icon size={14} />
                {module.label}
              </button>
            );
          })}

          <button
            onClick={() => handleModuleChange("branding")}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeModule === "branding" ? "bg-primary text-white shadow-md" : "bg-white text-neutral-500 border border-neutral-200"}`}
          >
            <Palette size={14} />
            Theme & Branding
          </button>

          <button
            onClick={() => handleModuleChange("home-cms")}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeModule === "home-cms" ? "bg-primary text-white shadow-md" : "bg-white text-neutral-500 border border-neutral-200"}`}
          >
            <PenTool size={14} />
            Home CMS
          </button>

          <button
            onClick={() => handleModuleChange("admin-credentials")}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeModule === "admin-credentials" ? "bg-primary text-white shadow-md" : "bg-white text-neutral-500 border border-neutral-200"}`}
          >
            <Shield size={14} />
            Admin Credentials
          </button>
        </div>

        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 md:p-10 max-w-7xl mx-auto"
        >
          {/* Messages Module */}
          {activeModule === "messages" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-black text-neutral-900 tracking-tight">
                    Contact Messages
                  </h2>
                  <p className="text-neutral-500 mt-2 font-medium">
                    Manage inquiries and feedback from website visitors.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fetchMessages()}
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <RefreshCw size={18} className="text-primary" /> Refresh
                  </Button>
                  <div className="h-10 w-[1px] bg-neutral-200 hidden md:block"></div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      downloadExcel(messages, "Contact-Messages", "messages")
                    }
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <Download size={18} className="text-emerald-600" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      downloadPDF(
                        "Contact Messages Report",
                        messages,
                        "messages",
                      )
                    }
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <Download size={18} className="text-rose-600" /> PDF
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center p-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <Card className="p-20 text-center border-dashed bg-neutral-50/50">
                  <Mail className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900">
                    No Messages Yet
                  </h3>
                  <p className="text-neutral-500 mt-2">
                    When visitors contact you, they will appear here.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {messages.map((msg: any) => (
                    <Card
                      key={msg.id}
                      className="group p-6 rounded-3xl border-none bg-white shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 ring-1 ring-neutral-200/60 hover:ring-primary/20"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl shadow-inner">
                              {msg.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-neutral-900 text-lg leading-tight">
                                {msg.name}
                              </h4>
                              <p className="text-primary font-bold text-sm">
                                {msg.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMessage(msg.id)}
                            className="text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 size={20} />
                          </Button>
                        </div>

                        <div className="bg-neutral-50 p-5 rounded-2xl mb-6 flex-1 border border-neutral-100/80">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              Subject
                            </span>
                            <span className="h-[1px] flex-1 bg-neutral-200"></span>
                          </div>
                          <h5 className="font-black text-neutral-800 mb-3 text-base leading-snug">
                            {msg.subject}
                          </h5>
                          <p className="text-neutral-600 text-sm leading-relaxed font-medium line-clamp-4 group-hover:line-clamp-none transition-all duration-300">
                            {msg.message}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-50">
                          <div className="flex items-center gap-2 text-neutral-400 font-bold text-xs">
                            <Calendar size={14} />
                            {new Date(msg.createdAt).toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-tighter bg-neutral-100 text-neutral-500 px-3 py-1.5 rounded-full">
                            Contact Form
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Borrowed Books Module */}
          {activeModule === "books" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-black text-neutral-900 tracking-tight">
                    Borrowed Books
                  </h2>
                  <p className="text-neutral-500 mt-2 font-medium">
                    Monitor and manage book circulation across the library.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fetchBorrowedBooks()}
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <RefreshCw size={18} className="text-primary" /> Refresh
                  </Button>
                  <div className="h-10 w-[1px] bg-neutral-200 hidden md:block"></div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      downloadExcel(
                        borrowedBooks,
                        `${settings.instituteShortName}-Borrowed-Books-Report`,
                        "borrowed-books",
                      )
                    }
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <Download size={18} className="text-emerald-600" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      downloadPDF(
                        `${settings.instituteShortName} - Borrowed Books Report`,
                        borrowedBooks,
                        "borrowed-books",
                      )
                    }
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <Download size={18} className="text-rose-600" /> PDF
                  </Button>
                </div>
              </div>

              {/* Borrowed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Borrowed",
                    value: borrowedCount,
                    icon: BookOpen,
                    color: "primary",
                  },
                  {
                    label: "Returned",
                    value: returnedCount,
                    icon: CheckCircle,
                    color: "emerald",
                  },
                  {
                    label: "Total Records",
                    value: borrowedBooks.length,
                    icon: BarChart3,
                    color: "blue",
                  },
                  {
                    label: "Pending Users",
                    value:
                      users.length -
                      new Set(borrowedBooks.map((b: any) => b.userId)).size,
                    icon: Users,
                    color: "amber",
                  },
                ].map((stat, i) => (
                  <Card
                    key={i}
                    className="p-6 rounded-3xl border-none bg-white shadow-sm ring-1 ring-neutral-200/60 transition-all hover:shadow-md group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-black text-neutral-900 mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}
                      >
                        <stat.icon size={24} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center p-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : borrowedBooks.length === 0 ? (
                <Card className="p-20 text-center border-dashed bg-neutral-50/50">
                  <BookOpen className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900">
                    No Borrowed Records
                  </h3>
                  <p className="text-neutral-500 mt-2">
                    Circulation history will appear here once books are
                    borrowed.
                  </p>
                </Card>
              ) : (
                <Card className="rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 overflow-hidden ring-1 ring-neutral-200/60">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-100">
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Borrower Info
                          </th>
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Card & Serial
                          </th>
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Book Details
                          </th>
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Borrow Timeline
                          </th>
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Status
                          </th>
                          <th className="text-center py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                        {borrowedBooks.map((book: any, idx: number) => (
                          <tr
                            key={book.id}
                            className="group hover:bg-neutral-50/50 transition-colors"
                          >
                            <td className="py-5 px-6">
                              <div className="font-bold text-neutral-900">
                                {book.borrowerName || "-"}
                              </div>
                              <div className="text-xs text-neutral-500 font-medium">
                                {book.borrowerEmail || "-"}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-medium mt-0.5">
                                {book.borrowerPhone || "-"}
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1">
                                SN #{idx + 1}
                              </div>
                              <span className="bg-neutral-100 px-2 py-1 rounded text-[10px] font-black text-neutral-600">
                                {book.libraryCardId || "-"}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="font-black text-primary text-sm">
                                {book.bookTitle}
                              </div>
                              <div className="text-[10px] font-bold text-neutral-400 mt-0.5">
                                {book.bookAuthor || "Library Collection"}
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                  Out:{" "}
                                  {new Date(
                                    book.borrowDate,
                                  ).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-rose-500">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                  Due:{" "}
                                  {book.dueDate
                                    ? new Date(
                                        book.dueDate,
                                      ).toLocaleDateString()
                                    : book.returnDate
                                      ? new Date(
                                          book.returnDate,
                                        ).toLocaleDateString()
                                      : "-"}
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <span
                                className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                                  book.status === "borrowed"
                                    ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                                    : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 shadow-sm shadow-emerald-100"
                                }`}
                              >
                                {book.status}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {book.status === "borrowed" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (
                                        confirm("Mark this book as returned?")
                                      ) {
                                        fetch(
                                          `/api/book-borrows/${book.id}/return`,
                                          {
                                            method: "PATCH",
                                            credentials: "include",
                                          },
                                        ).then((res) => {
                                          if (res.ok) {
                                            fetchBorrowedBooks();
                                            toast({
                                              title: "Success",
                                              description:
                                                "Book marked as returned.",
                                            });
                                          }
                                        });
                                      }
                                    }}
                                    className="h-8 rounded-xl border-emerald-200 text-emerald-600 font-bold text-[10px] uppercase hover:bg-emerald-50"
                                  >
                                    Return
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteBorrowedBook(book.id)}
                                  className="h-8 w-8 text-neutral-300 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Library Cards Module */}
          {activeModule === "library-cards" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-black text-neutral-900 tracking-tight">
                    Cards
                  </h2>
                  <p className="text-neutral-500 mt-2 font-medium">
                    Manage student Card applications and issuance.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fetchLibraryCards()}
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <RefreshCw size={18} className="text-primary" /> Refresh
                  </Button>
                  <div className="h-10 w-[1px] bg-neutral-200 hidden md:block"></div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      downloadExcel(
                        libraryCards,
                        `${settings.instituteShortName}-Library-Cards-Report`,
                        "library-cards",
                      )
                    }
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <Download size={18} className="text-emerald-600" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      downloadPDF(
                        `${settings.instituteShortName} - Card Applications Report`,
                        libraryCards,
                        "library-cards",
                      )
                    }
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <Download size={18} className="text-rose-600" /> PDF
                  </Button>
                </div>
              </div>

              {/* Library Card Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    label: "Active Cards",
                    value: libraryCards.filter((c) => c.status === "approved")
                      .length,
                    icon: CheckCircle,
                    color: "emerald",
                  },
                  {
                    label: "Pending Apps",
                    value: libraryCards.filter(
                      (c) => !c.status || c.status === "pending",
                    ).length,
                    icon: Clock,
                    color: "amber",
                  },
                  {
                    label: "Total Applications",
                    value: libraryCards.length,
                    icon: CreditCard,
                    color: "primary",
                  },
                ].map((stat, i) => (
                  <Card
                    key={i}
                    className="p-6 rounded-3xl border-none bg-white shadow-sm ring-1 ring-neutral-200/60 transition-all hover:shadow-md group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-black text-neutral-900 mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-2xl bg-${stat.color === "primary" ? "primary/10" : stat.color + "-50"} text-${stat.color === "primary" ? "primary" : stat.color + "-600"} group-hover:scale-110 transition-transform`}
                      >
                        <stat.icon size={24} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center p-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : libraryCards.length === 0 ? (
                <Card className="p-20 text-center border-dashed bg-neutral-50/50">
                  <CreditCard className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900">
                    No Applications
                  </h3>
                  <p className="text-neutral-500 mt-2">
                    Library card applications will appear here once students
                    apply.
                  </p>
                </Card>
              ) : (
                <Card className="rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 overflow-hidden ring-1 ring-neutral-200/60">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-100">
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Student Details
                          </th>
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Card ID
                          </th>
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Contact
                          </th>
                          {customFields.map((f) => (
                            <th
                              key={f.id}
                              className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400"
                            >
                              {f.fieldLabel}
                            </th>
                          ))}
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Status
                          </th>
                          <th className="text-center py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                        {libraryCards.map((card: any, idx: number) => (
                          <tr
                            key={card.id}
                            className="group hover:bg-neutral-50/50 transition-colors"
                          >
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 text-sm">
                                  {card.firstName?.charAt(0)}
                                  {card.lastName?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-neutral-900">
                                    {card.firstName} {card.lastName}
                                  </div>
                                  <div className="text-xs text-neutral-400 font-medium">
                                    S/O: {card.fatherName || "-"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1">
                                SN #{idx + 1}
                              </div>
                              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-primary/20">
                                {card.cardNumber}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="text-xs font-bold text-neutral-700">
                                {card.email}
                              </div>
                              <div className="text-[10px] font-medium text-neutral-400 mt-1">
                                {card.phone}
                              </div>
                            </td>
                            {customFields.map((f) => (
                              <td key={f.id} className="py-5 px-6">
                                <div className="text-xs font-bold text-neutral-700">
                                  {card.dynamicFields?.[f.fieldKey] || "-"}
                                </div>
                              </td>
                            ))}
                            <td className="py-5 px-6">
                              <span
                                className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                                  card.status === "approved"
                                    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                    : card.status === "rejected"
                                      ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                                      : "bg-amber-100 text-amber-700 ring-1 ring-amber-200 animate-pulse"
                                }`}
                              >
                                {card.status || "pending"}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {card.status?.toLowerCase() === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      approveLibraryCardHandler(card.id)
                                    }
                                    className="h-8 rounded-xl border-primary/20 text-primary font-bold text-[10px] uppercase hover:bg-primary/5"
                                  >
                                    Approve
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteLibraryCard(card.id)}
                                  className="h-8 w-8 text-neutral-300 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeModule === "branding" && <ThemeBranding />}
          {activeModule === "admin-credentials" && <AdminCredentials />}
          {activeModule === "home-cms" && <AdminHome />}
          {activeModule === "addresses" && <Addresses />}
          {activeModule === "institute-address" && <InstituteAddress />}

          {/* Users Module */}
          {activeModule === "users" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-black text-neutral-900 tracking-tight">
                    Users
                  </h2>
                  <p className="text-neutral-500 mt-2 font-medium">
                    Overview of all system users and their roles.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fetchUsers()}
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <RefreshCw size={18} className="text-primary" /> Refresh
                  </Button>
                  <div className="h-10 w-[1px] bg-neutral-200 hidden md:block"></div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      downloadExcel(
                        users,
                        `${settings.instituteShortName}-Users-Report`,
                        "users",
                      )
                    }
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <Download size={18} className="text-emerald-600" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      downloadPDF(
                        `${settings.instituteShortName} - Users Report`,
                        users,
                        "users",
                      )
                    }
                    className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <Download size={18} className="text-rose-600" /> PDF
                  </Button>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    label: "Students",
                    value: studentCountValue,
                    icon: Users,
                    color: "primary",
                  },
                  {
                    label: "Staff Members",
                    value: staffCountValue,
                    icon: Shield,
                    color: "blue",
                  },
                  {
                    label: "External Visitors",
                    value: visitorCountValue,
                    icon: ArrowRight,
                    color: "emerald",
                  },
                ].map((stat, i) => (
                  <Card
                    key={i}
                    className="p-6 rounded-3xl border-none bg-white shadow-sm ring-1 ring-neutral-200/60 transition-all hover:shadow-md group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-black text-neutral-900 mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-2xl bg-${stat.color === "primary" ? "primary/10" : stat.color + "-50"} text-${stat.color === "primary" ? "primary" : stat.color + "-600"} group-hover:scale-110 transition-transform`}
                      >
                        <stat.icon size={24} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center p-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : users.length === 0 ? (
                <Card className="p-20 text-center border-dashed bg-neutral-50/50">
                  <Users className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900">
                    No Users Registered
                  </h3>
                  <p className="text-neutral-500 mt-2">
                    New user accounts will appear here once they sign up.
                  </p>
                </Card>
              ) : (
                <Card className="rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 overflow-hidden ring-1 ring-neutral-200/60">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-100">
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            User Identity
                          </th>
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Contact Details
                          </th>
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Classification
                          </th>
                          <th className="text-left py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Joined
                          </th>
                          <th className="text-center py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                        {users.map((user: any) => (
                          <tr
                            key={user.id}
                            className="group hover:bg-neutral-50/50 transition-colors"
                          >
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                    user.type === "admin"
                                      ? "bg-neutral-900 text-white"
                                      : user.type === "student"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-neutral-100 text-neutral-500"
                                  }`}
                                >
                                  {(
                                    user.fullName ||
                                    user.full_name ||
                                    user.username ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-neutral-900 flex items-center gap-2">
                                    {user.name ||
                                      user.fullName ||
                                      user.full_name ||
                                      "-"}{" "}
                                    -{" "}
                                    {user.type === "admin"
                                      ? "Library Admin"
                                      : user.type === "student"
                                        ? "Student Member"
                                        : user.role || "Registered Person"}
                                    {user.type === "admin" && (
                                      <span className="text-[8px] bg-neutral-900 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest shadow-sm">
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="text-xs font-bold text-neutral-700 font-mono italic">
                                {user.email || "-"}
                              </div>
                              <div className="text-[10px] font-medium text-neutral-400 mt-1 flex items-center gap-1">
                                <Phone size={10} className="text-primary" />{" "}
                                {user.phone || "No Phone"}
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <Badge
                                className={`rounded-lg border-none font-bold text-[10px] uppercase px-3 py-1 ${
                                  user.type === "admin"
                                    ? "bg-neutral-900 text-white"
                                    : user.type === "student"
                                      ? "bg-primary/10 text-primary"
                                      : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {user.role ||
                                  (user.type === "student"
                                    ? "Student"
                                    : "Visitor")}
                              </Badge>
                            </td>
                            <td className="py-5 px-6 font-bold text-neutral-400 text-xs">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    deleteUser(user.userId || user.id)
                                  }
                                  className="h-8 w-8 text-neutral-300 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                  disabled={
                                    user.id === "1" || user.id === "admin"
                                  }
                                  title={
                                    user.id === "1" || user.id === "admin"
                                      ? "Cannot delete admin"
                                      : "Delete User"
                                  }
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeModule === "registered-people" && <RegisteredPeople />}

          {/* History Module */}
          {activeModule === "history" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AdminHistory />
            </div>
          )}

          {/* Principal Module */}
          {activeModule === "principal" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AdminPrincipal />
            </div>
          )}

          {/* Faculty Module */}
          {activeModule === "faculty" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AdminFaculty />
            </div>
          )}

          {/* Donations Module */}
          {activeModule === "donations" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Donations</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchDonations()}
                    className="gap-2"
                  >
                    <RefreshCw size={16} /> Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadExcel(
                        donations,
                        `${settings.instituteShortName}-Donations-Report`,
                        "donations",
                      )
                    }
                    className="gap-2"
                  >
                    <Download size={16} /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadPDF(
                        `${settings.instituteShortName} - Donations Report`,
                        donations,
                        "donations",
                      )
                    }
                    className="gap-2"
                  >
                    <Download size={16} /> PDF
                  </Button>
                </div>
              </div>

              {/* Donation Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="p-4 hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md border-l-4 border-l-primary">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Total Fund
                      </p>
                      <p className="text-3xl font-black mt-1 text-primary">
                        PKR {totalDonationsValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Gift size={24} className="text-primary" />
                    </div>
                  </div>
                </Card>
                <Card className="p-4 hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md border-l-4 border-l-blue-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Contributors
                      </p>
                      <p className="text-3xl font-black mt-1 text-blue-600">
                        {donations.length}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Users size={24} className="text-blue-600" />
                    </div>
                  </div>
                </Card>
                <Card className="p-4 hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md border-l-4 border-l-emerald-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Avg. Impact
                      </p>
                      <p className="text-3xl font-black mt-1 text-emerald-600">
                        PKR{" "}
                        {donations.length > 0
                          ? Math.round(
                              totalDonationsValue / donations.length,
                            ).toLocaleString()
                          : "0"}
                      </p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <BarChart3 size={24} className="text-emerald-600" />
                    </div>
                  </div>
                </Card>
              </div>

              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : donations.length === 0 ? (
                <p className="text-muted-foreground">No donations yet</p>
              ) : (
                <Card className="p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2 px-2">Donor Name</th>
                        <th className="text-left py-2 px-2">Email</th>
                        <th className="text-left py-2 px-2">Amount (PKR)</th>
                        <th className="text-left py-2 px-2">Date</th>
                        <th className="text-center py-2 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation: any) => (
                        <tr
                          key={donation.id}
                          className="border-b hover:bg-muted/30"
                        >
                          <td className="py-2 px-2 font-bold text-primary">
                            {donation.donorName || "-"}
                          </td>
                          <td className="py-2 px-2 font-medium">
                            {donation.email || "-"}
                          </td>
                          <td className="py-2 px-2 font-bold text-primary">
                            {parseFloat(donation.amount || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteDonation(donation.id)}
                              className="text-destructive"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          )}

          {/* Notes Module */}
          {activeModule === "notes" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Study Notes Management</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNotes()}
                    className="gap-2"
                  >
                    <RefreshCw size={16} /> Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadExcel(
                        notes,
                        `${settings.instituteShortName}-Study-Notes-Report`,
                        "notes",
                      )
                    }
                    className="gap-2"
                  >
                    <Download size={16} /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadPDF(
                        `${settings.instituteShortName} - Study Notes Report`,
                        notes,
                        "notes",
                      )
                    }
                    className="gap-2"
                  >
                    <Download size={16} /> PDF
                  </Button>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Add Note Form */}
                <Card className="lg:col-span-1 p-6">
                  <h3 className="text-lg font-semibold mb-4">Add New Note</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Class</label>
                      <select
                        className="w-full mt-1 p-2 border rounded-md"
                        value={noteForm.class}
                        onChange={(e) =>
                          setNoteForm({ ...noteForm, class: e.target.value })
                        }
                      >
                        <option value="">Select Class</option>
                        <option>Class 11</option>
                        <option>Class 12</option>
                        <option>ADS I</option>
                        <option>ADS II</option>
                        <option>BSc Part 1</option>
                        <option>BSc Part 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="e.g., Mathematics"
                        value={noteForm.subject}
                        onChange={(e) =>
                          setNoteForm({ ...noteForm, subject: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="Note title"
                        value={noteForm.title}
                        onChange={(e) =>
                          setNoteForm({ ...noteForm, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="Note description"
                        value={noteForm.description}
                        onChange={(e) =>
                          setNoteForm({
                            ...noteForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Upload Notes (PDF)
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("note-file-input")?.click()
                          }
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {selectedFile ? "Change File" : "Browse"}
                        </Button>
                        <input
                          id="note-file-input"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.type !== "application/pdf") {
                                toast({
                                  title: "Invalid File",
                                  description: "Only PDF files are allowed",
                                  variant: "destructive",
                                });
                                return;
                              }
                              setSelectedFile(file);
                              setNoteForm({ ...noteForm, pdfPath: file.name });
                            }
                          }}
                        />
                      </div>
                      {selectedFile && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={async () => {
                        if (
                          noteForm.class &&
                          noteForm.subject &&
                          noteForm.title &&
                          noteForm.description &&
                          selectedFile
                        ) {
                          setLoading(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", selectedFile);
                            formData.append("class", noteForm.class);
                            formData.append("subject", noteForm.subject);
                            formData.append("title", noteForm.title);
                            formData.append(
                              "description",
                              noteForm.description,
                            );
                            formData.append("status", noteForm.status);

                            const res = await fetch("/api/admin/notes", {
                              method: "POST",
                              credentials: "include",
                              body: formData,
                            });

                            if (res.ok) {
                              setNoteForm({
                                class: "",
                                subject: "",
                                title: "",
                                description: "",
                                pdfPath: "",
                                status: "active",
                              });
                              setSelectedFile(null);
                              fetchNotes();
                              toast({
                                title: "Success",
                                description: "Note added successfully",
                              });
                            } else {
                              const error = await res.json();
                              toast({
                                title: "Error",
                                description:
                                  error.message || "Failed to add note",
                                variant: "destructive",
                              });
                            }
                          } catch (err) {
                            toast({
                              title: "Error",
                              description: "Failed to upload note",
                              variant: "destructive",
                            });
                          } finally {
                            setLoading(false);
                          }
                        } else {
                          toast({
                            title: "Required",
                            description:
                              "All fields including PDF file are required",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Add Note
                    </Button>
                  </div>
                </Card>

                {/* Notes List */}
                <div className="lg:col-span-2">
                  {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : notes.length === 0 ? (
                    <p className="text-muted-foreground">
                      No notes yet. Add one to get started!
                    </p>
                  ) : (
                    <Card className="p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left py-2 px-2">Class</th>
                            <th className="text-left py-2 px-2">Subject</th>
                            <th className="text-left py-2 px-2">Title</th>
                            <th className="text-left py-2 px-2">Status</th>
                            <th className="text-center py-2 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notes.map((note: any) => (
                            <tr
                              key={note.id}
                              className="border-b hover:bg-muted/30"
                            >
                              <td className="py-2 px-2 font-medium text-emerald-600 bg-emerald-50/50 rounded-l-md">
                                {note.class}
                              </td>
                              <td className="py-2 px-2 font-medium text-blue-600 bg-blue-50/50">
                                {note.subject}
                              </td>
                              <td className="py-2 px-2 truncate font-bold text-slate-800">
                                {note.title}
                              </td>
                              <td className="py-2 px-2">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${note.status === "active" ? "bg-emerald-100 text-emerald-700 shadow-sm" : "bg-rose-100 text-rose-700 shadow-sm"}`}
                                >
                                  {note.status}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center space-x-2">
                                {note.pdfPath && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      window.open(
                                        note.pdfPath.startsWith("http")
                                          ? note.pdfPath
                                          : `${window.location.origin}${note.pdfPath}`,
                                        "_blank",
                                      )
                                    }
                                    title="View PDF"
                                  >
                                    <Download size={14} />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleNoteStatus(note.id)}
                                >
                                  {note.status === "active" ? "Hide" : "Show"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteNote(note.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeModule === "rare-books" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Rare Books Management</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchRareBooks()}
                    className="gap-2"
                  >
                    <RefreshCw size={16} /> Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadExcel(
                        rareBooks,
                        `${settings.instituteShortName}-Rare-Books-Report`,
                        "rare-books",
                      )
                    }
                    className="gap-2"
                  >
                    <Download size={16} /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadPDF(
                        `${settings.instituteShortName} - Rare Books Report`,
                        rareBooks,
                        "rare-books",
                      )
                    }
                    className="gap-2"
                  >
                    <Download size={16} /> PDF
                  </Button>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Add Rare Book Form */}
                <Card className="lg:col-span-1 p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Add New Rare Book
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="Book title"
                        value={rareBookForm.title}
                        onChange={(e) =>
                          setRareBookForm({
                            ...rareBookForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="e.g., History"
                        value={rareBookForm.category}
                        onChange={(e) =>
                          setRareBookForm({
                            ...rareBookForm,
                            category: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="Book description"
                        value={rareBookForm.description}
                        onChange={(e) =>
                          setRareBookForm({
                            ...rareBookForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Cover Image (Required)
                      </label>
                      <Input
                        id="rare-book-cover-input"
                        type="file"
                        accept="image/*"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Upload Rare Book (PDF)
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById("rare-book-file-input")
                              ?.click()
                          }
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {selectedFile ? "Change File" : "Browse"}
                        </Button>
                        <input
                          id="rare-book-file-input"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.type !== "application/pdf") {
                                toast({
                                  title: "Invalid File",
                                  description: "Only PDF files are allowed",
                                  variant: "destructive",
                                });
                                return;
                              }
                              setSelectedFile(file);
                            }
                          }}
                        />
                      </div>
                      {selectedFile && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      disabled={loading}
                      onClick={async () => {
                        if (
                          rareBookForm.title &&
                          rareBookForm.description &&
                          selectedFile &&
                          (
                            document.getElementById(
                              "rare-book-cover-input",
                            ) as HTMLInputElement
                          )?.files?.[0]
                        ) {
                          setLoading(true);
                          try {
                            const coverFile = (
                              document.getElementById(
                                "rare-book-cover-input",
                              ) as HTMLInputElement
                            ).files?.[0];
                            const formData = new FormData();
                            formData.append("file", selectedFile);
                            if (coverFile)
                              formData.append("coverImage", coverFile);
                            formData.append("title", rareBookForm.title);
                            formData.append(
                              "description",
                              rareBookForm.description,
                            );
                            formData.append("category", rareBookForm.category);
                            formData.append("status", rareBookForm.status);

                            const res = await fetch("/api/admin/rare-books", {
                              method: "POST",
                              credentials: "include",
                              body: formData,
                            });

                            if (res.ok) {
                              setRareBookForm({
                                title: "",
                                description: "",
                                category: "",
                                status: "active",
                              });
                              setSelectedFile(null);
                              // Clear the file inputs manually
                              const fileInput = document.getElementById(
                                "rare-book-file-input",
                              ) as HTMLInputElement;
                              if (fileInput) fileInput.value = "";
                              const coverInput = document.getElementById(
                                "rare-book-cover-input",
                              ) as HTMLInputElement;
                              if (coverInput) coverInput.value = "";

                              await fetchRareBooks();
                              toast({
                                title: "Success",
                                description:
                                  "Rare book and cover added successfully",
                              });
                            } else {
                              const error = await res.json();
                              toast({
                                title: "Error",
                                description:
                                  error.message ||
                                  error.error ||
                                  "Failed to add rare book",
                                variant: "destructive",
                              });
                            }
                          } catch (err) {
                            console.error("Upload error:", err);
                            toast({
                              title: "Error",
                              description: "Failed to upload rare book",
                              variant: "destructive",
                            });
                          } finally {
                            setLoading(false);
                          }
                        } else {
                          toast({
                            title: "Required",
                            description:
                              "All fields including PDF and Cover Image are required",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      {loading ? "Uploading..." : "Add Rare Book"}
                    </Button>
                  </div>
                </Card>

                {/* Rare Books List */}
                <div className="lg:col-span-2">
                  {loading && !rareBooks.length ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : !rareBooks || rareBooks.length === 0 ? (
                    <p className="text-muted-foreground">
                      No rare books yet. Add one to get started!
                    </p>
                  ) : (
                    <Card className="p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left py-2 px-2">Title</th>
                            <th className="text-left py-2 px-2">Category</th>
                            <th className="text-left py-2 px-2">Status</th>
                            <th className="text-center py-2 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rareBooks.map((book: any) => (
                            <tr
                              key={book.id}
                              className="border-b hover:bg-muted/30"
                            >
                              <td className="py-2 px-2 font-black text-primary drop-shadow-sm">
                                {book.title}
                              </td>
                              <td className="py-2 px-2 font-bold text-amber-700">
                                <span className="px-2 py-0.5 bg-amber-50 rounded-md border border-amber-100">
                                  {book.category}
                                </span>
                              </td>
                              <td className="py-2 px-2">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${book.status === "active" ? "bg-emerald-100 text-emerald-700 shadow-sm" : "bg-rose-100 text-rose-700 shadow-sm"}`}
                                >
                                  {book.status}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center space-x-2">
                                {book.pdfPath && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const url = `/api/rare-books/stream/${book.id}`;
                                      window.open(url, "_blank");
                                    }}
                                    title="Preview PDF"
                                  >
                                    <Eye size={14} />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleRareBookStatus(book.id)}
                                >
                                  {book.status === "active" ? "Hide" : "Show"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteRareBook(book.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeModule === "books-details" && <Books />}
          {/* Events Module */}
          {activeModule === "events" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Events Management</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchEvents()}
                    className="gap-2"
                  >
                    <RefreshCw size={16} /> Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadExcel(
                        events,
                        `${settings.instituteShortName}-Events-List-Report`,
                        "events",
                      )
                    }
                    className="gap-2"
                  >
                    <Download size={16} /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadPDF(
                        `${settings.instituteShortName} - Events Report`,
                        events,
                        "events",
                      )
                    }
                    className="gap-2"
                  >
                    <Download size={16} /> PDF
                  </Button>
                </div>
              </div>

              <Card className="p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Add New Event</h3>
                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Event Title</label>
                      <Input
                        required
                        value={eventForm.title}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, title: e.target.value })
                        }
                        placeholder="Annual Prize Distribution"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Event Date</label>
                      <Input
                        type="date"
                        value={eventForm.date}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, date: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      required
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={eventForm.description}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the event details..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Event Images (Multiple allowed)
                    </label>
                    <Input
                      id="eventImages"
                      type="file"
                      multiple
                      accept="image/*"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Adding Event..." : "Add Event"}
                  </Button>
                </form>
              </Card>

              {loading ? (
                <p className="text-muted-foreground">Loading events...</p>
              ) : events.length === 0 ? (
                <p className="text-muted-foreground">No events found</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {events.map((event: any) => (
                    <Card
                      key={event.id}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-white to-slate-50/50 group"
                    >
                      <div className="flex flex-col md:flex-row gap-0">
                        {event.images && event.images.length > 0 && (
                          <div className="md:w-64 h-48 md:h-auto overflow-hidden shrink-0 relative">
                            <img
                              src={event.images[0]}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                              <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                                <BarChart3 size={12} /> Gallery
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex-1 p-6 relative">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded">
                                  Event
                                </span>
                                {event.date && (
                                  <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                                    <RefreshCw
                                      size={12}
                                      className="animate-spin-slow"
                                    />{" "}
                                    {new Date(event.date).toLocaleDateString(
                                      undefined,
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-black text-2xl text-slate-800 group-hover:text-primary transition-colors">
                                {event.title}
                              </h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteEvent(event.id)}
                              className="text-slate-300 hover:text-destructive transition-colors shrink-0"
                            >
                              <Trash2 size={20} />
                            </Button>
                          </div>
                          <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3 text-sm">
                            {event.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-auto">
                            {event.images
                              ?.slice(1, 6)
                              .map((img: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm hover:z-10 hover:scale-110 transition-transform cursor-pointer"
                                >
                                  <img
                                    src={img}
                                    alt={`Event element ${idx}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            {event.images?.length > 6 && (
                              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 border-2 border-white shadow-sm">
                                +{event.images.length - 6}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeModule === "notifications" && <Notifications />}

          {activeModule === "blog" && <AdminBlog />}

          {activeModule === "home" && <AdminHome />}
        </motion.div>
      </main>
    </div>
  );
}
