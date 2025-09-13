
import React, { useEffect, useState } from 'react';

interface PaymentConfettiProps {
  isVisible: boolean;
  onComplete: () => void;
}

const PaymentConfetti = ({ isVisible, onComplete }: PaymentConfettiProps) => {
  const [confettiPieces, setConfettiPieces] = useState<{ id: number; color: string; left: string }[]>([]);
  
  useEffect(() => {
    if (isVisible) {
      const colors = ['#1A73E8', '#34A853', '#FBBC05', '#EA4335'];
      const newConfetti = Array.from({ length: 50 }).map((_, index) => ({
        id: index,
        color: colors[Math.floor(Math.random() * colors.length)],
        left: `${Math.random() * 100}%`
      }));
      
      setConfettiPieces(newConfetti);
      
      // Clean up confetti after animation completes
      const timer = setTimeout(() => {
        setConfettiPieces([]);
        onComplete();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div className="celebration-wrapper">
      <div className="relative h-full w-full">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="confetti"
            style={{
              backgroundColor: piece.color,
              left: piece.left,
              top: '-10px',
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
        
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-lg z-50 animate-celebration">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 mx-auto w-fit mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Complete!</h3>
            <p className="text-gray-600">Great job on your debt repayment journey!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfetti;
