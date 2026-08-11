import React, { createContext, useContext, useState } from 'react';
import locationData from './locationData';

const LocationContext = createContext();

const DEFAULT_STATE = 'Karnataka';
const DEFAULT_DISTRICT = 'Bengaluru';
const DEFAULT_SEASON = 'Kharif';

export function LocationProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [district, setDistrict] = useState(DEFAULT_DISTRICT);
  const [season, setSeason] = useState(DEFAULT_SEASON);

  const stateInfo = locationData[state] || {};
  const districts = stateInfo.districts || [];
  const seasons = stateInfo.seasons || ['Kharif', 'Rabi'];
  const defaultCrop = stateInfo.defaultCrop || 'Rice';

  const changeState = (newState) => {
    setState(newState);
    const info = locationData[newState];
    if (info) {
      setDistrict(info.districts[0]);
      setSeason(info.seasons[0]);
    }
  };

  return (
    <LocationContext.Provider value={{
      state, district, season,
      setState: changeState,
      setDistrict,
      setSeason,
      districts,
      seasons,
      defaultCrop,
      allStates: Object.keys(locationData),
      locationData,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
