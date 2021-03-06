import { Component, OnInit, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '../../exports/utils/date-utils';
import { RowCheckChangeEventArg, SortChangeEventArg, DataTablePager } from '../../exports/data-table/data-table.model';
import { DataTableComponent } from '../../exports/data-table/data-table.component';

@Component({
  selector: 're-data-table-demo',
  templateUrl: './data-table-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableDemoComponent implements OnInit {

  dataSource = [
    {
      id: 1,
      firstName: 'Mark',
      lastName: 'Otto',
      dob: new Date(1990, 12, 1),
      score: 80
    },
    {
      id: 2,
      firstName: 'Jacob',
      lastName: 'Thornton',
      dob: new Date(1989, 1, 1),
      score: 43

    },
    {
      id: 3,
      firstName: 'Danni',
      lastName: 'Chen',
      dob: new Date(1991, 3, 1),
      score: 80
    },
    {
      id: 4,
      firstName: 'green',
      lastName: 'gerong',
      dob: new Date(1991, 3, 1),
      score: 98
    },
    {
      id: 5,
      firstName: 'po',
      lastName: 'lang',
      dob: new Date(1991, 3, 1),
      score: 80
    },
    {
      id: 6,
      firstName: 'john',
      lastName: 'li',
      dob: new Date(1991, 3, 1),
      score: 70
    },
    {
      id: 7,
      firstName: 'peng',
      lastName: 'li',
      dob: new Date(1991, 3, 1),
      score: 27
    },
    {
      id: 8,
      firstName: 'Danni',
      lastName: 'Yu',
      dob: new Date(1991, 3, 1),
      score: 74
    },

  ];

  pager: DataTablePager = {
    total: 306,
    pageIndex: 5,
    pageSize: 10,
  };
  filterDataSource = [];

  constructor() {
    this.filterDataSource = [...this.dataSource];
  }

  ngOnInit() {
  }

  dobFormat(item) {
    return item ? formatDate(item, 'YYYY-MM-DD') : '';
  }

  sortChange($event: SortChangeEventArg) {
    this.dataSource = this.dataSource.sort((a, b) => {
      const first = a[$event.field].toString();
      const second = b[$event.field].toString();
      const factor = $event.direction === 'ASC' ? 1 : -1;
      return factor * first.localeCompare(second);
    });
  }

  onCheckAllChange($event: boolean, checkedTable: DataTableComponent) {
    console.log('All checked change', $event, checkedTable.getCheckRows());
  }

  onRowCheckChange($event: RowCheckChangeEventArg, checkedTable: DataTableComponent) {
    console.log('Row checked change', $event, checkedTable.getCheckRows());
  }

  onSearchQueryChange($event: { [key: string]: any; }) {
    const search = Object.keys($event)
      .map(key => ({ key, value: $event[key] }))
      .filter(item => item.value);

    console.log('Got search query:', $event);
    this.filterDataSource = this.dataSource.filter(item => {
      return !search.some(query => (item[query.key] ? item[query.key].toString() : '')
        .toLowerCase().indexOf(query.value.toString().toLowerCase()) === -1);
    });
  }

  onPageIndexChange($event) {
    console.log('Page index change', $event);
  }

  editRow(table, rowItem) {
    const editModel = {
      id: rowItem.id,
      firstName: rowItem.firstName,
      lastName: rowItem.lastName,
      dob: rowItem.dob,
      score: rowItem.score,
    };

    table.editRow(rowItem, editModel);
  }

  saveRow(table, rowItem) {
    const editModel = table.endEditRow(rowItem);
    rowItem.firstName = editModel.firstName;
    rowItem.lastName = editModel.lastName;
    rowItem.dob = editModel.dob;
    rowItem.score = editModel.score;
  }

  cancelRow(table, rowItem) {
    table.endEditRow(rowItem);
  }
}


@Pipe({
  name: 'reAVG'
})

export class AVGPipe implements PipeTransform {
  transform(value: any, args: any[]): any {
    if (value) {
      const field = args[0];
      const svg = value.reduce((sum, item) => sum + item[field], 0) / value.length;
      return svg.toFixed(2);
    }
  }
}
