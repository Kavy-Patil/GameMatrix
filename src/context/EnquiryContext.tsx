import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Game } from '../types/game';
import { EnquiryModal } from '../components/enquiry/EnquiryModal';

interface EnquiryContextType {
  isOpen: boolean;
  selectedGame: Game | null;
  defaultPlatform?: string;
  openEnquiry: (game: Game, platform?: string) => void;
  closeEnquiry: () => void;
}

const EnquiryContext = createContext<EnquiryContextType | undefined>(undefined);

export const EnquiryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [defaultPlatform, setDefaultPlatform] = useState<string | undefined>(undefined);

  const openEnquiry = (game: Game, platform?: string) => {
    setSelectedGame(game);
    setDefaultPlatform(platform || game.platform || (game.platforms && game.platforms[0]));
    setIsOpen(true);
  };

  const closeEnquiry = () => {
    setIsOpen(false);
  };

  return (
    <EnquiryContext.Provider
      value={{
        isOpen,
        selectedGame,
        defaultPlatform,
        openEnquiry,
        closeEnquiry,
      }}
    >
      {children}
      <EnquiryModal
        isOpen={isOpen}
        game={selectedGame}
        defaultPlatform={defaultPlatform}
        onClose={closeEnquiry}
      />
    </EnquiryContext.Provider>
  );
};

export const useEnquiry = (): EnquiryContextType => {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error('useEnquiry must be used within an EnquiryProvider');
  }
  return context;
};
