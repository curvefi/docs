export interface DeploymentEntry {
  chain: string;
  category: string;
  subcategory?: string;
  name: string;
  address: string;
  path: string;
  originChain?: string;
}
