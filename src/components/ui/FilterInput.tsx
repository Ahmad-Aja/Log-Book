interface FilterInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  type?: "text" | "tel" | "email" | "number";
}

export function FilterInput({
  label,
  placeholder,
  value,
  onChange,
  onEnter,
  type = "text",
}: FilterInputProps) {
  return (
    <div className="group/filter-input">
      <label className="text-[13px] group-focus-within/filter-input:text-forest-light text-wheat mb-1 block transition-colors duration-300">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        className="w-full px-3 py-2 border border-wheat hover:border-wheat-dark focus:border-forest-light rounded-md text-[15px] transition-shadow duration-300 focus:outline-none focus:ring-1 focus:ring-forest-light bg-white placeholder:text-gray-400"
      />
    </div>
  );
}
