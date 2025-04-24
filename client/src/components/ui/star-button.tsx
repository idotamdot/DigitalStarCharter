import { useState, useEffect, useRef, ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  angle: number;
  speed: number;
  life: number;
  maxLife: number;
}

interface StarButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "purple" | "pink" | "gold";
}

const StarButton = ({
  href,
  children,
  className,
  size = "md",
  color = "gold",
}: StarButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<StarParticle[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);
  const particleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const sizeClasses = {
    sm: "text-sm py-1 px-3",
    md: "text-base py-2 px-4",
    lg: "text-lg py-3 px-6",
  };

  const colorClasses = {
    blue: "from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 shadow-blue-500/30",
    purple: "from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 shadow-purple-500/30",
    pink: "from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 shadow-pink-500/30",
    gold: "from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 shadow-amber-500/30",
  };

  // Create particles
  useEffect(() => {
    if (isHovered && buttonRef.current) {
      // Clear any existing interval
      if (particleIntervalRef.current) {
        clearInterval(particleIntervalRef.current);
      }

      // Generate new particles periodically
      particleIntervalRef.current = setInterval(() => {
        setParticles((prevParticles) => {
          const newParticles = [...prevParticles];
          
          // Limit to 30 particles
          if (newParticles.length < 30) {
            const buttonRect = buttonRef.current?.getBoundingClientRect();
            if (buttonRect) {
              // Create particles around the button's border
              const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
              let x, y;
              
              switch (side) {
                case 0: // top
                  x = Math.random() * buttonRect.width;
                  y = 0;
                  break;
                case 1: // right
                  x = buttonRect.width;
                  y = Math.random() * buttonRect.height;
                  break;
                case 2: // bottom
                  x = Math.random() * buttonRect.width;
                  y = buttonRect.height;
                  break;
                case 3: // left
                  x = 0;
                  y = Math.random() * buttonRect.height;
                  break;
                default:
                  x = 0;
                  y = 0;
              }

              const maxLife = 30 + Math.random() * 30;
              newParticles.push({
                id: Date.now() + Math.random(),
                x,
                y,
                size: 2 + Math.random() * 4,
                opacity: 0.6 + Math.random() * 0.4,
                angle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5,
                life: 0,
                maxLife,
              });
            }
          }
          
          return newParticles;
        });
      }, 50);
    } else {
      // Clear interval when not hovered
      if (particleIntervalRef.current) {
        clearInterval(particleIntervalRef.current);
        particleIntervalRef.current = null;
      }
    }

    return () => {
      if (particleIntervalRef.current) {
        clearInterval(particleIntervalRef.current);
      }
    };
  }, [isHovered]);

  // Update particles
  useEffect(() => {
    const updateParticles = () => {
      setParticles((prevParticles) => {
        return prevParticles
          .map((particle) => {
            const newLife = particle.life + 1;
            const lifeRatio = newLife / particle.maxLife;
            
            // Update position
            const newX = particle.x + Math.cos(particle.angle) * particle.speed;
            const newY = particle.y + Math.sin(particle.angle) * particle.speed;

            // Update opacity based on life
            const newOpacity = particle.opacity * (1 - lifeRatio);
            
            return {
              ...particle,
              x: newX,
              y: newY,
              opacity: newOpacity,
              life: newLife,
            };
          })
          .filter((particle) => particle.life < particle.maxLife);
      });
      
      animationFrameRef.current = requestAnimationFrame(updateParticles);
    };
    
    if (isHovered && particles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(updateParticles);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, particles.length]);

  // Clean up particles when not hovered
  useEffect(() => {
    if (!isHovered) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  return (
    <Link href={href}>
      <div
        ref={buttonRef}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 overflow-hidden",
          isHovered ? "animate-pulse" : "",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-70",
            `bg-gradient-to-r ${colorClasses[color]}`
          )}
        />
        
        {/* Inner circle with star icon and text */}
        <div
          className={cn(
            "relative flex items-center justify-center gap-2 text-white font-medium",
            sizeClasses[size]
          )}
        >
          <Star className={cn(
            "transition-transform duration-300",
            isHovered ? "scale-110" : "scale-100",
            size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"
          )} />
          <span>{children}</span>
        </div>
        
        {/* Sparkle particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size}px ${particle.size / 2}px rgba(255, 255, 255, ${particle.opacity})`,
            }}
          />
        ))}
      </div>
    </Link>
  );
};

export { StarButton };