type FilterOption = {
  label: string;
  value: string;
};

type ProductFilterProps = {
  id: string;
  label: string;
  options: FilterOption[];
};

export function ProductFilter({ id, label, options }: ProductFilterProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <select
        id={id}
        name={id}
        className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none transition hover:border-zinc-300 focus:border-[#7F46FA] focus:ring-4 focus:ring-[#7F46FA]/10"
        defaultValue={options[0]?.value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
