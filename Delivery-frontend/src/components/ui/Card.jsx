import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';

const Card = ({
  children,
  className,
  hover = false,
  clickable = false,
  padding = true,
  ...props
}) => {
  const cardClasses = cn(
    'bg-white rounded-xl border border-gray-200 shadow-sm',
    padding && 'p-6',
    hover && 'hover:shadow-md transition-shadow duration-200',
    clickable && 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200',
    className
  );

  const Component = clickable ? motion.div : 'div';
  const motionProps = clickable ? {
    whileHover: { y: -2 },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <Component
      className={cardClasses}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm text-gray-600', className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('mt-4 pt-4 border-t border-gray-100', className)} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;