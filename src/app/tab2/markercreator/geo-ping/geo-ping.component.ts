import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {environment} from '../../../../environments/environment';
import {ModalController} from '@ionic/angular';
import {Geolocation} from '@capacitor/geolocation';
import {LinkSelectorPage} from '../link-selector/link-selector.page';
import { AuthHandler } from 'src/app/services/authHandler.service';
import { GeopingsService } from 'src/app/services/geopings.service';
import { concatMap } from 'rxjs/operators';
import { UtilsService } from 'src/app/services/utils.service';
import { of } from 'rxjs';

@Component({
    selector: 'app-geo-ping',
    templateUrl: './geo-ping.component.html',
    styleUrls: ['./geo-ping.component.scss'],
    providers: []
})
export class GeoPingComponent implements OnInit, AfterViewInit, OnDestroy {
    textAmt: number;
    message: string;
    isPublic: boolean;
    durationString: string;
    showPublic: boolean;
    links: Array<string>;
    map: mapboxgl.Map;
    geocoder: any;
    private location: any;
    @Input() currentLocation: Array<number>;
    customAlertOptions: any = {
        header: 'Geo-Ping Duration',
        translucent: true
    };


    constructor(private utils: UtilsService, private auth: AuthHandler, private gs: GeopingsService,
         private modalController: ModalController) {
        mapboxgl.accessToken = environment.mapbox.accessToken;
    }

    ngOnInit() {
        this.textAmt = 0;
        this.showPublic = false;
        this.isPublic = true;
        this.durationString = '5 Min';
        this.links = [];
    }

    ngOnDestroy() {
        this.textAmt = 0;
        this.showPublic = false;
        this.isPublic = true;
        this.durationString = '5 Min';
        this.links = [];
    }

    ngAfterViewInit() {
        this.location = [this.currentLocation[1],this.currentLocation[0]];
        this.buildMap();
        (document.querySelector('#pingmap .mapboxgl-canvas') as HTMLElement).style.width = '100%';
        (document.querySelector('#pingmap .mapboxgl-canvas') as HTMLElement).style.height = 'auto';
    }

    buildMap() {
        this.map = new mapboxgl.Map({
            container: 'pingmap',
            style: environment.mapbox.style,
            zoom: 15,
            center: this.location
        });
        new mapboxgl.Marker().setLngLat(this.location).addTo(this.map);
        // @ts-ignore
        this.geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl
        });
        document.getElementById('geocoder-container-geoping').appendChild(this.geocoder.onAdd(this.map));
        this.geocoder.on('result', (res) => {
            this.location = res.result.geometry.coordinates;
        });
    }

    setValue($event: any) {
        this.durationString = $event.detail.value;
    }

    togglePublic() {
        this.isPublic = !this.isPublic;
    }

    async showLinks() {
        if (!this.isPublic) {
            const modal = await this.modalController.create({
                component: LinkSelectorPage,
                componentProps: {
                    ids: this.links
                }
            });

            modal.onDidDismiss().then(data => {
                this.links = data.data;
            });

            return await modal.present();
        }
    }

    closeModal() {
        this.modalController.dismiss();
    }

    sendPing() {
        let duration;
        if (this.durationString === '5 Min') {
            duration = 5;
        } else if (this.durationString === '1 Hour') {
            duration = 60;
        } else {
            duration = 24*60;
        }

        if (!this.isPublic) {
            if (this.links.length > 20) {
                this.utils.presentToast('Whoops! You have more than 20 people');
                return;
            } else if(this.links.length === 0) {
                this.utils.presentToast('Whoops! You didn\'t add anyone');
                return;
            }
        }

        const geoPing = {
            sentMessage: this.message,
            location: {
                latitude: this.location[1],
                longitude: this.location[0]
            },
            isPrivate: !this.isPublic,
            timeLimit: duration
        }

        this.gs.createGeoPing(geoPing).pipe(concatMap((val:any) => {
            if(this.isPublic){
              return of('');
            }
            return this.gs.shareGeoPing(val.data.id, this.links);
        })).subscribe(() => {
            this.utils.presentToast('GeoPing Made!');
            this.closeModal();
        }, err => {
            this.utils.presentToast('Whoops! Unexpected Problem');
            console.log(err);
        });
    }
}
