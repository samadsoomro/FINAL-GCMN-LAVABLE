import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen } from "lucide-react";
import BookCard from "@/components/books/BookCard";
import { BOOK_CATEGORIES } from "@/utils/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

const Books = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [borrowingId, setBorrowingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = books;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (book) =>
          (book.bookName && book.bookName.toLowerCase().includes(term)) ||
          (book.shortIntro && book.shortIntro.toLowerCase().includes(term)),
      );
    }

    setFilteredBooks(result);
  }, [books, searchTerm]);

  const handleBorrow = async (book: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or register to borrow books.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: { pathname: "/books" } } });
      return;
    }

    setBorrowingId(book.id);

    try {
      const res = await apiRequest("POST", "/api/book-borrows", {
        bookId: String(book.id),
        bookTitle: book.bookName,
        isbn: book.isbn || "",
      });

      if (res.ok) {
        toast({
          title: "Book Borrowed Successfully!",
          description: `You have borrowed the book: "${book.bookName}". Please visit the library and return it within 14 days. We may contact you via phone or email if required.`,
        });
        fetchBooks();
      }
    } catch (error: any) {
      console.error("Error borrowing book:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to borrow book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBorrowingId(null);
    }
  };

  const handleViewDetails = (book: any) => {
    toast({
      title: book.bookName,
      description: book.description || "No description available.",
    });
  };

  return (
    <motion.div
      className="min-h-screen pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="py-12 lg:py-16 bg-gradient-to-br from-secondary to-background text-center">
        <div className="container">
          <motion.h1
            className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Book Collection
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Browse our extensive collection of academic books and resources
          </motion.p>
          {!user && (
            <motion.p
              className="text-sm text-primary mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Login or register to borrow books
            </motion.p>
          )}
        </div>
      </div>

      <div className="py-12 lg:py-16">
        <div className="container">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search by title or intro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="loading-spinner" />
            </div>
          ) : filteredBooks.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredBooks.length} of {books.length} books
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <BookCard
                      book={{
                        book_id: book.id,
                        title: book.bookName,
                        author: "",
                        category: "",
                        description: book.description,
                        cover_image: book.bookImage,
                        image: book.bookImage,
                        isbn: "",
                        available: parseInt(book.availableCopies || "0") > 0,
                        status:
                          parseInt(book.availableCopies || "0") > 0
                            ? "available"
                            : "unavailable",
                        total_copies: parseInt(book.totalCopies || "0"),
                        available_copies: parseInt(book.availableCopies || "0"),
                      }}
                      onBorrow={() => handleBorrow(book)}
                      onViewDetails={() => handleViewDetails(book)}
                      isBorrowing={borrowingId === book.id}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen
                size={64}
                className="mx-auto text-muted-foreground mb-4"
              />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Books Found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Books;
