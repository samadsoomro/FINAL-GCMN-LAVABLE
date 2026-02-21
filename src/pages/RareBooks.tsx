import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  Eye,
  Shield,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Document, Page, pdfjs } from "react-pdf";
import { useBranding } from "@/contexts/BrandingContext";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const RareBooks: React.FC = () => {
  const { settings } = useBranding();
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // PDF State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Security restrictions
    const preventDefaults = (e: any) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "s" || e.key === "p" || e.key === "u")) ||
        (e.ctrlKey && e.shiftKey && e.key === "I")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventDefaults);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", preventDefaults);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    fetch("/api/rare-books")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching rare books:", err);
        setLoading(false);
      });
  }, []);

  const filteredBooks = (books || []).filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.author &&
        book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset: number) => {
    setPageNumber((prev) =>
      Math.min(Math.max(1, prev + offset), numPages || 1),
    );
  };

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.5, prev + delta), 2.5));
  };

  return (
    <motion.div
      className="min-h-screen pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div
        className="py-12 lg:py-16 gradient-dark text-white text-center"
        style={{
          background: `linear-gradient(to right, ${settings.primaryColor}, #111)`,
        }}
      >
        <div className="container">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 border-2 border-white rounded-full text-white font-semibold mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Archive size={18} />
            <span>Digital Archive</span>
          </motion.div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Rare Books Collection
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Explore our digital archive of rare and historical books with secure
            viewing technology
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="py-12 lg:py-16">
        <div className="container">
          {/* Security Notice */}
          <div className="flex items-start gap-4 p-6 bg-primary/5 border-2 border-primary rounded-xl mb-8">
            <Shield size={24} className="text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Secure Viewing
              </h3>
              <p className="text-sm text-muted-foreground">
                These rare books are available for viewing only. Screenshots and
                downloads are restricted.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search rare books by title, author, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Books Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => {
                  setSelectedBook(book);
                  setPageNumber(1);
                  setScale(1.0);
                }}
              >
                <div className="relative h-64 overflow-hidden bg-muted flex items-center justify-center">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Archive size={48} className="text-muted-foreground/30" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white font-medium">
                      Archive Item
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {book.category}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Digital Copy</span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      View Only
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBook(null)}
          >
            <motion.div
              className="bg-card rounded-xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Toolbar - Optimized for Mobile */}
              <div className="p-3 border-b flex items-center justify-between bg-secondary shrink-0 gap-2">
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0 h-8 w-8 -ml-1 text-muted-foreground"
                    onClick={() => setSelectedBook(null)}
                  >
                    <X size={20} />
                  </Button>
                  <h2 className="font-bold text-sm md:text-lg line-clamp-1 truncate">
                    {selectedBook.title}
                  </h2>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap px-2">
                    <span>
                      Page {pageNumber} of {numPages || "--"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => changePage(-1)}
                    disabled={pageNumber <= 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="sm:hidden text-xs font-medium w-6 text-center">
                    {pageNumber}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => changePage(1)}
                    disabled={pageNumber >= (numPages || 1)}
                  >
                    <ChevronRight size={16} />
                  </Button>

                  <div className="hidden md:flex items-center gap-1">
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleZoom(-0.2)}
                    >
                      <ZoomOut size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleZoom(0.2)}
                    >
                      <ZoomIn size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRotation((r) => r + 90)}
                    >
                      <RotateCw size={18} />
                    </Button>
                  </div>

                  <div className="w-px h-6 bg-border mx-2 hidden md:block" />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex"
                    onClick={() => setSelectedBook(null)}
                  >
                    <X size={24} />
                  </Button>
                </div>
              </div>

              {/* Viewer Area */}
              <div
                className="flex-1 overflow-auto bg-neutral-900 relative flex justify-center p-4 select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                <Document
                  file={`/api/rare-books/stream/${selectedBook.id}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex flex-col items-center justify-center p-12 text-white">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
                      <p>Loading Secure Document...</p>
                    </div>
                  }
                  error={
                    <div className="flex flex-col items-center justify-center p-12 text-white/70">
                      <Shield size={48} className="mb-4" />
                      <p>Failed to load protected document.</p>
                    </div>
                  }
                  className="shadow-2xl"
                >
                  <div className="relative">
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      rotate={rotation}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="border shadow-lg"
                    />

                    {/* Watermark Overlay (Dynamic) */}
                    {settings.rbWatermarkEnabled && (
                      <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
                        <div
                          className="rotate-45 transform select-none"
                          style={{ opacity: settings.rbWatermarkOpacity }}
                        >
                          <p className="text-[8vw] font-black text-black leading-none text-center">
                            {(
                              settings.rbWatermarkText ||
                              `${settings.instituteShortName} LIBRARY ARCHIVE`
                            )
                              .split("\n")
                              .map((line, idx) => (
                                <React.Fragment key={idx}>
                                  {line}
                                  <br />
                                </React.Fragment>
                              ))}
                          </p>
                        </div>
                        {/* Multiple small watermarks grid */}
                        <div
                          className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-8 p-8 rotate-12"
                          style={{ opacity: settings.rbWatermarkOpacity / 2 }}
                        >
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-center"
                            >
                              <span className="font-bold text-2xl text-black">
                                {settings.rbWatermarkText?.split("\n")[0] ||
                                  `${settings.instituteShortName} ARCHIVE`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Document>
              </div>

              <div className="bg-primary text-primary-foreground text-center text-xs py-1">
                {settings.rbDisclaimerText ||
                  `Confidential • Do Not Distribute • ${settings.instituteShortName} Library Archive`}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RareBooks;
