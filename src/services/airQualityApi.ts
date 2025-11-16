import { api } from './api';
import {
    MapDataDto,
    Station,
    ImportResultDto,
    DataProvider,
    PollutantType,
    DataCompletenessDto
} from '../types/airQuality';

export const airQualityApi = {
    // Map data
    getMapData: (date: Date, pollutant?: PollutantType, provider?: DataProvider): Promise<MapDataDto> =>
        api.get<MapDataDto>('/api/airquality/map-data', {
            params: {
                date: date.toISOString().split('T')[0],
                pollutant,
                provider
            }
        }).then(response => response.data),

    // Available dates
    getAvailableDates: (): Promise<string[]> =>
        api.get<string[]>('/api/airquality/available-dates').then(response => response.data),

    // Stations
    getStations: (provider?: DataProvider): Promise<Station[]> =>
        api.get<Station[]>('/api/airquality/stations', {
            params: { provider }
        }).then(response => response.data),

    // Cities
    getCities: (): Promise<string[]> =>
        api.get<string[]>('/api/airquality/cities').then(response => response.data),

    // Data import
    importSaveEcoBot: (file: File): Promise<ImportResultDto> => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<ImportResultDto>('/api/dataimport/saveecobot', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(response => response.data);
    },

    importSaveEcoBotFromUrl: (): Promise<ImportResultDto> =>
        api.post<ImportResultDto>('/api/dataimport/saveecobot/url').then(response => response.data),

    // Data completeness
    getDataCompleteness: (date: Date): Promise<DataCompletenessDto> =>
        api.get<DataCompletenessDto>('/api/airquality/data-completeness', {
            params: { date: date.toISOString().split('T')[0] }
        }).then(response => response.data),

    // Station measurements
    getStationMeasurements: (stationId: string, startDate?: Date, endDate?: Date) =>
        api.get(`/api/airquality/station/${stationId}/measurements`, {
            params: {
                startDate: startDate?.toISOString().split('T')[0],
                endDate: endDate?.toISOString().split('T')[0]
            }
        }).then(response => response.data),
};