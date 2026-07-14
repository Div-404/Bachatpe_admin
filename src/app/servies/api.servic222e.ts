import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  domain = environment.url

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { }

  islogin(): boolean {

    const localStorage = this.document?.defaultView?.localStorage;
    if (localStorage && localStorage.getItem("isloggedIn")) {
      return true; // User is authenticated, allow access
    } else {
      // this.router.navigate(['/login']); // Redirect to login page
      return false; // Not authenticated, deny access
    }
  }

  login(obj: any) {
    return this.http.post(this.domain + "LOGIN_EXECUTIVE", obj)
  }

  getUserList(obj: any) {
    return this.http.post(this.domain + "GET_ADM_USERS_OVERALL", obj)
  }


  getSource() {
    return this.http.get(this.domain + "GET_SOURCE")
  }


  addSource(obj: any) {
    return this.http.post(this.domain + "ADD_SOURCE", obj)
  }

  delSource(obj: any) {
    return this.http.post(this.domain + "DEL_SOURCE", obj)
  }

  getApiCon(obj: any) {
    return this.http.post(this.domain + "GET_API_CONFIG", obj)
  }

  addEditApiCon(obj: any) {
    return this.http.post(this.domain + "ADD_API_CONFIG", obj)
  }

  delApiCon(obj: any) {
    return this.http.post(this.domain + "DEL_API_CONFIG", obj)
  }

  updateStatusCon(obj: any) {
    return this.http.post(this.domain + "UPDATE_API_CONFIG", obj)
  }

  getVendorComm(obj: any) {
    return this.http.post(this.domain + "GET_API_FEE", obj)
  }

  addMoreComm(obj: any) {
    return this.http.post(this.domain + "ADD_API_COMM_BY_SINGLE", obj)
  }

  updateComm(obj: any) {
    return this.http.post(this.domain + "UPDATE_API_FEE_BY_ID", obj)
  }

  delComm(obj: any) {
    return this.http.post(this.domain + "DELETE_API_FEE_BY_ID", obj)
  }

  addConfigComm(obj: any) {
    return this.http.post(this.domain + "ACTIVE_API_SERVICE", obj)
  }

  getCountry() {
    return this.http.get("https://api.cosmowallet.com/CosmoAPI_cosmowallet/GET_COUNTERIES")
  }

  getUserPackage(obj: any) {
    return this.http.post(this.domain + "GET_USER_PKG_MASTER", obj)
  }

  addPackage(obj: any) {
    return this.http.post(this.domain + "ADD_USER_PKG", obj)
  }

  delUserPackage(obj: any) {
    return this.http.post(this.domain + "DEL_USER_PKG", obj)
  }

  createPackDefault(obj: any) {
    return this.http.post(this.domain + "UPDATE_USER_PKG_BY_DEFAULT", obj)
  }

  getUserPackInfo(obj: any) {
    return this.http.post(this.domain + "GET_USER_PKG_INFO", obj)
  }

  addPackInfo(obj: any) {
    return this.http.post(this.domain + "ADD_USER_PKG_ENTRY", obj)
  }

  delUserPackInfo(obj: any) {
    return this.http.post(this.domain + "DEL_USER_PKG_SERVICE", obj)
  }

  ADD_EXECH_MASTER(obj: any) {
    return this.http.post(this.domain + 'ADD_EXECH_MASTER', obj)
  }

  UPDATE_EXECH_MASTER(obj: any) {
    return this.http.post(this.domain + 'UPDATE_EXECH_MASTER', obj);
  }

  GET_EXECH_MASTER(obj: any) {
    return this.http.get(this.domain + 'GET_EXECH_MASTER?Key=' + obj.Key + '&MasterID=' + obj.MasterID);
  }

  DEL_EXECH_MASTER(obj: any) {
    return this.http.get(this.domain + 'DEL_EXECH_MASTER?Key=' + obj.Key + '&MasterID=' + obj.MasterID);
  }

  ADD_EXEC_SUB_MASTER(obj: any) {
    return this.http.post(this.domain + 'ADD_EXEC_SUB_MASTER', obj);
  }

  GET_EXECH_SUB_MASTER(obj: any) {
    return this.http.get(this.domain + 'GET_EXECH_SUB_MASTER?Key=' + obj.Key + '&MasterID=' + obj.MasterID + '&SubMasterID=' + obj.SubMasterID);
  }

  UPDATE_EXECH_SUB_PERMIT(obj: any) {
    return this.http.post(this.domain + 'UPDATE_EXECH_SUB_PERMIT', obj);
  }

  DEL_EXECH_SUB_MASTER(obj: any) {
    return this.http.get(this.domain + 'DEL_EXECH_SUB_MASTER?Key=' + obj.Key + '&MasterID=' + obj.MasterID + '&SubMasterID=' + obj.SubMasterID);
  }

  GET_EXECUTIVE(obj: any) {
    return this.http.get(this.domain + 'GET_EXECUTIVE?ExecID=' + obj.ExecID);
  }
  GET_COUNTERIES() {
    return this.http.get(this.domain + 'GET_COUNTERIES')
  }

  ADD_EXECUTVE(obj: any) {
    return this.http.post(this.domain + 'ADD_EXECUTVE', obj);
  }

  ADD_EXEC_PERMIT(obj: any) {
    return this.http.post(this.domain + 'ADD_EXEC_PERMIT', obj);
  }

  getExecutive(obj: any) {
    return this.http.post(this.domain + "GET_EXECUTIVE_BYID", obj)
  }

  changePass(obj: any) {
    return this.http.post(this.domain + "CHANGE_EXEC_PWD", obj)
  }

  getTranBank() {
    return this.http.get(this.domain + "GET_TRANS_BANK")
  }

  addTranbank(obj: any) {
    return this.http.post(this.domain + "ADD_TRANS_BANK", obj)
  }

  bankStatus(obj: any) {
    return this.http.post(this.domain + "UPDATE_TRANS_BANK", obj)
  }

  deleteTranBank(obj: any) {
    return this.http.post(this.domain + "DEL_TRANS_BANK", obj)
  }

  getManualTranRec(obj: any) {
    return this.http.post(this.domain + "GET_ADM_MANUAL_TRANS_RECEIPT", obj)
  }

  updateManTranRec(obj: any) {
    return this.http.post(this.domain + "UPDATE_TRANS_MANUAL_TRANS_RECEIPT", obj)
  }
  GET_USERREMARKS(obj:any){
    return this.http.post(this.domain + "GET_USER_REMARKS_v2", obj)
  }
  ADD_USERREMARKS(obj:any){
    return this.http.post(this.domain + "ADD_USER_REMARKS_v2", obj)
  }
  UPDATE_TRANS_MANUAL_TRANS_RECEIPT(obj:any){
    return this.http.post(this.domain + "UPDATE_TRANS_MANUAL_TRANS_RECEIPT", obj)
  }
  GET_ADM_WAL_BAL_TRANS(obj:any){
    return this.http.post(this.domain + "GET_ADM_WAL_BAL_TRANS", obj)
  }
  GET_PROFILE_BY_FILTER(obj:any){
    return this.http.post(this.domain + "GET_PROFILE_BY_FILTER", obj)
  }
  ADD_DIGI_BULK_UPLOAD(obj:any){
    return this.http.post(this.domain + "ADD_DIGI_BULK_UPLOAD", obj)
  }
  GET_DIGI_BULK_FILES(){
    return this.http.get(this.domain + "GET_DIGI_BULK_FILES")
  }
  GET_DIGI_BULK_UPLOAD(obj:any){
    return this.http.post(this.domain + "GET_DIGI_BULK_UPLOAD", obj)
  }
  GET_ADM_LEDGER_BY_TAG(obj:any){
    return this.http.post(this.domain + "GET_ADM_LEDGER_BY_TAG", obj)
  }

  GET_ADM_USER_GEO(obj:any){
    return this.http.post(this.domain + "GET_ADM_USER_GEO", obj)
  }
  GET_USER_KYC_INFO(obj:any){
    return this.http.post(this.domain + "GET_USER_KYC_INFO", obj) 
  }
  GET_USER_INFO(obj:any){
    return this.http.get(this.domain + "GET_USER_INFO?Profile="+ obj.profileId) 
  }
  private apiKey = 'AIzaSyDqfVd9ccsU8Hu4auqaiqvCFF07BYbN77k';
  private geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  getLocationName(lat: number, lng: number): Observable<any> {
    const url = `${this.geocodeUrl}?latlng=${lat},${lng}&key=${this.apiKey}`;
    return this.http.get(url);
  }

  MAKE_CREDIT_TRANS_DEPT(obj:any){
    return this.http.post(this.domain + "MAKE_CREDIT_TRANS_DEPT", obj)  
  }
  MAKE_CREDIT_TRANS_TRANSFER(obj:any){
    return this.http.post(this.domain + "MAKE_CREDIT_TRANS_TRANSFER", obj)  
  }
  GET_ADM_CREDIT_TRANS(obj:any){
    return this.http.post(this.domain + "GET_ADM_CREDIT_TRANS", obj)  
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
  UPDATE_USER_RISK_STATUS(obj: any) {
    return this.http.post(this.domain + 'UPDATE_USER_RISK_STATUS', obj);
  }
 
}
