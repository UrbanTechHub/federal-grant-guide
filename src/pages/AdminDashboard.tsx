import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Loader2,
  FileText,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  name: string;
  type: string;
  size: string;
  category: string;
}

interface Application {
  id: string;
  application_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  grant_type: string;
  requested_amount: string;
  status: string;
  created_at: string;
  date_of_birth?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  employment_status?: string | null;
  employer_name?: string | null;
  annual_income?: string | null;
  purpose_of_grant?: string | null;
  organization_name?: string | null;
  uploaded_files?: UploadedFile[] | null;
}

const statusColors: Record<string, string> = {
  under_review: "bg-gold-500/15 text-gold-500 border-gold-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  pending: "bg-primary/15 text-primary border-primary/30",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch applications
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("grant_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Cast the data to handle Json type for uploaded_files
      const typedData = (data || []).map((app) => ({
        ...app,
        uploaded_files: app.uploaded_files as unknown as UploadedFile[] | null,
      }));
      
      setApplications(typedData);
      setFilteredApps(typedData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchApplications();
    }
  }, [user, isAdmin]);

  // Filter applications
  useEffect(() => {
    let filtered = [...applications];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.application_number.toLowerCase().includes(query) ||
          app.first_name.toLowerCase().includes(query) ||
          app.last_name.toLowerCase().includes(query) ||
          app.email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApps(filtered);
  }, [searchQuery, statusFilter, applications]);

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("grant_applications")
        .update({ status: newStatus })
        .eq("id", appId);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app
        )
      );
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const deleteApplication = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const { error } = await supabase
        .from("grant_applications")
        .delete()
        .eq("id", appId);

      if (error) throw error;

      setApplications((prev) => prev.filter((app) => app.id !== appId));
      toast.success("Application deleted");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  if (authLoading || (!user && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Stats
  const stats = {
    total: applications.length,
    underReview: applications.filter((a) => a.status === "under_review").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: "Total Applications", value: stats.total, color: "from-primary/20 to-primary/5" },
            { icon: Clock, label: "Under Review", value: stats.underReview, color: "from-gold-500/20 to-gold-500/5" },
            { icon: DollarSign, label: "Approved", value: stats.approved, color: "from-emerald-500/20 to-emerald-500/5" },
            { icon: Users, label: "Rejected", value: stats.rejected, color: "from-destructive/20 to-destructive/5" },
          ].map((stat) => (
            <div key={stat.label} className="card-gov p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold font-display">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card-gov p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or application number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchApplications}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="card-gov overflow-hidden p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application #</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Grant Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">
                        {app.application_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {app.first_name} {app.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {app.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{app.grant_type}</TableCell>
                      <TableCell>{app.requested_amount}</TableCell>
                      <TableCell>
                        <Select
                          value={app.status}
                          onValueChange={(value) => updateStatus(app.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge
                              variant="outline"
                              className={statusColors[app.status] || ""}
                            >
                              {app.status.replace("_", " ")}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(app.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedApp(app);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteApplication(app.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Application Number</p>
                  <p className="font-mono font-medium">{selectedApp.application_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={statusColors[selectedApp.status] || ""}
                  >
                    {selectedApp.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p>{selectedApp.first_name} {selectedApp.last_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p>{selectedApp.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p>{selectedApp.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p>{selectedApp.date_of_birth || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Address</p>
                    <p>
                      {selectedApp.street_address}, {selectedApp.city}, {selectedApp.state} {selectedApp.zip_code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Employment Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Employment Status</p>
                    <p>{selectedApp.employment_status || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Employer</p>
                    <p>{selectedApp.employer_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Annual Income</p>
                    <p>{selectedApp.annual_income || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Grant Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Grant Type</p>
                    <p>{selectedApp.grant_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Requested Amount</p>
                    <p>{selectedApp.requested_amount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Organization</p>
                    <p>{selectedApp.organization_name || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Purpose</p>
                    <p>{selectedApp.purpose_of_grant || "N/A"}</p>
                  </div>
                </div>
              </div>

              {selectedApp.uploaded_files && selectedApp.uploaded_files.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {selectedApp.uploaded_files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-muted rounded-lg p-3"
                      >
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.category} • {file.size}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
