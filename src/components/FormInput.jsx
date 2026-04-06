import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  error = null,
  success = null,
  multiline = false,
  maxLength = null,
  minLength = null,
  pattern = null,
  helperText = null,
  validate = null,
  ...props
}) {
  const isValid = !error && (success || (required && value));
  const showValidation = value && (error || success);

  const validateInput = (val) => {
    if (required && !val) return "שדה חובה";
    if (minLength && val.length < minLength) return `מינימום ${minLength} תווים`;
    if (maxLength && val.length > maxLength) return `מקסימום ${maxLength} תווים`;
    if (pattern && !new RegExp(pattern).test(val)) return "פורמט לא תקין";
    if (validate) return validate(val);
    return null;
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    const validationError = validateInput(newValue);
    onChange(e, validationError);
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-white text-lg flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-purple-400" />}
          {label}
          {required && <span className="text-red-400">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <InputComponent
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`bg-gray-800/50 border text-white text-lg transition-all ${
            showValidation
              ? error
                ? 'border-red-500 focus:border-red-600 focus:ring-red-500/50'
                : 'border-green-500 focus:border-green-600 focus:ring-green-500/50'
              : 'border-purple-700 focus:border-pink-500 focus:ring-pink-500/50'
          } ${multiline ? 'min-h-[100px]' : 'h-14'}`}
          dir="rtl"
          maxLength={maxLength}
          required={required}
          {...props}
        />
        
        {showValidation && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
        )}
      </div>

      {(error || success || helperText || (maxLength && value)) && (
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            {error && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
            {!error && success && (
              <p className="text-green-400 text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {success}
              </p>
            )}
            {!error && !success && helperText && (
              <p className="text-purple-300 text-sm">{helperText}</p>
            )}
          </div>
          
          {maxLength && value && (
            <p className="text-purple-400 text-xs">
              {value.length} / {maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
}