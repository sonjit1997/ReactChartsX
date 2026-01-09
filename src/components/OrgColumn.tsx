import React, { useEffect, useRef, useState } from 'react';
import { IReactChartXNode } from '../types';
import { OrgCard } from './OrgCard';

interface IOrgColumnProps {
    nodes: IReactChartXNode[];
    colIndex: number;
    // We need to know which node is active to highlight it.
    // The active node in THIS column is the one that lies on the 'path' at index `colIndex + 1`.
    // Wait, path[colIndex] is the parent of this column (if > 0).
    // The nodes in this column are children of path[colIndex].
    // One of them might be active (path[colIndex + 1]).
    activeNodeId?: string;
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
    onCardClick: (node: IReactChartXNode) => void;
    onScroll?: () => void;
}

const ARROW_UP = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m18 15-6-6-6 6" />
    </svg>
);

const ARROW_DOWN = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export const OrgColumn: React.FC<IOrgColumnProps> = ({
    nodes,
    colIndex,
    activeNodeId,
    isCompact,
    styleOptions,
    onCardClick,
    onScroll,
}) => {
    const colRef = useRef<HTMLDivElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const checkScroll = () => {
        if (!colRef.current) return;
        const el = colRef.current;

        // Buffer of 5px
        setCanScrollUp(el.scrollTop > 5);
        setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 5);

        if (onScroll) onScroll();
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [nodes]); // Re-check when nodes change

    const scrollUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        colRef.current?.scrollBy({ top: -100, behavior: 'smooth' });
    };

    const scrollDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        colRef.current?.scrollBy({ top: 100, behavior: 'smooth' });
    };

    return (
        <div
            ref={colRef}
            className={`org-col col-${colIndex}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onScroll={checkScroll}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                height: '100%',
                overflowY: 'auto',
                minWidth: isCompact ? '130px' : '300px',
                padding: '20px 0',
                paddingRight: isCompact ? '60px' : '81px',
                boxSizing: 'border-box',
                zIndex: 1,
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
            }}
        >
            {/* Scroll Indicators */}
            {/* Top Arrow */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    width: '100%',
                    height: '24px',
                    marginBottom: '-24px',
                    // background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: isHovering && canScrollUp ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: isHovering && canScrollUp ? 'auto' : 'none',
                    cursor: 'pointer',
                    zIndex: 10,
                    color: '#666',
                }}
                onClick={scrollUp}
            >
                {ARROW_UP}
            </div>

            <div className="col-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {nodes.map((node) => (
                    <OrgCard
                        key={node.id}
                        node={node}
                        isActive={node.id === activeNodeId}
                        isCompact={isCompact}
                        styleOptions={styleOptions}
                        onClick={onCardClick}
                    />
                ))}
            </div>

            {/* Bottom Arrow */}
            <div
                style={{
                    position: 'sticky',
                    bottom: 0,
                    width: '100%',
                    height: '24px',
                    marginTop: '-24px',
                    // background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: isHovering && canScrollDown ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: isHovering && canScrollDown ? 'auto' : 'none',
                    cursor: 'pointer',
                    zIndex: 10,
                    color: '#666',
                }}
                onClick={scrollDown}
            >
                {ARROW_DOWN}
            </div>
        </div>
    );
};
