import {
  ComponentFactoryResolver, ComponentRef, Directive, ElementRef, forwardRef, HostListener, Injector, Input, OnInit,
  Renderer,
  ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PositionService } from '../position/positioning.service';
import { DatePickerPopupComponent } from './date-picker-popup.component';
import { SelectDateChangeEventArgs, SelectDateChangeReason } from './date-change-event-args.model';
import { RebirthUIConfig } from '../rebirth-ui.config';
import { DateConverter } from '../utils/date-converter';
import { DefaultDateConverter } from '../utils/default-date-converter';

@Directive({
  selector: '[reDatePicker]',
  exportAs: 'datePicker',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerDirective),
    multi: true
  }]
})
export class DatePickerDirective implements OnInit, ControlValueAccessor {
  @Input() placement: DatePickerPlacement = 'bottom-left';
  @Input() selectedDate: Date;
  @Input() locale: string;
  @Input() showTimePicker: boolean;
  @Input() cssClass: string;
  @Input() disabled = false;
  @Input() dateConverter: DateConverter;
  isOpen = false;
  dateConfig: any;
  private _dateFormat: string;
  private _maxDate: Date;
  private _minDate: Date;
  private cmpRef: ComponentRef<DatePickerPopupComponent>;
  private onChange = (_: any) => null;
  private onTouched = () => null;

  constructor(private elementRef: ElementRef, private viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver, private renderer: Renderer,
              private injector: Injector, private positionService: PositionService,
              private rebirthUIConfig: RebirthUIConfig) {

    this.dateConfig = rebirthUIConfig.datePicker;
    this.dateConverter = rebirthUIConfig.datePicker.dateConverter || new DefaultDateConverter();
    this.showTimePicker = rebirthUIConfig.datePicker.timePicker;
    this.locale = rebirthUIConfig.datePicker.locale;
    this._minDate = new Date(this.dateConfig.min, 0, 1, 0, 0, 0);
    this._maxDate = new Date(this.dateConfig.max, 11, 31, 23, 59, 59);
  }

  @Input() set maxDate(date: Date | any) {
    const parseDate = this.dateConverter.parse(date, this.getDateFormat(), this.locale);
    if (parseDate) {
      this._maxDate = parseDate;
    }
  }

  get maxDate() {
    return this._maxDate;
  }

  @Input() set minDate(date: Date | any) {
    const parseDate = this.dateConverter.parse(date, this.getDateFormat(), this.locale);
    if (parseDate) {
      this._minDate = parseDate;
    }
  }

  get minDate() {
    return this._minDate;
  }

  @Input() set dateFormat(dateFormat: string) {
    if (this._dateFormat !== dateFormat) {
      this._dateFormat = dateFormat;
      this.writeModelValue(this.selectedDate);
    }
  }

  get dateFormat() {
    return this._dateFormat;
  }

  ngOnInit() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(DatePickerPopupComponent);
    this.cmpRef = this.viewContainerRef.createComponent(factory, this.viewContainerRef.length, this.injector);
    this.applyPopupStyling(this.cmpRef.location.nativeElement);
    const component = this.cmpRef.instance;
    this.hide();
    component.writeValue(this.selectedDate);
    this.fillPopupData();
    component.ngOnInit();

    component.registerOnChange((selectedDate) => {
      this.writeValue(selectedDate);
      this.onChange(selectedDate);
    });

    component.selectedDateChange.subscribe((arg: SelectDateChangeEventArgs) => {
      if (arg.reason === SelectDateChangeReason.date) {
        this.hide();
      }
    });
  }

  writeValue(obj: any): void {
    this.selectedDate = obj ? this.dateConverter.parse(obj, this.getDateFormat(), this.locale) : null;
    this.writeModelValue(this.selectedDate);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.renderer.setElementProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
    if (this.isOpen) {
      this.cmpRef.instance.setDisabledState(isDisabled);
    }
  }

  toggle($event: Event) {
    if ($event) {
      $event.stopPropagation();
    }
    if (this.isOpen) {
      this.hide();
      return;
    }

    this.show();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick($event: Event) {
    const hostElement = this.elementRef.nativeElement;
    if ($event.target !== hostElement) {
      this.hide();
    }
  }

  show() {
    const component = this.cmpRef.instance;
    component.writeValue(this.selectedDate);
    this.fillPopupData();
    this.isOpen = true;
    const targetElement = this.cmpRef.location.nativeElement;
    const hostElement = this.elementRef.nativeElement;
    this.renderer.setElementStyle(targetElement, 'display', 'inline-block');
    const clientRect = this.positionService.positionElements(hostElement, targetElement, this.placement, false);
    this.renderer.setElementStyle(targetElement, 'left', `${clientRect.left}px`);
    this.renderer.setElementStyle(targetElement, 'top', `${clientRect.top}px`);
  }

  hide() {
    this.isOpen = false;
    const target = this.cmpRef.location.nativeElement;
    this.renderer.setElementStyle(target, 'display', 'none');
  }

  @HostListener('blur', ['$event'])
  onBlur() {
    this.onTouched();
  }

  @HostListener('change', ['$event'])
  onChangeFromInput($event) {
    const value = $event.target.value;
    let parseDate = value ? this.dateConverter.parse(value, this.dateFormat, this.locale) : null;
    if (parseDate) {
      if (parseDate.getTime() < this.minDate.getTime()) {
        parseDate = this.minDate;
      }

      if (parseDate.getTime() > this.maxDate.getTime()) {
        parseDate = this.maxDate;
      }
    }

    this.writeValue(parseDate);
    this.onChange(this.selectedDate);
  }

  @HostListener('keyup.esc', ['$event'])
  onEscKeyup() {
    this.hide();
  }

  private writeModelValue(selectDate: Date) {
    const value = selectDate ? this.dateConverter.format(selectDate, this.getDateFormat(), this.locale) : '';
    this.renderer.setElementProperty(this.elementRef.nativeElement, 'value', value);
    if (this.isOpen) {
      this.cmpRef.instance.writeValue(selectDate);
      this.onTouched();
    }
  }

  private getDateFormat() {
    if (this.dateFormat) {
      return this.dateFormat;
    }
    return this.showTimePicker ? this.dateConfig.format.time : this.dateConfig.format.date;
  }

  private applyPopupStyling(nativeElement: any) {
    this.renderer.setElementClass(nativeElement, 'dropdown-menu', true);
    this.renderer.setElementStyle(nativeElement, 'padding', '0px');
  }

  private fillPopupData() {
    ['showTimePicker', 'maxDate', 'minDate', 'cssClass', 'disabled', 'dateConverter', 'locale', 'dateFormat']
      .forEach(key => {
        if (this[key] !== undefined) {
          this.cmpRef.instance[key] = this[key];
        }
      });
  }
}
