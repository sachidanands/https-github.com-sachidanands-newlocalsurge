import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string; // Optional class for the outer proximity hit area
  strength?: number;        // Multiplier for chassis magnetic pull (default: 0.35)
  textParallax?: number;    // Multiplier for inner content parallax float (default: 0.25)
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  wrapperClassName = '',
  strength = 0.35,
  textParallax = 0.25,
  as = 'button',
  href,
  target,
  rel,
  onClick,
  disabled,
  style,
  ...restProps
}) => {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [isMagneticEnabled, setIsMagneticEnabled] = useState(false);

  // Raw cursor displacement values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for butter-smooth attraction and release
  const springConfig = { damping: 18, stiffness: 190, mass: 0.15 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Secondary parallax spring for the inner label & icon
  const innerX = useTransform(springX, (val) => val * textParallax);
  const innerY = useTransform(springY, (val) => val * textParallax);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(hover: none)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    setIsMagneticEnabled(!isTouch && !prefersReducedMotion);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!isMagneticEnabled || disabled) return;
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Pull toward cursor up to comfortable boundary
    x.set(deltaX * strength);
    y.set(deltaY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Outer motion styles applied only on desktop fine pointer
  const motionStyle = isMagneticEnabled
    ? {
        x: springX,
        y: springY,
      }
    : undefined;

  const innerMotionStyle = isMagneticEnabled
    ? {
        x: innerX,
        y: innerY,
      }
    : undefined;

  // Extended proximity pad wrapper ensures the magnetic pull activates right before/upon entering
  if (as === 'a' && href) {
    return (
      <div
        className={`relative inline-flex items-center justify-center p-2.5 -m-2.5 ${wrapperClassName}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          onClick={onClick as any}
          style={{ ...style, ...(motionStyle || {}) }}
          className={`relative ${className}`}
          {...(restProps as any)}
        >
          <motion.span
            style={innerMotionStyle}
            className="flex items-center justify-center gap-2 w-full h-full pointer-events-none"
          >
            {children}
          </motion.span>
        </motion.a>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center p-2.5 -m-2.5 ${wrapperClassName}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={restProps.type || 'button'}
        onClick={onClick}
        disabled={disabled}
        style={{ ...style, ...(motionStyle || {}) }}
        className={`relative ${className}`}
        {...(restProps as any)}
      >
        <motion.span
          style={innerMotionStyle}
          className="flex items-center justify-center gap-2 w-full h-full pointer-events-none"
        >
          {children}
        </motion.span>
      </motion.button>
    </div>
  );
};

export default MagneticButton;
