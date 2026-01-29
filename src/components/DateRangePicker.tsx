'use client';

import { useState, useEffect, useRef } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

interface DateRangePickerProps {
    onSearch: (dateFrom: string, dateTo: string) => void;
}

export default function DateRangePicker({ onSearch }: DateRangePickerProps) {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const fromPickerRef = useRef<Flatpickr>(null);
    const toPickerRef = useRef<Flatpickr>(null);

    const handleSearch = () => {
        if (dateFrom && dateTo) {
            onSearch(dateFrom, dateTo);
        }
    };

    return (
        <div className="grid grid-2 gap-2">
            <div className="form-group">
                <label className="label">Dari Tanggal</label>
                <Flatpickr
                    ref={fromPickerRef}
                    options={{
                        dateFormat: 'Y-m-d',
                        time_24hr: true,
                    }}
                    value={dateFrom}
                    onChange={(dates) => {
                        if (dates[0]) {
                            const formatted = dates[0].toISOString().split('T')[0];
                            setDateFrom(formatted);
                        }
                    }}
                    className="input"
                    placeholder="Pilih tanggal mulai"
                />
            </div>

            <div className="form-group">
                <label className="label">Sampai Tanggal</label>
                <Flatpickr
                    ref={toPickerRef}
                    options={{
                        dateFormat: 'Y-m-d',
                        time_24hr: true,
                    }}
                    value={dateTo}
                    onChange={(dates) => {
                        if (dates[0]) {
                            const formatted = dates[0].toISOString().split('T')[0];
                            setDateTo(formatted);
                        }
                    }}
                    className="input"
                    placeholder="Pilih tanggal akhir"
                />
            </div>
        </div>
    );
}
