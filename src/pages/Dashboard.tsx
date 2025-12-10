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

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { airQualityApi } from '../services/airQualityApi';
import { MapDataDto, DataProvider, PollutantType } from '../types/airQuality';

// -------------------------------------------------------------------
// FIX MARKERS
// -------------------------------------------------------------------
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// -------------------------------------------------------------------
// NUMERIC POLLUTANT MAP
// -------------------------------------------------------------------
const PollutantMap: Record<number, string> = {
    1: "PM2.5",
    2: "PM10",
    3: "NO2",
    4: "SO2",
    5: "O3",
    6: "CO",
};

// -------------------------------------------------------------------
// COLOR SCALE
// -------------------------------------------------------------------
const getPollutantColor = (pollutant: number, value: number): string => {
    if (value == null || isNaN(value)) return '#999999'; // default gray

    switch (pollutant) {
        case 1:
            if (value <= 12) return '#00E400';
            if (value <= 35.4) return '#FFFF00';
            if (value <= 55.4) return '#FF7E00';
            if (value <= 150.4) return '#FF0000';
            if (value <= 250.4) return '#8F3F97';
            return '#7E0023';
        case 2:
            if (value <= 54) return '#00E400';
            if (value <= 154) return '#FFFF00';
            if (value <= 254) return '#FF7E00';
            if (value <= 354) return '#FF0000';
            if (value <= 424) return '#8F3F97';
            return '#7E0023';
        case 3:
            if (value <= 53) return '#00E400';
            if (value <= 100) return '#FFFF00';
            if (value <= 360) return '#FF7E00';
            if (value <= 649) return '#FF0000';
            if (value <= 1249) return '#8F3F97';
            return '#7E0023';
        case 4:
            if (value <= 54) return '#00E400';
            if (value <= 70) return '#FFFF00';
            if (value <= 85) return '#FF7E00';
            if (value <= 105) return '#FF0000';
            if (value <= 200) return '#8F3F97';
            return '#7E0023';
        case 5:
            if (value <= 35) return '#00E400';
            if (value <= 75) return '#FFFF00';
            if (value <= 185) return '#FF7E00';
            if (value <= 304) return '#FF0000';
            if (value <= 604) return '#8F3F97';
            return '#7E0023';
        case 6:
            if (value <= 4.4) return '#00E400';
            if (value <= 9.4) return '#FFFF00';
            if (value <= 12.4) return '#FF7E00';
            if (value <= 15.4) return '#FF0000';
            if (value <= 30.4) return '#8F3F97';
            return '#7E0023';
        default:
            return '#999999';
    }
};

// -------------------------------------------------------------------
// CUSTOM ICON
// -------------------------------------------------------------------
const createCustomIcon = (pollutant: number, value: number) => {
    const color = getPollutantColor(pollutant, value);

    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background-color: ${color};
                width: 26px;
                height: 26px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 11px;
                font-family: Arial, sans-serif;
            ">
                ${Math.round(value)}
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
};

// -------------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------------
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
            setError('Error while loading data. Check backend.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMapData();
    }, []);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* FILTERS */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <DatePicker
                                label="Date"
                                value={selectedDate}
                                onChange={(v) => setSelectedDate(v || new Date())}
                                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth>
                                <InputLabel>Pollutant</InputLabel>
                                <Select
                                    value={selectedPollutant}
                                    label="Pollutant"
                                    onChange={(e) => setSelectedPollutant(e.target.value as any)}
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
                            <FormControl fullWidth>
                                <InputLabel>Source</InputLabel>
                                <Select
                                    value={selectedProvider}
                                    label="Source"
                                    onChange={(e) => setSelectedProvider(e.target.value as any)}
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
                                {loading ? 'Loading...' : 'Load data'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* MAP */}
                <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ height: '600px', position: 'relative' }}>
                        <MapContainer center={[49.0, 31.5]} zoom={6} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {mapData?.stations.map((station) => {
                                const primary = station.measurements[0];
                                if (!primary) return null;

                                return (
                                    <React.Fragment key={station.id}>
                                        <Marker
                                            position={[station.latitude, station.longitude]}
                                            icon={createCustomIcon(Number(primary.pollutant), primary.value)}
                                        >
                                            <Popup>
                                                <Box sx={{ minWidth: 200 }}>
                                                    <Typography variant="h6">{station.name}</Typography>
                                                    <Typography variant="body2" color="textSecondary">{station.location}</Typography>

                                                    {station.measurements.map((m) => (
                                                        <Box
                                                            key={m.pollutant}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                p: 1,
                                                                mb: 1,
                                                                backgroundColor: 'grey.100',
                                                                borderRadius: 1,
                                                            }}
                                                        >
                                                            <Typography fontWeight="bold">
                                                                {PollutantMap[Number(m.pollutant)]}
                                                            </Typography>
                                                            <Typography>
                                                                {m.value} {m.unit}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Popup>
                                        </Marker>

                                        {/* aura circles */}
                                        {station.measurements.map((m) => {
                                            const color = getPollutantColor(Number(m.pollutant), m.value);
                                            const baseRadius = 120 + m.value * 15;
                                            return [1, 2, 3].map((i) => (
                                                <Circle
                                                    key={`${station.id}-${m.pollutant}-${i}`}
                                                    center={[station.latitude, station.longitude]}
                                                    radius={baseRadius * i}
                                                    pathOptions={{
                                                        color,
                                                        fillColor: color,
                                                        fillOpacity: 0.12 * (4 - i),
                                                        stroke: false,
                                                    }}
                                                />
                                            ));
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </MapContainer>
                    </Box>
                </Paper>

                {/* STATION LIST */}
                {mapData && mapData.stations.length > 0 && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Monitoring stations ({mapData.stations.length})
                        </Typography>

                        <Grid container spacing={2}>
                            {mapData.stations.map((station) => (
                                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={station.id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">{station.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">{station.location}</Typography>

                                            {station.measurements.map((m) => (
                                                <Box
                                                    key={m.pollutant}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        p: 1,
                                                        mb: 1,
                                                        backgroundColor: 'grey.100',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <Typography fontWeight="bold">{PollutantMap[Number(m.pollutant)]}</Typography>
                                                    <Typography>{m.value} {m.unit}</Typography>
                                                </Box>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {mapData && mapData.stations.length === 0 && !loading && (
                    <Alert severity="info">No data. Adjust your filters.</Alert>
                )}
            </Box>
        </LocalizationProvider>
    );
};
