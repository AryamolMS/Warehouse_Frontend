import React, { useState, useEffect } from "react";
import {
  Building2,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  CreditCard,
  Package,
  Upload,
  CheckCircle,
} from "lucide-react";
// Removed Link import as it's not used in a way that works outside a Router
// import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
// FIX: The CSS import is removed from here to prevent build errors in environments
// that don't support direct CSS imports in JS files.
// It will be added dynamically using a useEffect hook instead.

// ✅ Reusable input field component
const InputField = ({
  label,
  name,
  type = "text",
  icon: Icon,
  placeholder,
  rows,
  form,
  handleChange,
  styles,
}) => (
  <div style={styles.fieldGroup}>
    <label style={styles.label}>
      {label}{" "}
      {["companyName", "email", "password", "confirmPassword"].includes(name) && (
        <span style={styles.required}>*</span>
      )}
    </label>
    <div style={styles.inputWrapper}>
      {Icon && <Icon size={18} style={styles.inputIcon} />}
      {rows ? (
        <textarea
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          rows={rows}
          placeholder={placeholder}
          style={{
            ...styles.input,
            ...styles.textarea,
            paddingLeft: Icon ? 40 : 12,
          }}
        />
      ) : type === "file" ? (
        <>
          <input
            type="file"
            name={name}
            onChange={handleChange}
            style={styles.fileInput}
            id={name}
          />
          <label htmlFor={name} style={styles.fileLabel}>
            <Upload size={20} style={{ marginRight: 8 }} />
            {form[name] ? form[name].name : "Choose file"}
          </label>
        </>
      ) : (
        <input
          type={type}
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          placeholder={placeholder}
          style={{ ...styles.input, paddingLeft: Icon ? 40 : 12 }}
        />
      )}
    </div>
  </div>
);

function Registration() {
  const [form, setForm] = useState({
    companyName: "",
    businessType: "",
    registrationNumber: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: "",
    bankAccount: "",
    ifsc: "",
    bankName: "",
    paymentMethod: "",
    productCategories: "",
    gstFile: null,
  });

  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  
  // FIX: Dynamically load the react-toastify CSS to avoid import errors.
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/react-toastify.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);


  // ✅ Handle field input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Add username to the frontend validation
    if (!form.companyName || !form.email || !form.password || !form.username) {
      toast.error("Please fill in all required fields, including username.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const formData = new FormData();
      // FIX: The previous logic skipped sending empty fields like 'username'.
      // The backend requires the 'username' field, causing a validation error.
      // This now sends all fields, letting the backend handle validation.
      Object.keys(form).forEach((key) => {
        if (form[key] !== null) { // Condition changed to allow empty strings
          formData.append(key, form[key]);
        }
      });

      // FIX: Updated the API endpoint to match the one from the error log.
      const response = await fetch("http://127.0.0.1:8000/api/register-supplier/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Attempt to parse JSON error first, then fall back to text.
        try {
            const errorData = await response.json();
            const errorMessage = errorData.error || `Registration failed: ${response.status}`;
            throw new Error(errorMessage);
        } catch (jsonError) {
            const errorText = await response.text();
             throw new Error(
              `Registration failed: ${response.status} ${response.statusText}. Server says: ${errorText}`
            );
        }
      }
      
      const data = await response.json();

      toast.success(data.message || "Supplier registered successfully!");
      setForm({
        companyName: "",
        businessType: "",
        registrationNumber: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        username: "",
        password: "",
        confirmPassword: "",
        bankAccount: "",
        ifsc: "",
        bankName: "",
        paymentMethod: "",
        productCategories: "",
        gstFile: null,
      });
      setCurrentStep(1);

    } catch (err) {
      console.error("Error during registration:", err);
      // Display a cleaner error message from the backend if available
      toast.error(err.message.includes('ValidationError') ? "A validation error occurred. Check your inputs." : err.message || "Something went wrong. Please try again!");
    }
  };

  return (
    <div style={styles.page}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Building2 size={32} color="#fff" />
          </div>
          <h2 style={styles.title}>Supplier Registration</h2>
          <p style={styles.subtitle}>Join our network of trusted suppliers</p>
        </div>

        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          {[1, 2, 3].map((step) => (
            <div key={step} style={styles.stepItem}>
              <div
                style={{
                  ...styles.stepCircle,
                  ...(step <= currentStep ? styles.stepActiveCircle : {}),
                }}
              >
                {step < currentStep ? <CheckCircle size={16} /> : step}
              </div>
              <span style={styles.stepLabel}>
                {step === 1
                  ? "Business"
                  : step === 2
                  ? "Account"
                  : "Payment"}
              </span>
            </div>
          ))}
        </div>

        {/* Form Sections */}
        <div style={styles.formContainer}>
          {currentStep === 1 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Business Information</h3>
              <InputField
                label="Company Name"
                name="companyName"
                icon={Building2}
                placeholder="Your Company Ltd."
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Business Type"
                name="businessType"
                icon={FileText}
                placeholder="Manufacturer / Distributor / Wholesaler"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Registration / GST Number"
                name="registrationNumber"
                icon={FileText}
                placeholder="GST1234567890"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Contact Person"
                name="contactPerson"
                icon={User}
                placeholder="John Doe"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Business Address"
                name="address"
                icon={MapPin}
                rows={3}
                placeholder="Enter your complete business address"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Account Details</h3>
              <InputField
                label="Email"
                name="email"
                type="email"
                icon={Mail}
                placeholder="supplier@company.com"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Phone Number"
                name="phone"
                type="tel"
                icon={Phone}
                placeholder="+91 98765 43210"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Username"
                name="username"
                icon={User}
                placeholder="Choose a username"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                placeholder="Enter password"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                icon={Lock}
                placeholder="Re-enter password"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Payment & Products</h3>
              <InputField
                label="Bank Account Number"
                name="bankAccount"
                icon={CreditCard}
                placeholder="1234567890"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="IFSC Code"
                name="ifsc"
                icon={CreditCard}
                placeholder="ABCD0123456"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Bank Name"
                name="bankName"
                icon={CreditCard}
                placeholder="State Bank of India"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Preferred Payment Method"
                name="paymentMethod"
                icon={CreditCard}
                placeholder="Bank Transfer / UPI / Cheque"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Product Categories"
                name="productCategories"
                icon={Package}
                placeholder="Electronics, Raw Materials, Food..."
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
              <InputField
                label="Upload GST / Business License"
                name="gstFile"
                type="file"
                form={form}
                handleChange={handleChange}
                styles={styles}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={styles.buttonGroup}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                style={styles.secondaryButton}
              >
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                style={styles.button}
              >
                Next Step
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} style={styles.button}>
                Complete Registration
              </button>
            )}
          </div>
        </div>

        <a href="/login" style={{ textDecoration: "none" }}>
          <p style={styles.footerText}>
            Already registered? <span style={styles.link}>Sign in here</span>
          </p>
        </a>
      </div>
    </div>
  );
}

// ✅ Inline styles (same as before)
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #000000, #0a1a3c, #001f4d)",
    padding: 20,
    fontFamily: "sans-serif", // Added for better default font
  },
  container: {
    width: "100%",
    maxWidth: 600,
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
    color: "#fff",
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: "50%",
    background: "linear-gradient(to right, #0d47a1, #000000)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: { fontSize: 28, fontWeight: "bold", margin: 0, color: "#fff" },
  subtitle: { color: "#aaa", fontSize: 14, marginTop: 8 },
  stepIndicator: {
    display: "flex",
    justifyContent: "center",
    gap: 40,
    marginBottom: 30,
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "2px solid #333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
    fontWeight: "bold",
    transition: "all 0.3s ease", // Added transition
  },
  stepActiveCircle: {
    background: "linear-gradient(to right, #0d47a1, #001f4d)",
    border: "2px solid #0d47a1",
    color: "#fff",
  },
  stepLabel: { fontSize: 12, color: "#aaa" },
  formContainer: {
    background: "#111827",
    borderRadius: 12,
    padding: 32,
    boxShadow: "0 8px 20px rgba(0,0,0,0.7)",
  },
  section: { display: "flex", flexDirection: "column", gap: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 14, fontWeight: 500, color: "#ddd" },
  required: { color: "#f88" },
  inputWrapper: { position: "relative" },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#aaa",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #333",
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
    background: "#1f2937",
    color: "#fff",
    boxSizing: "border-box",
    transition: "border-color 0.3s, box-shadow 0.3s", // Added transition
  },
  textarea: { resize: "vertical", fontFamily: "inherit" },
  fileInput: { display: "none" },
  fileLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    background: "#1f2937",
    border: "1px solid #333",
    borderRadius: 6,
    color: "#aaa",
    cursor: "pointer",
    fontSize: 14,
    transition: "background-color 0.3s", // Added transition
  },
  buttonGroup: { display: "flex", gap: 12, marginTop: 24 },
  button: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(to right, #0d47a1, #001f4d)",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    transition: "opacity 0.3s", // Added transition
  },
  secondaryButton: {
    flex: 1,
    padding: "12px",
    background: "#1f2937",
    border: "1px solid #333",
    borderRadius: 6,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    transition: "background-color 0.3s", // Added transition
  },
  footerText: { textAlign: "center", fontSize: 13, color: "#aaa", marginTop: 20 },
  link: { color: "#1e90ff", textDecoration: "none" },
};

export default Registration;

