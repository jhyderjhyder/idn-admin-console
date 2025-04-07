/**
 * ng g c %compontName%
 * Then simply add your compontName to the main menu
 * or remove any component you dont want to show
 */

export class MenuLink {
  route: String;
  name: String;
  skip: boolean;

  constructor(route: string, name: string, skip: boolean) {
    this.route = route;
    this.name = name;
    this.skip = skip;
    if (skip == null) {
      this.skip = false;
    }
  }
}

export class MainMenu {
  links: Array<MenuLink>;
  title: String;
  id: String;
  constructor(title: string, links: Array<MenuLink>) {
    this.title = title;
    this.links = links;
    this.id = title + 'id';
  }
}

export const identityMenu = [
  new MenuLink('/identity-info', 'Search Details', null),
  new MenuLink('/identity-compare', 'Identity Compare', null),
  new MenuLink('/identity-profile-management', 'Identity Profile', null),
  new MenuLink('/identity-attribute-index', 'Attribute Index', null),
  new MenuLink('/identity-lcs-management', 'LifeCycle State', null),
];
export const accessMenu = [
  new MenuLink('/accessprofile-management', 'AccessProfile Report', null),
  new MenuLink('/accessprofile-owner-update', 'AccessProfile Ownership', null),
  new MenuLink(null, null, true),

  new MenuLink('/role-management', 'Role Report', null),
  new MenuLink('/role-owner-update', 'Role Ownership', null),
  new MenuLink('/role-duplicate', 'Role Duplicates', null),
  new MenuLink('/role-contains-ent', 'Role Contains Entitlement', null),
  new MenuLink(null, null, true),

  new MenuLink('/entitlement-management', 'Entitlements Ownership', null),
];
export const accountsMenu = [
  new MenuLink('/account-search', 'Search Details', null),
  new MenuLink('/multiple-accounts-report', 'Multiple Report', null),
  new MenuLink(null, null, true),

  new MenuLink('/account-report', 'Totals Report', null),
];

export const sourceMenu = [
  new MenuLink('/source-info', 'Debug', null),
  new MenuLink('/source-aggregation-management', 'Schedules', null),
  new MenuLink('/source-owner-update', 'Owners', null),
  new MenuLink('/source-aggregation-run', 'Aggregations', null),
  new MenuLink('/source-create-profile', 'Manage Create Profile', null),
  new MenuLink('/source-reset', 'Reset', null),
  new MenuLink(null, null, true),

  new MenuLink('/system-monitor-source', 'Monitor Sources', null),
];
export const codeMenu = [
  new MenuLink('/identity-transform-management', 'Transforms', null),
  new MenuLink('/rule-cloud-management', 'Cloud Rules', null),
  new MenuLink('/rule-connector-management', 'Connector Rules', null),
  new MenuLink(null, null, true),
  new MenuLink('/raw-object', 'Object Viewer', null),
  new MenuLink('/workflows', 'Workflows', null),
];
export const accessRequestMenu = [
  new MenuLink('/access-request-status', 'Approval Status', null),
  new MenuLink('/access-request-approval-forward', 'Approval Forward', null),
];
export const workitemMenu = [
  new MenuLink('/work-items-status', 'Manual WorkItems', null),
  new MenuLink('/work-items-forward', 'Pending Forward', null),
];

export const systemMenu = [
  new MenuLink('/system-monitor', 'Monitor VA', null),
  new MenuLink('/system-monitor-source', 'Monitor Sources', null),
  new MenuLink('/report-failures', 'Provisioning Failures', null),
  new MenuLink('/report-failures-source', 'Provisioning By Source', null),
  new MenuLink('/report-task-status', 'Task History', null),
  new MenuLink(null, null, true),

  new MenuLink('/identity-admin-management', 'Manage Admins', null),
  new MenuLink('/misc-manage-pat', 'Manage PAT', null),
  new MenuLink('/misc-org-time-update', 'Set Org Time', null),
  new MenuLink('/misc-org-stats', 'Org Statistics', null),
  new MenuLink('/reassignments', 'Out of Office', null),
  new MenuLink('/fast-tag', 'Fast Tag', null),
];
export const aboutMenu = [
  new MenuLink('/release-history', 'Release History', null),
  new MenuLink('/credits', 'Credits', null),
];

export const Menu = [
  new MainMenu('People', identityMenu),
  new MainMenu('Access', accessMenu),
  new MainMenu('Account', accountsMenu),
  new MainMenu('Sources', sourceMenu),
  new MainMenu('Code', codeMenu),
  new MainMenu('AccessRequests', accessRequestMenu),
  new MainMenu('WorkItems', workitemMenu),
  new MainMenu('System', systemMenu),
  new MainMenu('About', aboutMenu),
];
