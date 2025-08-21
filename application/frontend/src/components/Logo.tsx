import React from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/icons/logo-512.png" 
        alt="CesiZen Logo" 
        className={`${sizeClasses[size]} mr-2 sm:mr-3`}
      />
      {showText && (
        <h1 className={`${textSizeClasses[size]} font-bold text-neutral-900`}>
          CesiZen
        </h1>
      )}
    </div>
  )
}

export default Logo 