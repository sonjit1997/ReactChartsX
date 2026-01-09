import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import { OrgColumn } from './components/OrgColumn';
import { IReactChartXProps, IReactChartXNode } from './types';  
import { drawConnectors } from './utils/drawConnectors';

// Default theme
const DEFAULT_ACTIVE_COLOR = 'rgb(0 203 108)';

export default function ReactChartX({ data, styleOptions }: IReactChartXProps) {
  const activeColor = styleOptions?.activeColor || DEFAULT_ACTIVE_COLOR;
  const connectorColor = styleOptions?.connectorColor || '#CCCCCC';
  const textColor = styleOptions?.textColor || '#000000';
  const cardColor = styleOptions?.cardColor || '#ffffff';
  const cardTextColor = styleOptions?.cardTextColor || '#666666';
  const cardTitleColor = styleOptions?.cardTitleColor || '#666666';

  // Calculate a background color with opacity based on active color
  const activeBgColor = styleOptions?.backgroundColor || `color-mix(in srgb, ${activeColor}, transparent 94%)`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const connectorLayerRef = useRef<SVGSVGElement | null>(null);
  const [path, setPath] = useState<IReactChartXNode[]>([data]); // active path of nodes
  const [redrawTrigger, setRedrawTrigger] = useState(0); // Simple counter to force redraws

  // Style object to pass down
  const computedStyleOptions = {
    activeColor,
    activeBgColor,
    connectorColor,
    textColor,
    cardColor,
    cardTextColor,
    cardTitleColor,
  };

  useEffect(() => {
    if (!data) return;

    if (data.id === 'synthetic-root') {
      const ceoNode = data.children?.find(c => (c.total_children || 0) > 0);
      if (ceoNode) {
        setPath([data, ceoNode]); // root + CEO
      } else {
        setPath([data]); // just synthetic root
      }
    } else {
      setPath([data, data]); // normal mode (duplicated data? legacy logic kept)
    }
  }, [data]);

  // Handle Card Click
  const handleCardClick = (node: IReactChartXNode, colIndex: number) => {
    // New path is slice(0, colIndex + 1) + node
    const newPath = [...path.slice(0, colIndex + 1), node];
    setPath(newPath);
  };

  // Draw Connectors Effect
  useEffect(() => {
    if (!containerRef.current || !connectorLayerRef.current) return;

    // We can select the SVG using d3
    const layerSel = d3.select(connectorLayerRef.current);

    // Clear all? Safe to clear all if we redraw everything.
    layerSel.selectAll('*').remove();

    path.forEach((_, colIndex) => {
      // Connect colIndex-1 to colIndex
      if (colIndex > 0) {
        drawConnectors({
          container: containerRef.current!,
          connectorLayer: layerSel as any,
          path,
          colIndex,
          activeColor,
          connectorColor
        });
      }
    });

  }, [path, redrawTrigger, activeColor, connectorColor]);

  // Resize Handler
  useEffect(() => {
    const handleResize = () => setRedrawTrigger(prev => prev + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine Compact Logic
  const lastNode = path[path.length - 1];
  const isLeaf = (!lastNode.children || lastNode.children.length === 0) && (lastNode.total_children === 0 || lastNode.total_children === undefined);
  const cutoff = isLeaf ? 3 : 2;

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
          position: 'relative'
        }}
      >
        {/* Global Connector Layer */}
        <svg
          ref={connectorLayerRef}
          className="global-connector-layer"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Columns */}
        {path.map((node, colIndex) => {
          // Compact Check
          const isCompact = colIndex < path.length - cutoff;

          // Nodes to display in this column
          let nodesToRender: IReactChartXNode[] = [];

          // Legacy mapping logic:
          // Col 0: renders path[0] (or its children if synthetic & colIdx0)
          // Col > 0: renders path[colIndex].children? 
          // Wait, in my previous analysis I saw:
          // const nodes = colIndex === 0 && node.id === 'synthetic-root' ? ...

          // Let's stick to the exact logic:
          // 'node' here is 'path[colIndex]'

          if (colIndex === 0) {
            if (node.id === 'synthetic-root') {
              nodesToRender = node.children || [];
            } else {
              nodesToRender = [node];
            }
          } else {
            // For deeper columns, we are showing the children of the node selected in the PREVIOUS column?
            // No, `path` contains [Root, Child1, Child2].
            // `path[1]` is Child1.
            // Col 1 should show Root's children (containing Child1).
            // BUT existing logic:
            /*
              path.forEach((node, colIndex) => { ...
                 const nodes = ...
                 colIndex === 0 ? [node] : node.children;
            */
            // This implies path[colIndex] is the PARENT of the displayed list?
            // If path=[Root], loop once. col0 renders Root.
            // If path=[Root, Child1]. loop twice.
            // col0 (node=Root): renders Root.
            // col1 (node=Child1): renders Child1.children.
            // FAIL. If I click Child1, I want to see Child1's siblings?
            // Or does 'path' mean 'Active Nodes'?
            // Usually the path contains the active node at each level.
            // So for Col 1, we want to show the siblings of Child1. i.e. Children of Root.
            // Root is path[0].
            // So Col 1 should use path[colIndex-1].children.

            // BUT the legacy code used `node.children` where `node` was `path[colIndex]`.
            // This implies `path` is constructed differently or I am misinterpreting.
            // Let's re-read legacy `useEffect` for path:
            // `setPath([data, data])`
            // `path[0]` = Root. `path[1]` = Root.
            // Col 0: node=Root. Renders [Root].
            // Col 1: node=Root. Renders Root.children.

            // Ah! Duplicated data start.
            // If I click a child `C` in col 1:
            // `setPath` logic: `[...prev.slice(0, colIndex+1), n]`
            // If colIndex=1, we slice(0, 2) -> keep [Root, Root]. Append C.
            // New Path: [Root, Root, C].
            // Col 2: node=C. Renders C.children.

            // So the logic is:
            // Col 0: Special (Synthetic check).
            // Col > 0: Renders `path[colIndex].children`.

            nodesToRender = node.children || [];
          }

          // Active Node ID (to highlight)
          // If we are in Col K, we are showing children of `path[K]`.
          // One of these children is `path[K+1]`.
          const activeChildId = path[colIndex + 1]?.id;

          return (
            <OrgColumn
              key={colIndex} // colIndex is stable enough for this structure
              colIndex={colIndex}
              nodes={nodesToRender}
              activeNodeId={activeChildId}
              isCompact={isCompact}
              styleOptions={computedStyleOptions}
              onCardClick={(n) => handleCardClick(n, colIndex)}
              onScroll={() => setRedrawTrigger(p => p + 1)} // Redraw lines on scroll
            />
          );
        })}
      </div>
    </div>
  );
}
