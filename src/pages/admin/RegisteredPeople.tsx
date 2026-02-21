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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, RefreshCw, Search, Mail, Phone, Trash2 } from "lucide-react";

interface RegisteredPerson {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  createdAt: string;
}

const RegisteredPeople = () => {
  const [people, setPeople] = useState<RegisteredPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      // 'nonStudents' contains the staff/visitor people
      setPeople(data.nonStudents || []);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Could not load registered people.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This will also remove their profile and roles.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast({ title: "Success", description: "User deleted successfully." });
        fetchPeople();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <UserPlus className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
            Registered People
          </h1>
          <p className="text-neutral-500 font-medium font-sm">
            Manage Staff, Faculty, and Visitors registered through the website.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={16}
            />
            <Input
              placeholder="Search by name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-neutral-200 h-11 bg-white shadow-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchPeople}
            className="rounded-xl h-11 font-bold gap-2 bg-white"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh List
          </Button>
        </div>

        <Card className="rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 overflow-hidden ring-1 ring-neutral-200/60">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/50 border-b border-neutral-100 italic">
                  <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                    Name & Contact
                  </TableHead>
                  <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                    Functional Role
                  </TableHead>
                  <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                    Registered
                  </TableHead>
                  <TableHead className="py-5 px-6 text-center text-[11px] font-black uppercase tracking-widest text-neutral-400">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-40 text-center text-neutral-400 font-medium"
                    >
                      Loading records...
                    </TableCell>
                  </TableRow>
                ) : filteredPeople.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-40 text-center text-neutral-400 font-medium"
                    >
                      No registered people found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPeople.map((person) => (
                    <TableRow
                      key={person.id}
                      className="group hover:bg-neutral-50/50 transition-colors"
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900">
                            {person.name}
                          </span>
                          <span className="text-xs text-neutral-400 font-medium flex items-center gap-1 mt-0.5">
                            <Mail size={10} /> {person.email}
                          </span>
                          {person.phone && person.phone !== "-" && (
                            <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                              <Phone size={10} /> {person.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge className="rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold text-[10px] uppercase px-3 py-1">
                          {person.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6 font-bold text-neutral-400 text-xs">
                        {new Date(person.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(person.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 h-auto"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisteredPeople;
