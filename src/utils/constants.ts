import { PollutantType } from '../types/airQuality';


export const pollutantMap: { [key: number]: string } = {
    1: 'PM25',
    2: 'PM10',
    3: 'NO2',
    4: 'O3',
    5: 'SO2',
    6: 'CO'
};

export const POLLUTANT_CONFIG = {
    [PollutantType.PM25]: {
        name: 'PM2.5',
        unit: 'μg/m³',
        safeLevel: 25,
        warningLevel: 50,
        dangerLevel: 100,
        color: '#ff6b6b'
    },
    [PollutantType.PM10]: {
        name: 'PM10',
        unit: 'μg/m³',
        safeLevel: 50,
        warningLevel: 100,
        dangerLevel: 200,
        color: '#4ecdc4'
    },
    [PollutantType.NO2]: {
        name: 'NO₂',
        unit: 'μg/m³',
        safeLevel: 40,
        warningLevel: 100,
        dangerLevel: 200,
        color: '#45b7d1'
    },
    [PollutantType.O3]: {
        name: 'O₃',
        unit: 'μg/m³',
        safeLevel: 60,
        warningLevel: 120,
        dangerLevel: 180,
        color: '#96ceb4'
    },
    [PollutantType.SO2]: {
        name: 'SO₂',
        unit: 'μg/m³',
        safeLevel: 20,
        warningLevel: 80,
        dangerLevel: 250,
        color: '#feca57'
    },
    [PollutantType.CO]: {
        name: 'CO',
        unit: 'mg/m³',
        safeLevel: 2,
        warningLevel: 10,
        dangerLevel: 17,
        color: '#ff9ff3'
    }
};

export const PROVIDER_CONFIG = {
    SaveEcoBot: {
        name: 'SaveEcoBot',
        color: '#667eea'
    },
    OpenAQ: {
        name: 'OpenAQ',
        color: '#764ba2'
    },
    SensorCommunity: {
        name: 'Sensor.Community',
        color: '#f093fb'
    }
};

export const pollutantLabels = {
    0: 'PM25',
    1: 'PM10',
    2: 'NO2',
    3: 'O3',
    4: 'SO2',
    5: 'CO'
}