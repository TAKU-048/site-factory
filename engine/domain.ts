export type Mode = 'draft' | 'publish';
export type SectionType = 'hero'|'intro'|'services'|'strengths'|'projects'|'process'|'faq'|'company'|'cta'|'form'|'prose'|'custom';
export interface Item { title: string; body: string }
export interface SectionSpec { id:string; type:SectionType; variant?:string; heading?:string; body?:string; items?:Item[]; imageId?:string }
export interface PageSpec { slug:string; title:string; description:string; sections:SectionSpec[] }
export interface Asset { id:string; path:string; alt:string; permitted:boolean; source?:string }
export interface ClientBrief {
  company:{name:string;tagline:string;description:string;email:string;phone?:string;address:string;philosophy?:string;website?:string;logoId?:string};
  industry:string; demo:boolean; factsConfirmed:boolean; assets:Asset[];
  form:{connected:boolean;fields:string[];mode?:'disconnected'|'local'|'production';sitekey?:string}; pages:PageSpec[];
}
export interface DesignSpec { id:string;name:string;thesis:string;hero:string;order?:string[];tokens:Record<string,string> }
export interface ApprovalRecord { revision:string;date:string }
export interface ValidatedSite extends ClientBrief {}
export interface ValidationIssue { path:string;code:string;message:string }
export interface ClientState { id:string;revision:string;presetId:string;createdAt:string;updatedAt:string;status:'draft'|'review';approvals:Partial<Record<'structure'|'design'|'content'|'publish',ApprovalRecord>>;engineVersion:string }
export interface GenerationResult { clientId:string;directory:string;revision:string }
export interface ChangeReport { applied:boolean;revision:string;changed:string[];requiredApprovals:string[];files?:string[];before?:unknown;after?:unknown }
export interface ExportReport { directory:string;files:number;revision:string }
export interface ProposalBrief { facts:ClientBrief;instructions:string;profile:{id:string;name:string;questions:string[];cautions:string[]};components:string[];presets:DesignSpec[] }
export interface ProposalSet { directions:{id:string;reason:string;presetId:string;pages:PageSpec[]}[] }
export interface ClientReport { id:string;path:string;status:string;revision:string;presetId:string;url:string|null;domainExpiry:string|null;lastPublished:string|null;engineVersion:string|null;updatedAt:string|null;lastChecked:string|null;issues:string[] }
