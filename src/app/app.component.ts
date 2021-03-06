import { Component, OnInit, ViewContainerRef, Renderer, ElementRef } from '@angular/core';
import { RebirthUIConfig } from './exports/rebirth-ui.config';
import { DemoConfigService } from './shared/demo/demo-config.service';
import { MenuBar } from './exports/menu-bar/menu-bar.model';
import { REBIRTH_UI_I18N_ZHCN } from './exports/rebirth-ui.i18n.zh-cn';
import { ActivatedRoute } from '@angular/router';
import { ThemeService } from './shared';

@Component({
  selector: 're-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  components: any[];
  gettingStarted: any;
  menus: MenuBar;
  // largeDataSource = [];

  constructor(private rebirthConfig: RebirthUIConfig,
              private viewContainerRef: ViewContainerRef,
              private demoConfigService: DemoConfigService,
              private  router: ActivatedRoute,
              private  themeService: ThemeService,
              private  renderer: Renderer,
              private elementRef: ElementRef) {

    this.rebirthConfig.rootContainer = this.viewContainerRef;
    this.router.queryParams.subscribe((params: any) => {
      this.themeService.setupTheme(params.theme, this.renderer, this.elementRef);
    });

    // this.rebirthConfig.extend(REBIRTH_UI_I18N_ZHCN); i18n
  }

  ngOnInit(): void {
    this.gettingStarted = this.demoConfigService.gettingStarted;
    this.components = this.demoConfigService.components
      .sort((a, b) => a.name.localeCompare(b.name));

    this.setupMenus();

    // for (let i = 1; i <= 5000; i++) {
    //   this.largeDataSource.push({ id: i, name: `Name ${i}`, age: 10 });
    // }
  }

  private setupMenus() {
    const cmpMenus = this.components.map(item => {
      return {
        text: item.name,
        url: `#${item.name}`
      };
    });

    this.menus = {
      logo: 'http://greengerong.com/rebirth/assets/img/wolf2.png',
      title: '破狼博客',
      home: './',
      menus: [
        {
          text: '@Rebirth/UI',
          router: ['./'],
          icon: 'glyphicon glyphicon-home'
        },
        {
          text: 'Components',
          children: cmpMenus,
          icon: 'glyphicon glyphicon-fire'
        },
        {
          text: 'API Docs',
          url: '/ng2-rebirth-ui/compodocs/overview.html',
          target: '_blank',
          icon: 'glyphicon glyphicon-heart'
        },
        {
          text: '@Github',
          url: 'https://github.com/greengerong/ng2-rebirth-ui',
          target: '_blank',
          icon: 'glyphicon glyphicon-user'
        },
        {
          text: 'Themes',
          icon: 'glyphicon glyphicon-cog',
          children: [
            {
              text: 'Default',
              url: '?theme=Default'
            },
            {
              text: 'Dark',
              url: '?theme=Dark'
            },
            {
              text: 'Cosmo',
              url: '?theme=Cosmo'
            },
            {
              text: 'Paper',
              url: '?theme=Paper'
            },
            {
              text: 'Journal',
              url: '?theme=Journal'
            },
            {
              text: 'Readable',
              url: '?theme=Readable'
            },
            {
              text: 'United',
              url: '?theme=United'
            },
            {
              text: 'Sandstone',
              url: '?theme=Sandstone'
            }
          ]
        }
      ]
    };
  }
}
