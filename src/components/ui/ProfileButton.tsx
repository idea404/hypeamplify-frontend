import { Button } from "./Button";
import { motion } from "framer-motion";
import { useState } from "react";

// X Profile Button component with profile image
const ProfileButton = ({ name, onClick }: { name: string; onClick: () => void }) => {
    // Clean name for image path (removing @ if present)
    const imageName = name.replace("@", "").toLowerCase() + ".png";
    const [imageError, setImageError] = useState(false);

    return (
        <Button
            variant="outline"
            onClick={onClick}
            className="w-full text-base relative overflow-hidden group transition-all duration-200 hover:bg-accent/50 hover:border-primary/30 hover:shadow-md px-2 py-5 cursor-pointer"
        >
            <div className="flex items-center w-full justify-start gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border">
                    <img 
                        src={imageError ? "/images/x-logo.png" : `/images/${imageName}`} 
                        alt={name} 
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                </div>
                <span>@{name.replace("@", "")}</span>
            </div>
            <motion.div
                className="absolute inset-0 bg-primary/5 pointer-events-none opacity-0 group-hover:opacity-100"
                layoutId="profileButtonHighlight"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        </Button>
    );
};

export default ProfileButton;
