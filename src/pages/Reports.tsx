import React, { useState, useEffect } from 'react';
import {
    Paper,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    LinearProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import {
    LocalizationProvider,
    DatePicker,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    CheckCircle,
    Error,
    Warning,
    Info,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { airQualityApi } from '../services/airQualityApi';
import { DataCompletenessDto, DataProvider } from '../types/airQuality';

export const Reports: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [completenessData, setCompletenessData] = useState<DataCompletenessDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCompletenessReport = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await airQualityApi.getDataCompleteness(selectedDate);
            setCompletenessData(data);
        } catch (err) {
            setError('Error loading report. Check if the backend is running.');
            console.error('Error loading report:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompletenessReport();
    }, [selectedDate]);

    const getCompletenessColor = (percentage: number) => {
        if (percentage >= 90) return 'success';
        if (percentage >= 70) return 'warning';
        return 'error';
    };

    const getCompletenessIcon = (percentage: number) => {
        if (percentage >= 90) return <CheckCircle />;
        if (percentage >= 70) return <Warning />;
        return <Error />;
    };

    const chartData = completenessData?.providers.map(provider => ({
        name: provider.provider,
        completeness: provider.completenessPercentage,
        expected: provider.expectedRecords,
        actual: provider.actualRecords,
    })) || [];

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                    Reports and analitics
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Date Filter */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <DatePicker
                                label="Date for analysis"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue || new Date())}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        variant: 'outlined'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Report type</InputLabel>
                                <Select
                                    value="completeness"
                                    label="Report type"
                                >

                                    <MenuItem value="completeness">Data integrity</MenuItem>
                                    <MenuItem value="trends" disabled>Trends (coming soon)</MenuItem>
                                    <MenuItem value="comparison" disabled>Comparison (coming soon)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {/* Overall Completeness */}
                {completenessData && (
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Overall data integrity
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={completenessData.overallCompleteness}
                                            sx={{
                                                flexGrow: 1,
                                                mr: 2,
                                                height: 10,
                                                borderRadius: 5,
                                            }}
                                            color={
                                                completenessData.overallCompleteness >= 90 ? 'success' :
                                                    completenessData.overallCompleteness >= 70 ? 'warning' : 'error'
                                            }
                                        />
                                        <Typography variant="h6" color="textSecondary">
                                            {completenessData.overallCompleteness}%
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        Overall data completeness level for {new Date(completenessData.date).toLocaleDateString('uk-UA')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Completeness by Provider Chart */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Data integrity by source
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value: number) => [`${value}%`, 'Integrity']}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="completeness"
                                                    name="Integrity (%)"
                                                    fill="#667eea"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Statistics */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Statistics
                                    </Typography>
                                    {completenessData.providers.map((provider) => (
                                        <Box key={provider.provider} sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                {provider.provider}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={provider.completenessPercentage}
                                                    sx={{
                                                        flexGrow: 1,
                                                        mr: 1,
                                                        height: 6,
                                                    }}
                                                    color={getCompletenessColor(provider.completenessPercentage)}
                                                />
                                                <Typography variant="body2" color="textSecondary">
                                                    {provider.completenessPercentage}%
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" display="block" color="textSecondary">
                                                {provider.actualRecords} / {provider.expectedRecords} записів
                                            </Typography>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Detailed Report */}
                        <Grid size={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Detailed report on sources
                                    </Typography>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Data source</TableCell>
                                                    <TableCell align="center">Integrity</TableCell>
                                                    <TableCell align="center">Expected records</TableCell>
                                                    <TableCell align="center">Actual records</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Missing data</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {completenessData.providers.map((provider) => (
                                                    <TableRow key={provider.provider}>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {provider.provider}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                icon={getCompletenessIcon(provider.completenessPercentage)}
                                                                label={`${provider.completenessPercentage}%`}
                                                                color={getCompletenessColor(provider.completenessPercentage)}
                                                                variant="outlined"
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2">
                                                                {provider.expectedRecords}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2">
                                                                {provider.actualRecords}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                color={
                                                                    provider.completenessPercentage >= 90 ? 'success.main' :
                                                                        provider.completenessPercentage >= 70 ? 'warning.main' : 'error.main'
                                                                }
                                                            >
                                                                {provider.completenessPercentage >= 90 ? 'Excellent' :
                                                                    provider.completenessPercentage >= 70 ? 'Ok' : 'Needs to check'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            {provider.missingData.length > 0 ? (
                                                                <Typography variant="body2" color="textSecondary">
                                                                    {provider.missingData.slice(0, 2).join(', ')}
                                                                    {provider.missingData.length > 2 && ` ... (+${provider.missingData.length - 2})`}
                                                                </Typography>
                                                            ) : (
                                                                <Typography variant="body2" color="success.main">
                                                                        All data is present
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Recommendations */}
                        <Grid size={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Recommendations
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {completenessData.providers
                                            .filter(provider => provider.completenessPercentage < 90)
                                            .map(provider => (
                                                <Grid size={{ xs: 12, md: 6 }} key={provider.provider}>
                                                    <Alert severity="warning">
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            {provider.provider} - {provider.completenessPercentage}% integrity
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            It is recommended to check the connection to the data source
                                                            and perform the import again.
                                                        </Typography>
                                                    </Alert>
                                                </Grid>
                                            ))}

                                        {completenessData.providers.every(provider => provider.completenessPercentage >= 90) && (
                                            <Grid size={12}>
                                                <Alert severity="success">
                                                    <Typography variant="body2">
                                                        All data sources have excellent integrity. Keep monitoring!
                                                    </Typography>
                                                </Alert>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {!completenessData && !loading && (
                    <Alert severity="info">
                        <Typography variant="body2">
                            Select a date to view the data integrity report.
                        </Typography>
                    </Alert>
                )}
            </Box>
        </LocalizationProvider>
    );
};