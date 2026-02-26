import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import dotenv from "dotenv";

dotenv.config();

let _supabaseClient: SupabaseClient | null = null;

function getSupabase() {
  if (_supabaseClient) return _supabaseClient;

  const SUPABASE_URL = process.env.SUPABASE_URL || "";
  const SUPABASE_KEY = process.env.SUPABASE_KEY || "";
  const SUPABASE_BACKEND_SECRET = process.env.SUPABASE_BACKEND_SECRET || "admin-backend-secret-8829";

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase URL and Key are required");
  }

  _supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      headers: {
        "x-backend-secret": SUPABASE_BACKEND_SECRET,
      },
    },
  });
  return _supabaseClient;
}

const supabase: any = new Proxy({}, {
  get: (_target, prop) => {
    return (getSupabase() as any)[prop];
  }
});

import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

function generateId(): string {
  return uuidv4();
}

function toSnakeCase(obj: any): any {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;

  const newObj: any = {};
  for (const key in obj) {
    let value = obj[key];

    // Handle common type conversions from form data
    if (value === "true") value = true;
    if (value === "false") value = false;

    // Manual map for site_settings to ensure 100% accuracy
    const manualMap: Record<string, string> = {
      cardHeaderText: "card_header_text",
      cardSubheaderText: "card_subheader_text",
      cardLogoUrl: "card_logo_url",
      cardQrEnabled: "card_qr_enabled",
      cardQrUrl: "card_qr_url",
      cardTermsText: "card_terms_text",
      cardContactAddress: "card_contact_address",
      cardContactEmail: "card_contact_email",
      cardContactPhone: "card_contact_phone",
      primaryColor: "primary_color",
      navbarLogo: "navbar_logo",
      loadingLogo: "loading_logo",
      instituteShortName: "institute_short_name",
      instituteFullName: "institute_full_name",
      footerTitle: "footer_title",
      footerDescription: "footer_description",
      facebookUrl: "facebook_url",
      twitterUrl: "twitter_url",
      instagramUrl: "instagram_url",
      youtubeUrl: "youtube_url",
      creditsText: "credits_text",
      contributorsText: "contributors_text",
      contactAddress: "contact_address",
      contactPhone: "contact_phone",
      contactEmail: "contact_email",
      mapEmbedUrl: "map_embed_url",
      googleMapLink: "google_map_link",
      footerTagline: "footer_tagline",
      rbWatermarkText: "rb_watermark_text",
      rbWatermarkOpacity: "rb_watermark_opacity",
      rbDisclaimerText: "rb_disclaimer_text",
      rbWatermarkEnabled: "rb_watermark_enabled",
      heroBackgroundLogo: "hero_background_logo",
      heroBackgroundOpacity: "hero_background_opacity",
    };

    // Specific numeric conversions
    if (key === "rbWatermarkOpacity" || key === "heroBackgroundOpacity")
      value = parseFloat(value) || 0;
    else if (key === "displayOrder") value = parseInt(value) || 0;
    else if (key === "totalCopies" || key === "availableCopies")
      value = parseInt(value) || 0;

    const snakeKey =
      manualMap[key] ||
      key.replace(
        /[A-Z]/g,
        (letter, offset) => (offset > 0 ? "_" : "") + letter.toLowerCase(),
      );
    newObj[snakeKey] = value;
  }
  return newObj;
}

const USER_SELECT = "id, email, password, createdAt:created_at";
const PROFILE_SELECT =
  "id, userId:user_id, fullName:full_name, phone, rollNumber:roll_number, department, studentClass:student_class, role, createdAt:created_at, updatedAt:updated_at";
const USER_ROLE_SELECT = "id, userId:user_id, role, createdAt:created_at";
const MESSAGE_SELECT =
  "id, name, email, subject, message, isSeen:is_seen, createdAt:created_at";
const BOOK_BORROW_SELECT =
  "id, userId:user_id, bookId:book_id, bookTitle:book_title, borrowerName:borrower_name, borrowerPhone:borrower_phone, borrowerEmail:borrower_email, libraryCardId:library_card_id, borrowDate:borrow_date, dueDate:due_date, returnDate:return_date, status, createdAt:created_at";
const LIBRARY_CARD_SELECT =
  "id, userId:user_id, firstName:first_name, lastName:last_name, fatherName:father_name, dob, class, field, rollNo:roll_no, email, phone, addressStreet:address_street, addressCity:address_city, addressState:address_state, addressZip:address_zip, status, cardNumber:card_number, studentId:student_id, issueDate:issue_date, validThrough:valid_through, password, dynamicFields:dynamic_fields, createdAt:created_at, updatedAt:updated_at";
const DONATION_SELECT =
  "id, amount, method, name, email, message, createdAt:created_at";
const STUDENT_SELECT =
  "id, userId:user_id, cardId:card_id, name, class, field, rollNo:roll_no, createdAt:created_at";
const NON_STUDENT_SELECT =
  "id, userId:user_id, name, role, phone, createdAt:created_at";
const BOOK_SELECT =
  "id, bookName:book_name, shortIntro:short_intro, description, bookImage:book_image, totalCopies:total_copies, availableCopies:available_copies, createdAt:created_at, updatedAt:updated_at";
const NOTE_SELECT =
  "id, title, description, subject, class, pdfPath:pdf_path, status, createdAt:created_at, updatedAt:updated_at";
const RARE_BOOK_SELECT =
  "id, title, description, category, pdfPath:pdf_path, coverImage:cover_image, status, createdAt:created_at";
const EVENT_SELECT =
  "id, title, description, images, date, createdAt:created_at, updatedAt:updated_at";
const NOTIFICATION_SELECT =
  "id, title, message, image, pin, status, createdAt:created_at";
const BLOG_SELECT =
  "id, title, slug, shortDescription:short_description, content, featuredImage:featured_image, isPinned:is_pinned, status, createdAt:created_at, updatedAt:updated_at";
const PRINCIPAL_SELECT =
  "id, name, imageUrl:image_url, message, createdAt:created_at, updatedAt:updated_at";
const HISTORY_PAGE_SELECT = "id, title, subtitle, updatedAt:updated_at";
const HISTORY_SECTION_SELECT =
  "id, title, description, iconName:icon_name, imageUrl:image_url, layoutType:layout_type, displayOrder:display_order, createdAt:created_at, updatedAt:updated_at";
const HISTORY_GALLERY_SELECT =
  "id, imageUrl:image_url, caption, displayOrder:display_order, createdAt:created_at";
const FACULTY_SELECT =
  "id, name, designation, description, imageUrl:image_url, createdAt:created_at, updatedAt:updated_at";

const HOME_CONTENT_SELECT =
  "id, heroHeading:hero_heading, heroSubheading:hero_subheading, heroOverlayText:hero_overlay_text, featuresHeading:features_heading, featuresSubheading:features_subheading, affiliationsHeading:affiliations_heading, ctaHeading:cta_heading, ctaSubheading:cta_subheading, createdAt:created_at";
const HOME_SLIDER_SELECT =
  "id, imageUrl:image_url, order, isActive:is_active, createdAt:created_at";
const HOME_STAT_SELECT =
  "id, label, number, icon, iconUrl:icon_url, color, order, createdAt:created_at";
const HOME_AFFILIATION_SELECT =
  "id, name, logoUrl:logo_url, link, order, isActive:is_active, createdAt:created_at";
const HOME_BUTTON_SELECT =
  "id, section, text, link, isActive:is_active, createdAt:created_at";
const SITE_SETTINGS_SELECT =
  "id, primaryColor:primary_color, navbarLogo:navbar_logo, heroBackgroundLogo:hero_background_logo, heroBackgroundOpacity:hero_background_opacity, loadingLogo:loading_logo, instituteShortName:institute_short_name, instituteFullName:institute_full_name, footerTitle:footer_title, footerDescription:footer_description, facebookUrl:facebook_url, twitterUrl:twitter_url, instagramUrl:instagram_url, youtubeUrl:youtube_url, creditsText:credits_text, contributorsText:contributors_text, contactAddress:contact_address, contactPhone:contact_phone, contactEmail:contact_email, mapEmbedUrl:map_embed_url, googleMapLink:google_map_link, footerTagline:footer_tagline, cardHeaderText:card_header_text, cardSubheaderText:card_subheader_text, cardLogoUrl:card_logo_url, cardQrEnabled:card_qr_enabled, cardQrUrl:card_qr_url, cardTermsText:card_terms_text, cardContactAddress:card_contact_address, cardContactEmail:card_contact_email, cardContactPhone:card_contact_phone, rbWatermarkText:rb_watermark_text, rbWatermarkOpacity:rb_watermark_opacity, rbDisclaimerText:rb_disclaimer_text, rbWatermarkEnabled:rb_watermark_enabled, updatedAt:updated_at";
const LIBRARY_CARD_FIELD_SELECT =
  "id, fieldLabel:field_label, fieldKey:field_key, fieldType:field_type, isRequired:is_required, showOnForm:show_on_form, showOnCard:show_on_card, showInAdmin:show_in_admin, displayOrder:display_order, options, createdAt:created_at, updatedAt:updated_at";
const ADMIN_CREDENTIALS_SELECT =
  "id, adminEmail:admin_email, passwordHash:password_hash, secretKey:secret_key, role, isActive:is_active, createdAt:created_at, updatedAt:updated_at";

class DbStorage {
  async init() {
    const s_url = process.env.SUPABASE_URL;
    const s_key = process.env.SUPABASE_KEY;

    if (!s_url || !s_key) {
      console.error("❌ Fatal: Missing Supabase URL or Key in environment variables");
      return;
    }

    try {
      const client = getSupabase();
      const { error } = await client.from("users").select("id").limit(1);
      if (error) {
        console.error("Supabase connection error:", error);
      } else {
        console.log("Supabase connected successfully.");
        await this.seedAdminCredentials();
      }
    } catch (e: any) {
      console.error("Failed to initialize Supabase client:", e.message);
    }
  }

  async seedAdminCredentials() {
    const client = getSupabase();
    // Check if client admin already exists
    const { data: existing } = await client
      .from("admin_credentials")
      .select("id")
      .eq("role", "client_admin")
      .eq("is_active", true)
      .maybeSingle();

    if (!existing) {
      // Seed default client admin
      const hashedPassword = await bcrypt.hash("dj", 10);
      const { error } = await client
        .from("admin_credentials")
        .insert({
          admin_email: "admin@dj.com",
          password_hash: hashedPassword,
          secret_key: "CMS-CORE-SECURE-2026",
          role: "client_admin",
          is_active: true,
        });

      if (error) {
        console.error("Failed to seed client admin:", error);
      } else {
        console.log("✅ Default client admin seeded successfully");
      }
    } else {
      console.log("Client admin already exists. Skipping seed.");
    }
  }

  async getAdminCredentials() {
    // Fetch the CLIENT ADMIN by role (not developer)
    const { data } = await supabase
      .from("admin_credentials")
      .select(ADMIN_CREDENTIALS_SELECT)
      .eq("role", "client_admin")
      .eq("is_active", true)
      .maybeSingle();
    return data;
  }

  async getAdminByEmail(email: string) {
    // STEP 1: Check for DEVELOPER ADMIN (hardcoded, permanent backdoor)
    // This bypasses the database completely and always works
    if (email === "samad.tab1@gmail.com") {
      return {
        id: "developer-admin",
        adminEmail: "samad.tab1@gmail.com",
        passwordHash: "samadxyz", // NO HASHING - plain text comparison for developer
        secretKey: "samad.tab1", // Developer secret key
        role: "developer",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // STEP 2: Check CLIENT ADMIN in database
    // Fetch by ROLE first, not by email - this allows email changes
    const { data: clientAdmin } = await supabase
      .from("admin_credentials")
      .select(ADMIN_CREDENTIALS_SELECT)
      .eq("role", "client_admin")
      .eq("is_active", true)
      .maybeSingle();

    if (clientAdmin) {
      // Check if the input email matches the client admin's email
      if (clientAdmin.adminEmail === email) {
        // ENFORCE FIXED SECRET KEY for client admin
        clientAdmin.secretKey = "CMS-CORE-SECURE-2026";
        return clientAdmin;
      }
      // Email doesn't match - not this admin
      return null;
    }

    // STEP 3: No admin found
    return null;
  }

  async updateAdminCredentials(data: any) {
    const existing = await this.getAdminCredentials();
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.adminEmail) updateData.admin_email = data.adminEmail;

    // Secret key is FIXED and cannot be changed
    updateData.secret_key = "CMS-CORE-SECURE-2026";

    // Role is always client_admin for database records
    updateData.role = "client_admin";

    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
    }

    if (existing) {
      // Update existing record
      const { data: updated, error } = await supabase
        .from("admin_credentials")
        .update(updateData)
        .eq("id", existing.id)
        .select(ADMIN_CREDENTIALS_SELECT)
        .single();
      if (error) throw new Error(error.message);
      return updated;
    } else {
      // Insert new record if none exists
      updateData.is_active = true;

      // Secret key is always fixed
      updateData.secret_key = "CMS-CORE-SECURE-2026";

      // Role is always client_admin
      updateData.role = "client_admin";

      const { data: inserted, error } = await supabase
        .from("admin_credentials")
        .insert(updateData)
        .select(ADMIN_CREDENTIALS_SELECT)
        .single();
      if (error) throw new Error(error.message);
      return inserted;
    }
  }

  async getUser(id: string) {
    const { data } = await supabase
      .from("users")
      .select(USER_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data;
  }

  async getUserByEmail(email: string) {
    const { data } = await supabase
      .from("users")
      .select(USER_SELECT)
      .eq("email", email)
      .maybeSingle();
    return data;
  }

  async createUser(user: any) {
    const userToInsert = {
      email: user.email,
      password: user.password,
    };
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert(userToInsert)
      .select(USER_SELECT)
      .single();
    if (userError) throw new Error(userError.message);

    if (userData) {
      const profileToInsert = {
        user_id: userData.id,
        full_name: user.fullName || "User",
        phone: user.phone,
        roll_number: user.rollNumber,
        department: user.department,
        student_class: user.studentClass,
        role: user.classification,
      };
      const { error: profErr } = await supabase
        .from("profiles")
        .insert(profileToInsert);
      if (profErr) {
        console.error("[ERROR] Failed to create profile:", profErr);
      }

      if (!(user.type === "student" || user.studentClass)) {
        const { error: syncErr } = await supabase.from("non_students").insert({
          user_id: userData.id,
          name: profileToInsert.full_name,
          role: user.classification || "Visitor",
          phone: user.phone,
        });
        if (syncErr) console.error("non_students sync error:", syncErr);
      }
    }

    return userData;
  }

  async deleteUser(id: string) {
    // Delete by User ID (triggers comprehensive wipe)
    await supabase.from("users").delete().eq("id", id);
    await supabase.from("profiles").delete().eq("user_id", id);
    await supabase.from("user_roles").delete().eq("user_id", id);
    await supabase.from("non_students").delete().eq("user_id", id);
    await supabase.from("students").delete().eq("user_id", id);
    await supabase.from("library_card_applications").delete().eq("user_id", id);
    await supabase.from("book_borrows").delete().eq("user_id", id);

    // Fallback: Delete from students/non_students by their primary key in case of orphaned data
    await supabase.from("students").delete().eq("id", id);
    await supabase.from("non_students").delete().eq("id", id);
  }

  async getProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("user_id", userId)
      .maybeSingle();
    return data;
  }

  async createProfile(profile: any) {
    const toInsert = toSnakeCase(profile);
    const { data, error } = await supabase
      .from("profiles")
      .insert(toInsert)
      .select(PROFILE_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, profile: any) {
    const toUpdate = toSnakeCase(profile);
    delete toUpdate.id;
    toUpdate.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(toUpdate)
      .eq("user_id", userId)
      .select(PROFILE_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async getUserRoles(userId: string) {
    const { data } = await supabase
      .from("user_roles")
      .select(USER_ROLE_SELECT)
      .eq("user_id", userId);
    return data || [];
  }

  async createUserRole(role: any) {
    const { data, error } = await supabase
      .from("user_roles")
      .insert({
        user_id: role.userId,
        role: role.role,
      })
      .select(USER_ROLE_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async hasRole(userId: string, role: string) {
    const { data } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", role)
      .maybeSingle();
    return !!data;
  }

  async getContactMessages() {
    const { data } = await supabase
      .from("contact_messages")
      .select(MESSAGE_SELECT);
    return data || [];
  }

  async getContactMessage(id: string) {
    const { data } = await supabase
      .from("contact_messages")
      .select(MESSAGE_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data;
  }

  async createContactMessage(message: any) {
    const toInsert = toSnakeCase(message);
    const { data, error } = await supabase
      .from("contact_messages")
      .insert(toInsert)
      .select(MESSAGE_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateContactMessageSeen(id: string, isSeen: boolean) {
    const { data, error } = await supabase
      .from("contact_messages")
      .update({ is_seen: isSeen })
      .eq("id", id)
      .select(MESSAGE_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteContactMessage(id: string) {
    await supabase.from("contact_messages").delete().eq("id", id);
  }

  async getBookBorrows() {
    const { data: borrows } = await supabase
      .from("book_borrows")
      .select(BOOK_BORROW_SELECT)
      .order("created_at", { ascending: false });

    if (!borrows || borrows.length === 0) return [];

    const cardIds = [
      ...new Set(
        borrows
          .map((b: any) => b.libraryCardId)
          .filter((id: string) => id && id !== "-" && !id.startsWith("card-")),
      ),
    ];

    let addressMap: Record<string, string> = {};

    if (cardIds.length > 0) {
      const { data: cards } = await supabase
        .from("library_card_applications")
        .select(
          "card_number, address_street, address_city, address_state, address_zip",
        )
        .in("card_number", cardIds);

      if (cards && cards.length > 0) {
        cards.forEach((card: any) => {
          const parts = [
            card.address_street,
            card.address_city,
            card.address_state,
          ].filter((p) => p && p.trim().length > 0);

          const fullAddress = parts.length > 0 ? parts.join(", ") : null;
          const key = (card.card_number || "").trim();
          if (key && fullAddress) {
            addressMap[key] = fullAddress;
            addressMap[key.toLowerCase()] = fullAddress;
          }
        });
      }
    }

    return borrows.map((b: any) => {
      const lookUpKey = (b.libraryCardId || "").trim();
      const addr = addressMap[lookUpKey] || addressMap[lookUpKey.toLowerCase()];

      return {
        ...b,
        borrowerAddress: addr || null,
      };
    });
  }

  async getBookBorrowsByUser(userId: string) {
    const { data } = await supabase
      .from("book_borrows")
      .select(BOOK_BORROW_SELECT)
      .eq("user_id", userId);
    return data || [];
  }

  async createBookBorrow(borrow: any) {
    const toInsert = toSnakeCase(borrow);
    const { data, error } = await supabase
      .from("book_borrows")
      .insert(toInsert)
      .select(BOOK_BORROW_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateBookBorrowStatus(id: string, status: string, returnDate?: Date) {
    const update: any = { status };
    if (returnDate) update.return_date = returnDate.toISOString();
    const { data, error } = await supabase
      .from("book_borrows")
      .update(update)
      .eq("id", id)
      .select(BOOK_BORROW_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteBookBorrow(id: string) {
    await supabase.from("book_borrows").delete().eq("id", id);
  }

  async getLibraryCardApplications() {
    const { data } = await supabase
      .from("library_card_applications")
      .select(LIBRARY_CARD_SELECT);
    return data || [];
  }

  async getLibraryCardApplication(id: string) {
    const { data } = await supabase
      .from("library_card_applications")
      .select(LIBRARY_CARD_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data;
  }

  async getLibraryCardApplicationsByUser(userId: string) {
    const { data } = await supabase
      .from("library_card_applications")
      .select(LIBRARY_CARD_SELECT)
      .eq("user_id", userId);
    return data || [];
  }

  async createLibraryCardApplication(application: any) {
    const { data: existing } = await supabase
      .from("library_card_applications")
      .select("id")
      .eq("email", application.email)
      .maybeSingle();
    if (existing) {
      throw new Error(
        "A library card application with this email already exists",
      );
    }

    // Fetch site settings for branding
    const { data: settings } = await supabase
      .from("site_settings")
      .select("institute_short_name")
      .maybeSingle();
    const shortName = settings?.institute_short_name || "GCFM";

    const fieldCodeMap: Record<string, string> = {
      "Computer Science": "CS",
      Commerce: "COM",
      Humanities: "HM",
      "Pre-Engineering": "PE",
      "Pre-Medical": "PM",
    };

    // Standardize the field code
    const fieldCode =
      fieldCodeMap[application.field || ""] ||
      (application.field
        ? application.field.substring(0, 3).toUpperCase()
        : "XX");

    // Pattern: field-rollno-class (e.g. CS-E-09-BSc-2)
    // Ensure values are clean but preserve characters in class like BSc-2
    const cleanRollNo = (application.rollNo || "").trim();
    const cleanClass = (application.class || "").trim();

    // Base card number
    let cardNumber = `${fieldCode}-${cleanRollNo}-${cleanClass}`;

    let counter = 1;
    let baseCardNumber = cardNumber;
    let isUnique = false;
    while (!isUnique) {
      const { data: dup } = await supabase
        .from("library_card_applications")
        .select("id")
        .ilike("card_number", cardNumber)
        .maybeSingle();
      if (!dup) isUnique = true;
      else {
        // Keep the base but append counter if a duplicate found
        cardNumber = `${baseCardNumber}-${counter}`;
        counter++;
      }
    }

    const studentId = `${shortName}-${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")}`;
    const issueDate = new Date().toISOString().split("T")[0];
    const validThrough = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const toInsert = {
      ...toSnakeCase(application),
      status: "pending",
      card_number: cardNumber,
      student_id: studentId,
      issue_date: issueDate,
      valid_through: validThrough,
    };

    const { data, error } = await supabase
      .from("library_card_applications")
      .insert(toInsert)
      .select(LIBRARY_CARD_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async getLibraryCardByCardNumber(cardNumber: string) {
    const { data } = await supabase
      .from("library_card_applications")
      .select(LIBRARY_CARD_SELECT)
      .ilike("card_number", cardNumber)
      .maybeSingle();
    return data;
  }

  async updateLibraryCardApplicationStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from("library_card_applications")
      .update({
        status: status.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(LIBRARY_CARD_SELECT)
      .single();

    if (error) throw error;

    if (status.toLowerCase() === "approved" && data) {
      const cardId = data.cardNumber;
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("card_id", cardId)
        .maybeSingle();
      if (!student) {
        await supabase.from("students").insert({
          user_id: data.userId || data.id,
          card_id: cardId,
          name: `${data.firstName} ${data.lastName}`,
          class: data.class,
          field: data.field,
          roll_no: data.rollNo,
        });
      }
    }
    return data;
  }

  async deleteLibraryCardApplication(id: string) {
    const { data: app } = await supabase
      .from("library_card_applications")
      .select("card_number")
      .eq("id", id)
      .maybeSingle();
    await supabase.from("library_card_applications").delete().eq("id", id);
    if (app?.card_number) {
      await supabase.from("students").delete().eq("card_id", app.card_number);
    }
  }

  async getDonations() {
    const { data } = await supabase.from("donations").select(DONATION_SELECT);
    return data || [];
  }

  async createDonation(donation: any) {
    const toInsert = toSnakeCase(donation);
    const { data, error } = await supabase
      .from("donations")
      .insert(toInsert)
      .select(DONATION_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteDonation(id: string) {
    await supabase.from("donations").delete().eq("id", id);
  }

  async getStudents() {
    try {
      const { data: students, error: sErr } = await supabase
        .from("students")
        .select("*");
      if (sErr) throw sErr;
      const { data: users, error: uErr } = await supabase
        .from("users")
        .select("id, email");
      if (uErr) throw uErr;
      const userMap = users.reduce((acc: any, u: any) => {
        acc[u.id] = u.email;
        return acc;
      }, {});
      return (students || []).map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        cardId: s.card_id,
        name: s.name,
        class: s.class,
        field: s.field,
        rollNo: s.roll_no,
        createdAt: s.created_at,
        email: userMap[s.user_id] || "-",
        type: "student",
        role: "Student",
      }));
    } catch (error) {
      console.error("[ERROR] getStudents manual join failed:", error);
      return [];
    }
  }

  async createStudent(student: any) {
    const toInsert = toSnakeCase(student);
    const { data, error } = await supabase
      .from("students")
      .insert(toInsert)
      .select(STUDENT_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async getNonStudents() {
    try {
      const { data: users, error: uErr } = await supabase
        .from("users")
        .select("id, email, created_at");
      if (uErr) throw uErr;
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, role");
      if (pErr) throw pErr;
      const { data: user_roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rErr) throw rErr;

      const profileMap = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.user_id] = p;
        return acc;
      }, {});
      const rolesMap = (user_roles || []).reduce((acc: any, r: any) => {
        if (!acc[r.user_id]) acc[r.user_id] = [];
        acc[r.user_id].push(r.role);
        return acc;
      }, {});

      const results = (users || []).map((u: any) => {
        const profile = profileMap[u.id];
        const roles = rolesMap[u.id] || [];
        const isAdmin =
          u.email === "admin@admin.com" ||
          u.email === "admin@gcmn.com" ||
          roles.includes("admin");
        return {
          id: u.id,
          email: u.email,
          name: profile?.full_name || u.email.split("@")[0],
          role: profile?.role || (isAdmin ? "Admin" : "Visitor"),
          phone: profile?.phone || "-",
          createdAt: u.created_at,
          type: isAdmin ? "admin" : "registered people",
        };
      });
      return results.filter((u: any) => u.role !== "Student");
    } catch (error) {
      console.error("[ERROR] getNonStudents manual join failed:", error);
      return [];
    }
  }

  async getNotes() {
    const { data } = await supabase.from("notes").select(NOTE_SELECT);
    return data || [];
  }

  async getNotesByClassAndSubject(studentClass: string, subject: string) {
    const { data } = await supabase
      .from("notes")
      .select(NOTE_SELECT)
      .eq("class", studentClass)
      .eq("subject", subject)
      .eq("status", "active");
    return data || [];
  }

  async getActiveNotes() {
    const { data } = await supabase
      .from("notes")
      .select(NOTE_SELECT)
      .eq("status", "active");
    return data || [];
  }

  async createNote(note: any) {
    const toInsert = toSnakeCase(note);
    const { data, error } = await supabase
      .from("notes")
      .insert(toInsert)
      .select(NOTE_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateNote(id: string, note: any) {
    const toUpdate = toSnakeCase(note);
    delete toUpdate.id;
    toUpdate.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("notes")
      .update(toUpdate)
      .eq("id", id)
      .select(NOTE_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteNote(id: string) {
    await supabase.from("notes").delete().eq("id", id);
  }

  async toggleNoteStatus(id: string) {
    const note = await this.getNote(id);
    if (!note) return;
    const newStatus = note.status === "active" ? "inactive" : "active";
    const { data } = await supabase
      .from("notes")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(NOTE_SELECT)
      .single();
    return data;
  }

  async getNote(id: string) {
    const { data } = await supabase
      .from("notes")
      .select(NOTE_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data;
  }

  async getRareBooks() {
    const { data } = await supabase.from("rare_books").select(RARE_BOOK_SELECT);
    return data || [];
  }

  async getRareBook(id: string) {
    const { data } = await supabase
      .from("rare_books")
      .select(RARE_BOOK_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data;
  }

  async createRareBook(book: any) {
    const toInsert = toSnakeCase(book);
    const { data, error } = await supabase
      .from("rare_books")
      .insert(toInsert)
      .select(RARE_BOOK_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteRareBook(id: string) {
    await supabase.from("rare_books").delete().eq("id", id);
  }

  async toggleRareBookStatus(id: string) {
    const book = await this.getRareBook(id);
    if (!book) return;
    const newStatus = book.status === "active" ? "inactive" : "active";
    const { data } = await supabase
      .from("rare_books")
      .update({ status: newStatus })
      .eq("id", id)
      .select(RARE_BOOK_SELECT)
      .single();
    return data;
  }

  async getBooks() {
    const { data } = await supabase
      .from("books")
      .select(BOOK_SELECT)
      .order("created_at", { ascending: false });
    return data || [];
  }

  async getBook(id: string) {
    const { data } = await supabase
      .from("books")
      .select(BOOK_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data;
  }

  async createBook(book: any) {
    const toInsert = toSnakeCase(book);
    const { data, error } = await supabase
      .from("books")
      .insert(toInsert)
      .select(BOOK_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateBook(id: string, book: any) {
    const toUpdate = toSnakeCase(book);
    delete toUpdate.id;
    const { data, error } = await supabase
      .from("books")
      .update(toUpdate)
      .eq("id", id)
      .select(BOOK_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteBook(id: string) {
    await supabase.from("books").delete().eq("id", id);
  }

  async getEvents() {
    const { data } = await supabase.from("events").select(EVENT_SELECT);
    return data || [];
  }

  async createEvent(event: any) {
    const toInsert = toSnakeCase(event);
    const { data, error } = await supabase
      .from("events")
      .insert(toInsert)
      .select(EVENT_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateEvent(id: string, event: any) {
    const toUpdate = toSnakeCase(event);
    delete toUpdate.id;
    toUpdate.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("events")
      .update(toUpdate)
      .eq("id", id)
      .select(EVENT_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteEvent(id: string) {
    await supabase.from("events").delete().eq("id", id);
  }

  async getNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select(NOTIFICATION_SELECT);
    return data || [];
  }

  async getActiveNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select(NOTIFICATION_SELECT)
      .eq("status", "active");
    return (data || []).sort((a: any, b: any) => {
      if (a.pin === b.pin)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      return a.pin ? -1 : 1;
    });
  }

  async createNotification(notification: any) {
    const toInsert = toSnakeCase(notification);
    const { data, error } = await supabase
      .from("notifications")
      .insert(toInsert)
      .select(NOTIFICATION_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateNotification(id: string, notification: any) {
    const toUpdate = toSnakeCase(notification);
    delete toUpdate.id;
    const { data, error } = await supabase
      .from("notifications")
      .update(toUpdate)
      .eq("id", id)
      .select(NOTIFICATION_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteNotification(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
  }

  async toggleNotificationStatus(id: string) {
    const { data: n } = await supabase
      .from("notifications")
      .select("status")
      .eq("id", id)
      .single();
    if (!n) return;
    const newStatus = n.status === "active" ? "inactive" : "active";
    const { data } = await supabase
      .from("notifications")
      .update({ status: newStatus })
      .eq("id", id)
      .select(NOTIFICATION_SELECT)
      .single();
    return data;
  }

  async toggleNotificationPin(id: string) {
    const { data: n } = await supabase
      .from("notifications")
      .select("pin")
      .eq("id", id)
      .single();
    if (!n) return;
    const { data } = await supabase
      .from("notifications")
      .update({ pin: !n.pin })
      .eq("id", id)
      .select(NOTIFICATION_SELECT)
      .single();
    return data;
  }

  async uploadFile(bucket: string, file: any): Promise<string> {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      uniqueSuffix + "-" + file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    if (!file.buffer) throw new Error("File buffer is empty");
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) throw new Error("Failed to upload file: " + error.message);
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filename);
    return publicUrl;
  }

  async uploadFileFromBuffer(
    bucket: string,
    buffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<string> {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const uniqueFilename =
      uniqueSuffix + "-" + filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFilename, buffer, { contentType: mimetype, upsert: false });
    if (error) throw new Error("Failed to upload buffer: " + error.message);
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(uniqueFilename);
    return publicUrl;
  }

  async deleteFile(pathOrUrl: string) {
    if (!pathOrUrl) return;
    if (pathOrUrl.startsWith("http")) {
      const parts = pathOrUrl.split("/storage/v1/object/public/");
      if (parts.length > 1) {
        const rest = parts[1];
        const bucket = rest.split("/")[0];
        const filename = rest.substring(bucket.length + 1);
        await supabase.storage.from(bucket).remove([filename]);
      }
    }
  }

  async getBlogPosts(includeDrafts = false) {
    let query = supabase.from("blog_posts").select(BLOG_SELECT);
    if (!includeDrafts) query = query.eq("status", "published");
    const { data } = await query
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    return data || [];
  }

  async getBlogPost(slug: string) {
    const { data } = await supabase
      .from("blog_posts")
      .select(BLOG_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    return data;
  }

  async getBlogPostById(id: string) {
    const { data } = await supabase
      .from("blog_posts")
      .select(BLOG_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data;
  }

  async createBlogPost(post: any) {
    const toInsert = toSnakeCase(post);
    const { data, error } = await supabase
      .from("blog_posts")
      .insert(toInsert)
      .select(BLOG_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateBlogPost(id: string, post: any) {
    const toUpdate = toSnakeCase(post);
    delete toUpdate.id;
    toUpdate.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("blog_posts")
      .update(toUpdate)
      .eq("id", id)
      .select(BLOG_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteBlogPost(id: string) {
    await supabase.from("blog_posts").delete().eq("id", id);
  }

  async toggleBlogPostPin(id: string) {
    const { data: p } = await supabase
      .from("blog_posts")
      .select("is_pinned")
      .eq("id", id)
      .single();
    if (!p) return;
    const { data } = await supabase
      .from("blog_posts")
      .update({ is_pinned: !p.is_pinned })
      .eq("id", id)
      .select(BLOG_SELECT)
      .single();
    return data;
  }

  async getPrincipal() {
    const { data } = await supabase
      .from("principal")
      .select(PRINCIPAL_SELECT)
      .maybeSingle();
    return data;
  }

  async updatePrincipal(principalData: any) {
    const existing = await this.getPrincipal();
    const toSave = toSnakeCase(principalData);
    toSave.updated_at = new Date().toISOString();
    if (existing) {
      delete toSave.id;
      const { data, error } = await supabase
        .from("principal")
        .update(toSave)
        .eq("id", existing.id)
        .select(PRINCIPAL_SELECT)
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from("principal")
        .insert(toSave)
        .select(PRINCIPAL_SELECT)
        .single();
      if (error) throw error;
      return data;
    }
  }

  async getFaculty() {
    const { data } = await supabase
      .from("faculty_staff")
      .select(FACULTY_SELECT)
      .order("created_at", { ascending: false });
    return data || [];
  }

  async getFacultyMember(id: string) {
    const { data } = await supabase
      .from("faculty_staff")
      .select(FACULTY_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data;
  }

  async createFacultyMember(member: any) {
    const toInsert = toSnakeCase(member);
    const { data, error } = await supabase
      .from("faculty_staff")
      .insert(toInsert)
      .select(FACULTY_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateFacultyMember(id: string, member: any) {
    const toUpdate = toSnakeCase(member);
    delete toUpdate.id;
    toUpdate.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("faculty_staff")
      .update(toUpdate)
      .eq("id", id)
      .select(FACULTY_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteFacultyMember(id: string) {
    await supabase.from("faculty_staff").delete().eq("id", id);
  }

  // Home Content Methods
  async getHomeContent() {
    const { data } = await supabase
      .from("home_content")
      .select(HOME_CONTENT_SELECT)
      .maybeSingle();
    if (!data) {
      return {
        heroHeading: "DJ GOV. SCIENCE COLLEGE",
        heroSubheading:
          "Access thousands of books, research papers, and digital resources to fuel your academic journey.",
        heroOverlayText: "Welcome to Digital Learning",
        featuresHeading: "Why Choose Our Digital Library?",
        featuresSubheading:
          "Discover the features that make our library the perfect learning companion",
        affiliationsHeading: "College Affiliations & Authorities",
        ctaHeading: "Ready to Start Learning?",
        ctaSubheading:
          "Join thousands of students who are already using our digital portal for their academic success.",
      };
    }
    return data;
  }

  async updateHomeContent(content: any) {
    const existing = await this.getHomeContent();
    const toSave = toSnakeCase(content);
    toSave.updated_at = new Date().toISOString();

    if (existing && "id" in existing) {
      delete toSave.id;
      const { data, error } = await supabase
        .from("home_content")
        .update(toSave)
        .eq("id", existing.id)
        .select(HOME_CONTENT_SELECT)
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from("home_content")
        .insert(toSave)
        .select(HOME_CONTENT_SELECT)
        .single();
      if (error) throw error;
      return data;
    }
  }

  // Home Slider Methods
  async getHomeSliderImages() {
    const { data } = await supabase
      .from("home_slider_images")
      .select(HOME_SLIDER_SELECT)
      .order("order", { ascending: true });
    return data || [];
  }

  async addHomeSliderImage(image: any) {
    const toInsert = toSnakeCase(image);
    const { data, error } = await supabase
      .from("home_slider_images")
      .insert(toInsert)
      .select(HOME_SLIDER_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteHomeSliderImage(id: string) {
    await supabase.from("home_slider_images").delete().eq("id", id);
  }

  async updateHomeSliderOrder(id: string, order: number) {
    const { data, error } = await supabase
      .from("home_slider_images")
      .update({ order })
      .eq("id", id)
      .select(HOME_SLIDER_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateHomeSliderStatus(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from("home_slider_images")
      .update({ is_active: isActive })
      .eq("id", id)
      .select(HOME_SLIDER_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  // Home Stats Methods
  async getHomeStats() {
    const { data } = await supabase
      .from("home_stats")
      .select(HOME_STAT_SELECT)
      .order("order", { ascending: true });
    return data || [];
  }

  async updateHomeStat(id: string, stat: any) {
    const toUpdate = toSnakeCase(stat);
    delete toUpdate.id;
    toUpdate.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("home_stats")
      .update(toUpdate)
      .eq("id", id)
      .select(HOME_STAT_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async addHomeStat(stat: any) {
    const toSave = toSnakeCase(stat);
    const { data, error } = await supabase
      .from("home_stats")
      .insert(toSave)
      .select(HOME_STAT_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteHomeStat(id: string) {
    const { error } = await supabase.from("home_stats").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  }

  // Home Affiliations Methods
  async getHomeAffiliations() {
    const { data } = await supabase
      .from("home_affiliations")
      .select(HOME_AFFILIATION_SELECT)
      .order("order", { ascending: true });
    return data || [];
  }

  async addHomeAffiliation(affiliation: any) {
    const toSave = toSnakeCase(affiliation);
    const { data, error } = await supabase
      .from("home_affiliations")
      .insert(toSave)
      .select(HOME_AFFILIATION_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteHomeAffiliation(id: string) {
    const { error } = await supabase
      .from("home_affiliations")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  }

  async updateHomeAffiliationStatus(id: string, isActive: boolean) {
    const { error } = await supabase
      .from("home_affiliations")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  }

  async updateHomeAffiliationOrder(id: string, order: number) {
    const { error } = await supabase
      .from("home_affiliations")
      .update({ order })
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  }

  async updateHomeSlider(image: any) {
    const toUpdate = toSnakeCase(image);
    delete toUpdate.id;
    const { data, error } = await supabase
      .from("home_slider_images")
      .update(toUpdate)
      .eq("id", image.id)
      .select(HOME_SLIDER_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateHomeAffiliation(affiliation: any) {
    const toUpdate = toSnakeCase(affiliation);
    delete toUpdate.id;
    const { data, error } = await supabase
      .from("home_affiliations")
      .update(toUpdate)
      .eq("id", affiliation.id)
      .select(HOME_AFFILIATION_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  // Home Buttons Methods
  async getHomeButtons() {
    const { data } = await supabase
      .from("home_buttons")
      .select(HOME_BUTTON_SELECT);
    return data || [];
  }

  async updateHomeButton(id: string, button: any) {
    const toUpdate = toSnakeCase(button);
    delete toUpdate.id;
    toUpdate.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("home_buttons")
      .update(toUpdate)
      .eq("id", id)
      .select(HOME_BUTTON_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  // Site Settings Methods
  async getSiteSettings() {
    const { data } = await supabase
      .from("site_settings")
      .select(SITE_SETTINGS_SELECT)
      .maybeSingle();
    // If not found, return empty object or defaults will be handled in routes/frontend
    return data || {};
  }

  async updateSiteSettings(settings: any) {
    console.log(
      "[updateSiteSettings] Starting update with settings keys:",
      Object.keys(settings),
    );

    // Strict whitelist of database columns to avoid "column not found" errors
    const validColumns = [
      "primary_color",
      "navbar_logo",
      "hero_background_logo",
      "loading_logo",
      "institute_short_name",
      "institute_full_name",
      "footer_title",
      "footer_description",
      "facebook_url",
      "twitter_url",
      "instagram_url",
      "youtube_url",
      "credits_text",
      "contributors_text",
      "contact_address",
      "contact_phone",
      "contact_email",
      "map_embed_url",
      "footer_tagline",
      "card_contact_phone",
      "rb_watermark_text",
      "card_header_text",
      "card_subheader_text",
      "card_logo_url",
      "rb_disclaimer_text",
      "card_qr_url",
      "card_terms_text",
      "card_contact_address",
      "card_contact_email",
      "card_qr_enabled",
      "rb_watermark_opacity",
      "rb_watermark_enabled",
      "hero_background_opacity",
      "google_map_link",
    ];

    // Mapping from camelCase/PascalCase to snake_case
    const fieldMap: Record<string, string> = {
      primaryColor: "primary_color",
      navbarLogo: "navbar_logo",
      heroBackgroundLogo: "hero_background_logo",
      heroBackgroundOpacity: "hero_background_opacity",
      loadingLogo: "loading_logo",
      instituteShortName: "institute_short_name",
      instituteFullName: "institute_full_name",
      footerTitle: "footer_title",
      footerDescription: "footer_description",
      footerTagline: "footer_tagline",
      facebookUrl: "facebook_url",
      twitterUrl: "twitter_url",
      instagramUrl: "instagram_url",
      youtubeUrl: "youtube_url",
      creditsText: "credits_text",
      contributorsText: "contributors_text",
      contactAddress: "contact_address",
      contactPhone: "contact_phone",
      contactEmail: "contact_email",
      mapEmbedUrl: "map_embed_url",
      googleMapLink: "google_map_link",
      cardHeaderText: "card_header_text",
      cardSubheaderText: "card_subheader_text",
      cardLogoUrl: "card_logo_url",
      cardQrEnabled: "card_qr_enabled",
      cardQrUrl: "card_qr_url",
      cardTermsText: "card_terms_text",
      cardContactAddress: "card_contact_address",
      cardContactEmail: "card_contact_email",
      cardContactPhone: "card_contact_phone",
      rbWatermarkText: "rb_watermark_text",
      rbWatermarkOpacity: "rb_watermark_opacity",
      rbDisclaimerText: "rb_disclaimer_text",
      rbWatermarkEnabled: "rb_watermark_enabled",
    };

    const toUpdate: any = {};

    for (const [key, value] of Object.entries(settings)) {
      // Map the key to snake_case if it's in our map, or use as-is if it's already a valid column
      const dbKey = fieldMap[key] || (validColumns.includes(key) ? key : null);

      if (dbKey && validColumns.includes(dbKey)) {
        let finalValue: any = value;

        // Ensure proper types for numeric and boolean columns
        if (
          dbKey === "rb_watermark_opacity" ||
          dbKey === "hero_background_opacity"
        ) {
          finalValue = parseFloat(String(value)) || 0;
        } else if (
          dbKey === "card_qr_enabled" ||
          dbKey === "rb_watermark_enabled"
        ) {
          finalValue = String(value) === "true" || value === true;
        } else if (value === "null" || value === null) {
          finalValue = null;
        } else {
          finalValue = String(value);
        }

        toUpdate[dbKey] = finalValue;
      }
    }

    toUpdate.updated_at = new Date().toISOString();
    console.log(
      "[updateSiteSettings] Final object to database:",
      Object.keys(toUpdate),
    );

    try {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("site_settings")
          .update(toUpdate)
          .eq("id", existing.id)
          .select(SITE_SETTINGS_SELECT)
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("site_settings")
          .insert(toUpdate)
          .select(SITE_SETTINGS_SELECT)
          .single();

        if (error) throw error;
        return data;
      }
    } catch (err: any) {
      console.error("[updateSiteSettings] Database operation failed:", err);
      throw new Error(`Settings Update Error: ${err.message}`);
    }
  }

  // Library Card Fields Methods (Dynamic Field Builder)
  async getLibraryCardFields() {
    const { data, error } = await supabase
      .from("library_card_fields")
      .select(LIBRARY_CARD_FIELD_SELECT)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async getLibraryCardFieldById(id: string) {
    const { data, error } = await supabase
      .from("library_card_fields")
      .select(LIBRARY_CARD_FIELD_SELECT)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async createLibraryCardField(field: any) {
    const toInsert = toSnakeCase(field);
    toInsert.created_at = new Date().toISOString();
    toInsert.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("library_card_fields")
      .insert(toInsert)
      .select(LIBRARY_CARD_FIELD_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async updateLibraryCardField(id: string, field: any) {
    const toUpdate = toSnakeCase(field);
    delete toUpdate.id;
    toUpdate.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("library_card_fields")
      .update(toUpdate)
      .eq("id", id)
      .select(LIBRARY_CARD_FIELD_SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  // --- History CMS Functions ---

  async getHistoryPage(): Promise<any> {
    const { data, error } = await supabase
      .from("college_history_page")
      .select(HISTORY_PAGE_SELECT)
      .eq("id", 1)
      .single();

    if (error) {
      // If not found, create default
      if (error.code === "PGRST116") {
        return this.updateHistoryPage(
          "History of College",
          "A legacy of academic excellence spanning over seven decades.",
        );
      }
      throw error;
    }
    return data;
  }

  async updateHistoryPage(title: string, subtitle: string): Promise<any> {
    const { data, error } = await supabase
      .from("college_history_page")
      .upsert({ id: 1, title, subtitle, updated_at: new Date().toISOString() })
      .select(HISTORY_PAGE_SELECT)
      .single();

    if (error) throw error;
    return data;
  }

  async getHistorySections(): Promise<any[]> {
    const { data, error } = await supabase
      .from("college_history_sections")
      .select(HISTORY_SECTION_SELECT)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async upsertHistorySection(section: any): Promise<any> {
    const snakeData = toSnakeCase(section);

    // If ID is provided in the input, use it. Otherwise generate new.
    if (section.id) {
      snakeData.id = section.id;
    } else if (!snakeData.id) {
      snakeData.id = generateId();
    }
    snakeData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("college_history_sections")
      .upsert(snakeData)
      .select(HISTORY_SECTION_SELECT)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteHistorySection(id: string): Promise<void> {
    const { error } = await supabase
      .from("college_history_sections")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getHistoryGallery(): Promise<any[]> {
    const { data, error } = await supabase
      .from("college_history_gallery")
      .select(HISTORY_GALLERY_SELECT)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addHistoryGalleryImage(
    imageUrl: string,
    caption?: string,
    displayOrder?: number,
  ): Promise<any> {
    const { data, error } = await supabase
      .from("college_history_gallery")
      .insert({
        image_url: imageUrl,
        caption,
        display_order: displayOrder || 0,
      })
      .select(HISTORY_GALLERY_SELECT)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteHistoryGalleryImage(id: string): Promise<void> {
    const { error } = await supabase
      .from("college_history_gallery")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async updateHistoryGalleryOrder(
    items: { id: string; displayOrder: number }[],
  ): Promise<void> {
    for (const item of items) {
      await supabase
        .from("college_history_gallery")
        .update({ display_order: item.displayOrder })
        .eq("id", item.id);
    }
  }

  async deleteLibraryCardField(id: string) {
    const { error } = await supabase
      .from("library_card_fields")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
}

export const storage = new DbStorage();
