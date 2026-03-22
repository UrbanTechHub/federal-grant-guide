import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileSearch, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface ApplicationSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApplicationSearchDialog = ({ open, onOpenChange }: ApplicationSearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<"found" | "not-found" | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      // Check if the query matches the application number format
      const isValidFormat = /^FG-\d{4}-[A-Z0-9]{6,8}$/i.test(searchQuery.trim());
      setSearchResult(isValidFormat ? "found" : "not-found");
      setIsSearching(false);
    }, 1000);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" />
            Track Your Application
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter your application number to check the status of your grant application.
          </p>
          
          <div className="flex gap-2">
            <Input
              placeholder="e.g., FG-2026-ABC123XY"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value.toUpperCase());
                setSearchResult(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {searchResult === "found" && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Application Found</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Application #{searchQuery}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="font-medium text-accent">Under Review</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your application is being reviewed by our team. You will receive an email notification once a decision has been made.
                  </p>
                </div>
              </div>
            </div>
          )}

          {searchResult === "not-found" && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Application Not Found</h4>
                  <p className="text-sm text-muted-foreground">
                    We couldn't find an application with that number. Please check the number and try again.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Application numbers start with "FG-" followed by the year and a unique code (e.g., FG-2026-ABC123XY).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationSearchDialog;
