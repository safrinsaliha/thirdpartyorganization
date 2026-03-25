import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Branch {
  id?: number;
  name: string;
  code: string;
  city: string;
  address: string;
  contact_no: string;
  is_active?: boolean;
}

export interface Hub {
  id?: number;
  name: string;
  code: string;
  location: string;
  manager_name: string;
}

export interface Staff {
  id?: number;
  name: string;
  employee_id: string;
  designation: string;
  branch_id?: number;
  hub_id?: number;
  mobile: string;
}

export interface ServiceType {
  id?: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class MasterService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/master';

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/branches`);
  }

  createBranch(branch: Branch): Observable<Branch> {
    return this.http.post<Branch>(`${this.apiUrl}/branches`, branch);
  }

  getHubs(): Observable<Hub[]> {
    return this.http.get<Hub[]>(`${this.apiUrl}/hubs`);
  }

  createHub(hub: Hub): Observable<Hub> {
    return this.http.post<Hub>(`${this.apiUrl}/hubs`, hub);
  }

  getStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/staff`);
  }

  createStaff(staff: Staff): Observable<Staff> {
    return this.http.post<Staff>(`${this.apiUrl}/staff`, staff);
  }

  getServiceTypes(): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(`${this.apiUrl}/service-types`);
  }
}
