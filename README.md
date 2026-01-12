# react-charts-x

A modern, interactive organizational chart component for React with D3.js visualization. Perfect for displaying company hierarchies, team structures, and reporting relationships.

## Features

- 🎨 **Modern Design** - Clean, professional interface with smooth interactions
- 🔄 **Interactive Navigation** - Click through organizational levels dynamically
- 📏 **Compact Mode** - Smartly collapses older columns to save screen space while keeping context
<!-- - 🖱️ **Scroll Indicators** - Interactive hover arrows for easy navigation in long lists -->
- 📊 **D3.js Powered** - Robust visualization with automatic layout management
- 🎯 **TypeScript Support** - Full type definitions included
- 🪶 **Lightweight** - Minimal dependencies, optimized bundle size
- 📱 **Responsive** - Adapts to different screen sizes

## Installation

```bash
npm install react-charts-x d3
```

```bash
pnpm add react-charts-x d3
```

```bash
yarn add react-charts-x d3
```

> **Note**: `d3` is a peer dependency and must be installed separately.

## Usage

### Basic Example

```tsx
import { ReactChartX, IReactChartXNode } from 'react-charts-x';

function App() {
  const orgData: IReactChartXNode = {
    id: '1',
    name: 'Jane Doe',
    title: 'CEO',
    image: 'https://example.com/jane.jpg',
    total_children: 2,
    children: [
      {
        id: '2',
        name: 'John Smith',
        title: 'CTO',
        total_children: 3,
        children: [
          {
            id: '3',
            name: 'Alice Johnson',
            title: 'Engineering Manager',
            total_children: 0,
            children: []
          }
          // ... more employees
        ]
      },
      // ... more direct reports
    ]
  };

  return <ReactChartX data={orgData} />;
}
```

### With Synthetic Root (Multiple Top-Level Employees)

If you have multiple employees without a common parent (e.g., multiple CEOs or independent teams), use a synthetic root:

```tsx
import { ReactChartX, IReactChartXNode } from 'react-charts-x';

function App() {
  const employees: IReactChartXNode[] = [
    // Array of top-level employees from your API
  ];

  const ceo = employees.find(e => e.total_children > 0);
  const noReporters = employees.filter(e => e.total_children === 0);

  const syntheticRoot: IReactChartXNode = {
    id: 'synthetic-root',
    name: '',
    title: '',
    total_children: (ceo ? 1 : 0) + noReporters.length,
    children: [...(ceo ? [ceo] : []), ...noReporters]
  };

  return <ReactChartX data={syntheticRoot} />;
}
```

## API Reference

### `ReactChartX` Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `IReactChartXNode` | Yes | Root node of the organizational hierarchy |

### `IReactChartXNode` Interface

```tsx
interface IReactChartXNode {
  id: string;             // Unique identifier (formerly empId)
  name: string;           // Name of the entity
  title?: string;         // Title/Role (formerly designation)
  image?: string;         // URL to image (formerly photo)
  total_children?: number;// Number of direct reports
  children?: IReactChartXNode[]; // Array of children nodes
  // ... any other custom properties
}
```

### `styleOptions` Prop

You can customize the appearance of the chart by passing a `styleOptions` object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `activeColor` | `string` | `#00cb6c` | Color for the active path and connector lines |
| `connectorColor` | `string` | `#CCCCCC` | Color for inactive connector lines |
| `textColor` | `string` | `#000000` | Main text color |
| `backgroundColor` | `string` | `activeColor` + opacity | Background color for active cards |
| `cardColor` | `string` | `#ffffff` | Background color for inactive cards |
| `cardTextColor` | `string` | `#666666` | Color for employee name text |
| `cardTitleColor` | `string` | `#666666` | Color for designation title text |

## Styling

The component now uses **pure CSS** (inline styles). It works out-of-the-box in any project.

### Customizing Colors Example

```tsx
<ReactChartX 
  data={data}
  styleOptions={{
    activeColor: '#3b82f6', // Blue
    connectorColor: '#e5e7eb',
    textColor: '#1f2937',
    cardColor: '#f3f4f6',
    cardTextColor: '#111827',
    cardTitleColor: '#6b7280'
  }}
/>
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Dependencies

- **react** ^16.8.0 || ^17.0.0 || ^18.0.0
- **react-dom** ^16.8.0 || ^17.0.0 || ^18.0.0
- **d3** ^7.0.0

## License

MIT © Sonjit Saha

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/sonjit1997/ReactChartsX/issues).
