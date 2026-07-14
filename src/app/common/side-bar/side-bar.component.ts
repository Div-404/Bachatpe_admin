import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { SharedService } from '../../servies/shared/shared.service';
import { configComm } from '../serviceDrop';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';

type ToggleKey =
  | 'isBulkBalanceOpen'
  | 'isBalanceOpen'
  | 'isDepositOpen'
  | 'isMoneyTransferOpen'
  | 'isRechargeOpen'
  | 'isBookingOpen'
  | 'isUtilityOpen'
  | 'isMiscOpen'
  | 'isTransReportsOpen'
  | 'isDepositReportsOpen'
  | 'isDepositReportsOpen2'
  | 'isPerformerOpen';

type MenuNodeType = 'link' | 'group' | 'toggle-group' | 'separator';

interface SidebarMenuItem {
  id: string;
  label?: string;
  icon?: string;
  type: MenuNodeType;

  // Visibility & access
  visible?: () => boolean;

  // Routing
  route?: string; // normal navigate()
  customNavigate?: () => void; // special navigatePref, changeService etc.

  // Active checks
  activeExact?: string[];
  activeStartsWith?: string[];
  activeFn?: () => boolean;

  // Children
  children?: SidebarMenuItem[];
  childrenFactory?: () => SidebarMenuItem[];

  // Toggle support for nested sections (Money Transfer, Recharge etc.)
  toggleKey?: ToggleKey;

  // UI flags
  showArrow?: boolean;
  showCatArrowIcon?: boolean; // img down-right-arrow icon in leaf rows
  cssClass?: string;
  isMainMenu?: boolean;

  // main group (Configuration/Users/Finance/Transaction/Executive/Reports)
  mainMenuKey?: string;
}

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent implements OnInit, AfterViewInit {
  navactive: any = '';

  execDetails: any;
  loginId: any;
  profileId: any = '';

  execPermissions: any = [];
  Money: any[] = [];
  Recharge: any[] = [];
  Booking: any[] = [];
  Utility: any[] = [];
  Miscellaneous: any[] = [];

  serviceDrop: any = configComm;
  serviceType: any = '';
  sourceList: any = [];
  selectedTab: string = '';

  addClass: boolean = false;
  activeTab: any;
  PrefNumber: any;

  // -------- Main menu open state (replaces DOM querySelector class juggling) --------
  openMainMenuKey: string | null = null;

  // -------- Toggle states (nested groups) --------
  isBulkBalanceOpen: boolean = false;
  isBalanceOpen: boolean = false;
  isDepositOpen: boolean = false;
  isMoneyTransferOpen: boolean = false;
  isRechargeOpen: boolean = false;
  isBookingOpen: boolean = false;
  isUtilityOpen: boolean = false;
  isMiscOpen: boolean = false;
  isTransReportsOpen: boolean = false;
  isDepositReportsOpen: boolean = false;
  isDepositReportsOpen2: boolean = false;
  isPerformerOpen: boolean = JSON.parse(
    sessionStorage.getItem('isPerformerOpen') || 'false',
  );

  // -------- Menu Config --------
  menuItems: SidebarMenuItem[] = [];

  private readonly toggleKeys: ToggleKey[] = [
    'isBulkBalanceOpen',
    'isBalanceOpen',
    'isDepositOpen',
    'isMoneyTransferOpen',
    'isRechargeOpen',
    'isBookingOpen',
    'isUtilityOpen',
    'isMiscOpen',
    'isTransReportsOpen',
    'isDepositReportsOpen',
    'isDepositReportsOpen2',
    'isPerformerOpen',
  ];

  constructor(
    private router: Router,
    private share: SharedService,
    private shared: SharedService,
    private api: ApiService,
    private toster: ToastrService,
  ) {
    // Active tab from shared service
    this.share.activeClass$.subscribe((activeClass: string) => {
      this.activeTab = activeClass;
      // console.log('activeTab from share', this.activeTab);
      this.syncSidebarOpenStateFromActiveTab();
    });

    // Permissions from shared service / session
    this.shared.selectedPermission.subscribe({
      next: (res: any) => {
        this.execPermissions = res;
        if (
          !this.execPermissions ||
          Object.keys(this.execPermissions).length === 0
        ) {
          this.execPermissions = JSON.parse(
            sessionStorage.getItem('execDetails') || '[]',
          );
        }
        // console.log('permissions from side bar', this.execPermissions);
        this.buildSidebarMenus();
      },
    });

    // Initialize active class from shared service cache
    const currentActive = this.share.getSidebrActiveClass();
    if (currentActive) {
      this.activeTab = currentActive;
    }
  }

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.PrefNumber = localStorage.getItem('PerfNumber');

    this.share.selectedTab$.subscribe((tab) => {
      this.selectedTab = tab;
    });

    // load nested toggles from storage
    this.loadAllToggleStates();

    // derive active from current URL on refresh
    const urlTab = this.normalizeRoute(this.router.url);
    if (urlTab) {
      this.activeTab = urlTab;
      this.share.setSidebrActiveClass(urlTab);
    }

    // Build initial menu (dynamic items will re-render after getSource())
    this.buildSidebarMenus();

    this.getSource();
  }

  ngAfterViewInit(): void {
    // Initial restore after refresh
    setTimeout(() => {
      this.syncSidebarOpenStateFromActiveTab();
    });

    // Keep synced on route change
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.activeTab) {
          this.activeTab = this.normalizeRoute(this.router.url);
        }
        this.syncSidebarOpenStateFromActiveTab();
      });
  }

  // =========================================================
  // Core Helpers
  // =========================================================

  private normalizeRoute(url: string): string {
    return (url || '').replace(/^\//, '');
  }

  private loadAllToggleStates(): void {
    this.toggleKeys.forEach((k) => this.loadToggleState(k));
  }

  private loadToggleState(key: ToggleKey): void {
    (this as any)[key] = JSON.parse(sessionStorage.getItem(key) || 'false');
  }

  private setToggleState(key: ToggleKey, value: boolean): void {
    (this as any)[key] = value;
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  toggleByKey(key: ToggleKey): void {
    const current = !!(this as any)[key];
    this.setToggleState(key, !current);
  }

  isToggleOpen(key?: ToggleKey): boolean {
    if (!key) return false;
    return !!(this as any)[key];
  }

  trackByMenuId = (_: number, item: SidebarMenuItem) => item.id;

  getChildren(item: SidebarMenuItem): SidebarMenuItem[] {
    if (item.childrenFactory) return item.childrenFactory();
    return item.children || [];
  }

  isVisible(item: SidebarMenuItem): boolean {
    return item.visible ? item.visible() : true;
  }

  isMainMenuOpen(item: SidebarMenuItem): boolean {
    return !!item.mainMenuKey && this.openMainMenuKey === item.mainMenuKey;
  }

  toggleMainMenu(item: SidebarMenuItem): void {
    if (!item.mainMenuKey) return;
    this.openMainMenuKey =
      this.openMainMenuKey === item.mainMenuKey ? null : item.mainMenuKey;
  }

  onItemClick(item: SidebarMenuItem, event?: MouseEvent): void {
    if (event) event.stopPropagation();

    // Main group click (Configuration/Users/Finance/...)
    if (item.type === 'group' && item.mainMenuKey) {
      this.toggleMainMenu(item);
      return;
    }

    // Nested toggle group click (Money Transfer, Recharge, etc.)
    if (item.type === 'toggle-group' && item.toggleKey) {
      this.toggleByKey(item.toggleKey);
      return;
    }

    // Custom navigate
    if (item.customNavigate) {
      item.customNavigate();
      return;
    }

    // Normal route navigate
    if (item.route) {
      this.navigate(item.route);
    }
  }

  isItemActive(item: SidebarMenuItem): boolean {
    const tab = this.activeTab || this.normalizeRoute(this.router.url);

    if (item.activeFn && item.activeFn()) return true;
    if (item.activeExact?.includes(tab)) return true;
    if (item.activeStartsWith?.some((p) => tab?.startsWith(p))) return true;

    // Default: if route is present, exact match or prefix match
    if (item.route) {
      if (tab === item.route) return true;
      if (tab?.startsWith(item.route + '/')) return true;
      if (tab?.startsWith(item.route + '?')) return true;
    }

    return false;
  }

  // =========================================================
  // Sidebar refresh restore / active sync
  // =========================================================

  private syncSidebarOpenStateFromActiveTab(): void {
    const tab = this.normalizeRoute(this.activeTab || this.router.url || '');

    // Open correct main menu based on route
    if (this.isConfigurationTab(tab)) {
      this.openMainMenuKey = 'configuration';
    } else if (this.isUsersTab(tab)) {
      this.openMainMenuKey = 'users';
    } else if (this.isFinanceTab(tab)) {
      this.openMainMenuKey = 'finance';
    } else if (this.isTransactionTab(tab)) {
      this.openMainMenuKey = 'transaction';
    } else if (this.isExecutiveTab(tab)) {
      this.openMainMenuKey = 'executive';
    } else if (this.isReportsTab(tab)) {
      this.openMainMenuKey = 'reports';
    } else {
      this.openMainMenuKey = null;
    }

    // Auto-open nested toggle groups relevant to active route
    this.syncNestedTogglesFromActiveTab(tab);
  }

  private syncNestedTogglesFromActiveTab(tab: string): void {
    // Finance -> Transaction subtree
    if (
      tab.startsWith('balance-container') ||
      tab.startsWith('credit-container') ||
      tab.startsWith('aeps-container')
    ) {
      this.setToggleState('isBalanceOpen', true);
    }

    if (tab.startsWith('bulk-upload') || tab.startsWith('bulk-history')) {
      this.setToggleState('isBulkBalanceOpen', true);
    }

    // Transaction
    if (
      tab.startsWith('money-main') ||
      tab.startsWith('money-transfer-overall')
    ) {
      this.setToggleState('isMoneyTransferOpen', true);
    }

    if (tab.startsWith('recharge-overall')) {
      this.setToggleState('isRechargeOpen', true);
    }

    if (tab.startsWith('booking-overall')) {
      this.setToggleState('isBookingOpen', true);
    }

    if (tab.startsWith('utility-overall')) {
      this.setToggleState('isUtilityOpen', true);
    }

    if (tab.startsWith('misc-overall')) {
      this.setToggleState('isMiscOpen', true);
    }

    // Reports
    if (
      tab.startsWith('user-main') ||
      tab.startsWith('user-reports') ||
      tab.startsWith('api-reports') ||
      tab.startsWith('service-reports')
    ) {
      this.setToggleState('isTransReportsOpen', true);
    }

    if (
      tab.startsWith('user-deposit-reports') ||
      tab.startsWith('executive-deposit-reports')
    ) {
      this.setToggleState('isDepositReportsOpen', true);
    }

    if (
      tab.startsWith('reportcredit-main') ||
      tab.startsWith('report-overall')
    ) {
      this.setToggleState('isDepositReportsOpen2', true);
    }

    if (tab.startsWith('pref-creditmain')) {
      this.setToggleState('isPerformerOpen', true);
    }
  }

  // Route classification helpers (for refresh restore)
  private isConfigurationTab(tab: string): boolean {
    return [
      'services',
      'api-manage',
      'all-packages',
      'config-sittings',
      'package-lm-wk',
      'signup-kyc-subtype',
      'signup-kyc',
    ].some((x) => tab.startsWith(x));
  }

  private isUsersTab(tab: string): boolean {
    return ['user-list', 'master-dis', 'distributor', 'retailer'].some((x) =>
      tab.startsWith(x),
    );
  }

  private isFinanceTab(tab: string): boolean {
    if (!tab) return false
    if (tab.startsWith('balance-container') ||
      tab.startsWith('credit-container') ||
      tab.startsWith('aeps-container')) return true
    return [
      'bulk-upload',
      'bulk-history',
      'packages',
      'manage-bank',
      'deposit-request',
      'payment-by-manual',
    ].some((x) => tab.startsWith(x));
  }

  private isTransactionTab(tab: string): boolean {
    return [
      'money-main',
      'money-transfer',
      'money-transfer-overall',
      'recharge-overall',
      'booking-overall',
      'utility-overall',
      'misc-overall',
    ].some((x) => tab.startsWith(x));
  }

  private isExecutiveTab(tab: string): boolean {
    return ['tab', 'sub-tab', 'executive'].some((x) => tab.startsWith(x));
  }

  private isReportsTab(tab: string): boolean {
    return [
      'user-main',
      'user-reports',
      'api-reports',
      'service-reports',
      'user-deposit-reports',
      'executive-deposit-reports',
      'tax',
      'reports-commission',
      'reportcredit-main',
      'report-overall',
      'reportbalance-main',
      'belance-overall',
      'penality-main',
      'reports-penality',
      'business-main',
      'pref-creditmain',
    ].some((x) => tab.startsWith(x));
  }

  // =========================================================
  // Permissions
  // =========================================================

  hasAccess(masterName: string, subMasterName: string): boolean {
    // If permissions not loaded, allow rendering by default (same as your current behavior)
    if (!this.execPermissions || this.execPermissions.length === 0) {
      return true;
    }

    const master = this.execPermissions.find(
      (m: any) => m.Master === masterName,
    );
    if (!master) return true;

    const subMaster = master.SubMasters?.find(
      (s: any) => s.SubMaster === subMasterName,
    );
    return subMaster?.Access === 1 || subMaster?.Access === undefined;
  }

  // =========================================================
  // Navigation (kept compatible with your current behavior)
  // =========================================================

  navigate(val: any) {
    localStorage.removeItem('PerfNumber');

    if (val == 'bulk-upload' || val == 'bulk-history') {
      this.activeTab = val;
      this.router.navigateByUrl('/' + val);
      this.share.setSidebrActiveClass(val);
    } else if (
      val == 'balance-container' ||
      val == 'credit-container' ||
      val == 'aeps-container' ||
      val == 'aeps-ledger' ||
      val == 'aeps-transaction' ||
      val == 'credit-ledger' ||
      val == 'credit-transaction' ||
      val == 'wallet-and-ledger' ||
      val == 'deposit-transaction'
    ) {
      this.activeTab = val;
      this.router.navigateByUrl('/' + val);
      this.share.setSidebrActiveClass(val);
    } else if (val == 'deposit-request' || val == 'payment-by-manual') {
      this.activeTab = val;
      this.router.navigateByUrl('/' + val);
      this.share.setSidebrActiveClass(val);
    } else if (val == 'booking-overall') {
      this.activeTab = val;
      this.router.navigateByUrl('/' + val);
      this.share.setSidebrActiveClass(val);
    } else {
      this.shared.setReportTab(this.profileId);
      this.activeTab = val;
      this.router.navigateByUrl('/' + val);
      this.share.setSidebrActiveClass(val);
    }

    // keep sidebar open correctly after route action
    this.syncSidebarOpenStateFromActiveTab();
  }

  navigatePref(val: string, id: number) {
    // Reset report-related states
    this.isTransReportsOpen = false;
    this.isDepositReportsOpen = false;
    this.isDepositReportsOpen2 = false;

    this.activeTab = `pref-creditmain/${val}?id=${id}`;

    this.router.navigateByUrl(this.activeTab);
    this.share.setSidebrActiveClass(this.activeTab);

    this.setToggleState('isPerformerOpen', true);

    // ensure main Reports node is open
    this.openMainMenuKey = 'reports';
  }

  changeService(val: any) {
    this.share.setSideBarName(val.Source);
    // console.log('changeService', val.SourceId, val);
  }

  // =========================================================
  // Dynamic source API
  // =========================================================

  getSource() {
    this.Money = [];
    this.Recharge = [];
    this.Booking = [];
    this.Utility = [];
    this.Miscellaneous = [];

    this.api.getSource().subscribe({
      next: (res: any) => {
        this.sourceList = res;

        this.sourceList.forEach((ele: any) => {
          if (ele.Type == 1) this.Money = ele.lstSource;
          else if (ele.Type == 2) this.Recharge = ele.lstSource;
          else if (ele.Type == 3) this.Booking = ele.lstSource;
          else if (ele.Type == 4) this.Utility = ele.lstSource;
          else if (ele.Type == 5) this.Miscellaneous = ele.lstSource;
        });

        // rebuild menu so dynamic source children appear
        this.buildSidebarMenus();
      },
      error: (_err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  // =========================================================
  // Menu Config Builder (MAIN REFACTOR)
  // =========================================================

  buildSidebarMenus(): void {
    this.menuItems = [
      // Dashboard
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'fa-regular fa-chart-bar',
        type: 'link',
        route: 'dashboard',
        activeExact: ['dashboard', 'Dashboard'],
      },
      {
        id: 'globalSearch',
        label: 'Outlet Search',
        icon: 'fa-solid fa-search',
        type: 'link',
        route: 'globalSearch',
        activeExact: ['globalSearch', 'Outlet Search'],
      },

      // Configuration
      {
        id: 'configuration',
        label: 'Configuration',
        icon: 'fa-solid fa-code-branch',
        type: 'group',
        isMainMenu: true,
        mainMenuKey: 'configuration',
        visible: () =>
          this.hasAccess('Configuration', 'Services') ||
          this.hasAccess('Configuration', 'API') ||
          this.hasAccess('Configuration', 'Packages') ||
          this.hasAccess('Configuration', 'Settings') ||
          this.hasAccess('Configuration', 'package-lm-wk') ||
          this.hasAccess('Configuration', 'signup-kyc-subtype') ||
          this.hasAccess('Configuration', 'signup-kyc') ||
          this.hasAccess('Configuration', 'login-settings'),
        children: [
          {
            id: 'services',
            label: 'Services',
            type: 'link',
            route: 'services',
            visible: () => this.hasAccess('Configuration', 'Services'),
          },
          {
            id: 'api-manage',
            label: 'API',
            type: 'link',
            route: 'api-manage',
            visible: () => this.hasAccess('Configuration', 'API'),
          },
          {
            id: 'all-packages',
            label: 'Packages',
            type: 'link',
            route: 'all-packages',
            visible: () => this.hasAccess('Configuration', 'Packages'),
          },
          {
            id: 'config-sittings',
            label: 'Settings',
            type: 'link',
            route: 'config-sittings',
            visible: () => this.hasAccess('Configuration', 'Settings'),
          },
          {
            id: 'package-lm-wk',
            label: 'Package – LM|WK',
            type: 'link',
            route: 'package-lm-wk',
            visible: () => this.hasAccess('Configuration', 'package-lm-wk'),
          },
          {
            id: 'signup-kyc-subtype',
            label: 'Signup & KYC Subtype',
            type: 'link',
            route: 'signup-kyc-subtype',
            visible: () =>
              this.hasAccess('Configuration', 'signup-kyc-subtype'),
          },
          {
            id: 'signup-kyc',
            label: 'Signup & KYC',
            type: 'link',
            route: 'signup-kyc',
            visible: () => this.hasAccess('Configuration', 'signup-kyc'),
          },
          {
            id: 'login-settings',
            label: 'Login Settings',
            type: 'link',
            route: 'login-settings',
            visible: () => this.hasAccess('Configuration', 'login-settings'),
          },
        ],
      },

      // Users
      {
        id: 'users',
        label: 'Users',
        icon: 'fa-solid fa-user-group',
        type: 'group',
        isMainMenu: true,
        mainMenuKey: 'users',
        visible: () =>
          this.hasAccess('Users', 'Overall') ||
          this.hasAccess('Users', 'Master Distributor') ||
          this.hasAccess('Users', 'Distributor') ||
          this.hasAccess('Users', 'Retailer'),
        children: [
          {
            id: 'user-list',
            label: 'Overall',
            type: 'link',
            route: 'user-list',
            visible: () => this.hasAccess('Users', 'Overall'),
          },
          {
            id: 'master-dis',
            label: 'Master Distributor',
            type: 'link',
            route: 'master-dis',
            visible: () => this.hasAccess('Users', 'Master Distributor'),
            showCatArrowIcon: true,
          },
          {
            id: 'distributor',
            label: 'Distributor',
            type: 'link',
            route: 'distributor',
            visible: () => this.hasAccess('Users', 'Distributor'),
            showCatArrowIcon: true,
          },
          {
            id: 'retailer',
            label: 'Retailer',
            type: 'link',
            route: 'retailer',
            visible: () => this.hasAccess('Users', 'Retailer'),
            showCatArrowIcon: true,
          },
        ],
      },

      // Finance
      {
        id: 'finance',
        label: 'Finance',
        icon: 'fa-solid fa-hand-holding-dollar',
        type: 'group',
        isMainMenu: true,
        mainMenuKey: 'finance',
        visible: () =>
          this.hasAccess('Finance', 'Transaction') ||
          this.hasAccess('Finance', 'Bulk Balance') ||
          this.hasAccess('Finance', 'Wallet Packages') ||
          this.hasAccess('Finance', 'Manage Bank'),
        children: [
          // Finance -> Transaction (Balance/Credit/AEPS)
          {
            id: 'finance-transaction',
            label: 'Transaction',
            type: 'toggle-group',
            toggleKey: 'isBalanceOpen',
            visible: () => this.hasAccess('Finance', 'Transaction'),
            activeStartsWith: [
              'balance-container',
              'credit-container',
              'aeps-container',
            ],
            children: [
              {
                id: 'balance-container',
                label: 'Balance',
                type: 'link',
                route: 'balance-container',
                visible: () => this.hasAccess('Finance', 'Transaction'),
                showCatArrowIcon: true,
                activeExact: [
                  'balance-container',
                  'balance-container/transaction',
                  'balance-container/wallet-and-ledger',
                  'balance-container/deposit-request',
                  'balance-container/payment-by-manual',
                  'balance-container/withdraw-req',
                ],
              },
              {
                id: 'withdraw-req',
                label: 'Withdraw Req',
                type: 'link',
                route: 'balance-container/withdraw-req',
                visible: () => this.hasAccess('Finance', 'Transaction'),
                showCatArrowIcon: true
              },
              // {
              //   id: 'credit-container',
              //   label: 'Credit',
              //   type: 'link',
              //   route: 'credit-container',
              //   visible: () => this.hasAccess('Finance', 'Transaction'),
              //   showCatArrowIcon: true,
              // },
              // {
              //   id: 'aeps-container',
              //   label: 'AEPS',
              //   type: 'link',
              //   route: 'aeps-container/aeps-ledger',
              //   visible: () => this.hasAccess('Finance', 'Transaction'),
              //   showCatArrowIcon: true,
              //   activeStartsWith: ['aeps-container'],
              // },
            ],
          },

          // Finance -> Bulk Balance
          {
            id: 'bulk-balance',
            label: 'Bulk Balance',
            type: 'toggle-group',
            toggleKey: 'isBulkBalanceOpen',
            visible: () => this.hasAccess('Finance', 'Bulk Balance'),
            activeStartsWith: ['bulk-upload', 'bulk-history'],
            children: [
              {
                id: 'bulk-upload',
                label: 'Bulk Upload',
                type: 'link',
                route: 'bulk-upload',
                visible: () => this.hasAccess('Finance', 'Bulk Balance'),
                showCatArrowIcon: true,
              },
              {
                id: 'bulk-history',
                label: 'Bulk History',
                type: 'link',
                route: 'bulk-history',
                visible: () => this.hasAccess('Finance', 'Bulk Balance'),
                showCatArrowIcon: true,
              },
            ],
          },

          {
            id: 'packages',
            label: 'Wallet Packages',
            type: 'link',
            route: 'packages',
            visible: () => this.hasAccess('Finance', 'Wallet Packages'),
          },
          {
            id: 'manage-bank',
            label: 'Manage Bank',
            type: 'link',
            route: 'manage-bank',
            visible: () => this.hasAccess('Finance', 'Manage Bank'),
          },
        ],
      },

      // Transaction
      {
        id: 'transaction',
        label: 'Transaction',
        icon: 'fa-solid fa-money-bill-trend-up',
        type: 'group',
        isMainMenu: true,
        mainMenuKey: 'transaction',
        visible: () =>
          this.hasAccess('Transaction', 'Money Transfer') ||
          this.hasAccess('Transaction', 'Recharge') ||
          this.hasAccess('Transaction', 'Booking') ||
          this.hasAccess('Transaction', 'Utility Bill') ||
          this.hasAccess('Transaction', 'Miscellaneous'),
        children: [
          // Money Transfer
          {
            id: 'money-transfer-group',
            label: 'Money Transfer',
            type: 'toggle-group',
            toggleKey: 'isMoneyTransferOpen',
            visible: () => this.hasAccess('Transaction', 'Money Transfer'),
            activeStartsWith: ['money-main', 'money-transfer-overall'],
            childrenFactory: () => [
              {
                id: 'money-main',
                label: 'Overall',
                type: 'link',
                route: 'money-main',
                showCatArrowIcon: true,
                activeExact: [
                  'money-main',
                  'money-main/money-summary',
                  'money-summary',
                  'money-main/money-detail',
                ],
              },
              ...this.Money.map((data: any) => ({
                id: `money-transfer-source-${data.SourceId}`,
                label: data.Source,
                type: 'link' as const,
                route: `money-transfer-overall/${data.SourceId}`,
                visible: () => this.hasAccess('Transaction', 'Money Transfer'),
                showCatArrowIcon: true,
                customNavigate: () => {
                  this.changeService(data);
                  this.navigate(`money-transfer-overall/${data.SourceId}`);
                },
              })),
            ],
          },

          // Recharge
          {
            id: 'recharge-group',
            label: 'Recharge',
            type: 'toggle-group',
            toggleKey: 'isRechargeOpen',
            visible: () => this.hasAccess('Transaction', 'Recharge'),
            activeStartsWith: ['recharge-overall'],
            childrenFactory: () => [
              {
                id: 'recharge-overall',
                label: 'Overall',
                type: 'link',
                route: 'recharge-overall',
                showCatArrowIcon: true,
              },
              ...this.Recharge.map((data: any) => ({
                id: `recharge-source-${data.SourceId}`,
                label: data.Source,
                type: 'link' as const,
                route: `recharge-overall/${data.SourceId}`,
                visible: () => this.hasAccess('Transaction', 'Recharge'),
                showCatArrowIcon: true,
                customNavigate: () => {
                  this.changeService(data);
                  this.navigate(`recharge-overall/${data.SourceId}`);
                },
              })),
            ],
          },

          // Booking
          {
            id: 'booking-group',
            label: 'Booking',
            type: 'toggle-group',
            toggleKey: 'isBookingOpen',
            visible: () => this.hasAccess('Transaction', 'Booking'),
            activeStartsWith: ['booking-overall'],
            childrenFactory: () => [
              {
                id: 'booking-overall',
                label: 'Overall',
                type: 'link',
                route: 'booking-overall',
                showCatArrowIcon: true,
              },
              ...this.Booking.map((data: any) => ({
                id: `booking-source-${data.SourceId}`,
                label: data.Source,
                type: 'link' as const,
                route: `booking-overall/${data.SourceId}`,
                visible: () => this.hasAccess('Transaction', 'Booking'),
                showCatArrowIcon: true,
                customNavigate: () => {
                  this.changeService(data);
                  this.navigate(`booking-overall/${data.SourceId}`);
                },
              })),
            ],
          },

          // Utility
          {
            id: 'utility-group',
            label: 'Utility Bill',
            type: 'toggle-group',
            toggleKey: 'isUtilityOpen',
            visible: () => this.hasAccess('Transaction', 'Utility Bill'),
            activeStartsWith: ['utility-overall'],
            childrenFactory: () => [
              {
                id: 'utility-overall',
                label: 'Overall',
                type: 'link',
                route: 'utility-overall',
                showCatArrowIcon: true,
              },
              ...this.Utility.map((data: any) => ({
                id: `utility-source-${data.SourceId}`,
                label: data.Source,
                type: 'link' as const,
                route: `utility-overall/${data.SourceId}`,
                visible: () => this.hasAccess('Transaction', 'Utility Bill'),
                showCatArrowIcon: true,
                customNavigate: () => {
                  this.changeService(data);
                  this.navigate(`utility-overall/${data.SourceId}`);
                },
              })),
            ],
          },

          // Misc
          {
            id: 'misc-group',
            label: 'Miscellaneous',
            type: 'toggle-group',
            toggleKey: 'isMiscOpen',
            visible: () => this.hasAccess('Transaction', 'Miscellaneous'),
            activeStartsWith: ['misc-overall'],
            childrenFactory: () => [
              {
                id: 'misc-overall',
                label: 'Overall',
                type: 'link',
                route: 'misc-overall',
                showCatArrowIcon: true,
              },
              ...this.Miscellaneous.map((data: any) => ({
                id: `misc-source-${data.SourceId}`,
                label: data.Source,
                type: 'link' as const,
                route: `misc-overall/${data.SourceId}`,
                visible: () => this.hasAccess('Transaction', 'Miscellaneous'),
                showCatArrowIcon: true,
                customNavigate: () => {
                  this.changeService(data);
                  this.navigate(`misc-overall/${data.SourceId}`);
                },
              })),
            ],
          },
        ],
      },

      // Executive
      {
        id: 'executive',
        label: 'Executive',
        icon: 'fa-solid fa-user-gear',
        type: 'group',
        isMainMenu: true,
        mainMenuKey: 'executive',
        visible: () =>
          this.hasAccess('Executive', 'Tab') ||
          this.hasAccess('Executive', 'Sub Tab') ||
          this.hasAccess('Executive', 'Executive'),
        children: [
          {
            id: 'tab',
            label: 'Tab',
            type: 'link',
            route: 'tab',
            visible: () => this.hasAccess('Executive', 'Tab'),
          },
          {
            id: 'sub-tab',
            label: 'Sub Tab',
            type: 'link',
            route: 'sub-tab',
            visible: () => this.hasAccess('Executive', 'Sub Tab'),
          },
          {
            id: 'executive-page',
            label: 'Executive',
            type: 'link',
            route: 'executive',
            visible: () => this.hasAccess('Executive', 'Executive'),
          },
        ],
      },

      // Sales (static no route in your current HTML)
      {
        id: 'sales',
        label: 'Sales',
        icon: 'fa-regular fa-chart-bar',
        type: 'link',
        customNavigate: () => {
          /* no-op intentionally, same as current */
        },
      },

      // Reports
      {
        id: 'reports',
        label: 'Reports',
        icon: 'fa-regular fa-file-lines',
        type: 'group',
        isMainMenu: true,
        mainMenuKey: 'reports',
        visible: () =>
          this.hasAccess('Reports', 'Transaction') ||
          this.hasAccess('Reports', 'Deposit') ||
          this.hasAccess('Reports', 'TDS/GST') ||
          this.hasAccess('Reports', 'Commission') ||
          this.hasAccess('Reports', 'Credit') ||
          this.hasAccess('Reports', 'Balance') ||
          this.hasAccess('Reports', 'Penalty') ||
          this.hasAccess('Reports', 'Business') ||
          this.hasAccess('Reports', 'Performer'),
        children: [
          // Reports -> Transaction
          {
            id: 'reports-transaction-group',
            label: 'Transaction',
            type: 'toggle-group',
            toggleKey: 'isTransReportsOpen',
            visible: () => this.hasAccess('Reports', 'Transaction'),
            activeStartsWith: [
              'user-main',
              'user-reports',
              'api-reports',
              'service-reports',
            ],
            children: [
              {
                id: 'user-main',
                label: 'By User',
                type: 'link',
                route: 'user-main',
                visible: () => this.hasAccess('Reports', 'Transaction'),
                showCatArrowIcon: true,
                activeExact: [
                  'user-main',
                  'user-main/user-reports',
                  'user-main/m-distributor',
                  'user-main/user-distributor',
                  'user-main/user-retailer',
                ],
              },
              {
                id: 'api-reports',
                label: 'By API',
                type: 'link',
                route: 'api-reports',
                visible: () => this.hasAccess('Reports', 'Transaction'),
                showCatArrowIcon: true,
              },
              {
                id: 'service-reports',
                label: 'By Services',
                type: 'link',
                route: 'service-reports',
                visible: () => this.hasAccess('Reports', 'Transaction'),
                showCatArrowIcon: true,
              },
            ],
          },

          // Reports -> Deposit
          {
            id: 'reports-deposit-group',
            label: 'Deposit',
            type: 'toggle-group',
            toggleKey: 'isDepositReportsOpen',
            visible: () => this.hasAccess('Reports', 'Deposit'),
            activeStartsWith: [
              'user-deposit-reports',
              'executive-deposit-reports',
            ],
            children: [
              {
                id: 'user-deposit-reports',
                label: 'By User',
                type: 'link',
                route: 'user-deposit-reports',
                visible: () => this.hasAccess('Reports', 'Deposit'),
                showCatArrowIcon: true,
                activeExact: [
                  'user-deposit-reports',
                  'reportbalance-main/balance-user',
                ],
              },
              {
                id: 'executive-deposit-reports',
                label: 'By Executive',
                type: 'link',
                route: 'executive-deposit-reports',
                visible: () => this.hasAccess('Reports', 'Deposit'),
                showCatArrowIcon: true,
              },
            ],
          },

          {
            id: 'tax',
            label: 'TDS/GST',
            type: 'link',
            route: 'tax',
            visible: () => this.hasAccess('Reports', 'TDS/GST'),
          },

          {
            id: 'reports-commission',
            label: 'Commission',
            type: 'link',
            route: 'reports-commission',
            visible: () => this.hasAccess('Reports', 'Commission'),
          },

          // Reports -> Credit
          {
            id: 'reports-credit-group',
            label: 'Credit',
            type: 'toggle-group',
            toggleKey: 'isDepositReportsOpen2',
            visible: () => this.hasAccess('Reports', 'Credit'),
            activeStartsWith: ['reportcredit-main', 'report-overall'],
            children: [
              {
                id: 'report-overall',
                label: 'Overall',
                type: 'link',
                route: 'report-overall',
                visible: () => this.hasAccess('Reports', 'Credit'),
                showCatArrowIcon: true,
              },
              {
                id: 'reportcredit-main',
                label: 'By User',
                type: 'link',
                route: 'reportcredit-main',
                visible: () => this.hasAccess('Reports', 'Credit'),
                showCatArrowIcon: true,
                activeExact: [
                  'reportcredit-main',
                  'reportcredit-main/report-user',
                  'reportcredit-main/credit-list',
                ],
              },
            ],
          },

          {
            id: 'reportbalance-main',
            label: 'Balance',
            type: 'link',
            route: 'reportbalance-main',
            visible: () => this.hasAccess('Reports', 'Balance'),
            activeExact: [
              'reportbalance-main',
              'belance-overall',
              'reportbalance-main/balance-user',
            ],
          },

          {
            id: 'penality-main',
            label: 'Penalty',
            type: 'link',
            route: 'penality-main',
            visible: () => this.hasAccess('Reports', 'Penalty'),
            activeExact: [
              'penality-main',
              'reports-penality',
              'penality-main/user-penality',
            ],
          },

          {
            id: 'business-main',
            label: 'Business',
            type: 'link',
            route: 'business-main',
            visible: () => this.hasAccess('Reports', 'Business'),
            activeExact: [
              'business-main',
              'business-main/business-overall',
              'business-main/business-timestamp',
              'business-main/business-user',
            ],
          },

          // Reports -> Performer
          {
            id: 'performer-group',
            label: 'Performer',
            type: 'toggle-group',
            toggleKey: 'isPerformerOpen',
            visible: () => this.hasAccess('Reports', 'Performer'),
            activeFn: () =>
              (this.activeTab || '').startsWith('pref-creditmain'),
            children: [
              {
                id: 'performer-credit',
                label: 'Credit',
                type: 'link',
                customNavigate: () => this.navigatePref('pref-overall', 1),
                activeExact: ['pref-creditmain/pref-overall?id=1'],
                showCatArrowIcon: true,
              },
              {
                id: 'performer-balance',
                label: 'Balance',
                type: 'link',
                visible: () => this.hasAccess('Reports', 'Performer'),
                customNavigate: () => this.navigatePref('pref-overall', 2),
                activeFn: () =>
                  this.activeTab === 'pref-creditmain/pref-overall?id=2' ||
                  this.selectedTab == 'pref-range' ||
                  this.PrefNumber == 2,
                showCatArrowIcon: true,
              },
              {
                id: 'performer-deposit',
                label: 'Deposit',
                type: 'link',
                visible: () => this.hasAccess('Reports', 'Performer'),
                customNavigate: () => this.navigatePref('pref-overall', 3),
                activeFn: () =>
                  this.activeTab === 'pref-creditmain/pref-overall?id=3' ||
                  this.selectedTab == 'pref-range' ||
                  this.PrefNumber == 3,
                showCatArrowIcon: true,
              },
              {
                id: 'performer-business',
                label: 'Business',
                type: 'link',
                visible: () => this.hasAccess('Reports', 'Performer'),
                customNavigate: () => this.navigatePref('pref-overall', 5),
                activeFn: () =>
                  this.activeTab === 'pref-creditmain/pref-overall?id=5' ||
                  this.selectedTab == 'pref-range' ||
                  this.PrefNumber == 5,
                showCatArrowIcon: true,
              },
              {
                id: 'performer-commission',
                label: 'Commission',
                type: 'link',
                visible: () => this.hasAccess('Reports', 'Performer'),
                customNavigate: () => this.navigatePref('pref-overall', 4),
                activeFn: () =>
                  this.activeTab === 'pref-creditmain/pref-overall?id=4' ||
                  this.selectedTab == 'pref-range' ||
                  this.PrefNumber == 4,
                showCatArrowIcon: true,
              },
            ],
          },
        ],
      },

      // Message Center
      {
        id: 'message-center',
        label: 'Message Center',
        icon: 'fa-regular fa-chart-bar',
        type: 'link',
        route: 'message-center',
        visible: () => this.hasAccess('Message Center', 'Message Center'),
      },
    ];
  }

  // =========================================================
  // Legacy wrappers (if you still call these in other places)
  // =========================================================

  toggleBulkBalance() {
    this.toggleByKey('isBulkBalanceOpen');
  }
  toggleMoneyTransfer() {
    this.toggleByKey('isMoneyTransferOpen');
  }
  toggleBalance() {
    this.toggleByKey('isBalanceOpen');
  }
  toggleDeposit() {
    this.toggleByKey('isDepositOpen');
  }
  toggleRecharge() {
    this.toggleByKey('isRechargeOpen');
  }
  toggleBooking() {
    this.toggleByKey('isBookingOpen');
  }
  toggleUtility() {
    this.toggleByKey('isUtilityOpen');
  }
  toggleMisc() {
    this.toggleByKey('isMiscOpen');
  }
  toggleTransReports() {
    this.toggleByKey('isTransReportsOpen');
  }
  toggleDepositReports() {
    this.toggleByKey('isDepositReportsOpen');
  }
  toggleDepositReports2() {
    this.toggleByKey('isDepositReportsOpen2');
  }
  togglePerformer() {
    this.toggleByKey('isPerformerOpen');
  }
}
