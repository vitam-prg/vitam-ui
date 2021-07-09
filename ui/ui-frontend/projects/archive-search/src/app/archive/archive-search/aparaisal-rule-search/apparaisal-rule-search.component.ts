import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SearchCriteria } from 'projects/vitamui-library/src/public-api';
import { merge } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { diff } from 'ui-frontend-common';
import { ArchiveSharedDataServiceService } from '../../../core/archive-shared-data-service.service';
import { SearchCriteriaEltDto, SearchCriteriaTypeEnum } from '../../models/search.criteria';

const UPDATE_DEBOUNCE_TIME = 200;
const BUTTON_MAX_TEXT = 40;

@Component({
  selector: 'apparaisal-rule-search',
  templateUrl: './apparaisal-rule-search.component.html',
  styleUrls: ['./apparaisal-rule-search.component.css'],
})
export class ApparaisalRuleSearchComponent implements OnInit {
  appraisalRuleCriteriaForm: FormGroup;
  searchCriterias: Map<string, SearchCriteria>;
  searchCriteriaKeys: string[];

  appraisalCriteriaList: SearchCriteriaEltDto[] = [];

  showDuaEndDate = false;
  previousAppraisalCriteriaValue: {
    appraisalRuleIdentifier: '';
    appraisalRuleTitle: '';
    appraisalRuleStartDate: '';
    appraisalRuleEndDate: '';
    appraisalRuleOrigin: {};
    appraisalRuleFinalActionType: {
      anyFinalActionType: '';
      eliminationFinalActionType: '';
      conservationFinalActionType: '';
      notSpecifiedFinalActionType: '';
    };
    appraisalRuleFinalAction: {};
    appraisalRuleEliminationIdentifier: '';
  };
  emptyAppraisalCriteriaForm = {
    appraisalRuleIdentifier: '',
    appraisalRuleTitle: '',
    appraisalRuleStartDate: '',
    appraisalRuleEndDate: '',
    appraisalRuleOrigin: {},
    appraisalRuleFinalActionType: {
      anyFinalActionType: '',
      eliminationFinalActionType: '',
      conservationFinalActionType: '',
      notSpecifiedFinalActionType: '',
    },
    appraisalRuleFinalAction: {},
    appraisalRuleEliminationIdentifier: '',
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
      appraisalRuleOrigin: {},
      appraisalRuleFinalActionType: {
        anyFinalActionType: '',
        eliminationFinalActionType: '',
        conservationFinalActionType: '',
        notSpecifiedFinalActionType: '',
      },
      appraisalRuleFinalAction: {},
      appraisalRuleEliminationIdentifier: '',
    };

    this.appraisalRuleCriteriaForm = this.formBuilder.group({
      //appraisalRules
      appraisalRuleIdentifier: ['', []],
      appraisalRuleTitle: ['', []],
      appraisalRuleStartDate: ['', []],
      appraisalRuleEndDate: ['', []],

      appraisalRuleOrigin: formBuilder.group({
        inheriteAtLeastOne: ['true', []],
        hasAtLeastOne: ['true', []],
        hasNoOne: ['', []],
        waitingRecalculate: ['', []],
      }),

      appraisalRuleFinalAction: formBuilder.group({
        anyFinalAction: ['', []],
        hasFinalAction: ['', []],
        inheriteFinalAction: ['', []],
      }),

      appraisalRuleFinalActionType: formBuilder.group({
        anyFinalActionType: ['', []],
        eliminationFinalActionType: ['true', []],
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
          'EQ'
        );
        return true;
      } else if (formData.appraisalRuleIdentifier) {
        this.addCriteria(
          'AppraisalRuleIdentifier',
          'ID_DUA',
          formData.appraisalRuleIdentifier.trim(),
          formData.appraisalRuleIdentifier.trim(),
          true,
          'EQ'
        );
        return true;
      } else if (formData.appraisalRuleTitle) {
        this.addCriteria(
          'AppraisalRuleTitle',
          'TITLE_DUA',
          formData.appraisalRuleTitle.trim(),
          formData.appraisalRuleTitle.trim(),
          true,
          'EQ'
        );
        return true;
      } else if (formData.appraisalRuleStartDate) {
        this.addCriteria(
          'AppraisalRuleStartDate',
          'START_DATE_DUA',
          this.appraisalRuleCriteriaForm.value.appraisalRuleStartDate,
          this.datePipe.transform(this.appraisalRuleCriteriaForm.value.appraisalRuleStartDate, 'dd/MM/yyyy'),
          true,
          'GTE'
        );
        return true;
      } else if (formData.appraisalRuleEndDate) {
        this.addCriteria(
          'AppraisalRuleEndDate',
          'END_DATE_DUA',
          this.appraisalRuleCriteriaForm.value.appraisalRuleEndDate,
          this.datePipe.transform(this.appraisalRuleCriteriaForm.value.appraisalRuleEndDate, 'dd/MM/yyyy'),
          true,
          'LTE'
        );
        return true;
      } else if (formData.appraisalRuleFinalActionType) {
        this.addCriteria(
          'appraisalRuleFinalActionTypeSelected',
          'appraisalRuleFinalActionTypeSelected',
          'eliminationFinalActionType',
          'eliminationFinalActionType',
          true,
          'EQ'
        );

        let appraisalRuleFinalActionTypeSelected = this.appraisalRuleCriteriaForm.value.appraisalRuleFinalActionType;
        if (appraisalRuleFinalActionTypeSelected) {
          if (appraisalRuleFinalActionTypeSelected.anyFinalActionType === 'true') {
            this.removeCriteria('appraisalRuleFinalActionTypeSelected', 'eliminationFinalActionType');
            this.removeCriteria('appraisalRuleFinalActionTypeSelected', 'conservationFinalActionType');
            this.removeCriteria('appraisalRuleFinalActionTypeSelected', 'notSpecifiedFinalActionType');
          }
          if (appraisalRuleFinalActionTypeSelected.eliminationFinalActionType === 'true') {
            this.addCriteria(
              'appraisalRuleFinalActionTypeSelected',
              'appraisalRuleFinalActionTypeSelected',
              'eliminationFinalActionType',
              'eliminationFinalActionType',
              true,
              'EQ'
            );
          }
          if (appraisalRuleFinalActionTypeSelected.conservationFinalActionType === 'true') {
            this.addCriteria(
              'appraisalRuleFinalActionTypeSelected',
              'appraisalRuleFinalActionTypeSelected',
              'conservationFinalActionType',
              'conservationFinalActionType',
              true,
              'EQ'
            );
          }
          if (appraisalRuleFinalActionTypeSelected.notSpecifiedFinalActionType === 'true') {
            this.addCriteria(
              'appraisalRuleFinalActionTypeSelected',
              'appraisalRuleFinalActionTypeSelected',
              'notSpecifiedFinalActionType',
              'notSpecifiedFinalActionType',
              true,
              'EQ'
            );
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
    this.appraisalRuleCriteriaForm.reset(this.emptyAppraisalCriteriaForm);
  }

  ngOnInit() {
    this.searchCriterias = new Map();
    this.searchCriteriaKeys = [];
  }

  removeCriteriaEvent(criteriaToRemove: any) {
    this.removeCriteria(criteriaToRemove.keyElt, criteriaToRemove.valueElt);
  }
  removeCriteria(keyElt: string, valueElt: string) {
    if (this.searchCriterias && this.searchCriterias.size > 0) {
      console.log(keyElt, valueElt);
    }
  }

  addCriteria(keyElt: string, keyLabel: string, valueElt: string, labelElt: string, translated: boolean, operator: string) {
    if (keyElt && valueElt) {
      this.archiveExchangeDataService.addSimpleSearchCriteriaSubject({
        keyElt: keyElt,
        keyLabel: keyLabel,
        valueElt: valueElt,
        labelElt: labelElt,
        translated: translated,
        operator: operator,
        category: SearchCriteriaTypeEnum.APPRAISAL_RULE,
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

  get uaid() {
    return this.appraisalRuleCriteriaForm.controls.uaid;
  }
  get archiveCriteria() {
    return this.appraisalRuleCriteriaForm.controls.archiveCriteria;
  }
  get title() {
    return this.appraisalRuleCriteriaForm.controls.title;
  }
  get description() {
    return this.appraisalRuleCriteriaForm.controls.description;
  }
  get guid() {
    return this.appraisalRuleCriteriaForm.controls.guid;
  }
  get beginDt() {
    return this.appraisalRuleCriteriaForm.controls.beginDt;
  }
  get endDt() {
    return this.appraisalRuleCriteriaForm.controls.endDt;
  }
  get serviceProdLabel() {
    return this.appraisalRuleCriteriaForm.controls.serviceProdLabel;
  }
  get serviceProdCommunicability() {
    return this.appraisalRuleCriteriaForm.controls.serviceProdCommunicability;
  }
  get serviceProdCode() {
    return this.appraisalRuleCriteriaForm.controls.serviceProdCode;
  }
  get serviceProdCommunicabilityDt() {
    return this.appraisalRuleCriteriaForm.controls.serviceProdCommunicabilityDt;
  }
  get otherCriteria() {
    return this.appraisalRuleCriteriaForm.controls.otherCriteria;
  }
  get otherCriteriaValue() {
    return this.appraisalRuleCriteriaForm.controls.otherCriteriaValue;
  }
}
