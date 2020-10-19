/*
 * Copyright (c) 2020 the original author or authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { API_URL } from '../../data/enums/api-url.enum';
import { ROUTERS_URL } from '../../data/enums/routers-url.enum';
import { AppState } from '../../store';
import { updateUserAuthorization } from '../../store/userInfo/action';
import { propToLocalStorage } from '../../decorators/property-storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  refreshInProgress: boolean;
  requests = [];

  @propToLocalStorage()
  public isAuthorized: boolean;

  constructor(private http: HttpClient, private formBuilder: FormBuilder, private store: Store<AppState>, private router: Router) {
  }

  checkAuthorization(): boolean {
    return this.isAuthorized;
  }

  logIn(email: string, password: string): Observable<any> {
    const url = `${environment.adminApiUrl}${API_URL.LOGIN}`;
    const form = this.formBuilder.group({
      email,
      password,
      grant_type: 'password'
    });
    const formData = new FormData();
    formData.append('username', form.get('email').value);
    formData.append('password', form.get('password').value);
    formData.append('grant_type', form.get('grant_type').value);

    return this.http.post(url, formData, { headers: { Authorization: environment.basicToken }, withCredentials: false });
  }

  updateAuthorization(value: boolean): void {
    this.isAuthorized = value;
  }

  clearUserToken(): Observable<any> {
    localStorage.clear();
    const url = `${environment.adminApiUrl}${API_URL.LOGIN}`;
    return this.http.delete(url, { headers: { Authorization: environment.basicToken }});
  }

  signUp(firstName: string, password: string, email: string, lastName: string): Observable<any> {
    const url = `${environment.adminApiUrl}${API_URL.REGISTER}`;
    return this.http.post(url, { email, password, firstName, lastName }, {observe: 'response'});
  }

  logOut() {
    this.clearUserToken();
    this.store.dispatch(updateUserAuthorization({ value: false }));
    this.router.navigateByUrl(ROUTERS_URL.LOGIN);
  }
}
