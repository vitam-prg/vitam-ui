/*
 * Copyright French Prime minister Office/SGMAP/DINSIC/Vitam Program (2019-2020)
 * and the signatories of the "VITAM - Accord du Contributeur" agreement.
 *
 * contact@programmevitam.fr
 *
 * This software is a computer program whose purpose is to implement
 * implement a digital archiving front-office system for the secure and
 * efficient high volumetry VITAM solution.
 *
 * This software is governed by the CeCILL-C license under French law and
 * abiding by the rules of distribution of free software.  You can  use,
 * modify and/ or redistribute the software under the terms of the CeCILL-C
 * license as circulated by CEA, CNRS and INRIA at the following URL
 * "http://www.cecill.info".
 *
 * As a counterpart to the access to the source code and  rights to copy,
 * modify and redistribute granted by the license, users are provided only
 * with a limited warranty  and the software's author,  the holder of the
 * economic rights,  and the successive licensors  have only  limited
 * liability.
 *
 * In this respect, the user's attention is drawn to the risks associated
 * with loading,  using,  modifying and/or developing or reproducing the
 * software by the user in light of its specific status of free software,
 * that may mean  that it is complicated to manipulate,  and  that  also
 * therefore means  that it is reserved for developers  and  experienced
 * professionals having in-depth computer knowledge. Users are therefore
 * encouraged to load and test the software's suitability as regards their
 * requirements in conditions enabling the security of their systems and/or
 * data to be ensured and,  more generally, to use and operate it in the
 * same conditions as regards security.
 *
 * The fact that you are presently reading this means that you have had
 * knowledge of the CeCILL-C license and that you accept its terms.
 */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Account } from '../../models/account/account.interface';
import { AccountService } from '../account.service';

@Component({
  selector: 'vitamui-common-account-information-tab',
  templateUrl: './account-information-tab.component.html',
  styleUrls: ['./account-information-tab.component.scss']
})
export class AccountInformationTabComponent implements OnInit {

  form: FormGroup;

  @Input()
  set account(account: Account) {
      this._account = account;
      this.resetForm(this.account);
  }
  get account(): Account { return this._account; }
  // tslint:disable-next-line:variable-name
  private _account: Account;

  constructor(private formBuilder: FormBuilder, private accountService: AccountService) {
    this.form = this.formBuilder.group({
      id: [null],
      firstname: [{ value: null, disabled: true}, Validators.required],
      lastname: [{ value: null, disabled: true}, Validators.required],
      email: [{ value: null, disabled: true}, [Validators.required, Validators.email]],
      language: [{ value: null, disabled: false}, Validators.required],
      level : [{ value: null, disabled: true}],
      otp: [{ value: null, disabled: true}],
      mobile: [{ value: null, disabled: true}, [Validators.pattern(/^[+]{1}[0-9]{11,12}$/)]],
      phone: [{ value: null, disabled: true}, [Validators.pattern(/^[+]{1}[0-9]{11,12}$/)]],
      address: [{ value: null, disabled: true}, Validators.required],
      type: [{ value: null, disabled: true}],
      profileGroup: [{ value: null, disabled: true}],
    });
   }

  ngOnInit() {
    this.form.valueChanges.subscribe((values: Account) => {
      this.accountService.patch(values).subscribe();
    });
  }

  private resetForm(account: Account) {
    // Passing the user email to the validator so it doesn't check if his own code exists
    this.form.reset(account, { emitEvent: false });
  }

}
