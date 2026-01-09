import React from 'react';
import { IOrgChartNode } from '../types';

interface IOrgCardProps {
    node: IOrgChartNode;
    isActive: boolean;
    isCompact: boolean;
    styleOptions: {
        activeColor: string;
        activeBgColor: string;
        connectorColor: string;
        textColor: string;
        cardColor: string;
        cardTextColor: string;
        cardTitleColor: string;
    };
    onClick: (node: IOrgChartNode) => void;
}

export const OrgCard: React.FC<IOrgCardProps> = ({
    node,
    isActive,
    isCompact,
    styleOptions,
    onClick,
}) => {
    const {
        activeColor,
        activeBgColor,
        connectorColor,
        textColor,
        cardColor,
        cardTextColor,
        cardTitleColor,
    } = styleOptions;

    const hasChildren = node.children && (node.total_children || 0) > 0;

    return (
        <div
            className="org-card"
            data-node-id={node.id}
            onClick={(e) => {
                e.stopPropagation();
                if (!isActive) onClick(node);
            }}
            style={{
                backgroundColor: isActive ? activeBgColor : cardColor,
                border: isActive ? `1px solid ${activeColor}` : '1px solid #ddd',
                borderRadius: '8px',
                padding: isCompact ? '4px' : '5px 6px',
                width: isCompact ? '50px' : '262px',
                height: '54px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: isCompact ? 'center' : 'flex-start',
                alignItems: 'center',
                gap: isCompact ? '0' : '10px',
                position: 'relative',
                flexShrink: 0,
                transition: 'all 0.3s ease',
            }}
        >
            {/* Image */}
            <img
                src={node.image || 'https://via.placeholder.com/40?text=👤'}
                alt={node.name}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = '/user-thumbnail.png'; // Fallback
                }}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    objectFit: 'cover',
                }}
            />

            {/* Info (Name/Title) - Hidden in Compact Mode */}
            {!isCompact && (
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: '14px',
                            color: cardTextColor,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '200px',
                        }}
                    >
                        {node.name}
                    </div>
                    <div
                        style={{
                            fontSize: '12px',
                            color: cardTitleColor,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '200px',
                        }}
                    >
                        {node.title || ''}
                    </div>
                </div>
            )}

            {/* Children Count Box (Right Side) */}
            {hasChildren && (
                <>
                    {/* Connector Stub */}
                    <div
                        style={{
                            position: 'absolute',
                            right: '-20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '20px',
                            height: '2px',
                            background: isActive ? activeColor : connectorColor,
                        }}
                    />
                    {/* Count Box */}
                    <div
                        className="org-count-box"
                        style={{
                            position: 'absolute',
                            right: '-60px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: isActive ? activeColor : '#fff',
                            border: `1px solid ${isActive ? activeColor : connectorColor}`,
                            color: isActive ? '#fff' : textColor,
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            width: '40px',
                            textAlign: 'center',
                        }}
                    >
                        {node.total_children || 0}
                    </div>
                </>
            )}

            {/* Active Line Indicator (Small dash on the right of the card) */}
            {isActive && hasChildren && (
                <div
                    style={{
                        position: 'absolute',
                        right: '-31%',
                        top: '3%',
                        transform: 'translateY(-50%)',
                        width: '11px',
                        height: '2px',
                        background: activeColor,
                        display: 'none' // Hiding this for now as it seems to be a specific visual artifact that might be broken
                    }}
                />
            )}
        </div>
    );
};
