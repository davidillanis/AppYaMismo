export interface ComboBoxItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface ComboBoxProps {
  value: string | null;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  items?: ComboBoxItem[];
  fetchItems?: () => Promise<ComboBoxItem[]>;
  loading?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  maxHeight?: number;
  clearable?: boolean;
  noDataText?: string;
  noResultsText?: string;
  searchPlaceholder?: string;
}