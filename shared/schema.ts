import { pgTable, text, timestamp, uuid, decimal, date, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const appRoleEnum = pgEnum("app_role", ["admin", "moderator", "user"]);
export const adminRoleEnum = pgEnum("admin_role", ["system", "custom"]);

export const adminCredentials = pgTable("admin_credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminEmail: text("admin_email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRoleEnum("role").default("custom").notNull(),
  secretKey: text("secret_key"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  role: appRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  rollNumber: text("roll_number"),
  department: text("department"),
  studentClass: text("student_class"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isSeen: boolean("is_seen").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookBorrows = pgTable("book_borrows", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  bookId: text("book_id").notNull(),
  bookTitle: text("book_title").notNull(),
  borrowerName: text("borrower_name").notNull(),
  borrowerPhone: text("borrower_phone"),
  borrowerEmail: text("borrower_email"),
  libraryCardId: text("library_card_id"),
  borrowDate: timestamp("borrow_date", { withTimezone: true }).defaultNow().notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  returnDate: timestamp("return_date", { withTimezone: true }),
  status: text("status").default("borrowed").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const libraryCardApplications = pgTable("library_card_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  fatherName: text("father_name"),
  dob: date("dob"),
  class: text("class").notNull(),
  field: text("field"),
  rollNo: text("roll_no").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  addressStreet: text("address_street").notNull(),
  addressCity: text("address_city").notNull(),
  addressState: text("address_state").notNull(),
  addressZip: text("address_zip").notNull(),
  status: text("status").default("pending").notNull(),
  password: text("password"),
  cardNumber: text("card_number").unique(),
  studentId: text("student_id"),
  issueDate: date("issue_date"),
  validThrough: date("valid_through"),
  dynamicFields: z.any().transform(v => typeof v === 'string' ? JSON.parse(v) : v).default({}), // Helper for JSONB in Supabase
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const donations = pgTable("donations", {
  id: uuid("id").defaultRandom().primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  name: text("name"),
  email: text("email"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  cardId: text("card_id").notNull().unique(),
  name: text("name").notNull(),
  class: text("class"),
  field: text("field"),
  rollNo: text("roll_no"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const nonStudents = pgTable("non_students", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookName: text("book_name").notNull(),
  shortIntro: text("short_intro").notNull(),
  description: text("description").notNull(),
  bookImage: text("book_image"),
  totalCopies: decimal("total_copies", { precision: 10, scale: 0 }).default("1").notNull(),
  availableCopies: decimal("available_copies", { precision: 10, scale: 0 }).default("1").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertBookSchema = createInsertSchema(books).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const rareBooks = pgTable("rare_books", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").default("General").notNull(),
  pdfPath: text("pdf_path").notNull(),
  coverImage: text("cover_image").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  images: text("images").array(),
  date: date("date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  message: text("message"),
  image: text("image"),
  pin: boolean("pin").default(false).notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subject: text("subject").notNull(),
  class: text("class").notNull(),
  pdfPath: text("pdf_path").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  isPinned: boolean("is_pinned").default(false).notNull(),
  status: text("status").default("draft").notNull(), // 'published' | 'draft'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// New Tables for About Menu Structure
export const principal = pgTable("principal", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const facultyStaff = pgTable("faculty_staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, isSeen: true });
export const insertBookBorrowSchema = createInsertSchema(bookBorrows).omit({ id: true, createdAt: true, borrowDate: true, returnDate: true, status: true });
export const insertLibraryCardApplicationSchema = createInsertSchema(libraryCardApplications).omit({ id: true, createdAt: true, updatedAt: true, status: true, cardNumber: true, studentId: true, issueDate: true, validThrough: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true });
export const insertNonStudentSchema = createInsertSchema(nonStudents).omit({ id: true, createdAt: true });
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true, createdAt: true });
export const insertBookDetailSchema = createInsertSchema(books).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRareBookSchema = createInsertSchema(rareBooks).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPrincipalSchema = createInsertSchema(principal).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFacultyStaffSchema = createInsertSchema(facultyStaff).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertBookBorrow = z.infer<typeof insertBookBorrowSchema>;
export type InsertLibraryCardApplication = z.infer<typeof insertLibraryCardApplicationSchema>;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertNonStudent = z.infer<typeof insertNonStudentSchema>;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type InsertBookDetail = z.infer<typeof insertBookDetailSchema>;
export type InsertRareBook = z.infer<typeof insertRareBookSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertPrincipal = z.infer<typeof insertPrincipalSchema>;
export type InsertFacultyStaff = z.infer<typeof insertFacultyStaffSchema>;

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type BookBorrow = typeof bookBorrows.$inferSelect;
export type LibraryCardApplication = typeof libraryCardApplications.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Student = typeof students.$inferSelect;
export type NonStudent = typeof nonStudents.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type BookDetail = typeof books.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Principal = typeof principal.$inferSelect;
export type FacultyStaff = typeof facultyStaff.$inferSelect;

// New Tables for Dynamic Home Page
export const homeContent = pgTable("home_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  heroHeading: text("hero_heading").notNull().default("Where Knowledge Meets Inspiration"),
  heroSubheading: text("hero_subheading").notNull().default("Access thousands of books, research papers, and digital resources to fuel your academic journey."),
  heroOverlayText: text("hero_overlay_text").notNull().default("Welcome to Digital Learning"),
  featuresHeading: text("features_heading").notNull().default("Why Choose GCFM?"),
  featuresSubheading: text("features_subheading").notNull().default("Discover the features that make our library the perfect learning companion"),
  affiliationsHeading: text("affiliations_heading").notNull().default("College Affiliations & Authorities"),
  ctaHeading: text("cta_heading").notNull().default("Ready to Start Learning?"),
  ctaSubheading: text("cta_subheading").notNull().default("Join thousands of students who are already using GCFM for their academic success."),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const homeSliderImages = pgTable("home_slider_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  imageUrl: text("image_url").notNull(),
  order: decimal("order", { precision: 10, scale: 0 }).default("0").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const homeAffiliations = pgTable("home_affiliations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull(),
  link: text("link"),
  order: decimal("order", { precision: 10, scale: 0 }).default("0").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const homeStats = pgTable("home_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(),
  number: text("number").notNull(),
  icon: text("icon").notNull(), // 'BookOpen', 'Users', 'Award', 'TrendingUp' (Legacy/Default)
  iconUrl: text("icon_url"), // Custom uploaded icon
  color: text("color").notNull(), // Tailwind class
  order: decimal("order", { precision: 10, scale: 0 }).default("0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const homeButtons = pgTable("home_buttons", {
  id: uuid("id").defaultRandom().primaryKey(),
  section: text("section").notNull(), // 'hero_primary', 'hero_secondary', 'cta_primary', 'cta_secondary'
  text: text("text").notNull(),
  link: text("link").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  primaryColor: text("primary_color").default("#006600").notNull(),
  navbarLogo: text("navbar_logo"),
  loadingLogo: text("loading_logo"),
  instituteShortName: text("institute_short_name").notNull().default("GCFM"),
  instituteFullName: text("institute_full_name").notNull().default("Govt. College For Men Nazimabad"),
  footerTitle: text("footer_title").notNull().default("GCFM Library"),
  footerDescription: text("footer_description").notNull(),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  creditsText: text("credits_text").notNull(),
  contributorsText: text("contributors_text"),
  contactAddress: text("contact_address"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  mapEmbedUrl: text("map_embed_url"),
  footerTagline: text("footer_tagline"),
  cardHeaderText: text("card_header_text").default("GOVT COLLEGE FOR MEN NAZIMABAD"),
  cardSubheaderText: text("card_subheader_text").default("LIBRARY CARD"),
  cardLogoUrl: text("card_logo_url"),
  cardQrEnabled: boolean("card_qr_enabled").default(true),
  cardQrUrl: text("card_qr_url").default("https://gcfm.edu.pk/verify"),
  cardTermsText: text("card_terms_text"),
  cardContactAddress: text("card_contact_address"),
  cardContactEmail: text("card_contact_email"),
  cardContactPhone: text("card_contact_phone"),
  rbWatermarkText: text("rb_watermark_text").default("GCFM Library Archive"),
  rbWatermarkOpacity: decimal("rb_watermark_opacity", { precision: 3, scale: 2 }).default("0.1"),
  rbDisclaimerText: text("rb_disclaimer_text").default("Confidential • Do Not Distribute • GCFM Library Archive"),
  rbWatermarkEnabled: boolean("rb_watermark_enabled").default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const libraryCardFields = pgTable("library_card_fields", {
  id: uuid("id").defaultRandom().primaryKey(),
  fieldLabel: text("field_label").notNull(),
  fieldKey: text("field_key").notNull().unique(),
  fieldType: text("field_type").default("text").notNull(),
  isRequired: boolean("is_required").default(false),
  showOnForm: boolean("show_on_form").default(true),
  showOnCard: boolean("show_on_card").default(true),
  showInAdmin: boolean("show_in_admin").default(true),
  displayOrder: decimal("display_order", { precision: 10, scale: 0 }).default("0"),
  options: z.any().default([]), // For selection menus
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertHomeContentSchema = createInsertSchema(homeContent).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHomeSliderImageSchema = createInsertSchema(homeSliderImages).omit({ id: true, createdAt: true });
export const insertHomeAffiliationSchema = createInsertSchema(homeAffiliations).omit({ id: true, createdAt: true });
export const insertHomeStatSchema = createInsertSchema(homeStats).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHomeButtonSchema = createInsertSchema(homeButtons).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertHomeContent = z.infer<typeof insertHomeContentSchema>;
export type InsertHomeSliderImage = z.infer<typeof insertHomeSliderImageSchema>;
export type InsertHomeStat = z.infer<typeof insertHomeStatSchema>;
export type InsertHomeButton = z.infer<typeof insertHomeButtonSchema>;

export type HomeContent = typeof homeContent.$inferSelect;
export type HomeSliderImage = typeof homeSliderImages.$inferSelect;
export type HomeAffiliation = typeof homeAffiliations.$inferSelect;
export type HomeStat = typeof homeStats.$inferSelect;
export type HomeButton = typeof homeButtons.$inferSelect;
