import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Renderer,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent } from 'rxjs/Observable/fromEvent';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import { RebirthUIConfig } from '../rebirth-ui.config';
import { PositionService } from '../position/positioning.service';
import { AutoCompletePopupComponent } from './auto-complete-popup.component';

@Directive({
  selector: '[reAutoComplete]',
  exportAs: 'autoComplete',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutoCompleteDirective),
    multi: true
  }]
})
export class AutoCompleteDirective implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() disabled: boolean;
  @Input() value: any;
  @Input() delay = 300;
  @Input() minLength = 3;
  @Input() itemTemplate: TemplateRef<any>;
  @Input() onSearch: (term: string, target?: AutoCompleteDirective) => Observable<any>;
  @Input() formatter: (item: any) => string = item => item ? (item.label || item.toString()) : '';
  @Input() valueParser: (item: any) => string = item => item;
  private valueChanges: Observable<string>;
  private placement = 'bottom-left';
  private subscription: Subscription;
  private popupRef: ComponentRef<AutoCompletePopupComponent>;
  private onChange = (_: any) => null;
  private onTouched = () => null;

  constructor(private elementRef: ElementRef, private viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver, private renderer: Renderer,
              private injector: Injector, private positionService: PositionService,
              private rebirthUIConfig: RebirthUIConfig, private changeDetectorRef: ChangeDetectorRef) {
    this.valueChanges = this.registerInputEvent(elementRef);
  }

  ngOnInit() {
    this.subscription = this.valueChanges
      .subscribe(source => this.onSourceChange(source));

    const factory = this.componentFactoryResolver.resolveComponentFactory(AutoCompletePopupComponent);
    this.popupRef = this.viewContainerRef.createComponent(factory, this.viewContainerRef.length, this.injector);
    this.fillPopup();
    this.positionPopup();

    this.popupRef.instance.registerOnChange(item => {
      const value = this.valueParser(item);
      this.writeValue(value);
      this.onChange(value);
      this.hidePopup();
    });
  }

  writeValue(obj: any): void {
    this.value = obj;
    this.writeInputValue(this.value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.popupRef) {
      this.popupRef.instance.setDisabledState(isDisabled);
    }
  }

  ngOnDestroy() {
    this.unSubscription();
  }

  @HostListener('blur', [])
  onBlur() {
    this.onTouched();
  }

  @HostListener('keydown.esc', ['$event'])
  onEscKeyup($event) {
    this.hidePopup();
  }

  @HostListener('keydown.Enter', ['$event'])
  onEnterKeyDown($event) {
    this.hidePopup();
    if (this.popupRef) {
      $event.preventDefault();
      $event.stopPropagation();
      this.popupRef.instance.selectCurrentItem();
    }
  }

  @HostListener('keydown.ArrowUp', ['$event'])
  onArrowUpKeyDown($event) {
    if (this.popupRef) {
      $event.preventDefault();
      $event.stopPropagation();
      this.popupRef.instance.prev();
    }
  }

  @HostListener('keydown.ArrowDown', ['$event'])
  onArrowDownKeyDown($event) {
    if (this.popupRef) {
      $event.preventDefault();
      $event.stopPropagation();
      this.popupRef.instance.next();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick($event: Event) {
    const hostElement = this.elementRef.nativeElement;
    if ($event.target !== hostElement) {
      this.hidePopup();
    }
  }

  onSourceChange(source) {
    const pop = this.popupRef.instance;
    pop.reset();
    this.fillPopup(source);
    pop.isOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  private hidePopup() {
    if (this.popupRef) {
      this.popupRef.instance.isOpen = false;
    }
  }

  private positionPopup() {
    const targetElement = this.popupRef.location.nativeElement;
    const hostElement = this.elementRef.nativeElement;
    const clientRect = this.positionService.positionElements(hostElement, targetElement, this.placement, false);
    this.renderer.setElementStyle(targetElement, 'left', `${clientRect.left}px`);
    this.renderer.setElementStyle(targetElement, 'top', `${clientRect.top}px`);
  }

  private fillPopup(source?: any, term?: string) {
    const pop = this.popupRef.instance;
    pop.source = source;
    pop.term = term;
    pop.formatter = this.formatter;
    pop.itemTemplate = this.itemTemplate;
  }

  private writeInputValue(value: any) {
    this.renderer.setElementProperty(this.elementRef.nativeElement, 'value', this.formatter(value || ''));
  }

  private unSubscription() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  private registerInputEvent(elementRef: ElementRef) {
    return fromEvent(elementRef.nativeElement, 'input')
      .do(term => this.onTouched())
      .map((e: any) => e.target.value)
      .filter(term => !this.disabled && this.onSearch && term.length >= this.minLength)
      .debounceTime(this.delay)
      .distinctUntilChanged()
      .do(term => this.onChange(term))
      .switchMap(term => this.onSearch(term, this));
  }
}
