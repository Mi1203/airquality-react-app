export enum PollutantType {
    PM25 = 'PM25',
    PM10 = 'PM10',
    NO2 = 'NO2',
    O3 = 'O3',
    SO2 = 'SO2',
    CO = 'CO'
}

export const PollutantMap: Record<number, PollutantType> = {
    0: PollutantType.PM25,
    1: PollutantType.PM10,
    2: PollutantType.NO2,
    3: PollutantType.O3,
    4: PollutantType.SO2,
    5: PollutantType.CO
};

export enum DataProvider {
    SaveEcoBot = 'SaveEcoBot',
    OpenAQ = 'OpenAQ',
    SensorCommunity = 'SensorCommunity'
}

export interface Station {
    id: string;
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    provider: DataProvider;
    isActive: boolean;
}

export interface Measurement {
    id: string;
    stationId: string;
    measurementTime: string;
    pollutant: PollutantType;
    value: number;
    unit: string;
}

export interface StationMapDto {
    id: string;
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    provider: DataProvider;
    measurements: MeasurementMapDto[];
}

export interface MeasurementMapDto {
    pollutant: PollutantType;
    value: number;
    unit: string;
    measurementTime: string;
}

export interface MapDataDto {
    date: string;
    pollutant?: PollutantType;
    stations: StationMapDto[];
}

export interface ImportResultDto {
    isSuccess: boolean;
    recordsImported: number;
    message: string;
    duration: string;
}

export interface DataCompletenessDto {
    date: string;
    providers: DataCompletenessItemDto[];
    overallCompleteness: number;
}

export interface DataCompletenessItemDto {
    provider: DataProvider;
    expectedRecords: number;
    actualRecords: number;
    completenessPercentage: number;
    missingData: string[];
}