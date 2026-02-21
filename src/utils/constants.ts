// Application Constants
export const APP_NAME = "Library";
export const APP_FULL_NAME = "Library Management System";

// Google Maps Location
export const LIBRARY_LOCATION = {
  lat: 24.9207,
  lng: 67.0338,
  address: "Nazimabad, Karachi, Pakistan",
  mapUrl: "https://maps.app.goo.gl/yrPZQ5gmXNzkBEAQ7",
  embedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.5430358880396!2d67.03380137496951!3d24.920700041252727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f90157042d3%3A0x93d609e8bdb6ac95!2sGovernment%20College%20for%20Men%20Nazimabad!5e0!3m2!1sen!2s!4v1704067200000!5m2!1sen!2s",
};

// Classes/Semesters
export const CLASSES = [
  "Class 11",
  "Class 12",
  "ADS I",
  "ADS II",
  "BSc Part 1",
  "BSc Part 2",
];

// Subjects by Class
export const SUBJECTS_BY_CLASS: Record<string, string[]> = {
  "Class 11": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Urdu",
    "Computer Science",
    "Statistics",
    "Pakistan Studies",
    "Islamic Studies",
  ],
  "Class 12": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Urdu",
    "Computer Science",
    "Statistics",
    "Pakistan Studies",
    "Islamic Studies",
  ],
  "ADS I": [
    "English",
    "Urdu",
    "Islamic Studies",
    "Pakistan Studies",
    "Economics",
    "Political Science",
    "Sociology",
    "Psychology",
  ],
  "ADS II": [
    "English",
    "Urdu",
    "Islamic Studies",
    "Pakistan Studies",
    "Economics",
    "Political Science",
    "Sociology",
    "Psychology",
  ],
  "BSc Part 1": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Computer Science",
    "Statistics",
    "Botany",
    "Zoology",
    "Geology",
  ],
  "BSc Part 2": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Computer Science",
    "Statistics",
    "Botany",
    "Zoology",
    "Geology",
  ],
};

// Book Categories
export const BOOK_CATEGORIES = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English Literature",
  "Urdu Literature",
  "History",
  "Economics",
  "Political Science",
  "Philosophy",
  "Islamic Studies",
  "Pakistan Studies",
  "General Knowledge",
  "Reference",
];

// Departments
export const DEPARTMENTS = [
  "Computer Science",
  "Pre-Medical",
  "Pre-Engineering",
  "Humanities",
  "Commerce",
];

// Sample Books Data
export interface Book {
  book_id: string;
  title: string;
  author: string;
  category: string;
  publication_year: number;
  total_copies: number;
  available_copies: number;
  isbn?: string;
  publisher?: string;
  shelf_location?: string;
  description?: string;
  status: "available" | "unavailable";
  cover_image?: string;
}

export const SAMPLE_BOOKS: Book[] = [
  {
    book_id: "1",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    category: "Computer Science",
    publication_year: 2022,
    total_copies: 5,
    available_copies: 3,
    isbn: "978-0-13-468599-1",
    publisher: "MIT Press",
    shelf_location: "CS-A-101",
    description: "Comprehensive guide to algorithms and data structures",
    status: "available",
  },
  {
    book_id: "2",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Computer Science",
    publication_year: 2021,
    total_copies: 3,
    available_copies: 2,
    isbn: "978-0-13-235088-4",
    publisher: "Prentice Hall",
    shelf_location: "CS-A-102",
    description: "A handbook of agile software craftsmanship",
    status: "available",
  },
  {
    book_id: "3",
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    category: "Mathematics",
    publication_year: 2020,
    total_copies: 8,
    available_copies: 5,
    isbn: "978-1-285-74155-0",
    publisher: "Cengage Learning",
    shelf_location: "MATH-B-201",
    description: "Complete calculus textbook for undergraduate students",
    status: "available",
  },
  {
    book_id: "4",
    title: "Fundamentals of Physics",
    author: "Halliday, Resnick, Walker",
    category: "Physics",
    publication_year: 2021,
    total_copies: 6,
    available_copies: 4,
    isbn: "978-1-119-32015-1",
    publisher: "Wiley",
    shelf_location: "PHY-C-301",
    description:
      "Comprehensive physics textbook covering mechanics to modern physics",
    status: "available",
  },
  {
    book_id: "5",
    title: "Organic Chemistry",
    author: "Morrison and Boyd",
    category: "Chemistry",
    publication_year: 2019,
    total_copies: 4,
    available_copies: 1,
    isbn: "978-0-13-235973-3",
    publisher: "Pearson",
    shelf_location: "CHEM-D-401",
    description: "Classic organic chemistry textbook",
    status: "available",
  },
  {
    book_id: "6",
    title: "Cell Biology",
    author: "Alberts et al.",
    category: "Biology",
    publication_year: 2022,
    total_copies: 5,
    available_copies: 0,
    isbn: "978-0-393-68430-5",
    publisher: "Norton",
    shelf_location: "BIO-E-501",
    description: "Molecular biology of the cell",
    status: "unavailable",
  },
];

// Sample Rare Books
export interface RareBook {
  id: number;
  title: string;
  author: string;
  year: number;
  description: string;
  coverImage: string;
  language: string;
  pages: number;
  condition: string;
  availability: string;
  category: string;
}

export const RARE_BOOKS: RareBook[] = [
  {
    id: 1,
    title: "Tareekh-e-Pakistan (History of Pakistan)",
    author: "I. H. Qureshi",
    year: 1967,
    description:
      "A comprehensive historical account of Pakistan from ancient times to independence. This rare edition contains original maps and photographs.",
    coverImage:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
    language: "Urdu",
    pages: 456,
    condition: "Good",
    availability: "View Only",
    category: "History",
  },
  {
    id: 2,
    title: "Kulliyat-e-Iqbal (Complete Works of Iqbal)",
    author: "Allama Muhammad Iqbal",
    year: 1945,
    description:
      "First edition collection of poetry by Pakistan's national poet. Includes Bang-e-Dara, Bal-e-Jibril, and Zarb-e-Kalim.",
    coverImage:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    language: "Urdu/Persian",
    pages: 892,
    condition: "Excellent",
    availability: "View Only",
    category: "Poetry",
  },
  {
    id: 3,
    title: "Quaid-e-Azam: Speeches and Statements",
    author: "Muhammad Ali Jinnah",
    year: 1948,
    description:
      "Collection of speeches and statements by the founder of Pakistan. Rare first edition with original photographs.",
    coverImage:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    language: "English/Urdu",
    pages: 324,
    condition: "Fair",
    availability: "View Only",
    category: "Politics",
  },
  {
    id: 4,
    title: "Sindh and the Races That Inhabit the Valley of the Indus",
    author: "Richard F. Burton",
    year: 1851,
    description:
      "Historic ethnographic study of Sindh province. Original Victorian-era publication with hand-drawn illustrations.",
    coverImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    language: "English",
    pages: 478,
    condition: "Fair",
    availability: "View Only",
    category: "Ethnography",
  },
];

// Sample Notes Data
export interface Note {
  id: number;
  class: string;
  subject: string;
  title: string;
  description: string;
  pages: number;
  uploadDate: string;
}

export const SAMPLE_NOTES: Note[] = [
  {
    id: 1,
    class: "Class 11",
    subject: "Mathematics",
    title: "Calculus and Analytical Geometry",
    description: "Complete notes covering limits, derivatives, and integrals",
    pages: 45,
    uploadDate: "2025-01-15",
  },
  {
    id: 2,
    class: "Class 11",
    subject: "Physics",
    title: "Mechanics and Thermodynamics",
    description: "Detailed notes on motion, forces, and heat transfer",
    pages: 62,
    uploadDate: "2025-01-10",
  },
  {
    id: 3,
    class: "Class 12",
    subject: "Chemistry",
    title: "Organic Chemistry Fundamentals",
    description: "Comprehensive guide to organic compounds and reactions",
    pages: 78,
    uploadDate: "2025-01-08",
  },
  {
    id: 4,
    class: "BSc Part 1",
    subject: "Computer Science",
    title: "Data Structures and Algorithms",
    description: "Complete DSA notes with examples and exercises",
    pages: 120,
    uploadDate: "2025-01-05",
  },
];
