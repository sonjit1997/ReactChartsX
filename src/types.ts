export interface IReactChartXNode {
  id: string;
  name: string;
  title?: string;
  image?: string;
  total_children?: number;
  children?: IReactChartXNode[];
  // Allow other custom properties
  [key: string]: any;
}

export interface IReactChartXProps {
  data: IReactChartXNode;
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
