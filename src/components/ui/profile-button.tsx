import { Button } from "./button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

// X Profile Button component with profile image
interface ProfileButtonProps {
    name: string;
    profileImageUrl?: string;
    onClick: () => void;
    onDelete?: () => void;
    useLocalImagesFirst?: boolean; // Add this prop for demo profiles
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ 
    name, 
    profileImageUrl, 
    onClick, 
    onDelete,
    useLocalImagesFirst = false // Default to false, set to true for demo profiles
}) => {
    // Clean name for image path (removing @ if present)
    const imageName = name.replace("@", "").toLowerCase() + ".png";
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    // Reset image error state when profileImageUrl changes
    useEffect(() => {
        setImageError(false);
    }, [profileImageUrl]);

    // Reset error state when profile changes
    useEffect(() => {
        if (profileImageUrl) {
            setImageError(false);
        }
    }, [profileImageUrl, name]);

    // Determine which image source to use
    const getImageSrc = () => {
        if (imageError) {
            return "/images/x-logo.png";
        }
        
        // Use profile image URL if available
        if (profileImageUrl) {
            return profileImageUrl;
        }
        
        // Fallback to local image if enabled
        if (useLocalImagesFirst) {
            return `/images/${imageName}`;
        }
        
        // Ultimate fallback
        return `/images/${imageName}`;
    };

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
                            src={getImageSrc()}
                            alt={name} 
                            className={`w-full h-full object-cover ${getImageSrc().includes('x-logo.png') ? 'p-1' : ''}`}
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
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Trash2 size={16} />
                    </motion.div>
                </button>
            )}
        </div>
    );
};

export default ProfileButton;
