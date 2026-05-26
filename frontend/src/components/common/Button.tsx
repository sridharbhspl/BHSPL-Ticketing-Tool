import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  size = 'medium',
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary';
      case 'secondary': return 'btn-secondary';
      case 'danger': return 'btn-danger';
      case 'ghost': return 'btn-ghost';
      case 'icon': return 'btn-icon';
      default: return 'btn-primary';
    }
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.01, y: -1 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98, y: 0 } : {}}
      disabled={disabled || isLoading}
      className={`${getVariantClass()} ${className}`}
      style={{
        width: fullWidth ? '100%' : 'auto',
        justifyContent: 'center',
        padding: size === 'small' ? '8px 16px' : size === 'large' ? '12px 28px' : '10px 22px',
        fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.9rem',
        opacity: disabled || isLoading ? 0.6 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        ...style
      }}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <>
          {leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
          {children}
          {rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;
