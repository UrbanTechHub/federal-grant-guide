import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, FileText, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SubmissionSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationNumber: string;
  applicantName: string;
  email: string;
}

const SubmissionSuccessDialog = ({
  open,
  onOpenChange,
  applicationNumber,
  applicantName,
  email,
}: SubmissionSuccessDialogProps) => {
  const navigate = useNavigate();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(applicationNumber);
    toast.success("Copied!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center pt-4 pb-2">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-secondary-foreground" />
          </div>
        </div>

        <DialogHeader className="text-center pb-0">
          <DialogTitle className="text-2xl text-primary font-display">
            Application Submitted!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Thank you, <span className="font-semibold text-foreground">{applicantName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="my-6">
          <div className="bg-muted rounded-xl p-5 text-center border border-border">
            <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Application Number
            </p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-xl font-bold text-primary tracking-wider font-display">
                {applicationNumber}
              </code>
              <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm font-display">What happens next?</h3>
          {[
            { num: "1", title: "Review Period", desc: "Our team will review within 5-7 business days." },
            { num: "2", title: "Email Notification", desc: `Updates sent to ${email}` },
            { num: "3", title: "Decision", desc: "If approved, you'll receive next steps." },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl border border-border">
              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{step.num}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-2">Questions?</p>
          <div className="flex gap-4 justify-center text-xs">
            <a href="tel:1-800-FED-GRANTS" className="flex items-center gap-1 text-primary hover:opacity-80">
              <Phone className="w-3 h-3" /> 1-800-FED-GRANTS
            </a>
            <a href="mailto:support@federalgrants.gov" className="flex items-center gap-1 text-primary hover:opacity-80">
              <Mail className="w-3 h-3" /> Email
            </a>
          </div>
        </div>

        <div className="mt-4">
          <Button
            onClick={() => {
              onOpenChange(false);
              navigate("/", { replace: true });
            }}
            className="w-full"
            size="lg"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionSuccessDialog;
