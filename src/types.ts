export interface IOrgChartNode {
  id: string;
  name: string;
  title?: string;
  image?: string;
  total_children?: number;
  children?: IOrgChartNode[];
  // Allow other custom properties
  [key: string]: any;
}

export interface IModernOrgChartProps {
  data: IOrgChartNode;
  styleOptions?: {
    activeColor?: string;
    connectorColor?: string;
    textColor?: string;
    backgroundColor?: string;
    cardColor?: string;
    cardTextColor?: string;
    cardTitleColor?: string;
  };
}
