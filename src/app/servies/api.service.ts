import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  domain = environment.url;

  reportsURL = environment.reportsURL;
  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  islogin(): boolean {
    const localStorage = this.document?.defaultView?.localStorage;
    if (localStorage && sessionStorage.getItem('isloggedIn')) {
      return true; // User is authenticated, allow access
    } else {
      // this.router.navigate(['/login']); // Redirect to login page
      return false; // Not authenticated, deny access
    }
  }

  login(obj: any) {
    return this.http.post(this.domain + 'LOGIN_EXECUTIVE', obj);
  }

  getUserList(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_USERS_OVERALL', obj);
  }

  getSource() {
    return this.http.get(this.domain + 'GET_SOURCE');
  }

  vendorApi(obj: any) {
    return this.http.post(this.domain + 'GET_API_VENDORS', obj);
  }

  addSource(obj: any) {
    return this.http.post(this.domain + 'ADD_SOURCE', obj);
  }

  delSource(obj: any) {
    return this.http.post(this.domain + 'DEL_SOURCE', obj);
  }

  getApiCon(obj: any) {
    return this.http.post(this.domain + 'GET_API_CONFIG', obj);
  }

  addEditApiCon(obj: any) {
    return this.http.post(this.domain + 'ADD_API_CONFIG', obj);
  }

  delApiCon(obj: any) {
    return this.http.post(this.domain + 'DEL_API_CONFIG', obj);
  }

  updateStatusCon(obj: any) {
    return this.http.post(this.domain + 'UPDATE_API_CONFIG', obj);
  }

  getVendorComm(obj: any) {
    return this.http.post(this.domain + 'GET_API_FEE', obj);
  }

  addMoreComm(obj: any) {
    return this.http.post(this.domain + 'ADD_API_COMM_BY_SINGLE', obj);
  }

  updateComm(obj: any) {
    return this.http.post(this.domain + 'UPDATE_API_FEE_BY_ID', obj);
  }

  delComm(obj: any) {
    return this.http.post(this.domain + 'DELETE_API_FEE_BY_ID', obj);
  }

  addConfigComm(obj: any) {
    return this.http.post(this.domain + 'ACTIVE_API_SERVICE', obj);
  }

  getCountry() {
    return this.http.get(
      'https://api.cosmowallet.com/CosmoAPI_cosmowallet/GET_COUNTERIES',
    );
  }

  getUserPackage(obj: any) {
    return this.http.post(this.domain + 'GET_USER_PKG_MASTER', obj);
  }

  addPackage(obj: any) {
    return this.http.post(this.domain + 'ADD_USER_PKG', obj);
  }

  delUserPackage(obj: any) {
    return this.http.post(this.domain + 'DEL_USER_PKG', obj);
  }

  createPackDefault(obj: any) {
    return this.http.post(this.domain + 'UPDATE_USER_PKG_BY_DEFAULT', obj);
  }

  getUserPackInfo(obj: any) {
    return this.http.post(this.domain + 'GET_USER_PKG_INFO', obj);
  }

  addPackInfo(obj: any) {
    return this.http.post(this.domain + 'ADD_USER_PKG_ENTRY', obj);
  }

  delUserPackInfo(obj: any) {
    return this.http.post(this.domain + 'DEL_USER_PKG_SERVICE', obj);
  }

  ADD_EXECH_MASTER(obj: any) {
    return this.http.post(this.domain + 'ADD_EXECH_MASTER', obj);
  }

  UPDATE_EXECH_MASTER(obj: any) {
    return this.http.post(this.domain + 'UPDATE_EXECH_MASTER', obj);
  }

  GET_EXECH_MASTER(obj: any) {
    return this.http.get(
      this.domain +
      'GET_EXECH_MASTER?Key=' +
      obj.Key +
      '&MasterID=' +
      obj.MasterID,
    );
  }

  DEL_EXECH_MASTER(obj: any) {
    return this.http.get(
      this.domain +
      'DEL_EXECH_MASTER?Key=' +
      obj.Key +
      '&MasterID=' +
      obj.MasterID,
    );
  }

  ADD_EXEC_SUB_MASTER(obj: any) {
    return this.http.post(this.domain + 'ADD_EXEC_SUB_MASTER', obj);
  }

  GET_EXECH_SUB_MASTER(obj: any) {
    return this.http.get(
      this.domain +
      'GET_EXECH_SUB_MASTER?Key=' +
      obj.Key +
      '&MasterID=' +
      obj.MasterID +
      '&SubMasterID=' +
      obj.SubMasterID,
    );
  }

  UPDATE_EXECH_SUB_PERMIT(obj: any) {
    return this.http.post(this.domain + 'UPDATE_EXECH_SUB_PERMIT', obj);
  }

  DEL_EXECH_SUB_MASTER(obj: any) {
    return this.http.get(
      this.domain +
      'DEL_EXECH_SUB_MASTER?Key=' +
      obj.Key +
      '&MasterID=' +
      obj.MasterID +
      '&SubMasterID=' +
      obj.SubMasterID,
    );
  }

  GET_EXECUTIVE(obj: any) {
    return this.http.get(this.domain + 'GET_EXECUTIVE?ExecID=' + obj.ExecID);
  }
  GET_COUNTERIES() {
    return this.http.get(this.domain + 'GET_COUNTERIES');
  }

  ADD_EXECUTVE(obj: any) {
    return this.http.post(this.domain + 'ADD_EXECUTVE', obj);
  }

  ADD_EXEC_PERMIT(obj: any) {
    return this.http.post(this.domain + 'ADD_EXEC_PERMIT', obj);
  }

  getExecutive(obj: any) {
    return this.http.post(this.domain + 'GET_EXECUTIVE_BYID', obj);
  }

  changePass(obj: any) {
    return this.http.post(this.domain + 'CHANGE_EXEC_PWD', obj);
  }

  getTranBank() {
    return this.http.get(this.domain + 'GET_TRANS_BANK');
  }

  addTranbank(obj: any) {
    return this.http.post(this.domain + 'ADD_TRANS_BANK', obj);
  }

  bankStatus(obj: any) {
    return this.http.post(this.domain + 'UPDATE_TRANS_BANK', obj);
  }

  deleteTranBank(obj: any) {
    return this.http.post(this.domain + 'DEL_TRANS_BANK', obj);
  }

  getManualTranRec(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_MANUAL_TRANS_RECEIPT', obj);
  }

  updateManTranRec(obj: any) {
    return this.http.post(
      this.domain + 'UPDATE_TRANS_MANUAL_TRANS_RECEIPT',
      obj,
    );
  }
  GET_USERREMARKS(obj: any) {
    return this.http.post(this.domain + 'GET_USER_REMARKS_v2', obj);
  }
  ADD_USERREMARKS(obj: any) {
    return this.http.post(this.domain + 'ADD_USER_REMARKS_v2', obj);
  }
  UPDATE_TRANS_MANUAL_TRANS_RECEIPT(obj: any) {
    return this.http.post(
      this.domain + 'UPDATE_TRANS_MANUAL_TRANS_RECEIPT',
      obj,
    );
  }
  GET_ADM_WAL_BAL_TRANS(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_WAL_BAL_TRANS', obj);
  }
  GET_PROFILE_BY_FILTER(obj: any) {
    return this.http.post(this.domain + 'GET_PROFILE_BY_FILTER', obj);
  }
  ADD_DIGI_BULK_UPLOAD(obj: any) {
    return this.http.post(this.domain + 'ADD_DIGI_BULK_UPLOAD', obj);
  }
  GET_DIGI_BULK_FILES() {
    return this.http.get(this.domain + 'GET_DIGI_BULK_FILES');
  }
  GET_DIGI_BULK_UPLOAD(obj: any) {
    return this.http.post(this.domain + 'GET_DIGI_BULK_UPLOAD', obj);
  }
  GET_ADM_LEDGER_BY_TAG(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_LEDGER_BY_TAG', obj);
  }

  GET_ADM_USER_GEO(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_USER_GEO', obj);
  }
  GET_USER_KYC_INFO(obj: any) {
    return this.http.post(this.domain + 'GET_USER_KYC_INFO', obj);
  }
  GET_USER_INFO(obj: any) {
    return this.http.get(
      this.domain + 'GET_USER_INFO?Profile=' + obj.profileId,
    );
  }
  private apiKey = 'AIzaSyDqfVd9ccsU8Hu4auqaiqvCFF07BYbN77k';
  private geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  getLocationName(lat: number, lng: number): Observable<any> {
    const url = `${this.geocodeUrl}?latlng=${lat},${lng}&key=${this.apiKey}`;
    return this.http.get(url);
  }

  MAKE_CREDIT_TRANS_DEPT(obj: any) {
    return this.http.post(this.domain + 'MAKE_CREDIT_TRANS_DEPT', obj);
  }
  MAKE_CREDIT_TRANS_TRANSFER(obj: any) {
    return this.http.post(this.domain + 'MAKE_CREDIT_TRANS_TRANSFER', obj);
  }
  GET_ADM_CREDIT_TRANS(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_CREDIT_TRANS', obj);
  }
  GET_USER_ACCOUNT_BY_TAG(obj: any) {
    return this.http.get(
      this.domain +
      'GET_USER_ACCOUNT_BY_TAG?Profile=' +
      obj.profileId +
      '&Tag=' +
      obj.balance,
    );
  }
  getAdmType(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_USERS_BY_TYPE', obj);
  }
  filterMdDsRi(obj: any) {
    return this.http.post(this.domain + 'GET_FILTER_USERS', obj);
  }
  getTranOverall(obj: any) {
    return this.http.post(this.domain + 'GET_DM_PY_TRANSACTION', obj);
  }
  GET_RE_UB_BK__TRANSACTION() {
    return this.http.get(this.domain + 'GET_RE_UB_BK__TRANSACTION');
  }
  GET_RE_UB_BK__TRANSACTION2(obj: any) {
    return this.http.post(this.domain + 'GET_RE_UB_BK__TRANSACTION', obj);
  }
  UPLOAD_KYC_DOC(obj: any) {
    return this.http.post(this.domain + 'UPLOAD_KYC_DOC', obj);
  }

  uploadImg(obj: any) {
    return this.http.post('https://mt.sibawallet.net:5002/upload/', obj);
  }
  changeStatusUser(obj: any) {
    return this.http.post(this.domain + 'UPDATE_USER_STATUS', obj);
  }
  getUserLedger(obj: any) {
    return this.http.post(this.domain + 'GET_USER_LEDGER_INSTANT', obj);
  }
  getUserAcc(obj: any) {
    return this.http.get(this.domain + 'GET_USER_ACCOUNT_BY_ID', {
      params: obj,
    });
  }
  updateUserCommPkg(obj: any) {
    return this.http.post(this.domain + 'UPDATE_USER_COMM_PKG', obj);
  }
  makeSignup(obj: any) {
    return this.http.post(this.domain + 'MAKE_SIGNUP', obj);
  }
  assignMdDi(obj: any) {
    return this.http.post(this.domain + 'UPDATE_ASSIGN_MD_DI', obj);
  }
  getUserbank(obj: any) {
    return this.http.get(this.domain + 'GET_DB_USER_BENE', { params: obj });
  }
  getUserLocation(obj: any) {
    return this.http.post(this.domain + 'GET_CLNT_USER_GEO', obj);
  }
  CHANGE_USER_ADM_PASSWORD(obj: any) {
    return this.http.post(this.domain + 'CHANGE_USER_ADM_PASSWORD', obj);
  }
  getCreditReq(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_CREDIT_PENDING_TRANS', obj);
  }
  updateCreditReq(obj: any) {
    return this.http.post(this.domain + 'UPDATE_CREDIT_TRANS_REQ', obj);
  }
  getAdmSetting() {
    return this.http.get(this.domain + 'GET_ADM_SETTING');
  }
  addSetting(obj: any) {
    return this.http.post(this.domain + 'ADD_ADM_SETTING', obj);
  }
  getRecentMoney(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_DIGI_RCT_ADM_DM_PY_TRANS',
      obj,
    );
  }
  getMoneyDetail(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_ADM_DM_PY_TRANS', obj);
  }
  getSummary(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_DIGI_ADM_OVL_SMR_DM_PY_RBU',
      obj,
    );
  }
  advFilType(obj: any) {
    return this.http.post(this.reportsURL + 'GET_ADM_FILTER_USER', obj);
  }
  getRecntRechBookUtiMis(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_RCT_ADM_RBU_TRANS', obj);
  }
  getRecBookUtiMisDetail(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_ADM_RBU_TRANS', obj);
  }

  getReportsUserTime(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_DIGI_ADM_OVL_USER_TRANS_BY_RANGE',
      obj,
    );
  }
  getReportsRiTime(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_DIGI_ADM_OVL_RETAILER_TRANS_BY_RANGE',
      obj,
    );
  }
  getReportsUserOverall(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_ADM_OVL_USER_TRANS', obj);
  }
  getReportTransByapiTime(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_DIGI_ADM_OVL_API_TRANS_BY_RANGE',
      obj,
    );
  }
  getReportTransByapiOverall(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_ADM_OVL_API_TRANS', obj);
  }
  toggleList(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_DIGI_ADM_API_TRANS_DAILY',
      obj,
    );
  }
  getTransactionService(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_DIGI_ADM_DAILY_SERVICE_TRANS',
      obj,
    );
  }
  getTaxList(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_ADM_TAXES_USER_TM', obj);
  }

  getReportServiceOverall(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_DIGI_ADM_OVL_SERVICE_TRANS',
      obj,
    );
  }
  getReportServiceTime(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_DIGI_ADM_OVL_SERVICE_TRANS_BY_RANGE',
      obj,
    );
  }
  // getTaxOverall(obj: any) {
  //   return this.http.post(this.domain + 'GET_DIGI_ADM_TAXES_USER_OVL', obj);
  // }
  getTaxesOverall(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_ADM_TAXES_TM', obj);
  }
  getTaxesUser(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_USR_TAXES_OVL', obj);
  }
  getTaxesTime(obj: any) {
    return this.http.post(this.domain + 'GET_DIGI_ADM_TAXES_TM', obj);
  }
  getCommOverall(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_ADM_COMM_USER_OVL', obj);
  }
  getCommTime(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_ADM_COMM_TM', obj);
  }
  getReportCreditOverall(obj: any) {
    return this.http.post(this.reportsURL + 'GET_STAT_ADM_CREDIT_OVL', obj);
  }
  getReportCreditUser(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_STAT_ADM_CREDIT_USER_OVL',
      obj,
    );
  }
  getReportCreditUserId(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_STAT_USR_BRF_CREDIT_USER_OVL',
      obj,
    );
  }

  getReportBalanceOverall(obj: any) {
    return this.http.post(this.reportsURL + 'GET_STAT_ADM_BALANCE_OVL', obj);
  }
  getReportBalanceUser(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_STAT_ADM_BALANCE_USER_OVL',
      obj,
    );
  }
  getReportBalanceUserId(obj: any) {
    return this.http.post(
      this.reportsURL + 'GET_STAT_USR_BRF_BALANCE_USER_OVL',
      obj,
    );
  }

  getReportPanalty(obj: any) {
    return this.http.post(this.domain + 'GET_PENALITY_PKG', obj);
  }
  addEditReportPanalty(obj: any) {
    return this.http.post(this.domain + 'ADD_EDIT_PENALITY_PKG', obj);
  }
  UpdateDefaultPan(obj: any) {
    return this.http.post(this.domain + 'UPDATE_PENALITY_DEFAULT', obj);
  }
  UpdateStatusPan(obj: any) {
    return this.http.post(this.domain + 'UPDATE_PENALITY_STATUS', obj);
  }
  getReportPenOverall(obj: any) {
    return this.http.post(this.reportsURL + 'GET_ADM_OVL_PENALITY', obj);
  }
  getReportPenUser(obj: any) {
    return this.http.post(this.reportsURL + 'GET_ADM_USER_OVL_PENALITY', obj);
  }
  getPenalityUserId(obj: any) {
    return this.http.post(this.reportsURL + 'GET_ADM_USER_WISE_PENALITY', obj);
  }
  getCreditList(obj: any) {
    return this.http.post(this.reportsURL + 'GET_STAT_USR_CREDIT_TM', obj);
  }
  getCreditPref(obj: any) {
    return this.http.post(this.reportsURL + 'GET_ADM_STAT_PERFORMER', obj);
  }
  getBusinessOverall(obj: any) {
    return this.http.post(this.reportsURL + 'GET_ADM_USR_BUSINESS_OVL', obj);
  }
  getBusinessTime(obj: any) {
    return this.http.post(this.reportsURL + 'GET_ADM_STAT_BUSINESS', obj);
  }
  getBusinessUser(obj: any) {
    return this.http.post(this.reportsURL + 'GET_ADM_USR_BUSINESS_TM', obj);
  }
  getAllMessage(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_PROFILE_MESSAGES', obj);
  }
  addMessage(obj: any) {
    return this.http.post(this.domain + 'ADD_EDIT_MESSAGE_CENTER', obj);
  }
  deleteMessage(obj: any) {
    return this.http.post(this.domain + 'DELETE_EDIT_MESSAGE', obj);
  }
  getIdEmail(obj: any) {
    return this.http.post(this.domain + 'SEARCH_USERS_BYEMAIL', obj);
  }
  getBalanceDw(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_DE_WD_RECENT', obj);
  }
  getBalanceWithdraw(obj: any) {
    return this.http.post(this.domain + 'GET_USER_WITHDRAW_REQ', obj);
  }
  makeBalanceDw(obj: any) {
    return this.http.post(this.domain + 'MAKE_ADM_DEPOSIT_INSTANT', obj);
  }
  makeCreditDeposit(obj: any) {
    return this.http.post(this.domain + 'MAKE_CREDIT_TRANS_INSTANT', obj);
  }
  getExecutiveOverall(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_STAT_EXEC_DEPT_OVL', obj);
  }
  getExecutiveById(obj: any) {
    return this.http.post(this.reportsURL + 'GET_DIGI_STAT_EXEC_DEPT_TM', obj);
  }

  // -----------------------------------COSMO ADMIN API'S----------------------
  ADD_SETTINGS_COUNTRY(obj: any) {
    return this.http.post(this.domain + 'ADD_SETTINGS_COUNTRY', obj);
  }

  ADD_ADM_ACCOUNT_TYPE(obj: any) {
    return this.http.post(this.domain + 'ADD_ADM_ACCOUNT_TYPE', obj);
  }
  GET_ADM_ACCOUNT_TYPE(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_ACCOUNT_TYPE', obj);
  }
  DEL_ADM_ACCOUNT_TYPE(obj: any) {
    return this.http.post(this.domain + 'DEL_ADM_ACCOUNT_TYPE', obj);
  }
  ADD_EDIT_USER_RISK(obj: any) {
    return this.http.post(this.domain + 'ADD_EDIT_USER_RISK', obj);
  }
  GET_USER_RISK(obj: any) {
    return this.http.post(this.domain + 'GET_USER_RISK_BY_CURR', obj);
  }
  GET_Admin_Data() {
    return this.http.get(this.domain + 'GET_DIGI_ADM_DSH');
  }

  getUserKyc(obj: any) {
    return this.http.post(this.domain + 'GET_USER_KYC_INFO', obj);
  }

  /** ADD_STAGE_SUB_TYPE */
  addSubtype(stageId: number, subType: string, url: string) {
    const payload = {
      Key: '', // or your real key if needed
      oSubType: {
        oStage: stageId,
        SubType: subType,
        URL: url || '',
      },
    };

    return this.http.post(this.domain + 'ADD_STAGE_SUB_TYPE', payload);
  }

  /** GET_STAGE_SUB_TYPE */
  getSubTypes(stageId: number) {
    const payload = { Field1: stageId };
    return this.http.post(this.domain + 'GET_STAGE_SUB_TYPE', payload);
  }

  /** DEL_STAGE_SUB_TYPE */
  deleteSubtype(subTypeId: number) {
    const payload = { Field1: subTypeId };
    return this.http.post(this.domain + 'DEL_STAGE_SUB_TYPE', payload);
  }
  getStageSubTypes(stageId: number) {
    const body = { Field1: stageId }; // 0 => all
    return this.http.post(this.domain + 'GET_STAGE_SUB_TYPE', body);
  }

  getSignupFlow() {
    return this.http.post(this.domain + 'GET_SIGNUP_FLOW', {});
  }

  addSignupFlow(payload: any) {
    return this.http.post(this.domain + 'ADD_SIGNUP_FLOW', payload);
  }

  resetSignupFlow(obj: any) {
    // This is GET per your note
    return this.http.post(this.domain + 'RESET_SIGNUP_FLOW', obj);
  }
  updateKycFlowPkg(body: any) {
    return this.http.post(this.domain + 'UPDATE_KYCFLOW_PKG', body);
  }

  GET_LOGIN_FLOW() {
    return this.http.get(this.domain + 'GET_LOGIN_FLOW');
  }
  ADD_LOGIN_FLOW(obj: any) {
    return this.http.post(this.domain + 'ADD_LOGIN_FLOW', obj);
  }
  VALIDATE_LOGIN(obj: any) {
    return this.http.post(this.domain + 'VALIDATE_LOGIN', obj);
  }
  updateUserTag(profileId: string | number, tag: string): Observable<any> {
    const payload = {
      Key: '',
      Field1: String(profileId),
      Field2: tag,
      Field3: '',
    };
    return this.http.post(`${this.domain}/UPDATE_USER_TAG`, payload);
  }

  updateUserStage(profileId: string | number, stage: number): Observable<any> {
    const payload = {
      Key: '',
      Field1: String(profileId),
      Field2: String(stage),
      Field3: '',
    };
    return this.http.post(`${this.domain}/UPDATE_USER_STAGE`, payload);
  }
  GET_SIGNUP_FLOW_BY_TAG(obj: any) {
    return this.http.post(this.domain + 'GET_SIGNUP_FLOW_BY_TAG', obj);
  }
  uploadImgFormData(fd: FormData) {
    // IMPORTANT: don't set Content-Type manually
    return this.http.post('https://mt.sibawallet.net:5002/upload/', fd);
  }
  makeBankEntryVerify(payload: { BankID: number; lstTrans: any[] }): Observable<any[]> {
    return this.http.post<any[]>(this.domain + 'MAKE_BANK_ENTRY_VERIFY', payload);
  }
  getTransBank(): Observable<any[]> {
    return this.http.get<any[]>(this.domain +
      'GET_TRANS_BANK',
      {}
    );
  }

  // ─────────────────────── GLOBAL SEARCH APIs ───────────────────────

  /** Search users by Name (1), Phone (2), or Code (3) */
  GET_ADM_FILTER_USER(obj: { Key: string; FilterType: number; Value: string }) {
    return this.http.post(this.reportsURL + 'GET_ADM_FILTER_USER', obj);
  }

  /** GET_USER_KYC_INFO – all doc types or single type (oKYC_Type: 0 = all) */
  GET_USER_KYC_INFO_GS(obj: { ProfileId: number; Key: string; oKYC_Type: number }) {
    return this.http.post(this.domain + 'GET_USER_KYC_INFO', obj);
  }

  /** GET_DB_USER_BENE – bank details by profile ID */
  GET_DB_USER_BENE_PROFILE(profileId: number) {
    return this.http.get<any[]>(this.domain + 'GET_DB_USER_BENE', {
      params: { oProfileId: String(profileId) },
    });
  }

  /** GET_USER_ACCOUNT_BY_ID – wallet / AEPS / credit balances */
  GET_USER_ACCOUNT_BY_ID_PROFILE(profileId: number) {
    return this.http.get<any[]>(this.domain + 'GET_USER_ACCOUNT_BY_ID', {
      params: { Profile: String(profileId) },
    });
  }

  /** GET_RL_PKG_WK_LMT – default permissions/limits package */
  GET_RL_PKG_WK_LMT(obj: { Field1: number }) {
    return this.http.post<any>(this.domain + 'GET_RL_PKG_WK_LMT', obj);
  }

  /** GET_RL_ASSIGNED_PKG – custom permissions/limits assigned to retailer */
  GET_RL_ASSIGNED_PKG(obj: { Field1: string }) {
    return this.http.post<any>(this.domain + 'GET_RL_ASSIGNED_PKG', obj);
  }

  /** GET_USER_PKG_MASTER – package master (service types under a package) */
  GET_USER_PKG_MASTER_GS(obj: { Key: string; Field1: string }) {
    return this.http.post<any[]>(this.domain + 'GET_USER_PKG_MASTER', obj);
  }

  /** GET_USER_PKG_INFO – commission structure for a package + service type */
  GET_USER_PKG_INFO_GS(obj: { Key: string; Field1: string; Field2: string }) {
    return this.http.post<any>(this.domain + 'GET_USER_PKG_INFO', obj);
  }

  activeMemberWithoutToken(userName: string, amount: number): Observable<any> {

    const params = {
      UserName: userName,
      Amount: amount
    };

    return this.http.post(
      'https://bachatpay.co/API/api/Authentication/ActiveMember_WithoutToken',
      {},
      { params }
    );

  }

  getAdmWithdrawReq(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_WITHDRAW_REQ', obj);
  }

  makeWalletWithdraw(obj: any) {
    return this.http.post(this.domain + 'MAKE_WALLET_WDRAW', obj);
  }

  withdrawRequestWithoutToken(obj: any) {
    return this.http.post('https://bachatpay.co/API/api/Authentication/WithdrawRequest_WithoutToken', obj);
  }

  updateWithdrawReq(obj: any) {
    return this.http.post(this.domain + 'UPDATE_ADM_WITHDRAW_REQ', obj);
  }
}
