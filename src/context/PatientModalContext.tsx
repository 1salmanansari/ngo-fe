'use client';

import React, { createContext, useContext, useState } from 'react';

interface PatientModalContextType {
  selectedPatientId: number | null;
  isOpen: boolean;
  openPatientProfile: (patientId: number) => void;
  closePatientProfile: () => void;
}

const PatientModalContext = createContext<PatientModalContextType>({
  selectedPatientId: null,
  isOpen: false,
  openPatientProfile: () => {},
  closePatientProfile: () => {},
});

export const usePatientModal = () => useContext(PatientModalContext);

export const PatientModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openPatientProfile = (patientId: number) => {
    setSelectedPatientId(patientId);
    setIsOpen(true);
  };

  const closePatientProfile = () => {
    setIsOpen(false);
    setSelectedPatientId(null);
  };

  return (
    <PatientModalContext.Provider
      value={{
        selectedPatientId,
        isOpen,
        openPatientProfile,
        closePatientProfile,
      }}
    >
      {children}
    </PatientModalContext.Provider>
  );
};
