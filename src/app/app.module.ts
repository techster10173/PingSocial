import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {AngularFireMessagingModule} from '@angular/fire/messaging';
import {AngularFirestore} from '@angular/fire/firestore';
import { FCM } from '@ionic-native/fcm/ngx';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    // tslint:disable-next-line:max-line-length
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule
        , AngularFireModule.initializeApp(environment.firebase), AngularFireMessagingModule],
    providers: [
        StatusBar,
        SplashScreen,
        AngularFirestore,
        FCM,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
