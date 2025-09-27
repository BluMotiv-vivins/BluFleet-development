import { Info, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useState } from 'react';

interface CreditItem {
  type: 'photo' | 'video';
  author: string;
  authorUrl?: string;
  source: string;
  sourceUrl: string;
  description?: string;
}

interface CreditsProps {
  credits: CreditItem[];
}

export default function Credits({ credits }: CreditsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-6 left-6 z-10">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="p-1 transition-all duration-300 hover:scale-110 touch-target"
            aria-label="View image and video credits"
          >
            <Info 
              size={14} 
              style={{ color: '#F0F8FE' }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 max-h-96 overflow-y-auto p-4 backdrop-blur-md"
          style={{ 
            backgroundColor: 'rgba(48, 68, 97, 0.4)',
            borderColor: 'rgba(240, 248, 254, 0.2)',
            border: '1px solid rgba(240, 248, 254, 0.2)',
            color: '#F0F8FE',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
          side="top"
          align="start"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium" style={{ color: '#F0F8FE' }}>
                Image & Video Credits
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 transition-all duration-300 hover:scale-110 touch-target"
                aria-label="Close credits"
              >
                <X 
                  size={12} 
                  style={{ color: '#F0F8FE' }}
                />
              </button>
            </div>
            <div className="space-y-3">
              {credits.map((credit, index) => (
                <div key={index} className="text-xs leading-relaxed">
                  {credit.type === 'photo' ? (
                    <div>
                      Photo by{' '}
                      {credit.authorUrl ? (
                        <a 
                          href={credit.authorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline transition-colors duration-200"
                          style={{ color: '#247FFF' }}
                        >
                          {credit.author}
                        </a>
                      ) : (
                        <span style={{ color: '#F0F8FE' }}>{credit.author}</span>
                      )}{' '}
                      on{' '}
                      <a 
                        href={credit.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline transition-colors duration-200"
                        style={{ color: '#247FFF' }}
                      >
                        {credit.source}
                      </a>
                      {credit.description && (
                        <div className="mt-1 opacity-70" style={{ color: '#F0F8FE' }}>
                          {credit.description}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      Video by {credit.author}:{' '}
                      <a 
                        href={credit.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline transition-colors duration-200 break-all"
                        style={{ color: '#247FFF' }}
                      >
                        {credit.sourceUrl}
                      </a>
                      {credit.description && (
                        <div className="mt-1 opacity-70" style={{ color: '#F0F8FE' }}>
                          {credit.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}