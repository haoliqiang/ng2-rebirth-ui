import { Inject, Injectable, LOCALE_ID, ViewContainerRef } from '@angular/core';

@Injectable()
export class RebirthUIConfig {

  rootContainer: ViewContainerRef;

  accordion = {
    type: '',
    keepOneItem: true,
    closable: false
  };

  alertBox = {
    type: 'info',
    closable: false,
  };

  carousel = {
    interval: 0,
    animate: false,
    reflowDuration: 30,
    animationDuration: 600
  };

  datePicker = {
    locale: 'en-US',
    timePicker: false,
    dateConverter: null, // DateConverter
    weeks: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    min: 1900,
    max: 2099,
    format: {
      date: 'YYYY-MM-DD',
      time: 'YYYY-MM-DD HH:mm'
    }
  };

  dialog = {
    button: {
      yes: 'Yes',
      no: 'No'
    }
  };

  pager = {
    pageSize: 10,
    aligned: true,
    button: {
      previous: '« Previous',
      next: 'Next »'
    }
  };

  pagination = {
    boundary: true,
    pageSize: 10,
    maxItems: 10,
    size: '', // '' | 'lg' | 'sm'
    button: {
      first: 'First',
      last: 'Last',
      pre: 'Previous',
      next: 'Next'
    }
  };

  panel = {
    type: 'default',
    closable: false,
    collapsable: false,
  };

  progressBar = {
    type: '',
    max: 100,
    animate: false,
    striped: false
  };

  rating = {
    max: 10,
    icons: { stateOn: 'glyphicon glyphicon-star', stateOff: 'glyphicon glyphicon-star-empty' }
  };

  selectButton = {
    type: 'primary',
    justified: false,
    multiple: false
  };

  switchBtn = {
    onText: 'ON',
    offText: 'OFF',
    type: 'primary'
  };

  tabs = {
    type: 'tabs', // 'tabs' | 'pills'
    justified: false,
    vertical: false
  };

  constructor(@Inject(LOCALE_ID) private locale: string) {
  }
}
