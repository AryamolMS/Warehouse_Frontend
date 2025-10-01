import React, { useState } from "react";
import { Building2, FileText, User, Mail, Phone, MapPin, Lock, CreditCard, Package, Upload, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.companyName || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    alert("Supplier registered successfully!\nCheck console for details.");
    console.log("Supplier Data:", form);
  };

  const InputField = ({ label, name, type = "text", icon: Icon, placeholder, rows }) => (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>
        {label} {["companyName", "email", "password", "confirmPassword"].includes(name) && <span style={styles.required}>*</span>}
      </label>
      <div style={styles.inputWrapper}>
        {Icon && <Icon size={18} style={styles.inputIcon} />}
        {rows ? (
          <textarea
            name={name}
            value={form[name]}
            onChange={handleChange}
            rows={rows}
            placeholder={placeholder}
            style={{ ...styles.input, ...styles.textarea, paddingLeft: Icon ? 40 : 12 }}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            style={{ ...styles.input, paddingLeft: Icon ? 40 : 12 }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Building2 size={32} color="#fff" />
          </div>
          <h2 style={styles.title}>Supplier Registration</h2>
          <p style={styles.subtitle}>Join our network of trusted suppliers</p>
        </div>

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
                {step === 1 ? "Business" : step === 2 ? "Account" : "Payment"}
              </span>
            </div>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.formContainer}>
          {currentStep === 1 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Business Information</h3>
              <InputField label="Company Name" name="companyName" icon={Building2} placeholder="Your Company Ltd." />
              <InputField label="Business Type" name="businessType" icon={FileText} placeholder="Manufacturer / Distributor / Wholesaler" />
              <InputField label="Registration / GST Number" name="registrationNumber" icon={FileText} placeholder="GST1234567890" />
              <InputField label="Contact Person" name="contactPerson" icon={User} placeholder="John Doe" />
              <InputField label="Business Address" name="address" icon={MapPin} rows={3} placeholder="Enter your complete business address" />
            </div>
          )}

          {currentStep === 2 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Account Details</h3>
              <InputField label="Email" name="email" type="email" icon={Mail} placeholder="supplier@company.com" />
              <InputField label="Phone Number" name="phone" type="tel" icon={Phone} placeholder="+91 98765 43210" />
              <InputField label="Username" name="username" icon={User} placeholder="Choose a username" />
              <InputField label="Password" name="password" type="password" icon={Lock} placeholder="Minimum 8 characters" />
              <InputField label="Confirm Password" name="confirmPassword" type="password" icon={Lock} placeholder="Re-enter password" />
            </div>
          )}

          {currentStep === 3 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Payment & Products</h3>
              <InputField label="Bank Account Number" name="bankAccount" icon={CreditCard} placeholder="1234567890" />
              <InputField label="IFSC Code" name="ifsc" icon={CreditCard} placeholder="ABCD0123456" />
              <InputField label="Bank Name" name="bankName" icon={CreditCard} placeholder="State Bank of India" />
              <InputField label="Preferred Payment Method" name="paymentMethod" icon={CreditCard} placeholder="Bank Transfer / UPI / Cheque" />
              <InputField label="Product Categories" name="productCategories" icon={Package} placeholder="Electronics, Raw Materials, Food..." />

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Upload GST / Business License</label>
                <div style={styles.fileInputWrapper}>
                  <input type="file" name="gstFile" onChange={handleChange} style={styles.fileInput} id="gstFile" />
                  <label htmlFor="gstFile" style={styles.fileLabel}>
                    <Upload size={20} style={{ marginRight: 8 }} />
                    {form.gstFile ? form.gstFile.name : "Choose file"}
                  </label>
                </div>
              </div>
            </div>
          )}

          <div style={styles.buttonGroup}>
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep(currentStep - 1)} style={styles.secondaryButton}>
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button type="button" onClick={() => setCurrentStep(currentStep + 1)} style={styles.button}>
                Next Step
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} style={styles.button}>
                Complete Registration
              </button>
            )}
          </div>
        </div>

       <Link to="/login" style={{ textDecoration: 'none' }}>
  <p style={styles.footerText}>
    Already registered? <span style={styles.link}>Sign in here</span>
  </p>
</Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #000000, #0a1a3c, #001f4d)',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 600,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#fff',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: 'linear-gradient(to right, #0d47a1, #000000)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: 0,
    color: '#fff',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
  },
  stepIndicator: {
    display: 'flex',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 30,
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '2px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontWeight: 'bold',
  },
  stepActiveCircle: {
    background: 'linear-gradient(to right, #0d47a1, #001f4d)',
    border: '2px solid #0d47a1',
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  formContainer: {
    background: '#111827',
    borderRadius: 12,
    padding: 32,
    boxShadow: '0 8px 20px rgba(0,0,0,0.7)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#ddd',
  },
  required: {
    color: '#f88',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#aaa',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #333',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    background: '#1f2937',
    color: '#fff',
    boxSizing: 'border-box',
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  fileInputWrapper: {
    position: 'relative',
  },
  fileInput: {
    display: 'none',
  },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    background: '#1f2937',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#aaa',
    cursor: 'pointer',
    fontSize: 14,
  },
  buttonGroup: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(to right, #0d47a1, #001f4d)',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    cursor: 'pointer',
  },
  secondaryButton: {
    flex: 1,
    padding: '12px',
    background: '#1f2937',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    cursor: 'pointer',
  },
  error: {
    background: '#3b0d0d',
    color: '#f88',
    padding: '10px 12px',
    borderRadius: 6,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#aaa',
    marginTop: 20,
  },
  link: {
    color: '#1e90ff',
    textDecoration: 'none',
  },
};

export default Registration;

