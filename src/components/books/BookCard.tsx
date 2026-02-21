import React from "react";
import { motion } from "framer-motion";
import { BookOpen, User, Calendar, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Book } from "@/utils/constants";

interface BookCardProps {
  book: Book;
  onBorrow?: (book: Book) => void;
  onViewDetails?: (book: Book) => void;
  isBorrowing?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onBorrow,
  onViewDetails,
  isBorrowing = false,
}) => {
  const isAvailable = book.available_copies > 0 && book.status === "available";

  return (
    <motion.div
      className="bg-card rounded-xl shadow-md overflow-hidden flex flex-col transition-all hover:shadow-lg"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Book Cover */}
      <div className="relative w-full h-72 bg-secondary overflow-hidden">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-secondary to-muted text-muted-foreground">
            <BookOpen size={48} />
          </div>
        )}

        {/* Availability Badge */}
        <div
          className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${
            isAvailable
              ? "bg-primary text-white"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {isAvailable ? "Available" : "Unavailable"}
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight">
          {book.title}
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User size={14} />
            <span className="truncate">{book.author}</span>
          </div>

          {book.publication_year && (
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{book.publication_year}</span>
            </div>
          )}

          {book.shelf_location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{book.shelf_location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm pt-2 border-t border-border mt-auto">
          <span className="text-muted-foreground">{book.category}</span>
          <span
            className={
              isAvailable
                ? "text-primary font-medium"
                : "text-destructive font-medium"
            }
          >
            {book.available_copies}/{book.total_copies} copies
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(book)}
          >
            Details
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={!isAvailable || isBorrowing}
            onClick={() => onBorrow?.(book)}
          >
            {isBorrowing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Borrowing...
              </>
            ) : isAvailable ? (
              "Borrow"
            ) : (
              "Unavailable"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
