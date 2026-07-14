import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonmoduleModule } from './common/commonmodule.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from './servies/shared/shared.service';
import { ApiService } from './servies/api.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './common/shared.module';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonmoduleModule, CommonModule, SharedModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Digi_suites';

  isLoader: boolean = false

  constructor(private shared: SharedService, private cdr: ChangeDetectorRef, public api: ApiService) {

    console.log("this.api.islogin()", this.api.islogin())

    this.shared.selectedloaderValue.subscribe((val: any) => {
      this.isLoader = val;
      // console.log("here is loader value in app", this.isLoader);

      this.cdr?.detectChanges()

    })
  }


}
