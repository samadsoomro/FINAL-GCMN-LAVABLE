import type { Express, Request } from "express";
import { storage } from "./db-storage";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";


// Helper to delete files from uploads directory (delegates to Supabase)
const deleteFile = (pathOrUrl: string | undefined | null) => {
  if (pathOrUrl) storage.deleteFile(pathOrUrl);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/bmp", "image/svg+xml", "image/tiff"];
    if (["bookImage", "eventImages", "coverImage", "image", "featuredImage"].includes(file.fieldname)) {
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG, PNG, WEBP, GIF, BMP, and SVG images are allowed") as any);
      }
    } else if (file.mimetype === "application/pdf" || file.fieldname === "file") {
      cb(null, true);
    } else {
      cb(new Error("File type not supported") as any);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

const ADMIN_EMAIL = "admin@formen.com";
const ADMIN_PASSWORD = "gcfm123";
const ADMIN_SECRET_KEY = "GCFM-ADMIN-ONLY";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
    isLibraryCard?: boolean;
  }
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

export function registerRoutes(app: Express): void {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName, phone, rollNumber, department, studentClass } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
        phone,
        rollNumber,
        department,
        studentClass,
        type: studentClass ? "student" : "user"
      });

      await storage.createUserRole({ userId: user.id, role: "user" });

      req.session.userId = user.id;
      req.session.isAdmin = false;

      res.json({ user: { id: user.id, email: user.email } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, secretKey, libraryCardId } = req.body;

      // Check if admin login attempt
      if (secretKey) {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD && secretKey === ADMIN_SECRET_KEY) {
          req.session.userId = "admin";
          req.session.isAdmin = true;
          return res.json({
            user: { id: "admin", email: ADMIN_EMAIL },
            isAdmin: true,
            redirect: "/admin-dashboard"
          });
        } else if (secretKey !== ADMIN_SECRET_KEY) {
          // If secret key provided but wrong, still try to login as normal user
        }
      }

      // Library Card ID login
      if (libraryCardId) {
        if (!password) {
          return res.status(401).json({ error: "Password is required for library card login" });
        }

        const cardApp = await storage.getLibraryCardByCardNumber(libraryCardId);

        // generic error message for security
        const invalidCredentialsMsg = "Write correct details";

        if (!cardApp) {
          return res.status(401).json({ error: invalidCredentialsMsg });
        }

        // Verify password first
        if (cardApp.password) {
          const valid = await bcrypt.compare(password, cardApp.password);
          if (!valid) {
            return res.status(401).json({ error: invalidCredentialsMsg });
          }
        } else {
          // Allow legacy login without password? No, user implied password logic.
          // But if no password set, we can't verify. 
          // Let's assume password is required now.
          return res.status(401).json({ error: "No password set. Please contact library." });
        }

        // Credentials are correct, now check status
        const status = cardApp.status?.toLowerCase() || "pending";

        if (status === "pending") {
          return res.status(401).json({ error: "Wait for approval by library" });
        }

        if (status === "rejected") {
          return res.status(401).json({ error: "Your library card application was rejected." });
        }

        if (status !== "approved") {
          // catches other statuses or empty
          return res.status(401).json({ error: "Library card is not active." });
        }

        // Use library card ID as session identifier (prefix with "card-" to distinguish from regular users)
        req.session.userId = `card-${cardApp.id}`;
        req.session.isAdmin = false;
        req.session.isLibraryCard = true;

        return res.json({ user: { id: cardApp.id, email: cardApp.email, name: `${cardApp.firstName} ${cardApp.lastName}` } });
      }

      // Normal user login
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.isAdmin = false;

      res.json({ user: { id: user.id, email: user.email } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Admin session
    if (req.session.isAdmin && req.session.userId === "admin") {
      return res.json({
        user: { id: "admin", email: ADMIN_EMAIL },
        roles: ["admin"],
        isAdmin: true
      });
    }

    // Library Card session
    if (req.session.isLibraryCard) {
      const cardId = req.session.userId.replace(/^card-/, "");
      const card = await storage.getLibraryCardApplication(cardId);
      if (!card) {
        return res.status(401).json({ error: "Library card not found" });
      }
      return res.json({
        user: {
          id: card.id,
          email: card.email,
          name: `${card.firstName} ${card.lastName}`,
          cardNumber: card.cardNumber
        },
        isLibraryCard: true
      });
    }

    // Regular user session
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const profile = await storage.getProfile(user.id);
    const roles = await storage.getUserRoles(user.id);
    const isAdmin = await storage.hasRole(user.id, "admin");

    res.json({
      user: { id: user.id, email: user.email },
      profile,
      roles: roles.map((r) => r.role),
      isAdmin
    });
  });

  app.get("/api/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const profile = await storage.getProfile(req.session.userId);
    res.json(profile || null);
  });

  app.put("/api/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const profile = await storage.updateProfile(req.session.userId, req.body);
    res.json(profile);
  });

  // Admin-only routes - check admin status
  const requireAdmin = async (req: any, res: any, next: any) => {
    // Backend bypass for internal tools/scripts
    if (process.env.SUPABASE_BACKEND_SECRET && req.header('x-backend-secret') === process.env.SUPABASE_BACKEND_SECRET) {
      return next();
    }

    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.session.isAdmin) {
      return next();
    }
    const isAdmin = await storage.hasRole(req.session.userId, "admin");
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getStudents();
      const nonStudents = await storage.getNonStudents();
      res.json({ students: users, nonStudents: nonStudents });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      if (req.params.id === "1" || req.params.id === "admin") {
        return res.status(400).json({ error: "Cannot delete the primary admin account" });
      }
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/library-cards", requireAdmin, async (req, res) => {
    try {
      const cards = await storage.getLibraryCardApplications();
      res.json(cards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/borrowed-books", requireAdmin, async (req, res) => {
    try {
      const borrows = await storage.getBookBorrows();
      res.json(borrows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getStudents();
      const nonStudents = await storage.getNonStudents();
      const libraryCards = await storage.getLibraryCardApplications();
      const borrowedBooks = await storage.getBookBorrows();
      const donations = await storage.getDonations();

      const activeBorrows = borrowedBooks.filter((b) => b.status === "borrowed").length;
      const returnedBooks = borrowedBooks.filter((b) => b.status === "returned").length;

      res.json({
        totalUsers: users.length + nonStudents.length,
        totalBooks: borrowedBooks.length,
        libraryCards: libraryCards.length,
        borrowedBooks: activeBorrows,
        returnedBooks: returnedBooks,
        donations: donations.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Keep other existing routes with storage
  app.get("/api/contact-messages", requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contact-messages", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const result = await storage.createContactMessage({ name, email, subject, message });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/contact-messages/:id/seen", requireAdmin, async (req, res) => {
    try {
      const message = await storage.updateContactMessageSeen(req.params.id, req.body.isSeen);
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/contact-messages/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteContactMessage(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/book-borrows", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      if (req.session.isAdmin) {
        const borrows = await storage.getBookBorrows();
        return res.json(borrows);
      }
      const borrows = await storage.getBookBorrowsByUser(req.session.userId);
      res.json(borrows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin alias for borrowed books
  app.get("/api/admin/borrowed-books", requireAdmin, async (req, res) => {
    try {
      const borrows = await storage.getBookBorrows();
      res.json(borrows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/book-borrows", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { bookId, bookTitle } = req.body;
      if (!bookId || !bookTitle) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const book = await storage.getBook(bookId);
      if (!book) return res.status(404).json({ error: "Book not found" });
      if (parseInt(book.availableCopies || "0") <= 0) {
        return res.status(400).json({ error: "No copies available for borrowing" });
      }

      let borrowerName = "";
      let borrowerPhone = "";
      let borrowerEmail = "";
      let libraryCardId = "";

      if (req.session.isLibraryCard) {
        const cardId = req.session.userId.replace(/^card-/, "");
        const card = await storage.getLibraryCardApplication(cardId);
        if (card) {
          borrowerName = `${card.firstName} ${card.lastName}`;
          borrowerPhone = card.phone;
          borrowerEmail = card.email;
          libraryCardId = card.cardNumber;
        }
      } else {
        // Staff / Visitor / Admin Login
        const user = await storage.getUser(req.session.userId);
        if (user) {
          const profile = await storage.getProfile(user.id);
          borrowerName = profile?.fullName || (user.id === "admin" ? "System Admin" : user.email);
          borrowerPhone = profile?.phone || "";
          borrowerEmail = user.email || (user.id === "admin" ? ADMIN_EMAIL : "");
          libraryCardId = "-";
        } else if (req.session.userId === "admin") {
          borrowerName = "System Admin";
          borrowerEmail = ADMIN_EMAIL;
          libraryCardId = "-";
        }
      }

      const borrowDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const borrow = await storage.createBookBorrow({
        userId: req.session.userId,
        bookId,
        bookTitle,
        borrowerName,
        borrowerPhone,
        borrowerEmail,
        libraryCardId,
        borrowDate: borrowDate.toISOString(),
        dueDate: dueDate.toISOString(),
        status: "borrowed"
      });

      // Update available copies
      await storage.updateBook(bookId, {
        availableCopies: Math.max(0, parseInt(book.availableCopies || "0") - 1).toString(),
        updatedAt: new Date().toISOString()
      });

      res.json(borrow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/book-borrows/:id/return", requireAdmin, async (req, res) => {
    try {
      const borrows = await storage.getBookBorrows();
      const borrow = borrows.find((b: any) => b.id === req.params.id);
      if (!borrow) return res.status(404).json({ error: "Borrow record not found" });
      if (borrow.status === "returned") return res.status(400).json({ error: "Book already returned" });

      const updatedBorrow = await storage.updateBookBorrowStatus(req.params.id, "returned", new Date());

      // Update available copies
      const book = await storage.getBook(borrow.bookId);
      if (book) {
        const currentAvailable = parseInt(book.availableCopies || "0");
        const total = parseInt(book.totalCopies || "0");
        await storage.updateBook(borrow.bookId, {
          availableCopies: Math.min(total, currentAvailable + 1).toString(),
          updatedAt: new Date().toISOString()
        });
      }

      res.json(updatedBorrow);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/book-borrows/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status, returnDate } = req.body;
      const borrow = await storage.updateBookBorrowStatus(
        req.params.id,
        status,
        returnDate ? new Date(returnDate) : undefined
      );
      res.json(borrow);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/book-borrows/:id", requireAdmin, async (req, res) => {
    try {
      console.log(`[DELETE] Borrow record attempt: ${req.params.id} by admin ${req.session.userId}`);
      await storage.deleteBookBorrow(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error(`[DELETE] Borrow record failure: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin alias for deleting borrowed books
  app.delete("/api/admin/borrowed-books/:id", requireAdmin, async (req, res) => {
    try {
      console.log(`[DELETE] Borrow record alias attempt: ${req.params.id} by admin ${req.session.userId}`);
      await storage.deleteBookBorrow(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error(`[DELETE] Borrow record alias failure: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/library-card-applications", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      if (req.session.isAdmin) {
        const applications = await storage.getLibraryCardApplications();
        return res.json(applications);
      }
      const applications = await storage.getLibraryCardApplicationsByUser(req.session.userId);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/library-card-applications", async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        fatherName,
        dob,
        email,
        phone,
        field,
        rollNo,
        studentClass,
        class: studentClassAlt,
        addressStreet,
        addressCity,
        addressState,
        addressZip,
        password: applicationPassword
      } = req.body;

      const application = await storage.createLibraryCardApplication({
        userId: req.session?.userId || null,
        firstName,
        lastName,
        fatherName,
        dob,
        email,
        phone,
        field,
        rollNo,
        class: studentClass || studentClassAlt,
        addressStreet,
        addressCity,
        addressState,
        addressZip,
        password: applicationPassword ? await bcrypt.hash(applicationPassword, 10) : null,
        status: "pending"
      });
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/library-card-applications/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const application = await storage.getLibraryCardApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const updatedApplication = await storage.updateLibraryCardApplicationStatus(
        req.params.id,
        status
      );

      res.json(updatedApplication);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/library-card-applications/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteLibraryCardApplication(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/donations", requireAdmin, async (req, res) => {
    try {
      const donations = await storage.getDonations();
      res.json(donations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/donations", async (req, res) => {
    try {
      const { amount, method, name, email, message } = req.body;
      if (!amount || !method) {
        return res.status(400).json({ error: "Amount and method are required" });
      }
      const donation = await storage.createDonation({
        amount: amount.toString(),
        method,
        name: name || null,
        email: email || null,
        message: message || null,
        status: "received"
      });
      res.json(donation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/donations/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteDonation(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getActiveNotes();
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/notes/filter", async (req, res) => {
    try {
      const { class: studentClass, subject } = req.query;
      if (!studentClass || !subject) {
        return res.status(400).json({ error: "Class and subject required" });
      }
      const notes = await storage.getNotesByClassAndSubject(studentClass as string, subject as string);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/notes", requireAdmin, async (req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/notes", requireAdmin, upload.single('file'), async (req: MulterRequest, res) => {
    try {
      const { class: studentClass, subject, title, description, status } = req.body;
      if (!studentClass || !subject || !title || !description || !req.file) {
        return res.status(400).json({ error: "Missing required fields or file" });
      }

      const pdfPath = await storage.uploadFile('notes', req.file);

      const note = await storage.createNote({
        class: studentClass,
        subject,
        title,
        description,
        pdfPath,
        status: status || "active"
      });
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/notes/:id", requireAdmin, async (req, res) => {
    try {
      const note = await storage.updateNote(req.params.id, req.body);
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/notes/:id/toggle", requireAdmin, async (req, res) => {
    try {
      const note = await storage.toggleNoteStatus(req.params.id);
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/notes/:id", requireAdmin, async (req, res) => {
    try {
      // Find the note first to get the PDF path
      const notes = await storage.getNotes();
      const note = notes.find((n: any) => n.id === req.params.id);

      if (note && note.pdfPath) {
        deleteFile(note.pdfPath);
      }

      await storage.deleteNote(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/rare-books", requireAdmin, async (req, res) => {
    try {
      const books = await storage.getRareBooks();
      res.json(books);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/rare-books", requireAdmin, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req: MulterRequest, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { title, description, category, status } = req.body;

      if (!title || !description || !files.file?.[0] || !files.coverImage?.[0]) {
        return res.status(400).json({ error: "Missing required fields (PDF and Cover Image are mandatory)" });
      }

      const pdfPath = await storage.uploadFile('rare_books', files.file[0]);
      const coverImagePath = await storage.uploadFile('rare_books', files.coverImage[0]);

      const book = await storage.createRareBook({
        title,
        description,
        category: category || "General",
        pdfPath,
        coverImage: coverImagePath,
        status: status || "active"
      });
      res.json(book);
    } catch (error: any) {
      console.error('Rare book upload error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/rare-books/stream/:id", async (req, res) => {
    try {
      const book = await storage.getRareBook(req.params.id);
      if (!book || book.status !== "active") {
        return res.status(404).json({ error: "Book not found" });
      }

      if (book.pdfPath && book.pdfPath.startsWith('http')) {
        return res.redirect(book.pdfPath);
      }

      // Fallback for old local files if keeping support (or just fail)
      res.status(404).json({ error: "PDF file not found" });
    } catch (error: any) {
      console.error('PDF streaming error:', error);
      res.status(500).json({ error: "Error streaming PDF" });
    }
  });

  app.patch("/api/admin/rare-books/:id/toggle", requireAdmin, async (req, res) => {
    try {
      const book = await storage.toggleRareBookStatus(req.params.id);
      res.json(book);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/rare-books/:id", requireAdmin, async (req, res) => {
    try {
      const book = await storage.getRareBook(req.params.id);

      if (book) {
        if (book.pdfPath) deleteFile(book.pdfPath);
        if (book.coverImage) deleteFile(book.coverImage);
      }

      await storage.deleteRareBook(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rare-books", async (req, res) => {
    try {
      const books = await storage.getRareBooks();
      res.json(books.filter((b: any) => b.status === "active"));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Books Details Management
  app.get("/api/admin/books", requireAdmin, async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/books", requireAdmin, upload.single('bookImage'), async (req: MulterRequest, res) => {
    try {
      const { bookName, shortIntro, description, totalCopies } = req.body;
      if (!bookName || !shortIntro || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const bookImage = req.file ? await storage.uploadFile('books', req.file) : null;
      const copies = totalCopies ? totalCopies.toString() : "1";

      const book = await storage.createBook({
        bookName,
        shortIntro,
        description,
        bookImage,
        totalCopies: copies,
        availableCopies: copies,
        updatedAt: new Date().toISOString()
      });
      res.json(book);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/books/:id", requireAdmin, upload.single('bookImage'), async (req: MulterRequest, res) => {
    try {
      const { bookName, shortIntro, description, totalCopies } = req.body;
      const updateData: any = { updatedAt: new Date().toISOString() };

      if (bookName) updateData.bookName = bookName;
      if (shortIntro) updateData.shortIntro = shortIntro;
      if (description) updateData.description = description;
      if (req.file) updateData.bookImage = await storage.uploadFile('books', req.file);

      if (totalCopies) {
        const book = await storage.getBook(req.params.id);
        if (book) {
          const oldTotal = parseInt(book.totalCopies || "0");
          const oldAvailable = parseInt(book.availableCopies || "0");
          const newTotal = parseInt(totalCopies);
          const borrowed = oldTotal - oldAvailable;
          updateData.totalCopies = totalCopies.toString();
          updateData.availableCopies = Math.max(0, newTotal - borrowed).toString();
        }
      }

      const book = await storage.updateBook(req.params.id, updateData);
      res.json(book);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/books", requireAdmin, upload.single("bookImage"), async (req: MulterRequest, res) => {
    try {
      const { bookName, shortIntro, description, totalCopies } = req.body;
      if (!bookName || !shortIntro || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const bookImage = req.file ? await storage.uploadFile('books', req.file) : null;
      const copies = totalCopies ? parseInt(totalCopies) : 1;

      const book = await storage.createBook({
        bookName,
        shortIntro,
        description,
        bookImage,
        totalCopies: copies,
        availableCopies: copies,
        updatedAt: new Date().toISOString()
      });
      res.json(book);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/books/:id", requireAdmin, upload.single("bookImage"), async (req: MulterRequest, res) => {
    try {
      const { bookName, shortIntro, description, totalCopies } = req.body;
      const existing = await storage.getBook(req.params.id);
      if (!existing) return res.status(404).json({ error: "Book not found" });

      const updateData: any = {
        updatedAt: new Date().toISOString()
      };
      if (bookName) updateData.bookName = bookName;
      if (shortIntro) updateData.shortIntro = shortIntro;
      if (description) updateData.description = description;

      if (totalCopies !== undefined) {
        const newTotal = parseInt(totalCopies);
        const currentTotal = parseInt(existing.totalCopies || "0");
        const diff = newTotal - currentTotal;
        updateData.totalCopies = newTotal;
        updateData.availableCopies = parseInt(existing.availableCopies || "0") + diff;
      }

      if (req.file) {
        updateData.bookImage = await storage.uploadFile('books', req.file);
      }

      const book = await storage.updateBook(req.params.id, updateData);
      res.json(book);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/books/:id", requireAdmin, upload.single('bookImage'), async (req: MulterRequest, res) => {
    try {
      const { bookName, shortIntro, description, totalCopies } = req.body;
      const updateData: any = { updatedAt: new Date().toISOString() };

      if (bookName) updateData.bookName = bookName;
      if (shortIntro) updateData.shortIntro = shortIntro;
      if (description) updateData.description = description;
      if (req.file) updateData.bookImage = await storage.uploadFile('books', req.file);

      if (totalCopies) {
        const book = await storage.getBook(req.params.id);
        if (book) {
          const oldTotal = parseInt(book.totalCopies || "0");
          const oldAvailable = parseInt(book.availableCopies || "0");
          const newTotal = parseInt(totalCopies);
          const borrowed = oldTotal - oldAvailable;
          updateData.totalCopies = totalCopies.toString();
          updateData.availableCopies = Math.max(0, newTotal - borrowed).toString();
        }
      }

      const book = await storage.updateBook(req.params.id, updateData);
      res.json(book);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/books/:id", requireAdmin, async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);

      if (book && book.bookImage) {
        deleteFile(book.bookImage);
      }

      await storage.deleteBook(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Events Management
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/events", requireAdmin, (req, res, next) => {
    upload.array("eventImages")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }, async (req: MulterRequest, res) => {
    try {
      const { title, description, date } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
      }

      const imageFiles = req.files as Express.Multer.File[];
      const images = imageFiles ? await Promise.all(imageFiles.map(file => storage.uploadFile('events', file))) : [];

      const event = await storage.createEvent({
        title,
        description,
        images,
        date: date || null
      });
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/events/:id", requireAdmin, (req, res, next) => {
    upload.array("eventImages")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }, async (req: MulterRequest, res) => {
    try {
      const updateData: any = { ...req.body };
      const imageFiles = req.files as Express.Multer.File[];

      if (imageFiles && imageFiles.length > 0) {
        updateData.images = await Promise.all(imageFiles.map(file => storage.uploadFile('events', file)));
      }

      const event = await storage.updateEvent(req.params.id, updateData);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/events/:id", requireAdmin, async (req, res) => {
    try {
      const events = await storage.getEvents();
      const event = events.find((e: any) => e.id === req.params.id);

      if (event && event.images && Array.isArray(event.images)) {
        event.images.forEach((imagePath: string) => {
          deleteFile(imagePath);
        });
      }

      await storage.deleteEvent(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notifications Routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getActiveNotifications();
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/notifications", requireAdmin, async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/notifications", requireAdmin, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }, async (req: MulterRequest, res) => {
    try {
      const { title, message } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      let image = null;
      if (req.file) {
        image = await storage.uploadFile('notification', req.file);
      }

      const notification = await storage.createNotification({
        title,
        message,
        image,
        pin: req.body.pin === "true",
        status: "active"
      });
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/notifications/:id", requireAdmin, async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      const notification = notifications.find((n: any) => n.id === req.params.id);

      if (notification && notification.image) {
        deleteFile(notification.image);
      }

      await storage.deleteNotification(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/notifications/:id/status", requireAdmin, async (req, res) => {
    try {
      const notification = await storage.toggleNotificationStatus(req.params.id);
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/notifications/:id/pin", requireAdmin, async (req, res) => {
    try {
      const notification = await storage.toggleNotificationPin(req.params.id);
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Blog Routes
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(false);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/blog/:slugOrId", async (req, res) => {
    try {
      const { slugOrId } = req.params;
      // Try by slug first
      let post = await storage.getBlogPost(slugOrId);
      if (!post) {
        // Try by ID (if valid UUID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
        if (isUuid) {
          post = await storage.getBlogPostById(slugOrId);
        }
      }
      if (!post || post.status !== 'published') {
        // If admin, maybe allow? But this is public route.
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/blog", requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/blog", requireAdmin, upload.single('featuredImage'), async (req: MulterRequest, res) => {
    try {
      const { title, content, shortDescription, slug, status } = req.body;
      if (!title || !content || !slug) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let featuredImage = null;
      if (req.file) {
        featuredImage = await storage.uploadFile('blog', req.file);
      }

      const post = await storage.createBlogPost({
        title,
        slug,
        shortDescription: shortDescription || "",
        content,
        featuredImage, // string or null
        status: status || "draft"
      });
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/blog/:id", requireAdmin, upload.single('featuredImage'), async (req: MulterRequest, res) => {
    try {
      const { title, content, shortDescription, slug, status } = req.body;
      const updateData: any = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
      if (slug) updateData.slug = slug;
      if (status) updateData.status = status;

      if (req.file) {
        const url = await storage.uploadFile('blog', req.file);
        updateData.featuredImage = url;

        // Delete old image? Ideally yes, but need to fetch old post first.
        // skipping for simplicity unless strictly required.
      }

      const post = await storage.updateBlogPost(req.params.id, updateData);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    try {
      const post = await storage.getBlogPostById(req.params.id);
      if (post && post.featuredImage) {
        deleteFile(post.featuredImage);
      }
      await storage.deleteBlogPost(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/blog/:id/pin", requireAdmin, async (req, res) => {
    try {
      const post = await storage.toggleBlogPostPin(req.params.id);
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Editor Image Upload
  app.post("/api/admin/blog/upload-image", requireAdmin, upload.single('image'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No image provided" });
      const url = await storage.uploadFile('blog', req.file);
      res.json({ url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Principal Routes
  app.get("/api/principal", async (req, res) => {
    try {
      const data = await storage.getPrincipal();
      res.json(data || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/principal", requireAdmin, upload.single('image'), async (req: MulterRequest, res) => {
    try {
      const { name, message } = req.body;
      const data: any = { name, message };

      if (req.file) {
        data.imageUrl = await storage.uploadFile('principal_images', req.file);
      }

      const result = await storage.updatePrincipal(data);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Faculty Routes
  app.get("/api/faculty", async (req, res) => {
    try {
      const data = await storage.getFaculty();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/faculty", requireAdmin, upload.single('image'), async (req: MulterRequest, res) => {
    try {
      const { name, designation, description } = req.body;
      if (!name || !designation) {
        return res.status(400).json({ error: "Name and Designation are required" });
      }

      const data: any = { name, designation, description };
      if (req.file) {
        data.imageUrl = await storage.uploadFile('faculty_images', req.file);
      }

      const result = await storage.createFacultyMember(data);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/faculty/:id", requireAdmin, upload.single('image'), async (req: MulterRequest, res) => {
    try {
      const { name, designation, description } = req.body;
      const data: any = { name, designation, description };

      if (req.file) {
        data.imageUrl = await storage.uploadFile('faculty_images', req.file);
      }

      const result = await storage.updateFacultyMember(req.params.id, data);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/faculty/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteFacultyMember(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
