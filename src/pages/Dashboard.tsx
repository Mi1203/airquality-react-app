import React, { useState, useEffect } from 'react';
import {
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Box,
    Card,
    CardContent,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { airQualityApi } from '../services/airQualityApi';
import { MapDataDto, PollutantType, DataProvider } from '../types/airQuality';
import { POLLUTANT_CONFIG } from '../utils/constants';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export const Dashboard: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedPollutant, setSelectedPollutant] = useState<PollutantType | ''>('');
    const [selectedProvider, setSelectedProvider] = useState<DataProvider | ''>('');
    const [mapData, setMapData] = useState<MapDataDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadMapData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await airQualityApi.getMapData(
                selectedDate,
                selectedPollutant || undefined,
                selectedProvider || undefined
            );
            setMapData(data);
        } catch (err) {
            setError('Error with data load. Please check the backend.');
            console.error('Error loading map data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMapData();
    }, []);

    const getPollutantColor = (pollutant: PollutantType, value: number): string => {
        const config = POLLUTANT_CONFIG[pollutant];
        if (!config) return '#667eea';

        if (value > config.dangerLevel) return '#ff4757';
        if (value > config.warningLevel) return '#ffa502';
        return '#2ed573';
    };

    const createCustomIcon = (pollutant: PollutantType, value: number) => {
        const color = getPollutantColor(pollutant, value);

        return L.divIcon({
            className: 'custom-marker',
            html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
          font-family: Arial, sans-serif;
        ">${Math.round(value)}</div>
      `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Filters */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <DatePicker
                                label="Date"
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Pollutant</InputLabel>
                                <Select
                                    value={selectedPollutant}
                                    label="Pollutant"
                                    onChange={(e) => setSelectedPollutant(e.target.value as PollutantType | '')}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value={PollutantType.PM25}>PM2.5</MenuItem>
                                    <MenuItem value={PollutantType.PM10}>PM10</MenuItem>
                                    <MenuItem value={PollutantType.NO2}>NO₂</MenuItem>
                                    <MenuItem value={PollutantType.O3}>O₃</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Source</InputLabel>
                                <Select
                                    value={selectedProvider}
                                    label="Source"
                                    onChange={(e) => setSelectedProvider(e.target.value as DataProvider | '')}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value={DataProvider.SaveEcoBot}>SaveEcoBot</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={loadMapData}
                                disabled={loading}
                                sx={{ height: '56px' }}
                                startIcon={loading ? <CircularProgress size={20} /> : undefined}
                            >
                                {loading ? 'Loading...' : 'Load the data'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Map */}
                <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ height: '600px', position: 'relative' }}>
                        {loading && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    zIndex: 1000,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        )}
                        <MapContainer
                            center={[49.0, 31.5]}
                            zoom={6}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {mapData?.stations.map((station) => {
                                const primaryMeasurement = station.measurements[0];
                                if (!primaryMeasurement) return null;

                                return (
                                    <Marker
                                        key={station.id}
                                        position={[station.latitude, station.longitude]}
                                        icon={createCustomIcon(primaryMeasurement.pollutant, primaryMeasurement.value)}
                                    >
                                        <Popup>
                                            <Box sx={{ minWidth: 200 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    {station.name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    {station.location}
                                                </Typography>
                                                {station.measurements.map((measurement) => (
                                                    <Box
                                                        key={measurement.pollutant}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            mb: 1,
                                                            p: 1,
                                                            backgroundColor: 'grey.50',
                                                            borderRadius: 1,
                                                        }}
                                                    >
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {measurement.pollutant}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {measurement.value} {measurement.unit}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                                <Typography variant="caption" color="textSecondary">
                                                    Source: {station.provider}
                                                </Typography>
                                            </Box>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    </Box>
                </Paper>

                {/* Stations List */}
                {mapData && mapData.stations.length > 0 && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                           Monitoring stations: ({mapData.stations.length})
                        </Typography>
                        <Grid container spacing={2}>
                            {mapData.stations.map((station) => (
                                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={station.id}>
                                    <Card sx={{ height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {station.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                {station.location}
                                            </Typography>
                                            {station.measurements.map((measurement) => (
                                                <Box
                                                    key={measurement.pollutant}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mb: 1,
                                                        p: 1,
                                                        backgroundColor: 'grey.50',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {measurement.pollutant}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {measurement.value} {measurement.unit}
                                                    </Typography>
                                                </Box>
                                            ))}
                                            <Typography variant="caption" color="textSecondary">
                                                Source: {station.provider}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {mapData && mapData.stations.length === 0 && !loading && (
                    <Alert severity="info">
                        Nothig for this filter - please change the filter setting
                    </Alert>
                )}
            </Box>
        </LocalizationProvider>
    );
};