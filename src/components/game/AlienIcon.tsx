// src/components/game/AlienIcon.tsx

import { ALIEN_TYPE_COLORS } from "@/lib/constants/colors";
import { AlienType } from "@/types/game";

interface AlienIconProps {
  type: AlienType;
  className?: string;
}

/**
 * SVG icon component for displaying alien sprites in UI
 */
export const AlienIcon: React.FC<AlienIconProps> = ({
  type,
  className = "",
}) => {
  const color = ALIEN_TYPE_COLORS[type];

  return (
    <svg viewBox="0 0 12 8" className={className}>
      <g fill={color}>
        {type === "TOP" && (
          <>
            <rect x="4" y="0" width="4" height="1" />
            <rect x="2" y="1" width="8" height="1" />
            <rect x="1" y="2" width="10" height="1" />
            <rect x="1" y="3" width="2" height="1" />
            <rect x="5" y="3" width="2" height="1" />
            <rect x="9" y="3" width="2" height="1" />
            <rect x="1" y="4" width="10" height="1" />
            <rect x="3" y="5" width="2" height="1" />
            <rect x="7" y="5" width="2" height="1" />
            <rect x="2" y="6" width="2" height="1" />
            <rect x="8" y="6" width="2" height="1" />
            <rect x="1" y="7" width="2" height="1" />
            <rect x="9" y="7" width="2" height="1" />
          </>
        )}
        {type === "MIDDLE" && (
          <>
            <rect x="2" y="0" width="1" height="1" />
            <rect x="9" y="0" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="8" y="1" width="1" height="1" />
            <rect x="2" y="2" width="8" height="1" />
            <rect x="1" y="3" width="3" height="1" />
            <rect x="5" y="3" width="2" height="1" />
            <rect x="8" y="3" width="3" height="1" />
            <rect x="0" y="4" width="12" height="1" />
            <rect x="0" y="5" width="1" height="1" />
            <rect x="2" y="5" width="8" height="1" />
            <rect x="11" y="5" width="1" height="1" />
            <rect x="2" y="6" width="1" height="1" />
            <rect x="9" y="6" width="1" height="1" />
            <rect x="3" y="7" width="2" height="1" />
            <rect x="7" y="7" width="2" height="1" />
          </>
        )}
        {type === "BOTTOM" && (
          <>
            <rect x="3" y="0" width="6" height="1" />
            <rect x="1" y="1" width="10" height="1" />
            <rect x="0" y="2" width="12" height="1" />
            <rect x="0" y="3" width="3" height="1" />
            <rect x="5" y="3" width="2" height="1" />
            <rect x="9" y="3" width="3" height="1" />
            <rect x="0" y="4" width="12" height="1" />
            <rect x="2" y="5" width="3" height="1" />
            <rect x="7" y="5" width="3" height="1" />
            <rect x="1" y="6" width="2" height="1" />
            <rect x="5" y="6" width="2" height="1" />
            <rect x="9" y="6" width="2" height="1" />
            <rect x="0" y="7" width="2" height="1" />
            <rect x="10" y="7" width="2" height="1" />
          </>
        )}
      </g>
    </svg>
  );
};

export default AlienIcon;
