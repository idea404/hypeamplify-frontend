import { Button } from "./Button";
import { motion } from "framer-motion";
import { useState } from "react";

// X Profile Button component with profile image
interface ProfileButtonProps {
    name: string;
    onClick: () => void;
    onDelete?: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ name, onClick, onDelete }) => {
    // Clean name for image path (removing @ if present)
    const imageName = name.replace("@", "").toLowerCase() + ".png";
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative rounded-md border border-input bg-background px-3 flex items-center justify-between hover:border-primary transition-colors min-w-[220px] w-full overflow-hidden h-12"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button 
                onClick={onClick}
                className="flex-1 text-left cursor-pointer focus:outline-none min-w-0 overflow-hidden"
            >
                <div className="flex items-center w-full justify-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border">
                        <img 
                            src={imageError ? "/images/x-logo.png" : `/images/${imageName}`} 
                            alt={name} 
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    </div>
                    <span className="truncate">@{name.replace("@", "")}</span>
                </div>
            </button>
            
            {onDelete && isHovered && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="flex items-center justify-center h-6 w-6 text-red-500 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Delete profile"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </div>
    );
};

export default ProfileButton;
