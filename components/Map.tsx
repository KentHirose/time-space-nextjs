import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import Box from '@mui/material/Box';

interface MapProps {
  center: google.maps.LatLngLiteral;
  markers: google.maps.LatLngLiteral[];
  onLoad: (map: google.maps.Map) => void;
}

const Map: React.FC<MapProps> = ({ center, markers, onLoad }) => {
  return (
    <Box sx={{ width: '100%', height: '500px' }} 
    style={{ marginTop: "10px", marginBottom: "30px" }}
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={8}
        onLoad={onLoad}
      >
        {markers.map((marker, index) => (
          <Marker key={index} position={marker} />
        ))}
      </GoogleMap>
    </Box>
  );
};

export default Map;