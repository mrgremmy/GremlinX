import { useState, type ChangeEvent, type KeyboardEvent } from 'react';

interface SearchBarProps {
    readonly placeholder?: string;
    readonly defaultValue?: string;
    readonly onSearch: (query: string) => void;
}

/** Search input with keyboard submit. */
export function SearchBar({ placeholder = 'Search...', defaultValue = '', onSearch }: SearchBarProps): JSX.Element {
    const [value, setValue] = useState(defaultValue);

    function handleChange(e: ChangeEvent<HTMLInputElement>): void {
        setValue(e.target.value);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
        if (e.key === 'Enter') {
            onSearch(value.trim());
        }
    }

    return (
        <div className="search-bar">
            <svg
                className="search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                className="search-input"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
            />
        </div>
    );
}
