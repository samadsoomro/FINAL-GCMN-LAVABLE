import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Download,
  RefreshCw,
  Search,
  FileSpreadsheet,
  MapPin,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

interface LibraryCardApplication {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string | null;
  dob: string | null;
  class: string;
  field: string | null;
  rollNo: string;
  email: string;
  phone: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  status: string;
  cardNumber: string;
  studentId: string | null;
  issueDate: string | null;
  validThrough: string | null;
  createdAt: string;
  // Computed full address for display
  fullAddress?: string;
}

const Addresses = () => {
  const [addresses, setAddresses] = useState<LibraryCardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      // Reuse existing endpoint but filter for 'approved'
      // Note: We are mocking a specialized endpoint behavior by filtering client-side for now
      // per implementation plan to minimize backend churn unless massive data volume.
      const res = await fetch("/api/admin/library-cards?_t=" + Date.now(), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data: LibraryCardApplication[] = await res.json();

      console.log("[DEBUG] Addresses Module - Raw Data length:", data.length);
      if (data.length > 0) {
        console.log(
          "[DEBUG] Addresses Module - Sample statuses:",
          data.map((d) => d.status).slice(0, 5),
        );
      }

      const approvedOnly = data
        .filter((app) => {
          const s = (app.status || "").toLowerCase();
          const match = s === "approved";
          return match;
        })
        .map((app) => ({
          ...app,
          fullAddress: [
            app.addressStreet,
            app.addressCity,
            app.addressState,
            app.addressZip,
          ]
            .filter((p) => p && p.trim().length > 0)
            .join(", "),
        }));

      setAddresses(approvedOnly);
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch addresses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const filteredAddresses = addresses.filter((app) => {
    const search = searchQuery.toLowerCase();
    return (
      app.cardNumber.toLowerCase().includes(search) ||
      app.firstName.toLowerCase().includes(search) ||
      app.lastName.toLowerCase().includes(search) ||
      app.email.toLowerCase().includes(search)
    );
  });

  const downloadExcel = () => {
    if (filteredAddresses.length === 0) {
      toast({
        title: "No Data",
        description: "No records to download.",
        variant: "destructive",
      });
      return;
    }

    const excelData = filteredAddresses.map((app, index) => ({
      "S.No": index + 1,
      "Student Name": `${app.firstName} ${app.lastName}`,
      "Father Name": app.fatherName || "-",
      "Card ID": app.cardNumber,
      Email: app.email,
      Phone: app.phone,
      "Full Address": app.fullAddress || "Address not found",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Addresses");
    XLSX.writeFile(workbook, "student_addresses.xlsx");
    toast({ title: "Success", description: "Excel file downloaded." });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Student Addresses
              </h1>
              <p className="text-muted-foreground">
                Contact & Address details for approved members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" onClick={downloadExcel} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={fetchAddresses}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Approved Members List ({filteredAddresses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : filteredAddresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No approved members found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        Student Details
                      </TableHead>
                      <TableHead>Card ID</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="w-[300px]">Full Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAddresses.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="align-top py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-foreground">
                              {app.firstName} {app.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              S/O: {app.fatherName || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono font-medium text-emerald-600">
                              {app.cardNumber}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              SN #1
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-3">
                          <div className="flex flex-col gap-1 text-sm">
                            <span>{app.email}</span>
                            <span className="text-muted-foreground">
                              {app.phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-3">
                          {app.fullAddress ? (
                            <div className="text-sm bg-muted/50 p-2 rounded border border-border">
                              {app.fullAddress}
                            </div>
                          ) : (
                            <span className="text-xs text-destructive font-medium">
                              Address missing
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Addresses;
