import React from 'react';

export interface AvatarProps {
  /** The image URL */
  src?: string;
  /** Alternative text for the image */
  alt?: string;
  /** The initials to display if no image is provided */
  initials?: string;
  /** The size of the avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the avatar has a border */
  bordered?: boolean;
  /** Whether the avatar has a square shape */
  square?: boolean;
  /** Whether the avatar is online */
  online?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  initials,
  size = 'md',
  bordered = false,
  square = false,
  online = false,
  className = '',
  onClick,
}) => {
  // Determine size class
  let sizeClass = '';
  switch (size) {
    case 'xs':
      sizeClass = 'w-6 h-6 text-xs';
      break;
    case 'sm':
      sizeClass = 'w-8 h-8 text-sm';
      break;
    case 'lg':
      sizeClass = 'w-12 h-12 text-lg';
      break;
    case 'xl':
      sizeClass = 'w-16 h-16 text-xl';
      break;
    default: // md
      sizeClass = 'w-10 h-10 text-base';
  }

  // Generate random background color based on initials
  const getBackgroundColor = (text?: string) => {
    if (!text) return 'bg-gray-400';
    
    const colors = [
      'bg-red-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
    ];
    
    const index = text.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Base classes
  let classes = `${sizeClass} flex items-center justify-center relative overflow-hidden text-white font-medium `;
  
  // Shape classes
  classes += square ? 'rounded' : 'rounded-full ';
  
  // Border classes
  classes += bordered ? 'border-2 border-white dark:border-gray-800 ' : '';
  
  // Add custom classes
  classes += className;

  return (
    <div className={classes} onClick={onClick}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${getBackgroundColor(initials)}`}>
          {initials || alt?.charAt(0) || '?'}
        </div>
      )}
      
      {online && (
        <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800"></span>
      )}
    </div>
  );
};

export default Avatar;
