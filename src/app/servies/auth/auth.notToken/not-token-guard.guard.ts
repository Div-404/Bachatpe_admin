import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const notTokenGuardGuard: CanActivateFn = (route, state) => {

  const router = inject(Router)

  let isLoggedin = sessionStorage.getItem('isloggedIn')
  if (!isLoggedin) {
    return true
  } else {
    router.navigateByUrl('user-list')
  }
  return true;
};
