import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';

export const PdfReport: React.FC = () => {
    const [from, setFrom] = useState<string>('');
    const [to, setTo] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const downloadPdf = async () => {
        if (!from || !to) {
            setError("Please select both dates.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const fromDate = new Date(from).toISOString();
            const toDate = new Date(to).toISOString();

            const response = await fetch(
                `https://localhost:44343/api/reports/air-quality-report?from=${fromDate}&to=${toDate}&_=${Date.now()}`,
                {
                    method: "GET",
                    headers: { Accept: "application/pdf" },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || "Failed to generate PDF");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "AirQualityReport.pdf";
            a.click();

            window.URL.revokeObjectURL(url);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Paper sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
                <Typography variant="h4" gutterBottom>
                    Generate PDF Report
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    label="From"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    label="To"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                />

                <Button
                    variant="contained"
                    disabled={loading}
                    onClick={downloadPdf}
                    fullWidth
                >
                    {loading ? <CircularProgress size={24} /> : "Download PDF"}
                </Button>
            </Paper>
        </Box>
    );
};
