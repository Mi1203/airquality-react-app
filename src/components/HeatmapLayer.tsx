import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface HeatmapLayerProps {
    points: [number, number, number][];
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        const layer = (L as any).heatLayer(points, {
            radius: 25,
            blur: 20,
            maxZoom: 12
        }).addTo(map);

        return () => {
            map.removeLayer(layer);
        };
    }, [points]);

    return null;
};
