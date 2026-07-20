import { Component } from '@angular/core';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiService } from '../../servies/api.service';
import { PaginationService } from '../../servies/pagination.service';
import { SharedService } from '../../servies/shared/shared.service';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-withdraw-req-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './withdraw-req-list.component.html',
  styleUrl: './withdraw-req-list.component.scss'
})
export class WithdrawReqListComponent {
  wdList: any[] = []
  Count: any = 0

  dtFrom: string = ''
  dtTo: string = ''
  oFilter: number = 0
  searchValue: string = ''
  selectedFilterLabel: string = 'Select'

  pager: any = []
  page: any = 1
  numRecord: any = 10

  datePreset: any = '7'
  today: string = ''

  constructor(
    private api: ApiService,
    private toster: ToastrService,
    private pagination: PaginationService,
    private datePipe: DatePipe,
    private shared: SharedService
  ) { }

  ngOnInit(): void {
    this.shared.setSidebrActiveClass('balance-container/withdraw-req')
    this.today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US')
    this.setDatePreset('7')
  }

  setDatePreset(days: string) {
    this.datePreset = days
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - Number(days))
    this.dtFrom = formatDate(from, 'yyyy-MM-dd', 'en-US')
    this.dtTo = formatDate(to, 'yyyy-MM-dd', 'en-US')
    if (days !== 'custom') {
      this.page = 1
      this.fetchData(1, 10)
    }
  }

  onCustomDate() {
    if (this.dtFrom && this.dtTo) {
      this.page = 1
      this.fetchData(1, 10)
    }
  }

  onFilterChange() {
    this.searchValue = ''
  }

  onSearch() {
    this.page = 1
    this.fetchData(1, 10)
  }

  clearSearch() {
    this.searchValue = ''
    this.oFilter = 0
    this.selectedFilterLabel = 'Select'
    this.page = 1
    this.fetchData(1, 10)
  }

  fetchData(initial: number, maxCount: number) {
    const dtFrom = this.dtFrom ? this.dtFrom + ' 00:00:01' : ''
    const dtTo = this.dtTo ? this.dtTo + ' 23:59:59' : ''

    const obj: any = {
      Key: '',
      dtFrom,
      dtTo,
      Value: this.searchValue,
      Reserve1: '',
      Reserve2: '',
      Reserve3: '',
      oFilter: this.oFilter,
      Initial: initial,
      MaxCount: maxCount,
      oTransType: 0,
      Callback_URL: ''
    }

    this.shared.loader(true)
    this.api.getAdmWithdrawReq(obj).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res && res.lstWDraw) {
          this.wdList = res.lstWDraw.sort((a: any, b: any) => {
            const tA = a.oReq?.oTime?.Tm_Str || ''
            const tB = b.oReq?.oTime?.Tm_Str || ''
            return tB.localeCompare(tA)
          })
          this.Count = res.Count
        } else {
          this.wdList = []
          this.Count = 0
        }
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord)
      },
      error: () => {
        this.shared.loader(false)
        this.toster.error('Something went wrong', 'Error')
      }
    })
  }

  updateStatus(reqId: number, status: any, selEl: HTMLSelectElement) {
    Swal.fire({
      title: 'Confirmation',
      text: 'Are you sure you want to update this withdraw request status?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.confirmUpdateStatus(reqId, status, selEl)
      } else {
        selEl.value = '1'
      }
    })
  }

  private confirmUpdateStatus(reqId: number, status: any, selEl: HTMLSelectElement) {
    const obj = { Field1: String(reqId), Field2: String(status) }
    this.shared.loader(true)
    this.api.updateWithdrawReq(obj).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result === true) {
          this.page = 1
          this.fetchData(1, 10)
          this.toster.success(res.MSG_USER || 'Status updated', 'Success')
        } else {
          selEl.value = '1'
          this.toster.error(res.MSG_USER || 'Failed to update withdraw status.', 'Error')
        }
      },
      error: () => {
        this.shared.loader(false)
        selEl.value = '1'
        this.toster.error('Something went wrong', 'Error')
      }
    })
  }

  // =========================================================== export =====================================================
  private fetchAllWithdrawals(): Promise<any[]> {
    return new Promise((resolve) => {
      const dtFrom = this.dtFrom ? this.dtFrom + ' 00:00:01' : ''
      const dtTo = this.dtTo ? this.dtTo + ' 23:59:59' : ''
      const obj: any = {
        Key: '',
        dtFrom, dtTo,
        Value: this.searchValue,
        Reserve1: '',
        Reserve2: '',
        Reserve3: '',
        oFilter: this.oFilter,
        Initial: 1,
        MaxCount: this.Count || 999999,
        oTransType: 0,
        Callback_URL: ''
      }
      this.api.getAdmWithdrawReq(obj).subscribe({
        next: (res: any) => resolve(res?.lstWDraw || []),
        error: () => resolve([]),
      })
    })
  }

  async exportCsv() {
    const items = await this.fetchAllWithdrawals()
    const rows = items.map((item: any) => ({
      Date: item.oReq?.oTime?.Tm_Str || '',
      Name: item.oInfo?.Name || '',
      Phone: item.oInfo?.Phone || '',
      Amount: item.oReq?.Amt || '',
      Remark: item.oReq?.Comment || '',
      Status: item.oReq?.Status ?? ''
    }))
    if (!rows.length) return
    new ngxCsv(rows, 'WithdrawRequests', { headers: Object.keys(rows[0]) })
  }

  async exportExcel() {
    const items = await this.fetchAllWithdrawals()
    const rows = items.map((item: any) => ({
      Date: item.oReq?.oTime?.Tm_Str || '',
      Name: item.oInfo?.Name || '',
      Phone: item.oInfo?.Phone || '',
      Amount: item.oReq?.Amt || '',
      Remark: item.oReq?.Comment || '',
      Status: item.oReq?.Status ?? ''
    }))
    if (!rows.length) return
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Withdrawals')
    XLSX.writeFile(wb, 'WithdrawRequests.xlsx')
  }
  // =========================================================== pagination ======================================================

  onPageSizeChange() {
    this.page = 1
    this.fetchData(1, this.numRecord)
  }

  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) return
    this.page = page
    this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord)
    this.fetchData((this.numRecord * page) - this.numRecord + 1, this.numRecord * page)
  }
}
