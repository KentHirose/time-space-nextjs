import React, { useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';

interface SearchBoxProps {
  onPlacesChanged: (places: google.maps.places.PlaceResult[]) => void;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onPlacesChanged, placeholder, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      const searchBox = new google.maps.places.SearchBox(inputRef.current);

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places) {
          onPlacesChanged(places);
        }
      });
    }
  }, [onPlacesChanged]);

  return (
    <TextField
      inputRef={inputRef}
      type="text"
      placeholder={placeholder}
      variant="outlined"
      value={value}
      onChange={onChange}
    />
  );
};

export default SearchBox;