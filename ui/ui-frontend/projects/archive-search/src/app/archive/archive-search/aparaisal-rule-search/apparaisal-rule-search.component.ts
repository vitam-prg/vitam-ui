import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { merge } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { diff } from 'ui-frontend-common';
import { ArchiveSharedDataServiceService } from '../../../core/archive-shared-data-service.service';
import { SearchCriteriaEltDto, SearchCriteriaTypeEnum } from '../../models/search.criteria';

const UPDATE_DEBOUNCE_TIME = 200;
const BUTTON_MAX_TEXT = 40;

const APPRAISAL_RULE_FINAL_ACTION = 'APPRAISAL_RULE_FINAL_ACTION';
const APPRAISAL_RULE_FINAL_ACTION_TYPE = 'APPRAISAL_RULE_FINAL_ACTION_TYPE';
const APPRAISAL_RULE_ORIGIN = 'APPRAISAL_RULE_ORIGIN';
@Component({
  selector: 'apparaisal-rule-search',
  templateUrl: './apparaisal-rule-search.component.html',
  styleUrls: ['./apparaisal-rule-search.component.css'],
})
export class ApparaisalRuleSearchComponent implements OnInit {
  appraisalRuleCriteriaForm: FormGroup;

  appraisalCriteriaList: SearchCriteriaEltDto[] = [];

  showDuaEndDate = false;
  previousAppraisalCriteriaValue: {
    appraisalRuleIdentifier?: string;
    appraisalRuleTitle?: string;
    appraisalRuleStartDate?: any;
    appraisalRuleEndDate?: any;
    appraisalRuleOrigin?: {
      inheriteAtLeastOne: boolean;
      hasAtLeastOne: boolean;
      hasNoOne: boolean;
      waitingRecalculate: boolean;
    };
    appraisalRuleFinalActionType?: {
      eliminationFinalActionType?: boolean;
      conservationFinalActionType?: boolean;
      notSpecifiedFinalActionType?: boolean;
    };
    appraisalRuleFinalAction?: {
      hasFinalAction: boolean;
      inheriteFinalAction: boolean;
    };
    appraisalRuleEliminationIdentifier?: any;
  };
  emptyAppraisalCriteriaForm = {
    appraisalRuleIdentifier: '',
    appraisalRuleTitle: '',
    appraisalRuleStartDate: '',
    appraisalRuleEndDate: '',
    appraisalRuleOrigin: {
      inheriteAtLeastOne: false,
      hasAtLeastOne: false,
      hasNoOne: false,
      waitingRecalculate: false,
    },
    appraisalRuleFinalActionType: {
      eliminationFinalActionType: false,
      conservationFinalActionType: false,
      notSpecifiedFinalActionType: false,
    },
    appraisalRuleFinalAction: {
      hasFinalAction: false,
      inheriteFinalAction: false,
    },
    appraisalRuleEliminationIdentifier: false,
  };

  showUnitPreviewBlock = false;

  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    public dialog: MatDialog,
    private archiveExchangeDataService: ArchiveSharedDataServiceService
  ) {
    this.previousAppraisalCriteriaValue = {
      appraisalRuleIdentifier: '',
      appraisalRuleTitle: '',
      appraisalRuleStartDate: '',
      appraisalRuleEndDate: '',
      appraisalRuleOrigin: {
        inheriteAtLeastOne: false,
        hasAtLeastOne: false,
        hasNoOne: false,
        waitingRecalculate: false,
      },
      appraisalRuleFinalActionType: {
        eliminationFinalActionType: false,
        conservationFinalActionType: false,
        notSpecifiedFinalActionType: false,
      },
      appraisalRuleFinalAction: {
        hasFinalAction: false,
        inheriteFinalAction: false,
      },
      appraisalRuleEliminationIdentifier: '',
    };

    this.appraisalRuleCriteriaForm = this.formBuilder.group({
      //appraisalRules
      appraisalRuleIdentifier: ['', []],
      appraisalRuleTitle: ['', []],
      appraisalRuleStartDate: ['', []],
      appraisalRuleEndDate: ['', []],

      appraisalRuleOrigin: formBuilder.group({
        inheriteAtLeastOne: [false, []],
        hasAtLeastOne: [false, []],
        hasNoOne: ['', []],
        waitingRecalculate: ['', []],
      }),

      appraisalRuleFinalAction: formBuilder.group({
        hasFinalAction: ['', []],
        inheriteFinalAction: ['', []],
      }),

      appraisalRuleFinalActionType: formBuilder.group({
        eliminationFinalActionType: ['', []],
        conservationFinalActionType: ['', []],
        notSpecifiedFinalActionType: ['', []],
      }),

      appraisalRuleEliminationIdentifier: ['', []],
    });
    merge(this.appraisalRuleCriteriaForm.statusChanges, this.appraisalRuleCriteriaForm.valueChanges)
      .pipe(
        debounceTime(UPDATE_DEBOUNCE_TIME),
        filter(() => this.appraisalRuleCriteriaForm.valid),
        map(() => this.appraisalRuleCriteriaForm.value),
        map(() => diff(this.appraisalRuleCriteriaForm.value, this.previousAppraisalCriteriaValue)),
        filter((formData) => this.isEmpty(formData))
      )
      .subscribe(() => {
        this.resetAppraisalRuleCriteriaForm();
      });

    this.archiveExchangeDataService.receiveRemoveSearchCriteriaSubject().subscribe((criteria) => {
      if (criteria) {
        console.log('received remove criteria ', criteria.keyElt, criteria.valueElt);
        console.log('to update fields ');
      }
    });
  }

  isEmpty(formData: any): boolean {
    if (formData) {
      if (formData.archiveCriteria) {
        this.addCriteria(
          'titleAndDescription',
          'TITLE_OR_DESCRIPTION',
          formData.archiveCriteria.trim(),
          formData.archiveCriteria.trim(),
          true,
          'EQ',
          false
        );
        return true;
      } else if (formData.appraisalRuleIdentifier) {
        this.addCriteria(
          'AppraisalRuleIdentifier',
          'ID_DUA',
          formData.appraisalRuleIdentifier.trim(),
          formData.appraisalRuleIdentifier.trim(),
          true,
          'EQ',
          false
        );
        return true;
      } else if (formData.appraisalRuleTitle) {
        this.addCriteria(
          'AppraisalRuleTitle',
          'TITLE_DUA',
          formData.appraisalRuleTitle.trim(),
          formData.appraisalRuleTitle.trim(),
          true,
          'EQ',
          false
        );
        return true;
      } else if (formData.appraisalRuleStartDate) {
        this.addCriteria(
          'AppraisalRuleStartDate',
          'START_DATE_DUA',
          this.appraisalRuleCriteriaForm.value.appraisalRuleStartDate,
          this.datePipe.transform(this.appraisalRuleCriteriaForm.value.appraisalRuleStartDate, 'dd/MM/yyyy'),
          true,
          'GTE',
          false
        );
        return true;
      } else if (formData.appraisalRuleEndDate) {
        this.addCriteria(
          'AppraisalRuleEndDate',
          'END_DATE_DUA',
          this.appraisalRuleCriteriaForm.value.appraisalRuleEndDate,
          this.datePipe.transform(this.appraisalRuleCriteriaForm.value.appraisalRuleEndDate, 'dd/MM/yyyy'),
          true,
          'LTE',
          false
        );
        return true;
      } else if (formData.appraisalRuleFinalActionType) {
        console.log(formData.appraisalRuleFinalActionType);
        let appraisalRuleFinalActionTypeSelected = this.appraisalRuleCriteriaForm.value.appraisalRuleFinalActionType;
        if (appraisalRuleFinalActionTypeSelected) {
          if (appraisalRuleFinalActionTypeSelected.eliminationFinalActionType !== null) {
            console.log(appraisalRuleFinalActionTypeSelected.eliminationFinalActionType);
            if (appraisalRuleFinalActionTypeSelected.eliminationFinalActionType === true) {
              this.addCriteria(
                APPRAISAL_RULE_FINAL_ACTION_TYPE,
                APPRAISAL_RULE_FINAL_ACTION_TYPE,
                'ELIMINATION',
                'ELIMINATION',
                true,
                'EQ',
                true
              );
              this.previousAppraisalCriteriaValue.appraisalRuleFinalActionType.eliminationFinalActionType = true;
            } else {
              this.removeCriteria(APPRAISAL_RULE_FINAL_ACTION_TYPE, 'ELIMINATION');
              this.previousAppraisalCriteriaValue.appraisalRuleFinalActionType.eliminationFinalActionType = false;
            }
          }
          if (appraisalRuleFinalActionTypeSelected.conservationFinalActionType !== null) {
            console.log(appraisalRuleFinalActionTypeSelected.eliminationFinalActionType);
            if (appraisalRuleFinalActionTypeSelected.conservationFinalActionType === true) {
              this.addCriteria(
                APPRAISAL_RULE_FINAL_ACTION_TYPE,
                APPRAISAL_RULE_FINAL_ACTION_TYPE,
                'CONSERVATION',
                'CONSERVATION',
                true,
                'EQ',
                true
              );
              this.previousAppraisalCriteriaValue.appraisalRuleFinalActionType.conservationFinalActionType = true;
            } else {
              this.removeCriteria(APPRAISAL_RULE_FINAL_ACTION_TYPE, 'CONSERVATION');
              this.previousAppraisalCriteriaValue.appraisalRuleFinalActionType.conservationFinalActionType = false;
            }
          }
          if (appraisalRuleFinalActionTypeSelected.notSpecifiedFinalActionType !== null) {
            if (appraisalRuleFinalActionTypeSelected.notSpecifiedFinalActionType === true) {
              this.addCriteria(
                APPRAISAL_RULE_FINAL_ACTION_TYPE,
                APPRAISAL_RULE_FINAL_ACTION_TYPE,
                'NOT_SPECIFIED',
                'NOT_SPECIFIED',
                true,
                'EQ',
                true
              );
              this.previousAppraisalCriteriaValue.appraisalRuleFinalActionType.notSpecifiedFinalActionType = true;
            } else {
              this.removeCriteria(APPRAISAL_RULE_FINAL_ACTION_TYPE, 'NOT_SPECIFIED');
              this.previousAppraisalCriteriaValue.appraisalRuleFinalActionType.notSpecifiedFinalActionType = false;
            }
          }
        }
        return true;
      } else if (formData.appraisalRuleFinalAction) {
        console.log(formData.appraisalRuleFinalAction);
        let appraisalRuleFinalActionSelected = this.appraisalRuleCriteriaForm.value.appraisalRuleFinalAction;
        if (appraisalRuleFinalActionSelected) {
          if (appraisalRuleFinalActionSelected.hasFinalAction !== null) {
            console.log(appraisalRuleFinalActionSelected.hasFinalAction);
            if (appraisalRuleFinalActionSelected.hasFinalAction === true) {
              this.addCriteria(
                APPRAISAL_RULE_FINAL_ACTION,
                APPRAISAL_RULE_FINAL_ACTION,
                'HAS_FINAL_ACTION',
                'HAS_FINAL_ACTION',
                true,
                'EQ',
                true
              );
              this.previousAppraisalCriteriaValue.appraisalRuleFinalAction.hasFinalAction = true;
            } else {
              this.removeCriteria(APPRAISAL_RULE_FINAL_ACTION, 'HAS_FINAL_ACTION');
              this.previousAppraisalCriteriaValue.appraisalRuleFinalAction.hasFinalAction = false;
            }
          }
          if (appraisalRuleFinalActionSelected.inheriteFinalAction !== null) {
            if (appraisalRuleFinalActionSelected.inheriteFinalAction === true) {
              this.addCriteria(
                APPRAISAL_RULE_FINAL_ACTION,
                APPRAISAL_RULE_FINAL_ACTION,
                'INHERITE_FINAL_ACTION',
                'INHERITE_FINAL_ACTION',
                true,
                'EQ',
                true
              );
              this.previousAppraisalCriteriaValue.appraisalRuleFinalAction.inheriteFinalAction = true;
            } else {
              this.removeCriteria(APPRAISAL_RULE_FINAL_ACTION, 'INHERITE_FINAL_ACTION');
              this.previousAppraisalCriteriaValue.appraisalRuleFinalAction.inheriteFinalAction = false;
            }
          }
        }
        return true;
      } else if (formData.appraisalRuleOrigin) {
        console.log(formData.oriappraisalRuleOrigin);
        let appraisalRuleOriginSelected = this.appraisalRuleCriteriaForm.value.appraisalRuleOrigin;
        if (appraisalRuleOriginSelected) {
          if (appraisalRuleOriginSelected.hasAtLeastOne !== null) {
            console.log(appraisalRuleOriginSelected.hasAtLeastOne);
            if (appraisalRuleOriginSelected.hasAtLeastOne === true) {
              this.addCriteria(APPRAISAL_RULE_ORIGIN, APPRAISAL_RULE_ORIGIN, 'HAS_AT_LEAST_ONE', 'HAS_AT_LEAST_ONE', true, 'EQ', true);
              this.previousAppraisalCriteriaValue.appraisalRuleOrigin.hasAtLeastOne = true;
            } else {
              this.removeCriteria(APPRAISAL_RULE_ORIGIN, 'HAS_AT_LEAST_ONE');
              this.previousAppraisalCriteriaValue.appraisalRuleOrigin.hasAtLeastOne = false;
            }
          }
          if (appraisalRuleOriginSelected.hasNoOne !== null) {
            if (appraisalRuleOriginSelected.hasNoOne === true) {
              this.addCriteria(APPRAISAL_RULE_ORIGIN, APPRAISAL_RULE_ORIGIN, 'HAS_NO_ONE', 'HAS_NO_ONE', true, 'EQ', true);
              this.previousAppraisalCriteriaValue.appraisalRuleOrigin.hasNoOne = true;
            } else {
              this.removeCriteria(APPRAISAL_RULE_ORIGIN, 'HAS_NO_ONE');
              this.previousAppraisalCriteriaValue.appraisalRuleOrigin.hasNoOne = false;
            }
          }
          if (appraisalRuleOriginSelected.waitingRecalculate !== null) {
            if (appraisalRuleOriginSelected.waitingRecalculate === true) {
              this.addCriteria(
                APPRAISAL_RULE_ORIGIN,
                APPRAISAL_RULE_ORIGIN,
                'WAITING_RECALCULATE',
                'WAITING_RECALCULATE',
                true,
                'EQ',
                true
              );
              this.previousAppraisalCriteriaValue.appraisalRuleOrigin.waitingRecalculate = true;
            } else {
              this.removeCriteria(APPRAISAL_RULE_ORIGIN, 'WAITING_RECALCULATE');
              this.previousAppraisalCriteriaValue.appraisalRuleOrigin.waitingRecalculate = false;
            }
          }
          if (appraisalRuleOriginSelected.inheriteAtLeastOne !== null) {
            if (appraisalRuleOriginSelected.inheriteAtLeastOne === true) {
              this.addCriteria(
                APPRAISAL_RULE_ORIGIN,
                APPRAISAL_RULE_ORIGIN,
                'INHERITE_AT_LEAST_ONE',
                'INHERITE_AT_LEAST_ONE',
                true,
                'EQ',
                true
              );
              this.previousAppraisalCriteriaValue.appraisalRuleOrigin.inheriteAtLeastOne = true;
            } else {
              this.removeCriteria(APPRAISAL_RULE_ORIGIN, 'INHERITE_AT_LEAST_ONE');
              this.previousAppraisalCriteriaValue.appraisalRuleOrigin.inheriteAtLeastOne = false;
            }
          }
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  showHideDuaEndDate(status: boolean) {
    this.showDuaEndDate = status;
  }

  private resetAppraisalRuleCriteriaForm() {
    this.appraisalRuleCriteriaForm.reset(this.previousAppraisalCriteriaValue);
  }

  ngOnInit() {
    //  this.addCriteria();
  }

  removeCriteriaEvent(criteriaToRemove: any) {
    this.removeCriteria(criteriaToRemove.keyElt, criteriaToRemove.valueElt);
  }
  removeCriteria(keyElt: string, valueElt: string) {
    console.log(keyElt, valueElt);
    this.archiveExchangeDataService.sendRemoveSearchCriteriaAction({ keyElt: keyElt, valueElt: valueElt });
  }

  addCriteria(
    keyElt: string,
    keyLabel: string,
    valueElt: string,
    labelElt: string,
    keyTranslated: boolean,
    operator: string,
    valueTranslated: boolean
  ) {
    if (keyElt && valueElt) {
      this.archiveExchangeDataService.addSimpleSearchCriteriaSubject({
        keyElt: keyElt,
        keyLabel: keyLabel,
        valueElt: valueElt,
        labelElt: labelElt,
        keyTranslated: keyTranslated,
        operator: operator,
        category: SearchCriteriaTypeEnum.APPRAISAL_RULE,
        valueTranslated: valueTranslated,
      });
    }
  }

  getButtonSubText(originText: string): string {
    return this.getSubText(originText, BUTTON_MAX_TEXT);
  }

  getSubText(originText: string, limit: number): string {
    let subText = originText;
    if (originText && originText.length > limit) {
      subText = originText.substring(0, limit) + '...';
    }
    return subText;
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
  }

  get appraisalRuleIdentifier() {
    return this.appraisalRuleCriteriaForm.controls.appraisalRuleIdentifier;
  }
  get appraisalRuleTitle() {
    return this.appraisalRuleCriteriaForm.controls.appraisalRuleTitle;
  }
  get appraisalRuleStartDate() {
    return this.appraisalRuleCriteriaForm.controls.appraisalRuleStartDate;
  }
  get appraisalRuleEndDate() {
    return this.appraisalRuleCriteriaForm.controls.appraisalRuleEndDate;
  }
  get appraisalRuleOrigin() {
    return this.appraisalRuleCriteriaForm.controls.appraisalRuleOrigin;
  }
  get appraisalRuleFinalAction() {
    return this.appraisalRuleCriteriaForm.controls.appraisalRuleFinalAction;
  }
  get appraisalRuleFinalActionType() {
    return this.appraisalRuleCriteriaForm.controls.appraisalRuleFinalActionType;
  }
  get appraisalRuleEliminationIdentifier() {
    return this.appraisalRuleCriteriaForm.controls.appraisalRuleFinalActionType;
  }
}
