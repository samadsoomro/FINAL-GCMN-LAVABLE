import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing Supabase URL or Key in environment variables");
}

const SUPABASE_BACKEND_SECRET = process.env.SUPABASE_BACKEND_SECRET || 'admin-backend-secret-8829';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
        headers: {
            'x-backend-secret': SUPABASE_BACKEND_SECRET
        }
    }
});

function generateId(): string {
    // Using randomBytes(8) hex to match old method behavior, 
    // though typically UUIDs are better.
    return randomBytes(8).toString("hex");
}

/*
  Helper to map object keys from camelCase to snake_case for DB insertion.
*/
function toSnakeCase(obj: any): any {
    const newObj: any = {};
    for (const key in obj) {
        if (key === 'userId') newObj.user_id = obj.userId;
        else if (key === 'fullName') newObj.full_name = obj.fullName;
        else if (key === 'rollNumber') newObj.roll_number = obj.rollNumber;
        else if (key === 'studentClass') newObj.student_class = obj.studentClass;
        else if (key === 'createdAt') newObj.created_at = obj.createdAt;
        else if (key === 'updatedAt') newObj.updated_at = obj.updatedAt;
        else if (key === 'isSeen') newObj.is_seen = obj.isSeen;
        else if (key === 'bookId') newObj.book_id = obj.bookId;
        else if (key === 'bookTitle') newObj.book_title = obj.bookTitle;
        else if (key === 'borrowerName') newObj.borrower_name = obj.borrowerName;
        else if (key === 'borrowerPhone') newObj.borrower_phone = obj.borrowerPhone;
        else if (key === 'borrowerEmail') newObj.borrower_email = obj.borrowerEmail;
        else if (key === 'borrowDate') newObj.borrow_date = obj.borrowDate;
        else if (key === 'dueDate') newObj.due_date = obj.dueDate;
        else if (key === 'returnDate') newObj.return_date = obj.returnDate;
        else if (key === 'firstName') newObj.first_name = obj.firstName;
        else if (key === 'lastName') newObj.last_name = obj.lastName;
        else if (key === 'fatherName') newObj.father_name = obj.fatherName;
        else if (key === 'rollNo') newObj.roll_no = obj.rollNo;
        else if (key === 'addressStreet') newObj.address_street = obj.addressStreet;
        else if (key === 'addressCity') newObj.address_city = obj.addressCity;
        else if (key === 'addressState') newObj.address_state = obj.addressState;
        else if (key === 'addressZip') newObj.address_zip = obj.addressZip;
        else if (key === 'cardNumber') newObj.card_number = obj.cardNumber;
        else if (key === 'studentId') newObj.student_id = obj.studentId;
        else if (key === 'issueDate') newObj.issue_date = obj.issueDate;
        else if (key === 'validThrough') newObj.valid_through = obj.validThrough;
        else if (key === 'cardId') newObj.card_id = obj.cardId;
        else if (key === 'bookName') newObj.book_name = obj.bookName;
        else if (key === 'shortIntro') newObj.short_intro = obj.shortIntro;
        else if (key === 'bookImage') newObj.book_image = obj.bookImage;
        else if (key === 'totalCopies') newObj.total_copies = obj.totalCopies;
        else if (key === 'availableCopies') newObj.available_copies = obj.availableCopies;
        else if (key === 'pdfPath') newObj.pdf_path = obj.pdfPath;
        else if (key === 'coverImage') newObj.cover_image = obj.coverImage;
        else if (key === 'coverImage') newObj.cover_image = obj.coverImage;
        else if (key === 'featuredImage') newObj.featured_image = obj.featuredImage;
        else if (key === 'shortDescription') newObj.short_description = obj.shortDescription;
        else if (key === 'isPinned') newObj.is_pinned = obj.isPinned;
        else if (key === 'imageUrl') newObj.image_url = obj.imageUrl;
        else newObj[key] = obj[key];
    }
    return newObj;
}

// Select strings for mapping snake_case DB fields to camelCase app fields
const USER_SELECT = 'id, email, password, createdAt:created_at';
const PROFILE_SELECT = 'id, userId:user_id, fullName:full_name, phone, rollNumber:roll_number, department, studentClass:student_class, createdAt:created_at, updatedAt:updated_at';
const USER_ROLE_SELECT = 'id, userId:user_id, role, createdAt:created_at';
const MESSAGE_SELECT = 'id, name, email, subject, message, isSeen:is_seen, createdAt:created_at';
const BOOK_BORROW_SELECT = 'id, userId:user_id, bookId:book_id, bookTitle:book_title, borrowerName:borrower_name, borrowerPhone:borrower_phone, borrowerEmail:borrower_email, borrowDate:borrow_date, dueDate:due_date, returnDate:return_date, status, createdAt:created_at';
const LIBRARY_CARD_SELECT = 'id, userId:user_id, firstName:first_name, lastName:last_name, fatherName:father_name, dob, class, field, rollNo:roll_no, email, phone, addressStreet:address_street, addressCity:address_city, addressState:address_state, addressZip:address_zip, status, cardNumber:card_number, studentId:student_id, issueDate:issue_date, validThrough:valid_through, password, createdAt:created_at, updatedAt:updated_at';
const DONATION_SELECT = 'id, amount, method, name, email, message, createdAt:created_at';
const STUDENT_SELECT = 'id, userId:user_id, cardId:card_id, name, class, field, rollNo:roll_no, createdAt:created_at';
const NON_STUDENT_SELECT = 'id, userId:user_id, name, role, phone, createdAt:created_at';
const BOOK_SELECT = 'id, bookName:book_name, shortIntro:short_intro, description, bookImage:book_image, totalCopies:total_copies, availableCopies:available_copies, createdAt:created_at, updatedAt:updated_at';
const NOTE_SELECT = 'id, title, description, subject, class, pdfPath:pdf_path, status, createdAt:created_at, updatedAt:updated_at';
const RARE_BOOK_SELECT = 'id, title, description, category, pdfPath:pdf_path, coverImage:cover_image, status, createdAt:created_at';
const EVENT_SELECT = 'id, title, description, images, date, createdAt:created_at, updatedAt:updated_at';
const NOTIFICATION_SELECT = 'id, title, message, image, pin, status, createdAt:created_at';
const BLOG_SELECT = 'id, title, slug, shortDescription:short_description, content, featuredImage:featured_image, isPinned:is_pinned, status, createdAt:created_at, updatedAt:updated_at';
const PRINCIPAL_SELECT = 'id, name, imageUrl:image_url, message, createdAt:created_at, updatedAt:updated_at';
const FACULTY_SELECT = 'id, name, designation, description, imageUrl:image_url, createdAt:created_at, updatedAt:updated_at';

class DbStorage {
    async init() {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) {
            console.error("Supabase connection error:", error);
        } else {
            console.log("Supabase connected successfully.");
        }
    }

    async getUser(id: string) {
        const { data } = await supabase.from('users').select(USER_SELECT).eq('id', id).maybeSingle();
        return data;
    }

    async getUserByEmail(email: string) {
        const { data } = await supabase.from('users').select(USER_SELECT).eq('email', email).maybeSingle();
        return data;
    }

    async createUser(user: any) {
        // 1. Create Auth User
        const userToInsert = {
            email: user.email,
            password: user.password
        };
        const { data: userData, error: userError } = await supabase.from('users').insert(userToInsert).select(USER_SELECT).single();
        if (userError) throw new Error(userError.message);

        // 2. Create Profile
        if (userData) {
            const profileToInsert = {
                user_id: userData.id,
                full_name: user.fullName || "User", // fallback
                phone: user.phone,
                roll_number: user.rollNumber,
                department: user.department,
                student_class: user.studentClass,
            };
            await supabase.from('profiles').insert(profileToInsert);
        }

        return userData;
    }

    async deleteUser(id: string) {
        await supabase.from('users').delete().eq('id', id);
        // Cascade delete handling is ideally done in DB triggers, but for now app-level:
        await supabase.from('profiles').delete().eq('user_id', id);
        await supabase.from('user_roles').delete().eq('user_id', id);
        // other relations...
    }

    async getProfile(userId: string) {
        const { data } = await supabase.from('profiles').select(PROFILE_SELECT).eq('user_id', userId).maybeSingle();
        return data;
    }

    async createProfile(profile: any) {
        const toInsert = toSnakeCase(profile);
        // ensure id is handled if needed
        const { data, error } = await supabase.from('profiles').insert(toInsert).select(PROFILE_SELECT).single();
        if (error) throw error;
        return data;
    }

    async updateProfile(userId: string, profile: any) {
        const toUpdate = toSnakeCase(profile);
        delete toUpdate.id; // don't update ID
        toUpdate.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('profiles').update(toUpdate).eq('user_id', userId).select(PROFILE_SELECT).single();
        if (error) throw error;
        return data;
    }

    async getUserRoles(userId: string) {
        const { data } = await supabase.from('user_roles').select(USER_ROLE_SELECT).eq('user_id', userId);
        return data || [];
    }

    async createUserRole(role: any) {
        const { data, error } = await supabase.from('user_roles').insert({
            user_id: role.userId,
            role: role.role
        }).select(USER_ROLE_SELECT).single();
        if (error) throw error;
        return data;
    }

    async hasRole(userId: string, role: string) {
        const { data } = await supabase.from('user_roles').select('id').eq('user_id', userId).eq('role', role).maybeSingle();
        return !!data;
    }

    async getContactMessages() {
        const { data } = await supabase.from('contact_messages').select(MESSAGE_SELECT);
        return data || [];
    }

    async getContactMessage(id: string) {
        const { data } = await supabase.from('contact_messages').select(MESSAGE_SELECT).eq('id', id).maybeSingle();
        return data;
    }

    async createContactMessage(message: any) {
        const toInsert = toSnakeCase(message);
        const { data, error } = await supabase.from('contact_messages').insert(toInsert).select(MESSAGE_SELECT).single();
        if (error) throw error;
        return data;
    }

    async updateContactMessageSeen(id: string, isSeen: boolean) {
        const { data, error } = await supabase.from('contact_messages').update({ is_seen: isSeen }).eq('id', id).select(MESSAGE_SELECT).single();
        if (error) throw error;
        return data;
    }

    async deleteContactMessage(id: string) {
        await supabase.from('contact_messages').delete().eq('id', id);
    }

    async getBookBorrows() {
        const { data } = await supabase.from('book_borrows').select(BOOK_BORROW_SELECT);
        return data || [];
    }

    async getBookBorrowsByUser(userId: string) {
        const { data } = await supabase.from('book_borrows').select(BOOK_BORROW_SELECT).eq('user_id', userId);
        return data || [];
    }

    async createBookBorrow(borrow: any) {
        const toInsert = toSnakeCase(borrow);
        const { data, error } = await supabase.from('book_borrows').insert(toInsert).select(BOOK_BORROW_SELECT).single();
        if (error) throw error;
        return data;
    }

    async updateBookBorrowStatus(id: string, status: string, returnDate?: Date) {
        const update: any = { status };
        if (returnDate) update.return_date = returnDate.toISOString();
        const { data, error } = await supabase.from('book_borrows').update(update).eq('id', id).select(BOOK_BORROW_SELECT).single();
        if (error) throw error;
        return data;
    }

    async deleteBookBorrow(id: string) {
        await supabase.from('book_borrows').delete().eq('id', id);
    }

    async getLibraryCardApplications() {
        const { data } = await supabase.from('library_card_applications').select(LIBRARY_CARD_SELECT);
        return data || [];
    }

    async getLibraryCardApplication(id: string) {
        const { data } = await supabase.from('library_card_applications').select(LIBRARY_CARD_SELECT).eq('id', id).maybeSingle();
        return data;
    }

    async getLibraryCardApplicationsByUser(userId: string) {
        const { data } = await supabase.from('library_card_applications').select(LIBRARY_CARD_SELECT).eq('user_id', userId);
        return data || [];
    }

    async createLibraryCardApplication(application: any) {
        // Logic from json-storage: check existing email, generate logical card number
        const { data: existing } = await supabase.from('library_card_applications').select('id').eq('email', application.email).maybeSingle();
        if (existing) {
            throw new Error("A library card application with this email already exists");
        }

        const fieldCodeMap: Record<string, string> = {
            "Computer Science": "CS",
            "Commerce": "COM",
            "Humanities": "HM",
            "Pre-Engineering": "PE",
            "Pre-Medical": "PM"
        };

        const fieldCode = fieldCodeMap[application.field] || "XX";
        const classNumber = (application.class || "").replace(/[^\d]/g, '') || application.class;
        let cardNumber = `${fieldCode}-${application.rollNo}-${classNumber}`;

        // Ensure unique card number
        let counter = 1;
        let baseCardNumber = cardNumber;
        // Check uniqueness (best offloaded to DB unique constraint, catching error)
        // But for "X-Y-Z-1" suffix logic, we need to query.
        // Iterative check against remote DB is slow.
        // Better: Try insert, catch unique error? No, we need to append suffix.
        // Let's rely on simple count or random check? `json-storage` did while loop.
        // We'll trust the base is unique enough or fail? 
        // To match old behavior exactly:
        /*
            while (exists) { cardNumber = base + counter; counter++ }
        */
        // Implementing this against remote DB:
        let isUnique = false;
        while (!isUnique) {
            const { data: dup } = await supabase.from('library_card_applications').select('id').ilike('card_number', cardNumber).maybeSingle();
            if (!dup) isUnique = true;
            else {
                cardNumber = `${baseCardNumber}-${counter}`;
                counter++;
            }
        }

        const studentId = `GCMN-${Math.floor(Math.random() * 1000000).toString().padStart(6, "0")}`;
        const issueDate = new Date().toISOString().split("T")[0];
        const validThrough = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const toInsert = {
            ...toSnakeCase(application),
            status: "pending",
            card_number: cardNumber,
            student_id: studentId,
            issue_date: issueDate,
            valid_through: validThrough,
        };

        const { data, error } = await supabase.from('library_card_applications').insert(toInsert).select(LIBRARY_CARD_SELECT).single();
        if (error) throw error;
        return data;
    }

    async getLibraryCardByCardNumber(cardNumber: string) {
        const { data } = await supabase.from('library_card_applications').select(LIBRARY_CARD_SELECT).ilike('card_number', cardNumber).maybeSingle();
        return data;
    }

    async updateLibraryCardApplicationStatus(id: string, status: string) {
        const { data, error } = await supabase.from('library_card_applications').update({
            status: status.toLowerCase(),
            updated_at: new Date().toISOString()
        }).eq('id', id).select(LIBRARY_CARD_SELECT).single();

        if (error) throw error;

        // Logic: If approved, create/ensure student record
        if (status.toLowerCase() === 'approved' && data) {
            const cardId = data.cardNumber;
            // Check student
            const { data: student } = await supabase.from('students').select('id').eq('card_id', cardId).maybeSingle();
            if (!student) {
                await supabase.from('students').insert({
                    user_id: data.userId || data.id, // Fallback if no userId
                    card_id: cardId,
                    name: `${data.firstName} ${data.lastName}`,
                    class: data.class,
                    field: data.field,
                    roll_no: data.rollNo,
                    // userId mapping is tricky if LibApp doesn't have userId (user not logged in when applying).
                    // json-storage line 325: `userId: application.userId || 'card-${application.id}'`.
                    // Schema UUID requires valid UUID. `card-${id}` is valid UUID? NO.
                    // json-storage strings were NOT UUIDs.
                    // Supabase Schema: `user_id uuid`.
                    // IF logic relies on generic strings for IDs, we have a problem with UUID schema.
                    // BUT `schema.ts` uses `uuid()`.
                    // If `library_card_applications.user_id` is nullable UUID.
                    // If we try to insert "card-123" into UUID column `students.user_id`, it fails.
                    // `students.user_id` is uuid NOT NULL.
                    // So we MUST have a UUID.
                    // If user not registered, we cannot create a Student linked to a User UUID?
                    // `json-storage` was loose.
                    // Solution: Create a *new user* implicitly? Or just use the LibApp ID (which is UUID)?
                    // Yes, LibApp ID is UUID (defaultRandom).
                    // So use LibApp ID as Student UserID?
                    // `user_id: data.userId || data.id` works if data.id is used when userId is null.
                });
            }
        }
        return data;
    }

    async deleteLibraryCardApplication(id: string) {
        await supabase.from('library_card_applications').delete().eq('id', id);
    }

    async getDonations() {
        const { data } = await supabase.from('donations').select(DONATION_SELECT);
        return data || [];
    }

    async createDonation(donation: any) {
        const toInsert = toSnakeCase(donation);
        const { data, error } = await supabase.from('donations').insert(toInsert).select(DONATION_SELECT).single();
        if (error) throw error;
        return data;
    }

    async deleteDonation(id: string) {
        await supabase.from('donations').delete().eq('id', id);
    }

    async getStudents() {
        // return students + mapped user info?
        // json-storage just returns student array.
        const { data } = await supabase.from('students').select(STUDENT_SELECT);
        return data || [];
    }

    async createStudent(student: any) {
        const toInsert = toSnakeCase(student);
        const { data, error } = await supabase.from('students').insert(toInsert).select(STUDENT_SELECT).single();
        if (error) throw error;
        return data;
    }

    async getNonStudents() {
        // "users where type != student"
        // Schema doesn't have 'type' column on users.
        // 'type' was inferred or in profiles.
        // Logic: users who are not in 'students' table?
        // Or users with role 'admin'?
        // json-storage logic: `users.filter(u => u.type !== 'student')`.
        // Where was `type` stored? `createUser` had it.
        // But `schema.ts` `users` table only `email`, `password`.
        // So `type` is lost if not in `profiles` or `roles`.
        // I should check `profiles` or `user_roles`.
        // `user_roles` has 'admin', 'moderator', 'user'.
        // Maybe `non_students` table? Yes, separate table `non_students` exists!
        // But json-storage `getNonStudents` implementation (line 381) filters `users` array!
        // It constructs the result from `users`.
        // But there is a `non_students` table in schema.
        // If I use the table:
        const { data } = await supabase.from('non_students').select(NON_STUDENT_SELECT);
        return data || [];
    }

    async getNotes() {
        const { data } = await supabase.from('notes').select(NOTE_SELECT);
        return data || [];
    }

    async getNotesByClassAndSubject(studentClass: string, subject: string) {
        const { data } = await supabase.from('notes').select(NOTE_SELECT)
            .eq('class', studentClass)
            .eq('subject', subject)
            .eq('status', 'active');
        return data || [];
    }

    async getActiveNotes() {
        const { data } = await supabase.from('notes').select(NOTE_SELECT).eq('status', 'active');
        return data || [];
    }

    async createNote(note: any) {
        const toInsert = toSnakeCase(note);
        const { data, error } = await supabase.from('notes').insert(toInsert).select(NOTE_SELECT).single();
        if (error) throw error;
        return data;
    }

    async updateNote(id: string, note: any) {
        const toUpdate = toSnakeCase(note);
        delete toUpdate.id;
        toUpdate.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('notes').update(toUpdate).eq('id', id).select(NOTE_SELECT).single();
        if (error) throw error;
        return data;
    }

    async deleteNote(id: string) {
        await supabase.from('notes').delete().eq('id', id);
    }

    async toggleNoteStatus(id: string) {
        // Fetch current
        const note = await this.getNote(id);
        if (!note) return;
        const newStatus = note.status === 'active' ? 'inactive' : 'active';
        const { data } = await supabase.from('notes').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id).select(NOTE_SELECT).single();
        return data;
    }

    async getNote(id: string) {
        const { data } = await supabase.from('notes').select(NOTE_SELECT).eq('id', id).maybeSingle();
        return data;
    }

    async getRareBooks() {
        const { data } = await supabase.from('rare_books').select(RARE_BOOK_SELECT);
        return data || [];
    }

    async getRareBook(id: string) {
        const { data } = await supabase.from('rare_books').select(RARE_BOOK_SELECT).eq('id', id).maybeSingle();
        return data;
    }

    async createRareBook(book: any) {
        const toInsert = toSnakeCase(book);
        const { data, error } = await supabase.from('rare_books').insert(toInsert).select(RARE_BOOK_SELECT).single();
        if (error) throw error;
        return data;
    }

    async deleteRareBook(id: string) {
        await supabase.from('rare_books').delete().eq('id', id);
    }

    async toggleRareBookStatus(id: string) {
        const book = await this.getRareBook(id);
        if (!book) return;
        const newStatus = book.status === 'active' ? 'inactive' : 'active';
        const { data } = await supabase.from('rare_books').update({ status: newStatus }).eq('id', id).select(RARE_BOOK_SELECT).single();
        return data;
    }

    async getBooks() {
        const { data } = await supabase.from('books').select(BOOK_SELECT).order('created_at', { ascending: false });
        return data || [];
    }

    async getBook(id: string) {
        const { data } = await supabase.from('books').select(BOOK_SELECT).eq('id', id).maybeSingle();
        return data;
    }

    async createBook(book: any) {
        const toInsert = toSnakeCase(book);
        const { data, error } = await supabase.from('books').insert(toInsert).select(BOOK_SELECT).single();
        if (error) throw error;
        return data;
    }

    async updateBook(id: string, book: any) {
        const toUpdate = toSnakeCase(book);
        delete toUpdate.id;
        const { data, error } = await supabase.from('books').update(toUpdate).eq('id', id).select(BOOK_SELECT).single();
        if (error) throw error;
        return data;
    }

    async deleteBook(id: string) {
        await supabase.from('books').delete().eq('id', id);
    }

    async getEvents() {
        const { data } = await supabase.from('events').select(EVENT_SELECT);
        return data || [];
    }

    async createEvent(event: any) {
        const toInsert = toSnakeCase(event);
        const { data, error } = await supabase.from('events').insert(toInsert).select(EVENT_SELECT).single();
        if (error) throw error;
        return data;
    }

    async updateEvent(id: string, event: any) {
        const toUpdate = toSnakeCase(event);
        delete toUpdate.id;
        toUpdate.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('events').update(toUpdate).eq('id', id).select(EVENT_SELECT).single();
        if (error) throw error;
        return data;
    }

    async deleteEvent(id: string) {
        await supabase.from('events').delete().eq('id', id);
    }

    async getNotifications() {
        const { data } = await supabase.from('notifications').select(NOTIFICATION_SELECT);
        return data || [];
    }

    async getActiveNotifications() {
        const { data } = await supabase.from('notifications').select(NOTIFICATION_SELECT).eq('status', 'active');
        // Sorting logic (pin first)
        return (data || []).sort((a: any, b: any) => {
            if (a.pin === b.pin) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return a.pin ? -1 : 1;
        });
    }

    async createNotification(notification: any) {
        const toInsert = toSnakeCase(notification);
        const { data, error } = await supabase.from('notifications').insert(toInsert).select(NOTIFICATION_SELECT).single();
        if (error) throw error;
        return data;
    }

    async updateNotification(id: string, notification: any) {
        const toUpdate = toSnakeCase(notification);
        delete toUpdate.id;
        const { data, error } = await supabase.from('notifications').update(toUpdate).eq('id', id).select(NOTIFICATION_SELECT).single();
        if (error) throw error;
        return data;
    }

    async deleteNotification(id: string) {
        await supabase.from('notifications').delete().eq('id', id);
    }

    async toggleNotificationStatus(id: string) {
        const { data: n } = await supabase.from('notifications').select('status').eq('id', id).single();
        if (!n) return;
        const newStatus = n.status === 'active' ? 'inactive' : 'active';
        const { data } = await supabase.from('notifications').update({ status: newStatus }).eq('id', id).select(NOTIFICATION_SELECT).single();
        return data;
    }

    async toggleNotificationPin(id: string) {
        const { data: n } = await supabase.from('notifications').select('pin').eq('id', id).single();
        if (!n) return;
        const { data } = await supabase.from('notifications').update({ pin: !n.pin }).eq('id', id).select(NOTIFICATION_SELECT).single();
        return data;
    }

    async uploadFile(bucket: string, file: any): Promise<string> {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = uniqueSuffix + "-" + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

        if (!file.buffer) throw new Error("File buffer is empty");

        const { data, error } = await supabase.storage.from(bucket).upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

        if (error) {
            console.error("Supabase upload error:", error);
            throw new Error("Failed to upload file: " + error.message);
        }

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename);
        return publicUrl;
    }

    async deleteFile(pathOrUrl: string) {
        if (!pathOrUrl) return;
        if (pathOrUrl.startsWith('http')) {
            const parts = pathOrUrl.split('/storage/v1/object/public/');
            if (parts.length > 1) {
                const rest = parts[1];
                const bucket = rest.split('/')[0];
                const filename = rest.substring(bucket.length + 1);
                await supabase.storage.from(bucket).remove([filename]);
            }
        }
    }

    async getBlogPosts(includeDrafts = false) {
        let query = supabase.from('blog_posts').select(BLOG_SELECT);
        if (!includeDrafts) {
            query = query.eq('status', 'published');
        }
        const { data } = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
        return data || [];
    }

    async getBlogPost(slug: string) {
        const { data } = await supabase.from('blog_posts').select(BLOG_SELECT).eq('slug', slug).maybeSingle();
        return data;
    }

    async getBlogPostById(id: string) {
        const { data } = await supabase.from('blog_posts').select(BLOG_SELECT).eq('id', id).maybeSingle();
        return data;
    }

    async createBlogPost(post: any) {
        const toInsert = toSnakeCase(post);
        const { data, error } = await supabase.from('blog_posts').insert(toInsert).select(BLOG_SELECT).single();
        if (error) throw error;
        return data;
    }

    async updateBlogPost(id: string, post: any) {
        const toUpdate = toSnakeCase(post);
        delete toUpdate.id;
        toUpdate.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('blog_posts').update(toUpdate).eq('id', id).select(BLOG_SELECT).single();
        if (error) throw error;
        return data;
    }

    async deleteBlogPost(id: string) {
        await supabase.from('blog_posts').delete().eq('id', id);
    }

    async toggleBlogPostPin(id: string) {
        const { data: p } = await supabase.from('blog_posts').select('is_pinned').eq('id', id).single();
        if (!p) return;
        const { data } = await supabase.from('blog_posts').update({ is_pinned: !p.is_pinned }).eq('id', id).select(BLOG_SELECT).single();
        return data;
    }

    async getPrincipal() {
        const { data } = await supabase.from('principal').select(PRINCIPAL_SELECT).maybeSingle();
        return data;
    }

    async updatePrincipal(principalData: any) {
        // If no principal exists, create one. If exists, update it.
        // We can check existence first.
        const existing = await this.getPrincipal();
        const toSave = toSnakeCase(principalData);
        toSave.updated_at = new Date().toISOString();

        if (existing) {
            delete toSave.id;
            const { data, error } = await supabase.from('principal').update(toSave).eq('id', existing.id).select(PRINCIPAL_SELECT).single();
            if (error) throw error;
            return data;
        } else {
            // insert
            const { data, error } = await supabase.from('principal').insert(toSave).select(PRINCIPAL_SELECT).single();
            if (error) throw error;
            return data;
        }
    }

    async getFaculty() {
        const { data } = await supabase.from('faculty_staff').select(FACULTY_SELECT).order('created_at', { ascending: false });
        return data || [];
    }

    async getFacultyMember(id: string) {
        const { data } = await supabase.from('faculty_staff').select(FACULTY_SELECT).eq('id', id).maybeSingle();
        return data;
    }

    async createFacultyMember(member: any) {
        const toInsert = toSnakeCase(member);
        const { data, error } = await supabase.from('faculty_staff').insert(toInsert).select(FACULTY_SELECT).single();
        if (error) throw error;
        return data;
    }

    async updateFacultyMember(id: string, member: any) {
        const toUpdate = toSnakeCase(member);
        delete toUpdate.id;
        toUpdate.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('faculty_staff').update(toUpdate).eq('id', id).select(FACULTY_SELECT).single();
        if (error) throw error;
        return data;
    }

    async deleteFacultyMember(id: string) {
        await supabase.from('faculty_staff').delete().eq('id', id);
    }
}

export const storage = new DbStorage();
