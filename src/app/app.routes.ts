import { Routes } from '@angular/router';
import { authGuard } from './servies/auth/auth.guard';
import { notTokenGuardGuard } from './servies/auth/auth.notToken/not-token-guard.guard';

export const routes: Routes = [
  //   {
  //     path: 'user-list',
  //     loadComponent: () =>
  //       import('./module/user-list/user-list.component').then(
  //         (c) => c.UserListComponent,
  //       ),
  //     canActivate: [authGuard],
  //   },
  {
    path: '',
    loadComponent: () =>
      import('./module/login/login.component').then((c) => c.LoginComponent),
    canActivate: [notTokenGuardGuard],
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./module/login/login.component').then((c) => c.LoginComponent),
    canActivate: [notTokenGuardGuard],
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./module/signup/signup.component').then((c) => c.SignupComponent),
    canActivate: [notTokenGuardGuard],
  },
  {
    path: 'otp',
    loadComponent: () =>
      import('./module/otp/otp.component').then((c) => c.OtpComponent),
    canActivate: [notTokenGuardGuard],
  },
  {
    path: 'kyc',
    loadComponent: () =>
      import('./module/kyc/kyc.component').then((c) => c.KycComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./common/aadhar/aadhar.component').then(
            (c) => c.AadharComponent,
          ),
      },
      {
        path: 'aadhar',
        loadComponent: () =>
          import('./common/aadhar/aadhar.component').then(
            (c) => c.AadharComponent,
          ),
      },
      {
        path: 'pan-details',
        loadComponent: () =>
          import('./common/pan-details/pan-details.component').then(
            (c) => c.PanDetailsComponent,
          ),
      },
      {
        path: 'selfie',
        loadComponent: () =>
          import('./common/selfie/selfie.component').then(
            (c) => c.SelfieComponent,
          ),
      },
      {
        path: 'shop-details',
        loadComponent: () =>
          import('./common/shop-details/shop-details.component').then(
            (c) => c.ShopDetailsComponent,
          ),
      },
    ],
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./module/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'user-list',
    loadComponent: () =>
      import('./module/user-list/user-list.component').then(
        (c) => c.UserListComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'package-lm-wk',
    loadComponent: () =>
      import('./module/package-lm-wk/package-lm-wk.component').then(
        (c) => c.PackageLmWkComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'add-lm-wk',
    loadComponent: () =>
      import('./module/add-lm-wk/add-lm-wk.component').then(
        (c) => c.AddLmWkComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'view-kyc/:profileId',
    loadComponent: () =>
      import('./module/view-kyc/view-kyc.component').then(
        (c) => c.ViewKycComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'show-pan',
        loadComponent: () =>
          import('./module/pan-detail/pan-detail.component').then(
            (c) => c.PanDetailComponent,
          ),
      },
      {
        path: 'show-aadhar',
        loadComponent: () =>
          import('./module/aadhar-detail/aadhar-detail.component').then(
            (c) => c.AadharDetailComponent,
          ),
      },
      {
        path: 'show-selfie',
        loadComponent: () =>
          import('./module/selfie/selfie.component').then(
            (c) => c.SelfieComponent,
          ),
      },
      {
        path: 'show-shop',
        loadComponent: () =>
          import('./module/shop-details/shop-details.component').then(
            (c) => c.ShopDetailsComponent,
          ),
      },
      {
        path: 'show-Changepass',
        loadComponent: () =>
          import('./module/change-pass/change-pass.component').then(
            (c) => c.ChangePassComponent,
          ),
      },
      {
        path: 'bank-detail',
        loadComponent: () =>
          import('./module/bank-detail/bank-detail.component').then(
            (c) => c.BankDetailComponent,
          ),
      },
      {
        path: 'show-gst',
        loadComponent: () =>
          import('./module/gst-detail/gst-detail.component').then(
            (c) => c.GstDetailComponent,
          ),
      },
    ],
  },

  {
    path: 'services',
    loadComponent: () =>
      import('./module/services/services.component').then(
        (c) => c.ServicesComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'api-manage',
    loadComponent: () =>
      import('./module/api-manage/api-manage.component').then(
        (c) => c.ApiManageComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'set-commission/:id/:venderName/:api',
    loadComponent: () =>
      import('./module/set-commission/set-commission.component').then(
        (c) => c.SetCommissionComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user-package/:id/:type',
    loadComponent: () =>
      import('./module/user-package/user-package.component').then(
        (c) => c.UserPackageComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'all-packages',
    loadComponent: () =>
      import('./module/user-all-package/user-all-package.component').then(
        (c) => c.UserAllPackageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'assign-package-limits/:id/:pf',
    loadComponent: () =>
      import('./module/assign-package-limits/assign-package-limits.component').then(
        (c) => c.AssignPackageLimitsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'config-sittings',
    loadComponent: () =>
      import('./module/config-sittings/config-sittings.component').then(
        (c) => c.ConfigSittingsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tab',
    loadComponent: () =>
      import('./module/manager/manager/manager.component').then(
        (c) => c.ManagerComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'sub-tab',
    loadComponent: () =>
      import('./module/sub-manager/sub-manager/sub-manager.component').then(
        (c) => c.SubManagerComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'executive',
    loadComponent: () =>
      import('./module/executive/executive/executive.component').then(
        (c) => c.ExecutiveComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'exec-update/:id1',
    loadComponent: () =>
      import('./module/executive-update/excutive-update/excutive-update.component').then(
        (c) => c.ExcutiveUpdateComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'packages',
    loadComponent: () =>
      import('./module/com-package/com-package.component').then(
        (c) => c.ComPackageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user-risk/:id',
    loadComponent: () =>
      import('./module/user-risk/user-risk.component').then(
        (c) => c.UserRiskComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'manage-bank',
    loadComponent: () =>
      import('./module/manage-bank/manage-bank.component').then(
        (c) => c.ManageBankComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'payment-by-manual',
    loadComponent: () =>
      import('./module/payment-by-manual/payment-by-manual.component').then(
        (c) => c.PaymentByManualComponent,
      ),
  },
  {
    path: 'wallet-and-ledger',
    loadComponent: () =>
      import('./module/wallet-and-ledger/wallet-and-ledger.component').then(
        (c) => c.WalletAndLedgerComponent,
      ),
  },
  {
    path: 'deposit-transaction',
    loadComponent: () =>
      import('./module/deposit-transaction/deposit-transaction.component').then(
        (c) => c.DepositTransactionComponent,
      ),
  },
  {
    path: 'bulk-upload',
    loadComponent: () =>
      import('./module/bulk-upload/bulk-upload.component').then(
        (c) => c.BulkUploadComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'bulk-history',
    loadComponent: () =>
      import('./module/bulk-history/bulk-history.component').then(
        (c) => c.BulkHistoryComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'credit-transfer',
    loadComponent: () =>
      import('./module/credit-transfer/credit-transfer.component').then(
        (c) => c.CreditTransferComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'balance-container',
    loadComponent: () =>
      import('./module/balance-contaniner/balance-contaniner.component').then(
        (c) => c.BalanceContaninerComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/deposit-transaction/deposit-transaction.component').then(
            (c) => c.DepositTransactionComponent,
          ),
      },
      {
        path: 'transaction',
        loadComponent: () =>
          import('./module/deposit-transaction/deposit-transaction.component').then(
            (c) => c.DepositTransactionComponent,
          ),
      },
      {
        path: 'wallet-and-ledger',
        loadComponent: () =>
          import('./module/wallet-and-ledger/wallet-and-ledger.component').then(
            (c) => c.WalletAndLedgerComponent,
          ),
      },
      {
        path: 'deposit-request',
        loadComponent: () =>
          import('./module/deposit-request/deposit-request.component').then(
            (c) => c.DepositRequestComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'payment-by-manual',
        loadComponent: () =>
          import('./module/payment-by-manual/payment-by-manual.component').then(
            (c) => c.PaymentByManualComponent,
          ),
      },
      {
        path: 'withdraw-req',
        loadComponent: () =>
          import('./module/withdraw-req-list/withdraw-req-list.component').then(
            (c) => c.WithdrawReqListComponent,
          ),
      },
    ],
  },
  {
    path: 'credit-container',
    loadComponent: () =>
      import('./module/credit-container/credit-container.component').then(
        (c) => c.CreditContainerComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/credit-request/credit-request.component').then(
            (c) => c.CreditRequestComponent,
          ),
      },
      {
        path: 'credit-transaction',
        loadComponent: () =>
          import('./module/credit-transaction/credit-transaction.component').then(
            (c) => c.CreditTransactionComponent,
          ),
      },
      {
        path: 'credit-ledger',
        loadComponent: () =>
          import('./module/credit-ledger/credit-ledger.component').then(
            (c) => c.CreditLedgerComponent,
          ),
      },
      {
        path: 'credit-request',
        loadComponent: () =>
          import('./module/credit-request/credit-request.component').then(
            (c) => c.CreditRequestComponent,
          ),
      },
      {
        path: 'credit-penalty',
        loadComponent: () =>
          import('./module/credit-penality/reports-penality.component').then(
            (c) => c.ReportsPenalityComponent,
          ),
      },
    ],
  },
  {
    path: 'aeps-container',
    loadComponent: () =>
      import('./module/aeps-container/aeps-container.component').then(
        (c) => c.AepsContainerComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/aeps-ledger/aeps-ledger.component').then(
            (c) => c.AepsLedgerComponent,
          ),
      },
      // {
      //   path: 'aeps-transaction',
      //   loadComponent: () =>
      //     import('./module/aeps-transaction/aeps-transaction.component').then(
      //       (c) => c.AepsTransactionComponent,
      //     ),
      // },
      {
        path: 'aeps-ledger',
        loadComponent: () =>
          import('./module/aeps-ledger/aeps-ledger.component').then(
            (c) => c.AepsLedgerComponent,
          ),
      },
    ],
  },
  {
    path: 'master-dis',
    loadComponent: () =>
      import('./module/master-distributor/master-distributor.component').then(
        (c) => c.MasterDistributorComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'distributor',
    loadComponent: () =>
      import('./module/distributor/distributor.component').then(
        (c) => c.DistributorComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'retailer',
    loadComponent: () =>
      import('./module/retailer/retailer.component').then(
        (c) => c.RetailerComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'money-main',
    loadComponent: () =>
      import('./module/money-main/money-main.component').then(
        (c) => c.MoneyMainComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/money-summary/money-summary.component').then(
            (c) => c.MoneySummaryComponent,
          ),
      },
      {
        path: 'money-summary',
        loadComponent: () =>
          import('./module/money-summary/money-summary.component').then(
            (c) => c.MoneySummaryComponent,
          ),
      },
      {
        path: 'money-detail',
        loadComponent: () =>
          import('./module/money-transfer-overall/money-transfer-overall.component').then(
            (c) => c.MoneyTransferOverallComponent,
          ),
      },
    ],
  },

  {
    path: 'money-transfer-overall',
    loadComponent: () =>
      import('./module/money-transfer-overall/money-transfer-overall.component').then(
        (c) => c.MoneyTransferOverallComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'money-transfer-overall/:id',
    loadComponent: () =>
      import('./module/money-transfer-overall/money-transfer-overall.component').then(
        (c) => c.MoneyTransferOverallComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'money-transfer-dmt',
    loadComponent: () =>
      import('./module/money-transfer-dmt/money-transfer-dmt.component').then(
        (c) => c.MoneyTransferDmtComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'money-transfer-aeps',
    loadComponent: () =>
      import('./module/money-transfer-aeps/money-transfer-aeps.component').then(
        (c) => c.MoneyTransferAepsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'money-transfer-payout',
    loadComponent: () =>
      import('./module/money-transfer-payout/money-transfer-payout.component').then(
        (c) => c.MoneyTransferPayoutComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'recharge-overall',
    loadComponent: () =>
      import('./module/recharge-overall/recharge-overall.component').then(
        (c) => c.RechargeOverallComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'recharge-overall/:id',
    loadComponent: () =>
      import('./module/recharge-overall/recharge-overall.component').then(
        (c) => c.RechargeOverallComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'recharge-postpaid',
    loadComponent: () =>
      import('./module/recharge-postpaid/recharge-postpaid.component').then(
        (c) => c.RechargePostpaidComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'recharge-prepaid',
    loadComponent: () =>
      import('./module/recharge-prepaid/recharge-prepaid.component').then(
        (c) => c.RechargePrepaidComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'booking-overall',
    loadComponent: () =>
      import('./module/booking-overall/booking-overall.component').then(
        (c) => c.BookingOverallComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'booking-overall/:id',
    loadComponent: () =>
      import('./module/booking-overall/booking-overall.component').then(
        (c) => c.BookingOverallComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'utility-overall',
    loadComponent: () =>
      import('./module/utility-overall/utility-overall.component').then(
        (c) => c.UtilityOverallComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'utility-overall/:id',
    loadComponent: () =>
      import('./module/utility-overall/utility-overall.component').then(
        (c) => c.UtilityOverallComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'misc-overall',
    loadComponent: () =>
      import('./module/misc-overall/misc-overall.component').then(
        (c) => c.MiscOverallComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'misc-overall/:id',
    loadComponent: () =>
      import('./module/misc-overall/misc-overall.component').then(
        (c) => c.MiscOverallComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user-ledger/:id',
    loadComponent: () =>
      import('./module/user-ledger/user-ledger.component').then(
        (c) => c.UserLedgerComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'assign-package/:id/:pf',
    loadComponent: () =>
      import('./module/assign-package/assign-package.component').then(
        (c) => c.AssignPackageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user-main',
    loadComponent: () =>
      import('./module/transactionuser-main/transactionuser-main.component').then(
        (c) => c.TransactionuserMainComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/user-reports/user-reports.component').then(
            (c) => c.UserReportsComponent,
          ),
      },
      {
        path: 'user-reports',
        loadComponent: () =>
          import('./module/user-reports/user-reports.component').then(
            (c) => c.UserReportsComponent,
          ),
      },
      {
        path: 'm-distributor',
        loadComponent: () =>
          import('./module/transactionuser-md/transactionuser-md.component').then(
            (c) => c.TransactionuserMdComponent,
          ),
      },
      {
        path: 'user-distributor',
        loadComponent: () =>
          import('./module/transactionuser-di/transactionuser-di.component').then(
            (c) => c.TransactionuserDiComponent,
          ),
      },
      {
        path: 'user-retailer',
        loadComponent: () =>
          import('./module/transactionuser-re/transactionuser-re.component').then(
            (c) => c.TransactionuserReComponent,
          ),
      },
    ],
  },
  {
    path: 'user-reports',
    loadComponent: () =>
      import('./module/user-reports/user-reports.component').then(
        (c) => c.UserReportsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'api-reports',
    loadComponent: () =>
      import('./module/api-reports/api-reports.component').then(
        (c) => c.ApiReportsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'service-reports',
    loadComponent: () =>
      import('./module/services-reports/services-reports.component').then(
        (c) => c.ServicesReportsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user-deposit-reports',
    loadComponent: () =>
      import('./module/user-deposit-reports/user-deposit-reports.component').then(
        (c) => c.UserDepositReportsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'source-deposit-reports',
    loadComponent: () =>
      import('./module/source-deposit-reports/source-deposit-reports.component').then(
        (c) => c.SourceDepositReportsComponent,
      ),
    canActivate: [authGuard],
  },
  // {
  //     path: 'executive-deposit-reports', loadComponent: () => import('./module/executive-deposit-reports/executive-deposit-reports.component').then(c => c.ExecutiveDepositReportsComponent), canActivate: [authGuard]
  // },
  {
    path: 'executive-deposit-reports',
    loadComponent: () =>
      import('./module/executive-overall/executive-overall.component').then(
        (c) => c.ExecutiveOverallComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'user-wise-reports',
    loadComponent: () =>
      import('./module/user-wise-reports/user-wise-reports.component').then(
        (c) => c.UserWiseReportsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user-deposit-withdraw',
    loadComponent: () =>
      import('./module/user-deposit-withdraw/user-deposit-withdraw.component').then(
        (c) => c.UserDepositWithdrawComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tax',
    loadComponent: () =>
      import('./module/reports-tax/reports-tax.component').then(
        (c) => c.ReportsTaxComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'reports-commission',
    loadComponent: () =>
      import('./module/reports-commission/reports-commission.component').then(
        (c) => c.ReportsCommissionComponent,
      ),
    canActivate: [authGuard],
  },
  // {
  //     path: 'reports-credits', loadComponent: () => import('./module/reports-credits/reports-credits.component').then(c => c.ReportsCreditsComponent), canActivate: [authGuard]
  // },

  {
    path: 'dwmain',
    loadComponent: () =>
      import('./module/balance-dwmain/balance-dwmain.component').then(
        (c) => c.BalanceDwmainComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/user-deposit-withdraw/user-deposit-withdraw.component').then(
            (c) => c.UserDepositWithdrawComponent,
          ),
      },
      {
        path: 'balance',
        loadComponent: () =>
          import('./module/user-deposit-withdraw/user-deposit-withdraw.component').then(
            (c) => c.UserDepositWithdrawComponent,
          ),
      },
      {
        path: 'credit',
        loadComponent: () =>
          import('./module/balance-withdraw/balance-withdraw.component').then(
            (c) => c.BalanceWithdrawComponent,
          ),
      },
    ],
  },

  {
    path: 'creditDw',
    loadComponent: () =>
      import('./module/creditdw/creditdw.component').then(
        (c) => c.CreditdwComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/credit-deposit/credit-deposit.component').then(
            (c) => c.CreditDepositComponent,
          ),
      },
      {
        path: 'credit-deposit',
        loadComponent: () =>
          import('./module/credit-deposit/credit-deposit.component').then(
            (c) => c.CreditDepositComponent,
          ),
      },
      {
        path: 'credit-withdraw',
        loadComponent: () =>
          import('./module/user-credit/user-credit.component').then(
            (c) => c.UserCreditComponent,
          ),
      },
    ],
  },

  {
    path: 'reportcredit-main',
    loadComponent: () =>
      import('./module/reportcredit-main/reportcredit-main.component').then(
        (c) => c.ReportcreditMainComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/reports-credits/reports-credits.component').then(
            (c) => c.ReportsCreditsComponent,
          ),
      },
      {
        path: 'report-user',
        loadComponent: () =>
          import('./module/reports-credits/reports-credits.component').then(
            (c) => c.ReportsCreditsComponent,
          ),
      },
      {
        path: 'credit-list',
        loadComponent: () =>
          import('./module/credit-list/credit-list.component').then(
            (c) => c.CreditListComponent,
          ),
      },
    ],
  },

  {
    path: 'report-overall',
    loadComponent: () =>
      import('./module/report-credit-overall/report-credit-overall.component').then(
        (c) => c.ReportCreditOverallComponent,
      ),
    canActivate: [authGuard],
  },

  // {
  //     path: 'reports-credits', loadComponent: () => import('./module/reports-balance/reports-balance.component').then(c => c.ReportsBalanceComponent), canActivate: [authGuard]
  // },
  //  {
  //     path: 'reports-balance', loadComponent: () => import('./module/reports-balance/reports-balance.component').then(c => c.ReportsBalanceComponent), canActivate: [authGuard]
  // },

  {
    path: 'reportbalance-main',
    loadComponent: () =>
      import('./module/reports-balance-main/reports-balance-main.component').then(
        (c) => c.ReportsBalanceMainComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/balance-overall/balance-overall.component').then(
            (c) => c.BalanceOverallComponent,
          ),
      },
      {
        path: 'balance-overall',
        loadComponent: () =>
          import('./module/balance-overall/balance-overall.component').then(
            (c) => c.BalanceOverallComponent,
          ),
      },
      {
        path: 'balance-user',
        loadComponent: () =>
          import('./module/reports-balance/reports-balance.component').then(
            (c) => c.ReportsBalanceComponent,
          ),
      },
    ],
  },

  {
    path: 'penality-main',
    loadComponent: () =>
      import('./module/penality-main/penality-main.component').then(
        (c) => c.PenalityMainComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/reports-penality/reports-penality.component').then(
            (c) => c.ReportsPenalityComponent,
          ),
      },
      {
        path: 'reports-penality',
        loadComponent: () =>
          import('./module/reports-penality/reports-penality.component').then(
            (c) => c.ReportsPenalityComponent,
          ),
      },
      {
        path: 'user-penality',
        loadComponent: () =>
          import('./module/user-penality/user-penality.component').then(
            (c) => c.UserPenalityComponent,
          ),
      },
    ],
  },

  {
    path: 'pref-creditmain',
    loadComponent: () =>
      import('./module/perf-credit-main/perf-credit-main.component').then(
        (c) => c.PerfCreditMainComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/pref-overall/pref-overall.component').then(
            (c) => c.PrefOverallComponent,
          ),
      },
      {
        path: 'pref-overall',
        loadComponent: () =>
          import('./module/pref-overall/pref-overall.component').then(
            (c) => c.PrefOverallComponent,
          ),
      },
      {
        path: 'pref-range',
        loadComponent: () =>
          import('./module/pref-range/pref-range.component').then(
            (c) => c.PrefRangeComponent,
          ),
      },
    ],
  },

  {
    path: 'business-main',
    loadComponent: () =>
      import('./module/business-main/business-main.component').then(
        (c) => c.BusinessMainComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/business-overall/business-overall.component').then(
            (c) => c.BusinessOverallComponent,
          ),
      },
      {
        path: 'business-overall',
        loadComponent: () =>
          import('./module/business-overall/business-overall.component').then(
            (c) => c.BusinessOverallComponent,
          ),
      },
      {
        path: 'business-timestamp',
        loadComponent: () =>
          import('./module/business-timestamp/business-timestamp.component').then(
            (c) => c.BusinessTimestampComponent,
          ),
      },
      {
        path: 'business-user',
        loadComponent: () =>
          import('./module/business-user/business-user.component').then(
            (c) => c.BusinessUserComponent,
          ),
      },
    ],
  },

  {
    path: 'user-credit',
    loadComponent: () =>
      import('./module/user-credit/user-credit.component').then(
        (c) => c.UserCreditComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'message-center',
    loadComponent: () =>
      import('./module/message-center/message-center.component').then(
        (c) => c.MessageCenterComponent,
      ),
    canActivate: [authGuard],
  },

  // {
  //     path: 'aeps-container', loadComponent: () => import('./module/aeps-container/aeps-container.component').then(c => c.AepsContainerComponent), canActivate: [authGuard], children: [
  //         {
  //             path: '', loadComponent: () => import('./module/aeps-transaction/aeps-transaction.component').then(c => c.AepsTransactionComponent)
  //         },
  //         {
  //             path: 'aeps-transaction', loadComponent: () => import('./module/aeps-transaction/aeps-transaction.component').then(c => c.AepsTransactionComponent)
  //         },
  //         {
  //             path: 'aeps-ledger', loadComponent: () => import('./module/aeps-ledger/aeps-ledger.component').then(c => c.AepsLedgerComponent)
  //         },
  //     ]
  // },

  // {
  //     path: 'reports-penalty/:id', loadComponent: () => import('./module/reports-penality/reports-penality.component').then(c => c.ReportsPenalityComponent), canActivate: [authGuard]
  // },

  // {
  //     path: '',
  //     loadChildren: () => import('./module/login/login.module').then(m => m.LoginModule), canActivate: [notTokenGuardGuard]
  // },
  // {
  //     path: 'login',
  //     component: LoginComponent
  // }
  {
    path: 'signup-kyc',
    loadComponent: () =>
      import('./module/signup-kyc/signup-kyc.component').then(
        (c) => c.SignupKycComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'login-settings',
    loadComponent: () =>
      import('./module/login-settings/login-settings.component').then(
        (c) => c.LoginSettingsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'signup-kyc-subtype',
    loadComponent: () =>
      import('./module/signup-kyc-subtype/signup-kyc-subtype.component').then(
        (c) => c.SignupKycSubtypeComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'globalSearch',
    loadComponent: () =>
      import('./module/global-search/global-search.component').then(
        (c) => c.GlobalSearchComponent,
      ),
    canActivate: [authGuard],
  },
];
