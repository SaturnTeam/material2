/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs/Subject';
import {DateAdapter} from '@angular/material/core';
import {EventEmitter} from '@angular/core';
import {MatDateSelectionChange} from './date-selection';

/**
 * Special interface for dates interval.
 */
export interface MatDatepickerRange<D> {
  begin: D | null;
  end: D | null;
}

/**
 * Class to be used to power selecting one or two dates.
 */
export class MatDateSelectionModel<D> {

  /** Event emitted when the value has changed. */
  readonly onChange: Subject<MatDateSelectionChange<D>> = new EventEmitter();

  /** In range there is two selections necessary. */
  private _selectionFinished = true;

  constructor(public _dateAdapter: DateAdapter<D>,
              private _rangeMode = false,
              private _selected: MatDatepickerRange<D> | D | null = null) {
      if (!this._rangeMode) {
          this.validateDate(this._selected);
      } else {
          this.validateRange(this._selected);
      }
  }

  /** Selected value. */
  get selected(): MatDatepickerRange<D> | D | null {
    return this._selected;
  }

  get rangeMode(): boolean {
    return this._rangeMode;
  }

  /*
   * Clears selected value.
   */
  clear(): void {
    this._selected = null;
    this._emitChangeEvent();
  }

  /**
   * Determines whether a value is selected.
   */
  isSelected(): boolean {
    return this._selected !== null;
  }

  /**
   * Selects passed value. In range mode, the value will be attached to begin or end of range.
   */
  select(value: MatDatepickerRange<D> | D | null) {
    if (!this.rangeMode) {
      this.validateDate(value);
      const oldValue = <D|null>this._selected;
      this._selected = <D|null>value;
      console.log(oldValue, this._selected);
      if (!this._dateAdapter.sameDate(oldValue, this._selected)) {
        this._emitChangeEvent();
      }
    } else {
      this.validateRange(value);
      const oldValue = <MatDatepickerRange<D>|null>this._selected;
      this._selected = <MatDatepickerRange<D>|null>value;
      if (!this._dateAdapter.sameDate(oldValue!.begin, this._selected!.begin) ||
        !this._dateAdapter.sameDate(oldValue!.end, this._selected!.end)) {
        this._emitChangeEvent();
      }
    }
  }

  /** Emits a change event. */
  private _emitChangeEvent() {
    this.onChange.next({
      value: this.selected,
      source: this,
      selectionFinished: this._selectionFinished,
    });
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  private validateDate(obj: any): void {
    if (obj !== null &&
      (!this._dateAdapter.isDateInstance(obj) || !this._dateAdapter.isValid(obj))) {
      throw Error(`MatDateSelectionModel: The passed value is not a correct date or null`);
    }
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  private validateRange(obj: any): void {
    if (obj === null || obj.begin === null && obj.end === null) {
      return;
    }
    if (!this._dateAdapter.isDateInstance(obj.begin) || !this._dateAdapter.isValid(obj.begin) ||
        !this._dateAdapter.isDateInstance(obj.end) || !this._dateAdapter.isValid(obj.end)) {
      throw Error(`MatDateSelectionModel: The passed value is not a correct range or null`);
    }
    if (this._dateAdapter.compareDate(obj.begin, obj.end) > 0) {
      throw Error(`MatDateSelectionModel: The begin of range is later then the end`);
    }
  }
}

/**
 * Event emitted when the value of a MatDateSelectionModel has changed.
 * @docs-private
 */
export interface MatDateSelectionChange<D> {
  /** The value from model */
  value: MatDatepickerRange<D> | D | null;
  /** Model that dispatched the event. */
  source: MatDateSelectionModel<D>;
  /** Whenever all necessary selection is made. */
  selectionFinished: boolean;
}
