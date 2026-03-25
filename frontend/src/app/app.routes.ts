import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Booking } from './components/booking/booking';
import { NewPickup } from './components/new-pickup/new-pickup';
import { HubItems } from './components/hub-items/hub-items';
import { BranchInward } from './components/branch-inward/branch-inward';
import { BranchOutward } from './components/branch-outward/branch-outward';
import { Delivery } from './components/delivery/delivery';
import { Tracking } from './components/tracking/tracking';
import { Reports } from './components/reports/reports';
import { TrackingPublic } from './components/tracking-public/tracking-public';
import { Master } from './components/master/master';
import { OFDComponent } from './components/ofd/ofd';
import { DeliveryEntry } from './components/delivery-entry/delivery-entry';
import { TariffMaster } from './components/tariff/tariff-master';
import { PayAmount } from './components/payments/pay-amount';
import { Placeholder } from './components/placeholder/placeholder';
import { SignupComponent } from './components/signup/signup';
import { Layout } from './components/layout/layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: Login, pathMatch: 'full' },
  { path: 'tracking-public', component: TrackingPublic },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'master', component: Master },
      { path: 'booking', component: Booking },
      { path: 'new-pickup', component: NewPickup },
      { path: 'hub-items', component: HubItems },
      { path: 'add-tariff', component: TariffMaster },
      { path: 'branch-inward', component: BranchInward },
      { path: 'branch-outward', component: BranchOutward },
      { path: 'out-for-delivery', component: OFDComponent },
      { path: 'delivery', component: Delivery },
      { path: 'delivery-entry', component: DeliveryEntry },
      { path: 'reports', component: Reports },
      { path: 'tracking', component: Tracking },
      { path: 'pay-amount', component: PayAmount },
      { path: 'wallet', component: Placeholder },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
