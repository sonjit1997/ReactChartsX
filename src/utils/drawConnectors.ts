import * as d3 from 'd3';
import { IOrgChartNode } from '../types';

interface IDrawConnectorsParams {
    container: HTMLElement;
    connectorLayer: d3.Selection<SVGGElement, unknown, null, undefined> | d3.Selection<SVGSVGElement, unknown, null, undefined>;
    path: IOrgChartNode[];
    colIndex: number;
    activeColor: string;
    connectorColor: string;
}

export function drawConnectors({
    container,
    connectorLayer,
    path,
    colIndex,
    activeColor,
    connectorColor,
}: IDrawConnectorsParams) {
    if (!container) return;

    // Container Rect (the viewport effectively)
    const containerRect = container.getBoundingClientRect();
    if (!containerRect) return;

    // Group for this column's connectors in the global layer
    // We use a specific ID to group connectors for this column
    const groupId = `connector-grp-${colIndex}`;
    let grp = connectorLayer.select<SVGGElement>(`#${groupId}`);

    if (grp.empty()) {
        // Determine type for append, but usually we just append 'g' to the svg
        grp = (connectorLayer as any).append('g').attr('id', groupId);
    }
    grp.selectAll('*').remove();

    // Parent Node
    const parentNodeData = path[colIndex];
    if (!parentNodeData) return;

    // Find Parent Card Layout
    // We expect the react components to render classes: .org-col.col-{i} and .org-card
    const prevColDiv = d3.select(container).select(`.org-col.col-${colIndex - 1}`);
    if (prevColDiv.empty()) return;

    // We need to find the specific card element for the parent
    // We assume the card DOM element has the data-id attribute or we filter by checking some property?
    // In the React refactor, we should attach `id` to the DOM or use data attributes.
    // The D3 version used .datum(), but React won't attach __data__.
    // So we will look for `[data-node-id="${parentNodeData.id}"]`
    const parentCardSel = prevColDiv.select(`.org-card[data-node-id="${parentNodeData.id}"]`);

    if (parentCardSel.empty()) return;
    const parentCardEl = parentCardSel.node() as HTMLElement;

    // Find Child Cards
    // They are in the current column `colIndex`
    const currentColDiv = d3.select(container).select(`.org-col.col-${colIndex}`);
    if (currentColDiv.empty()) return;

    const childCardsSel = currentColDiv.selectAll('.org-card');
    if (childCardsSel.empty()) return;
    const childCardEls = childCardsSel.nodes() as HTMLElement[];

    // Coordinates relative to Container
    const parentRect = parentCardEl.getBoundingClientRect();
    const parentRightX = Math.round(parentRect.right - containerRect.left);
    const startX = parentRightX; // Start directly from card edge
    const parentY = Math.round(parentRect.top - containerRect.top + parentRect.height / 2);

    // Connection Line X-coordinate (vertical bus)
    if (childCardEls.length === 0) return;

    const firstChildRect = childCardEls[0].getBoundingClientRect();
    const childLeftX = Math.round(firstChildRect.left - containerRect.left);
    const lineX = childLeftX - 11; // Vertical bus X position

    // Calculate Y positions for all children
    // Need to map back to data. relying on data-node-id again.
    const childPoints = childCardEls.map(c => {
        const r = c.getBoundingClientRect();
        const nodeId = c.getAttribute('data-node-id');
        // find node in parent's children? or just use the id if we have it
        return {
            y: Math.round(r.top - containerRect.top + r.height / 2),
            id: nodeId,
            element: c
        };
    });

    const minChildY = Math.min(...childPoints.map(p => p.y));
    const maxChildY = Math.max(...childPoints.map(p => p.y));

    const railTop = Math.min(minChildY, parentY);
    const railBottom = Math.max(maxChildY, parentY);
    const radius = 0; // Sharp corners

    // --- 1. Draw Passive (Grey) Path ---
    const pathGen = d3.path();

    // Parent Connection
    pathGen.moveTo(startX, parentY);

    // Connect to vertical rail
    if (Math.abs(lineX - startX) > radius) {
        pathGen.lineTo(lineX - (parentY === railTop || parentY === railBottom ? radius : 0), parentY);
    } else {
        pathGen.lineTo(lineX, parentY);
    }

    // Radius for parent connection to rail
    if (parentY === railTop && railBottom > railTop) {
        pathGen.arcTo(lineX, parentY, lineX, parentY + radius, radius);
    } else if (parentY === railBottom && railTop < railBottom) {
        pathGen.arcTo(lineX, parentY, lineX, parentY - radius, radius);
    }

    // Vertical Rail
    pathGen.moveTo(lineX, railTop + (parentY === railTop ? radius : 0));
    pathGen.lineTo(lineX, railBottom - (parentY === railBottom ? radius : 0));

    // Horizontal forks to each child
    childPoints.forEach(pt => {
        const isTop = (pt.y === railTop);
        const isBottom = (pt.y === railBottom);

        if (isTop && railBottom > railTop) {
            pathGen.moveTo(lineX, pt.y + radius);
            pathGen.arcTo(lineX, pt.y, lineX + radius, pt.y, radius);
            pathGen.lineTo(childLeftX, pt.y);
        } else if (isBottom && railTop < railBottom) {
            pathGen.moveTo(lineX, pt.y - radius);
            pathGen.arcTo(lineX, pt.y, lineX + radius, pt.y, radius);
            pathGen.lineTo(childLeftX, pt.y);
        } else {
            pathGen.moveTo(lineX, pt.y);
            pathGen.lineTo(childLeftX, pt.y);
        }
    });

    grp.append('path')
        .attr('d', pathGen.toString())
        .attr('stroke', connectorColor)
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    // --- 2. Draw Active (Colored) Path ---
    // Locate the active child
    // The active child is the one at path[colIndex + 1]
    const activeChildId = path[colIndex + 1]?.id;
    const activeChildPt = childPoints.find(pt => pt.id === activeChildId);

    if (activeChildPt) {
        const activePath = d3.path();
        activePath.moveTo(startX, parentY);

        const isGoingDown = activeChildPt.y > parentY;
        // const isGoingUp = activeChildPt.y < parentY;

        if (Math.abs(parentY - activeChildPt.y) < 1) {
            // Straight horizontal
            activePath.lineTo(childLeftX, parentY);
        } else {
            // Vertical offset
            activePath.lineTo(lineX - radius, parentY);

            if (isGoingDown) {
                activePath.arcTo(lineX, parentY, lineX, parentY + radius, radius);
                activePath.lineTo(lineX, activeChildPt.y - radius);
                activePath.arcTo(lineX, activeChildPt.y, lineX + radius, activeChildPt.y, radius);
            } else { // Going Up
                activePath.arcTo(lineX, parentY, lineX, parentY - radius, radius);
                activePath.lineTo(lineX, activeChildPt.y + radius);
                activePath.arcTo(lineX, activeChildPt.y, lineX + radius, activeChildPt.y, radius);
            }
            activePath.lineTo(childLeftX, activeChildPt.y);
        }

        grp.append('path')
            .attr('d', activePath.toString())
            .attr('stroke', activeColor)
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .style('transition', 'all 0.3s ease');
    }
}
