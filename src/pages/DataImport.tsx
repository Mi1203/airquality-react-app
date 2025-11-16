import React, { useState } from 'react';
import {
    Paper,
    Box,
    Typography,
    Button,
    Alert,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
} from '@mui/material';
import {
    CloudUpload,
    Download,
    CheckCircle,
    Error,
    Schedule,
} from '@mui/icons-material';
import { airQualityApi } from '../services/airQualityApi';
import { ImportResultDto } from '../types/airQuality';

export const DataImport: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<ImportResultDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [importHistory, setImportHistory] = useState<ImportResultDto[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setImportResult(null);
        }
    };

    const handleFileUpload = async () => {
        if (!file) return;

        try {
            setLoading(true);
            const result = await airQualityApi.importSaveEcoBot(file);
            setImportResult(result);
            setImportHistory(prev => [result, ...prev.slice(0, 4)]);
        } catch (error) {
            setImportResult({
                isSuccess: false,
                recordsImported: 0,
                message: 'Error for import: ' + (error as Error).message,
                duration: '00:00:00'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImportFromApi = async () => {
        try {
            setLoading(true);
            const result = await airQualityApi.importSaveEcoBotFromUrl();
            setImportResult(result);
            setImportHistory(prev => [result, ...prev.slice(0, 4)]);
        } catch (error) {
            setImportResult({
                isSuccess: false,
                recordsImported: 0,
                message: 'Error import from API: ' + (error as Error).message,
                duration: '00:00:00'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (duration: string) => {
        try {
            const [hours, minutes, seconds] = duration.split(':');
            return `${hours}:${minutes}:${seconds.split('.')[0]}`;
        } catch {
            return duration;
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
                Import 
            </Typography>

            <Grid container spacing={3}>
                {/* File Upload Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Load the file
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <input
                                    accept=".json,.csv"
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        fullWidth
                                        sx={{ mb: 2, height: '100px' }}
                                    >
                                        <Box>
                                            <CloudUpload sx={{ fontSize: 40, mb: 1 }} />
                                            <Typography variant="body2">
                                                {file ? file.name : 'Choice JSON or CSV file'}
                                            </Typography>
                                        </Box>
                                    </Button>
                                </label>
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleFileUpload}
                                disabled={!file || loading}
                                startIcon={<Download />}
                            >
                                {loading ? 'Import...' : 'Import file'}
                            </Button>

                            {file && (
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    Розмір: {(file.size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* API Import Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <Download sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Import from API
                            </Typography>

                            <Typography variant="body2" color="textSecondary" paragraph>
                                Load data from SaveEcoBot API
                            </Typography>

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleImportFromApi}
                                disabled={loading}
                                startIcon={<CloudUpload />}
                                sx={{ mb: 1 }}
                            >
                                {loading ? 'Load...' : 'Load з API'}
                            </Button>

                            <Typography variant="caption" color="textSecondary">
                                Source: https://api.saveecobot.com/output.json
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Import Result */}
                {importResult && (
                    <Grid size={12}>
                        <Alert
                            severity={importResult.isSuccess ? 'success' : 'error'}
                            sx={{ mb: 2 }}
                        >
                            <Typography variant="h6" gutterBottom>
                                {importResult.isSuccess ? 'Import success' : 'Error - please check the logs'}
                            </Typography>
                            <Typography variant="body2">
                                {importResult.message}
                            </Typography>
                            {importResult.isSuccess && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Rows imported:</strong> {importResult.recordsImported}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Time of import:</strong> {formatDuration(importResult.duration)}
                                    </Typography>
                                </Box>
                            )}
                        </Alert>
                    </Grid>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <Grid size={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Importing...
                            </Typography>
                            <LinearProgress />
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                Please wait. This may take a few minutes.
                            </Typography>
                        </Paper>
                    </Grid>
                )}

                {/* Import History */}
                {importHistory.length > 0 && (
                    <Grid size={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Import History
                                </Typography>
                                <List>
                                    {importHistory.map((result, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    {result.isSuccess ? (
                                                        <CheckCircle color="success" />
                                                    ) : (
                                                        <Error color="error" />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2">
                                                            {result.isSuccess ? 'Successful import' : 'Import error'}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="caption" display="block">
                                                                Rows: {result.recordsImported} | Time: {formatDuration(result.duration)}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {result.message}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            {index < importHistory.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Information Card */}
                <Grid size={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Information about data formats
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Supported formats:
                                    </Typography>
                                    <Typography variant="body2" component="div">
                                        <ul>
                                            <li>JSON from SaveEcoBot</li>
                                            <li>CSV measurement files</li>
                                            <li>Direct connection to the API</li>
                                        </ul>
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                         Supported data:
                                    </Typography>
                                    <Typography variant="body2" component="div">
                                        <ul>
                                            <li>PM2.5 and PM10 measurements</li>
                                            <li>Station coordinates</li>
                                            <li>Measurement time stamps</li>
                                            <li>Station metadata</li>
                                        </ul>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};