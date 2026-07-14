import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router)

  let isloggedIn = sessionStorage.getItem('isloggedIn')
  if (isloggedIn) {
    // router.navigateByUrl('user-list')
    return true
  } else {
    router.navigateByUrl('login')
    return false


  }

};
