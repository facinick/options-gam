import React from 'react';
import { Button } from '@/components/ui/button';
interface AddPositionPopupProps {
  x: number;
  y: number;
  onClose: () => void;
}

const AddPositionPopup: React.FC<AddPositionPopupProps> = ({ x, y, onClose }) => {
  const handleButtonClick = (label: string) => {
    console.log(label);
    onClose()
  };

  const buttons = [
    { label: 'BUY CE' },
    { label: 'BUY PE' },
    { label: 'SELL CE' },
    { label: 'SELL PE' },
  ];

  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
      <div className="w-auto p-2 flex flex-col gap-2">
        {buttons.map((button, index) => (
          <Button key={index} variant="outline" size="sm" onClick={() => handleButtonClick(button.label)}>{button.label}</Button>
        ))}
      </div>
    </div>

  );
};

export default AddPositionPopup;